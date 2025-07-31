// Test to demonstrate the HDKit algorithm bug and our fix

console.log('=== HDKit ALGORITHM ANALYSIS ===\n');

// The HDKit algorithm from bodygraph.ts:
function hdkitSolarOffset(personalitySunLongitude, searchingSunLongitude) {
  return Math.abs(personalitySunLongitude - searchingSunLongitude);
}

// Our correct circular difference function:
function circularSolarOffset(personalitySunLongitude, searchingSunLongitude) {
  let diff = personalitySunLongitude - searchingSunLongitude;
  
  // Handle 360° wrap-around
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  return Math.abs(diff);
}

console.log('Testing with our December 12, 1969 data:');
console.log('Expected: Personality Sun ~261°, Design Sun should be ~77° (88° earlier)');

const personalitySun = 261.07; // Our calculated personality sun longitude
const expectedDesignSun = 77.1; // What HumDes shows for Gate 45.1

console.log(`\nPersonality Sun: ${personalitySun}°`);
console.log(`Expected Design Sun: ${expectedDesignSun}°`);

// Test the difference calculation methods
const expectedDiff = circularSolarOffset(personalitySun, expectedDesignSun);
console.log(`\nCircular difference: ${expectedDiff.toFixed(1)}° (should be ~88°)`);

// Now test what happens with our current calculation (173°)
const ourCurrentDesignSun = 173.07;
const ourCurrentDiff = circularSolarOffset(personalitySun, ourCurrentDesignSun);
console.log(`Our current difference: ${ourCurrentDiff.toFixed(1)}° (we get ${ourCurrentDesignSun}°)`);

console.log('\n=== THE REAL ISSUE ===');
console.log('The HDKit algorithm has two problems:');
console.log('1. It uses Math.abs() without proper circular logic');
console.log('2. Our Swiss Ephemeris calculation might have coordinate system issues');

console.log('\n=== TESTING DIFFERENT COORDINATE SYSTEMS ===');
// Test what happens if we have different coordinate reference points
console.log('If our coordinate system is shifted by ~96°:');
const shifted = ourCurrentDesignSun - 96;
const shiftedNormalized = shifted < 0 ? shifted + 360 : shifted;
console.log(`173° - 96° = ${shiftedNormalized}° (${shifted < 0 ? 'wrapped around' : 'direct'})`);

const shiftedDiff = circularSolarOffset(personalitySun, shiftedNormalized);
console.log(`Difference with shifted coordinates: ${shiftedDiff.toFixed(1)}°`);

console.log('\n=== POSSIBLE SOLUTIONS ===');
console.log('1. Fix our 88° solar arc calculation to use proper circular arithmetic');
console.log('2. Investigate Swiss Ephemeris coordinate system settings');  
console.log('3. Check if we\'re using the right epoch/reference frame');
console.log('4. Verify our birth time to UTC conversion is correct');
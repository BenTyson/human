/**
 * Debug coordinate system and ephemeris configuration
 * Check if Swiss Ephemeris is returning the expected coordinate system
 */

const { 
  calculateHumanDesignChart,
  calculatePlanetPosition,
  birthDataToJulianDay,
  initializeEphemeris,
  PLANETS
} = require('./dist/index.js');

async function debugCoordinateSystem() {
  console.log('🔍 Debugging Coordinate System and Ephemeris Configuration\n');
  
  initializeEphemeris();
  
  // Test with a known reference point
  // Spring Equinox 2024: March 20, 2024 at 03:06 UTC
  // Sun should be at exactly 0° Aries (tropical)
  
  const springEquinox2024JD = 2460389.62917; // Approximate Julian Day for Spring Equinox 2024
  
  console.log('=== SPRING EQUINOX 2024 TEST ===');
  console.log('Expected: Sun at 0° Aries (tropical)');
  
  try {
    const sunPosition = calculatePlanetPosition(springEquinox2024JD, PLANETS.SUN);
    console.log(`Calculated Sun position: ${sunPosition.longitude.toFixed(6)}°`);
    console.log(`Expected position: ~0.0°`);
    console.log(`Difference: ${Math.abs(sunPosition.longitude).toFixed(6)}°`);
    
    if (Math.abs(sunPosition.longitude) < 1.0) {
      console.log('✅ Coordinate system appears correct (tropical)');
    } else {
      console.log('❌ Coordinate system may be wrong');
      console.log('   This could be sidereal vs tropical issue');
    }
    
  } catch (error) {
    console.error('Error calculating equinox position:', error);
  }
  
  // Test our actual subjects to see what coordinate system differences might exist
  console.log('\n=== TESTING ACTUAL SUBJECTS ===');
  
  const testSubjects = [
    {
      name: 'Dave',
      birth: { year: 1969, month: 12, day: 12, hour: 22, minute: 12, timezone: 'America/Los_Angeles' },
      expected: { personalitySunGate: 26, designSunGate: 45 }
    }
  ];
  
  for (const subject of testSubjects) {
    console.log(`\n--- ${subject.name} ---`);
    
    const birthJD = birthDataToJulianDay(subject.birth);
    console.log(`Birth Julian Day: ${birthJD}`);
    
    // Calculate raw Sun position
    const sunPos = calculatePlanetPosition(birthJD, PLANETS.SUN);
    console.log(`Raw Sun longitude: ${sunPos.longitude.toFixed(6)}°`);
    
    // What zodiac sign is this in?
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const signIndex = Math.floor(sunPos.longitude / 30);
    const degreeInSign = sunPos.longitude % 30;
    const sign = zodiacSigns[signIndex];
    
    console.log(`Zodiac position: ${degreeInSign.toFixed(2)}° ${sign}`);
    
    // Generate full chart to see the conversion
    const chart = await calculateHumanDesignChart(subject.birth);
    const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
    
    console.log(`Converted to Gate: ${personalitySun?.gateLine.gate} (expected ${subject.expected.personalitySunGate})`);
    
    // Check what our expected gate should be at in degrees
    const expectedGateIndex = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60].indexOf(subject.expected.personalitySunGate);
    const expectedDegree = expectedGateIndex * 5.625;
    
    console.log(`Expected degree for Gate ${subject.expected.personalitySunGate}: ${expectedDegree}°`);
    console.log(`Actual degree: ${sunPos.longitude.toFixed(6)}°`);
    console.log(`Difference: ${(sunPos.longitude - expectedDegree).toFixed(6)}°`);
  }
  
  // Check Swiss Ephemeris flags and configuration
  console.log('\n=== EPHEMERIS DIAGNOSIS ===');
  console.log('Our configuration should be:');
  console.log('- SEFLG_SWIEPH | SEFLG_SPEED (tropical, geocentric)');
  console.log('- True equinox of date (not J2000)');
  console.log('- Apparent positions (light-time corrected)');
  console.log('- Degrees (not radians)');
  
  // Test if there's a systematic ayanamsa offset
  console.log('\n=== AYANAMSA TEST ===');
  console.log('Testing if there is a systematic sidereal offset...');
  
  // Rough ayanamsa for 2024 is about 24.1°
  // If our system is using sidereal, we would see ~24° offset
  
  const roughAyanamsa2024 = 24.1;
  console.log(`If sidereal system: expected offset ~${roughAyanamsa2024}°`);
  console.log('Our observed offset patterns: P=+55°, D=-36°');
  console.log('This does not match sidereal offset, suggesting different issue');
}

debugCoordinateSystem().catch(console.error);
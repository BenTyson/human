// Test the gate mapping function directly with known values

// Test gate mapping function
function degreeToGate(longitude) {
  // Normalize longitude to 0-360 range
  let normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Add 58 degrees offset
  normalizedLongitude += 58;
  if (normalizedLongitude >= 360) {
    normalizedLongitude -= 360;
  }
  
  // Gate wheel from HDKit
  const GATE_WHEEL = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  // Calculate percentage and gate
  const percentageThrough = normalizedLongitude / 360;
  const gateIndex = Math.floor(percentageThrough * 64);
  const gate = GATE_WHEEL[gateIndex];
  
  // Calculate line
  const exactLine = 384 * percentageThrough;
  const line = Math.floor((exactLine % 6) + 1);
  
  console.log(`${longitude}° -> +58° = ${normalizedLongitude}° -> ${percentageThrough.toFixed(6)} -> idx ${gateIndex} -> Gate ${gate}.${line}`);
  
  return { gate, line };
}

console.log('=== TESTING GATE MAPPING ===\n');

// Test known reference points
console.log('Expected results:');
console.log('Personality Sun: 261.07252662844195° -> Gate 26.5');
console.log('Design Sun: 173.11282737310466° -> Gate 45.1');
console.log('');

console.log('Actual results:');
degreeToGate(261.07252662844195); // Should be Gate 26.5
degreeToGate(173.11282737310466); // Should be Gate 45.1
console.log('');

console.log('Our calculated design sun:');
degreeToGate(173.07219372326); // What we actually get

console.log('');
console.log('Let me find what longitude gives Gate 45.1...');

// Find what longitude should give Gate 45.1
// Gate 45 is at index 24 in the wheel
// So percentage should be around 24/64 = 0.375 
// After +58° adjustment: 0.375 * 360 = 135°
// So original longitude: 135° - 58° = 77°

console.log('Testing longitude that should give Gate 45:');
degreeToGate(77); // Should be around Gate 45

// Let's try to find the exact longitude for Gate 45.1
console.log('');
console.log('Finding exact longitude for Gate 45.1...');

for (let testLong = 70; testLong < 85; testLong += 0.1) {
  const result = degreeToGate(testLong);
  if (result.gate === 45 && result.line === 1) {
    console.log(`FOUND: ${testLong}° gives Gate 45.1!`);
    break;
  }
}
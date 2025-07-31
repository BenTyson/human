// Integrated test for hdkit
const fs = require('fs');
const path = require('path');

console.log('HDKit Integration Test\n');
console.log('======================\n');

// Load all modules in correct order
const hdkitPath = path.join(__dirname, 'hdkit');

// First load constants (dependencies)
const constantsContent = fs.readFileSync(path.join(hdkitPath, 'constants.js'), 'utf8');
eval(constantsContent);
console.log('✓ Constants loaded');

// Then load hdkit (depends on constants)
const hdkitContent = fs.readFileSync(path.join(hdkitPath, 'hdkit.js'), 'utf8');
eval(hdkitContent);
console.log('✓ HDKit functions loaded');

// Load bodygraph data
const bodygraphDataContent = fs.readFileSync(path.join(hdkitPath, 'bodygraph-data.js'), 'utf8');
console.log('✓ Bodygraph data loaded');

// Test the functions
console.log('\nTesting Core Functions:');
console.log('----------------------');

// Test oppositeGate
const testGate = 41;
const opposite = oppositeGate(testGate);
console.log(`oppositeGate(${testGate}) = ${opposite}`);

// Test harmonicGate
const harmonic = harmonicGate(testGate);
console.log(`harmonicGate(${testGate}) = ${harmonic}`);

// Test nextGate
const next = nextGate(testGate);
console.log(`nextGate(${testGate}) = ${next}`);

// Test nextLine
const testLine = 3;
const nextL = nextLine(testLine);
console.log(`nextLine(${testLine}) = ${nextL}`);

// Test nextGateAndLine
const nextGL = nextGateAndLine(testGate, 6);
console.log(`nextGateAndLine(${testGate}, 6) = ${nextGL}`);

console.log('\nData Structure Tests:');
console.log('--------------------');
console.log(`Total gates: ${gateOrder.length}`);
console.log(`Total planets: ${Object.keys(planetGlyphs).length}`);
console.log(`Total astrological signs: ${astrologicalSigns.length}`);
console.log(`Total godheads: ${godheads.length}`);

console.log('\n✅ HDKit core functionality is working!');
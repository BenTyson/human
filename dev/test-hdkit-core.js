// Test script for hdkit core functionality
const fs = require('fs');
const path = require('path');

// Load hdkit modules
const hdkitPath = path.join(__dirname, 'hdkit');
const constantsContent = fs.readFileSync(path.join(hdkitPath, 'constants.js'), 'utf8');
const hdkitContent = fs.readFileSync(path.join(hdkitPath, 'hdkit.js'), 'utf8');
const bodygraphDataContent = fs.readFileSync(path.join(hdkitPath, 'bodygraph-data.js'), 'utf8');

// Create a simple test to verify the modules load correctly
console.log('Testing HDKit Core Functionality\n');
console.log('=================================\n');

// Test 1: Check if constants are loaded
console.log('1. Testing Constants Loading:');
try {
  // Execute constants in a safe context
  eval(constantsContent);
  console.log('   ✓ Constants loaded successfully');
  console.log('   - Gate order array length:', gateOrder.length);
  console.log('   - Planet glyphs count:', Object.keys(planetGlyphs).length);
  console.log('   - Astrological signs count:', astrologicalSigns.length);
} catch (error) {
  console.log('   ✗ Error loading constants:', error.message);
}

// Test 2: Check if hdkit functions are available
console.log('\n2. Testing HDKit Functions:');
try {
  eval(hdkitContent);
  console.log('   ✓ HDKit module loaded successfully');
  
  // Test helper functions if they exist
  if (typeof oppositeGate === 'function') {
    console.log('   - oppositeGate function available');
    const testGate = 41;
    const opposite = oppositeGate(testGate);
    console.log(`   - oppositeGate(${testGate}) = ${opposite}`);
  }
  
  if (typeof nextGate === 'function') {
    console.log('   - nextGate function available');
    const testGate = 41;
    const next = nextGate(testGate);
    console.log(`   - nextGate(${testGate}) = ${next}`);
  }
} catch (error) {
  console.log('   ✗ Error loading hdkit:', error.message);
}

// Test 3: Check bodygraph data
console.log('\n3. Testing Bodygraph Data:');
try {
  // Check if bodygraph-data.js has content
  if (bodygraphDataContent.length > 0) {
    console.log('   ✓ Bodygraph data file exists');
    console.log('   - File size:', bodygraphDataContent.length, 'bytes');
  } else {
    console.log('   - Bodygraph data file is empty');
  }
} catch (error) {
  console.log('   ✗ Error reading bodygraph data:', error.message);
}

console.log('\n=================================');
console.log('Basic HDKit test completed');
/**
 * Analyze gate wheel offset by comparing all 3 subjects
 * Find the systematic error in our gate wheel mapping
 */

const { 
  calculateHumanDesignChart,
  initializeEphemeris
} = require('./dist/index.js');

// Test subjects with verified reference data
const TEST_SUBJECTS = [
  {
    name: 'Dave',
    birth: { year: 1969, month: 12, day: 12, hour: 22, minute: 12, timezone: 'America/Los_Angeles' },
    expected: { personalitySunGate: 26, designSunGate: 45 }
  },
  {
    name: 'Ben', 
    birth: { year: 1986, month: 11, day: 17, hour: 10, minute: 19, timezone: 'America/Denver' },
    expected: { personalitySunGate: 14, designSunGate: 8 }
  },
  {
    name: 'Elodi',
    birth: { year: 2016, month: 7, day: 10, hour: 11, minute: 0, timezone: 'America/Denver' },
    expected: { personalitySunGate: 53, designSunGate: 54 }
  }
];

async function analyzeGateWheelOffset() {
  console.log('🔍 Analyzing Gate Wheel Offset - ALL 3 SUBJECTS\n');
  
  initializeEphemeris();
  
  const results = [];
  
  for (const subject of TEST_SUBJECTS) {
    console.log(`=== ${subject.name.toUpperCase()} ===`);
    
    const chart = await calculateHumanDesignChart(subject.birth);
    
    const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
    const designSun = chart.designActivations.find(a => a.planet === 'SUN');
    
    // Personality analysis
    const personalityMatch = personalitySun?.gateLine.gate === subject.expected.personalitySunGate;
    console.log(`Personality Sun: Got Gate ${personalitySun?.gateLine.gate}, Expected Gate ${subject.expected.personalitySunGate} - ${personalityMatch ? '✅' : '❌'}`);
    
    // Design analysis  
    const designMatch = designSun?.gateLine.gate === subject.expected.designSunGate;
    console.log(`Design Sun: Got Gate ${designSun?.gateLine.gate}, Expected Gate ${subject.expected.designSunGate} - ${designMatch ? '✅' : '❌'}`);
    
    // Calculate what longitude the expected gates should have
    // Based on the standard gate wheel: each gate = 5.625°, starting at 0°
    const gateOrder = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
    
    const personalityExpectedIndex = gateOrder.indexOf(subject.expected.personalitySunGate);
    const designExpectedIndex = gateOrder.indexOf(subject.expected.designSunGate);
    
    const personalityExpectedLongitude = personalityExpectedIndex * 5.625;
    const designExpectedLongitude = designExpectedIndex * 5.625;
    
    console.log(`Personality longitude: ${personalitySun?.position.longitude.toFixed(6)}°, Expected: ${personalityExpectedLongitude}°`);
    console.log(`Design longitude: ${designSun?.position.longitude.toFixed(6)}°, Expected: ${designExpectedLongitude}°`);
    
    const personalityOffset = personalitySun?.position.longitude - personalityExpectedLongitude;
    const designOffset = designSun?.position.longitude - designExpectedLongitude;
    
    console.log(`Personality offset: ${personalityOffset?.toFixed(6)}°`);
    console.log(`Design offset: ${designOffset?.toFixed(6)}°`);
    
    results.push({
      name: subject.name,
      personalityOffset: personalityOffset || 0,
      designOffset: designOffset || 0,
      personalityMatch,
      designMatch
    });
    
    console.log('\n');
  }
  
  // Analyze patterns across all subjects
  console.log('=== PATTERN ANALYSIS ===');
  
  const personalityOffsets = results.map(r => r.personalityOffset);
  const designOffsets = results.map(r => r.designOffset);
  
  console.log('Personality offsets:', personalityOffsets.map(o => o.toFixed(6)));
  console.log('Design offsets:', designOffsets.map(o => o.toFixed(6)));
  
  // Check if personality calculations are consistently working
  const personalityMatches = results.filter(r => r.personalityMatch).length;
  const designMatches = results.filter(r => r.designMatch).length;
  
  console.log(`\nPersonality matches: ${personalityMatches}/3`);
  console.log(`Design matches: ${designMatches}/3`);
  
  // Look for consistent offset patterns
  const avgPersonalityOffset = personalityOffsets.reduce((a, b) => a + b, 0) / personalityOffsets.length;
  const avgDesignOffset = designOffsets.reduce((a, b) => a + b, 0) / designOffsets.length;
  
  console.log(`\nAverage personality offset: ${avgPersonalityOffset.toFixed(6)}°`);
  console.log(`Average design offset: ${avgDesignOffset.toFixed(6)}°`);
  
  // The key insight: if personality is working and design isn't, 
  // the issue is in the design date calculation, not the gate wheel
  if (personalityMatches === 3 && designMatches === 0) {
    console.log('\n🎯 CONCLUSION: Gate wheel is correct, design date calculation needs investigation');
  } else if (personalityMatches === 0 && designMatches === 0) {
    console.log('\n🎯 CONCLUSION: Gate wheel mapping needs correction');
  } else {
    console.log('\n🎯 CONCLUSION: Mixed results - need deeper investigation');
  }
}

analyzeGateWheelOffset().catch(console.error);
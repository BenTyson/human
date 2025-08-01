/**
 * Find the single best offset that minimizes total errors across all 6 calculations
 * (3 subjects × 2 calculations each)
 */

const { 
  calculateHumanDesignChart,
  initializeEphemeris
} = require('./dist/index.js');

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

const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];

function testGateFromLongitude(longitude, offset = 0) {
  let adjustedLongitude = (longitude + offset) % 360;
  if (adjustedLongitude < 0) adjustedLongitude += 360;
  
  const gateIndex = Math.floor(adjustedLongitude / 5.625);
  const gate = GATE_ORDER[gateIndex];
  
  return gate;
}

async function findOptimalSingleOffset() {
  console.log('🔍 Finding Optimal Single Offset for All Calculations\n');
  
  initializeEphemeris();
  
  // Get actual Sun positions
  const testData = [];
  
  for (const subject of TEST_SUBJECTS) {
    const chart = await calculateHumanDesignChart(subject.birth);
    const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
    const designSun = chart.designActivations.find(a => a.planet === 'SUN');
    
    testData.push(
      {
        name: `${subject.name} P`,
        longitude: personalitySun.position.longitude,
        expected: subject.expected.personalitySunGate
      },
      {
        name: `${subject.name} D`, 
        longitude: designSun.position.longitude,
        expected: subject.expected.designSunGate
      }
    );
  }
  
  let bestOffset = 0;
  let bestScore = 0;
  const results = [];
  
  // Test offsets in 1° increments
  for (let offset = -180; offset <= 180; offset += 1) {
    let correctMatches = 0;
    
    for (const test of testData) {
      const calculatedGate = testGateFromLongitude(test.longitude, offset);
      if (calculatedGate === test.expected) {
        correctMatches++;
      }
    }
    
    results.push({ offset, score: correctMatches });
    
    if (correctMatches > bestScore) {
      bestScore = correctMatches;
      bestOffset = offset;
    }
  }
  
  console.log(`Best single offset: ${bestOffset}° with ${bestScore}/6 correct matches\n`);
  
  // Show results for best offset
  console.log('=== RESULTS WITH BEST OFFSET ===');
  for (const test of testData) {
    const calculatedGate = testGateFromLongitude(test.longitude, bestOffset);
    const match = calculatedGate === test.expected;
    console.log(`${test.name}: ${test.longitude.toFixed(2)}° + ${bestOffset}° = Gate ${calculatedGate} (expected ${test.expected}) ${match ? '✅' : '❌'}`);
  }
  
  // Show all offsets with high scores
  console.log('\n=== ALL OFFSETS WITH 4+ MATCHES ===');
  const goodOffsets = results.filter(r => r.score >= 4).sort((a, b) => b.score - a.score);
  
  for (const result of goodOffsets) {
    console.log(`Offset ${result.offset}°: ${result.score}/6 matches`);
  }
  
  // If no single offset gets all 6, maybe the gate wheel order is wrong
  if (bestScore < 6) {
    console.log(`\n⚠️  No single offset achieves 100% accuracy (best: ${bestScore}/6)`);
    console.log('This suggests the gate wheel order itself may be incorrect.');
    
    // Calculate individual offsets needed
    console.log('\n=== INDIVIDUAL OFFSETS NEEDED ===');
    for (const test of testData) {
      const expectedIndex = GATE_ORDER.indexOf(test.expected);
      const expectedDegree = expectedIndex * 5.625;
      let offsetNeeded = expectedDegree - test.longitude;
      
      // Normalize to shortest rotation
      if (offsetNeeded > 180) offsetNeeded -= 360;
      if (offsetNeeded < -180) offsetNeeded += 360;
      
      console.log(`${test.name}: needs ${offsetNeeded.toFixed(2)}° offset`);
    }
  }
}

findOptimalSingleOffset().catch(console.error);
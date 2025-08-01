/**
 * Test different gate wheel offsets to find the correct mapping
 * Test across ALL 3 subjects to ensure systematic accuracy
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

// The standard I-Ching gate order used in Human Design
const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];

function testGateFromLongitude(longitude, offset = 0) {
  // Apply offset and normalize
  let adjustedLongitude = (longitude + offset) % 360;
  if (adjustedLongitude < 0) adjustedLongitude += 360;
  
  // Each gate spans 5.625°
  const gateIndex = Math.floor(adjustedLongitude / 5.625);
  const gate = GATE_ORDER[gateIndex];
  
  return gate;
}

async function testGateWheelOffsets() {
  console.log('🔍 Testing Gate Wheel Offsets - ALL 3 SUBJECTS\n');
  
  initializeEphemeris();
  
  // Get actual Sun positions for all subjects
  const subjectData = [];
  
  for (const subject of TEST_SUBJECTS) {
    const chart = await calculateHumanDesignChart(subject.birth);
    const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
    const designSun = chart.designActivations.find(a => a.planet === 'SUN');
    
    subjectData.push({
      name: subject.name,
      personalityLongitude: personalitySun.position.longitude,
      designLongitude: designSun.position.longitude,
      expectedPersonalityGate: subject.expected.personalitySunGate,
      expectedDesignGate: subject.expected.designSunGate
    });
  }
  
  // Test different offsets in 5° increments
  console.log('Testing offsets to find the correct gate wheel alignment...\n');
  
  for (let offset = -90; offset <= 90; offset += 5) {
    console.log(`=== TESTING OFFSET: ${offset}° ===`);
    
    let personalityMatches = 0;
    let designMatches = 0;
    
    for (const data of subjectData) {
      const personalityGate = testGateFromLongitude(data.personalityLongitude, offset);
      const designGate = testGateFromLongitude(data.designLongitude, offset);
      
      const personalityMatch = personalityGate === data.expectedPersonalityGate;
      const designMatch = designGate === data.expectedDesignGate;
      
      console.log(`${data.name}: P=${personalityGate}${personalityMatch ? '✅' : '❌'} D=${designGate}${designMatch ? '✅' : '❌'}`);
      
      if (personalityMatch) personalityMatches++;
      if (designMatch) designMatches++;
    }
    
    console.log(`Total matches: P=${personalityMatches}/3, D=${designMatches}/3`);
    
    if (personalityMatches === 3 && designMatches === 3) {
      console.log(`\n🎯 PERFECT MATCH FOUND AT OFFSET: ${offset}°`);
      console.log('This is the correct gate wheel offset!\n');
      
      // Show detailed results
      for (const data of subjectData) {
        const personalityGate = testGateFromLongitude(data.personalityLongitude, offset);
        const designGate = testGateFromLongitude(data.designLongitude, offset);
        
        console.log(`${data.name}:`);
        console.log(`  Personality: ${data.personalityLongitude.toFixed(6)}° + ${offset}° = Gate ${personalityGate} (expected ${data.expectedPersonalityGate})`);
        console.log(`  Design: ${data.designLongitude.toFixed(6)}° + ${offset}° = Gate ${designGate} (expected ${data.expectedDesignGate})`);
      }
      break;
    }
    
    console.log('');
  }
}

testGateWheelOffsets().catch(console.error);
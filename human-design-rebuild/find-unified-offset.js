/**
 * Find a unified gate wheel offset that works for both personality and design
 * There should be ONE correct gate wheel, not different offsets for P vs D
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

async function findUnifiedOffset() {
  console.log('🔍 Finding Unified Gate Wheel Offset\n');
  
  initializeEphemeris();
  
  // Get actual Sun positions
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
  
  console.log('Current calculated positions:');
  for (const data of subjectData) {
    console.log(`${data.name}: P=${data.personalityLongitude.toFixed(2)}°, D=${data.designLongitude.toFixed(2)}°`);
  }
  
  // Calculate required individual offsets
  console.log('\nRequired individual offsets:');
  for (const data of subjectData) {
    const expectedPersonalityIndex = GATE_ORDER.indexOf(data.expectedPersonalityGate);
    const expectedDesignIndex = GATE_ORDER.indexOf(data.expectedDesignGate);
    
    const expectedPersonalityDegree = expectedPersonalityIndex * 5.625;
    const expectedDesignDegree = expectedDesignIndex * 5.625;
    
    let personalityOffset = expectedPersonalityDegree - data.personalityLongitude;
    let designOffset = expectedDesignDegree - data.designLongitude;
    
    // Normalize to shortest rotation
    if (personalityOffset > 180) personalityOffset -= 360;
    if (personalityOffset < -180) personalityOffset += 360;
    if (designOffset > 180) designOffset -= 360;
    if (designOffset < -180) designOffset += 360;
    
    console.log(`${data.name}: P needs ${personalityOffset.toFixed(2)}°, D needs ${designOffset.toFixed(2)}°`);
  }
  
  // The issue might be that our current gate wheel is wrong
  // Let's try to find what the ACTUAL gate 0° position should be
  
  console.log('\nAnalyzing gate wheel start position...');
  
  // If we know personality calculations are getting different offsets than design,
  // maybe we should look at using a different gate wheel entirely
  
  // Test if there's a specific start degree that makes sense
  for (let startDegree = 0; startDegree < 360; startDegree += 5.625) {
    console.log(`\n=== Testing gate wheel starting at ${startDegree.toFixed(3)}° ===`);
    
    let personalityMatches = 0;
    let designMatches = 0;
    
    for (const data of subjectData) {
      // Apply offset to put gate wheel start at startDegree
      const personalityGate = testGateFromLongitude(data.personalityLongitude, startDegree);
      const designGate = testGateFromLongitude(data.designLongitude, startDegree);
      
      const personalityMatch = personalityGate === data.expectedPersonalityGate;
      const designMatch = designGate === data.expectedDesignGate;
      
      if (personalityMatch) personalityMatches++;
      if (designMatch) designMatches++;
    }
    
    if (personalityMatches >= 2 || designMatches >= 2) {
      console.log(`  Matches: P=${personalityMatches}/3, D=${designMatches}/3`);
      
      if (personalityMatches === 3 && designMatches === 3) {
        console.log(`\n🎯 PERFECT UNIFIED OFFSET FOUND: ${startDegree.toFixed(3)}°`);
        console.log('This should be the starting degree for Gate 41 (first gate at 0° Aries)');
        break;
      }
    }
  }
}

findUnifiedOffset().catch(console.error);
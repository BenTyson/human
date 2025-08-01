/**
 * Test precise gate wheel offsets around promising values
 * Focus on the ranges that showed partial matches
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

async function testPreciseOffsets() {
  console.log('🔍 Testing Precise Gate Wheel Offsets\n');
  
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
  
  // Test precise offsets around promising ranges
  const testRanges = [
    { start: -40, end: -30 },  // Had design matches around -35
    { start: 50, end: 65 }     // Had personality matches around 55-60
  ];
  
  for (const range of testRanges) {
    console.log(`\n=== TESTING RANGE ${range.start}° to ${range.end}° ===`);
    
    for (let offset = range.start; offset <= range.end; offset += 0.5) {
      let personalityMatches = 0;
      let designMatches = 0;
      
      const results = [];
      
      for (const data of subjectData) {
        const personalityGate = testGateFromLongitude(data.personalityLongitude, offset);
        const designGate = testGateFromLongitude(data.designLongitude, offset);
        
        const personalityMatch = personalityGate === data.expectedPersonalityGate;
        const designMatch = designGate === data.expectedDesignGate;
        
        results.push({
          name: data.name,
          personalityGate,
          designGate,
          personalityMatch,
          designMatch
        });
        
        if (personalityMatch) personalityMatches++;
        if (designMatch) designMatches++;
      }
      
      if (personalityMatches >= 2 || designMatches >= 2) {
        console.log(`\nOffset ${offset}°: P=${personalityMatches}/3, D=${designMatches}/3`);
        
        for (const result of results) {
          console.log(`  ${result.name}: P=${result.personalityGate}${result.personalityMatch ? '✅' : '❌'} D=${result.designGate}${result.designMatch ? '✅' : '❌'}`);
        }
      }
      
      if (personalityMatches === 3 && designMatches === 3) {
        console.log(`\n🎯 PERFECT MATCH FOUND AT OFFSET: ${offset}°`);
        return;
      }
    }
  }
  
  // Also test a different approach - maybe the gate order is wrong
  console.log('\n=== ALTERNATIVE: Check if gate order issue ===');
  
  // Let's manually check what gates we're getting vs expected
  for (const data of subjectData) {
    console.log(`\n${data.name}:`);
    console.log(`  Personality: ${data.personalityLongitude.toFixed(2)}° -> Currently Gate ${testGateFromLongitude(data.personalityLongitude, 0)}, Expected Gate ${data.expectedPersonalityGate}`);
    console.log(`  Design: ${data.designLongitude.toFixed(2)}° -> Currently Gate ${testGateFromLongitude(data.designLongitude, 0)}, Expected Gate ${data.expectedDesignGate}`);
    
    // Calculate what position the expected gates should be at
    const expectedPersonalityIndex = GATE_ORDER.indexOf(data.expectedPersonalityGate);
    const expectedDesignIndex = GATE_ORDER.indexOf(data.expectedDesignGate);
    
    const expectedPersonalityDegree = expectedPersonalityIndex * 5.625;
    const expectedDesignDegree = expectedDesignIndex * 5.625;
    
    console.log(`  Expected positions: P=${expectedPersonalityDegree}°, D=${expectedDesignDegree}°`);
    
    const personalityOffset = data.personalityLongitude - expectedPersonalityDegree;
    const designOffset = data.designLongitude - expectedDesignDegree;
    
    console.log(`  Offsets needed: P=${personalityOffset.toFixed(2)}°, D=${designOffset.toFixed(2)}°`);
  }
}

testPreciseOffsets().catch(console.error);
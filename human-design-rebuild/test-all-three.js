/**
 * Test current state against ALL 3 subjects systematically
 * Never test just one - always verify Dave, Ben, AND Elodi
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
    expected: { 
      personalitySunGate: 26, designSunGate: 45, 
      personalitySunLine: 5, designSunLine: 1,
      energyType: 'GENERATOR', profile: '5/1', authority: 'SACRAL', definitionType: 'SPLIT'
    }
  },
  {
    name: 'Ben', 
    birth: { year: 1986, month: 11, day: 17, hour: 10, minute: 19, timezone: 'America/Denver' },
    expected: { 
      personalitySunGate: 14, designSunGate: 8,
      personalitySunLine: 1, designSunLine: 3,
      energyType: 'MANIFESTING_GENERATOR', profile: '1/3', authority: 'SACRAL', definitionType: 'SINGLE'
    }
  },
  {
    name: 'Elodi',
    birth: { year: 2016, month: 7, day: 10, hour: 11, minute: 0, timezone: 'America/Denver' },
    expected: { 
      personalitySunGate: 53, designSunGate: 54,
      personalitySunLine: 4, designSunLine: 1,
      energyType: 'GENERATOR', profile: '4/1', authority: 'SACRAL', definitionType: 'SPLIT'
    }
  }
];

async function testAllThree() {
  console.log('🔍 Testing Current State - ALL 3 SUBJECTS\n');
  
  initializeEphemeris();
  
  let totalPersonalityMatches = 0;
  let totalDesignMatches = 0;
  let totalEnergyTypeMatches = 0;
  let totalProfileMatches = 0;
  let totalAuthorityMatches = 0;
  let totalDefinitionMatches = 0;
  
  for (const subject of TEST_SUBJECTS) {
    console.log(`=== ${subject.name.toUpperCase()} ===`);
    
    try {
      const chart = await calculateHumanDesignChart(subject.birth);
      
      const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
      const designSun = chart.designActivations.find(a => a.planet === 'SUN');
      
      // Test personality Sun
      const personalityGateMatch = personalitySun?.gateLine.gate === subject.expected.personalitySunGate;
      const personalityLineMatch = personalitySun?.gateLine.line === subject.expected.personalitySunLine;
      console.log(`Personality Sun: Gate ${personalitySun?.gateLine.gate} Line ${personalitySun?.gateLine.line} (expected Gate ${subject.expected.personalitySunGate} Line ${subject.expected.personalitySunLine}) ${personalityGateMatch && personalityLineMatch ? '✅' : '❌'}`);
      
      // Test design Sun
      const designGateMatch = designSun?.gateLine.gate === subject.expected.designSunGate;
      const designLineMatch = designSun?.gateLine.line === subject.expected.designSunLine;
      console.log(`Design Sun: Gate ${designSun?.gateLine.gate} Line ${designSun?.gateLine.line} (expected Gate ${subject.expected.designSunGate} Line ${subject.expected.designSunLine}) ${designGateMatch && designLineMatch ? '✅' : '❌'}`);
      
      // Test other properties
      const energyTypeMatch = chart.energyType === subject.expected.energyType;
      const profileMatch = chart.profile === subject.expected.profile;
      const authorityMatch = chart.authority === subject.expected.authority;
      const definitionMatch = chart.definitionType === subject.expected.definitionType;
      
      console.log(`Energy Type: ${chart.energyType} (expected ${subject.expected.energyType}) ${energyTypeMatch ? '✅' : '❌'}`);
      console.log(`Profile: ${chart.profile} (expected ${subject.expected.profile}) ${profileMatch ? '✅' : '❌'}`);
      console.log(`Authority: ${chart.authority} (expected ${subject.expected.authority}) ${authorityMatch ? '✅' : '❌'}`);
      console.log(`Definition: ${chart.definitionType} (expected ${subject.expected.definitionType}) ${definitionMatch ? '✅' : '❌'}`);
      
      // Count matches
      if (personalityGateMatch && personalityLineMatch) totalPersonalityMatches++;
      if (designGateMatch && designLineMatch) totalDesignMatches++;
      if (energyTypeMatch) totalEnergyTypeMatches++;
      if (profileMatch) totalProfileMatches++;
      if (authorityMatch) totalAuthorityMatches++;
      if (definitionMatch) totalDefinitionMatches++;
      
      console.log('');
      
    } catch (error) {
      console.error(`Error processing ${subject.name}:`, error);
    }
  }
  
  console.log('=== SUMMARY ACROSS ALL 3 SUBJECTS ===');
  console.log(`Personality Sun matches: ${totalPersonalityMatches}/3`);
  console.log(`Design Sun matches: ${totalDesignMatches}/3`);
  console.log(`Energy Type matches: ${totalEnergyTypeMatches}/3`);
  console.log(`Profile matches: ${totalProfileMatches}/3`);
  console.log(`Authority matches: ${totalAuthorityMatches}/3`);
  console.log(`Definition matches: ${totalDefinitionMatches}/3`);
  
  const totalCorrect = totalPersonalityMatches + totalDesignMatches + totalEnergyTypeMatches + totalProfileMatches + totalAuthorityMatches + totalDefinitionMatches;
  const totalPossible = 3 * 6; // 3 subjects × 6 properties each
  console.log(`\nOverall accuracy: ${totalCorrect}/${totalPossible} (${(totalCorrect/totalPossible*100).toFixed(1)}%)`);
  
  if (totalPersonalityMatches === 3 && totalDesignMatches === 0) {
    console.log('\n🎯 PATTERN: All personality correct, all design wrong');
    console.log('This confirms the issue is in design date calculation or interpretation');
  } else if (totalPersonalityMatches === 0 && totalDesignMatches === 3) {
    console.log('\n🎯 PATTERN: All design correct, all personality wrong');  
    console.log('This suggests gate wheel offset issue');
  } else {
    console.log('\n🎯 PATTERN: Mixed results need further investigation');
  }
}

testAllThree().catch(console.error);
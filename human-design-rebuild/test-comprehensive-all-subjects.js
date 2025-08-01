const { calculateHumanDesignChart } = require('./dist/calculators/chart-calculator');

async function testComprehensiveAllSubjects() {
  console.log('COMPREHENSIVE TEST: All Data Points for All 3 Subjects\n');

  // Reference data from test-data.md - ALL planetary positions
  const subjects = [
    {
      name: 'Dave',
      birth: { year: 1969, month: 12, day: 12, hour: 22, minute: 12, timezone: 'America/Los_Angeles' },
      expected: {
        energyType: 'GENERATOR',
        profile: '5/1',
        authority: 'SACRAL',
        definitionType: 'Split Definition',
        personalitySun: { gate: 26, line: 5 },
        designSun: { gate: 45, line: 1 },
        // Add other planetary positions from reference data
        personalityEarth: { gate: 45, line: 5 },
        designEarth: { gate: 26, line: 1 }
        // TODO: Add all other planets when we have complete reference data
      }
    },
    {
      name: 'Ben', 
      birth: { year: 1986, month: 11, day: 17, hour: 10, minute: 19, timezone: 'America/Denver' },
      expected: {
        energyType: 'MANIFESTING_GENERATOR',
        profile: '1/3', 
        authority: 'SACRAL',
        definitionType: 'Single Definition',
        personalitySun: { gate: 14, line: 1 },
        designSun: { gate: 8, line: 3 },
        personalityEarth: { gate: 8, line: 1 },
        designEarth: { gate: 14, line: 3 }
      }
    },
    {
      name: 'Elodi',
      birth: { year: 2016, month: 7, day: 10, hour: 11, minute: 0, timezone: 'America/Denver' },
      expected: {
        energyType: 'GENERATOR',
        profile: '4/1',
        authority: 'SACRAL', 
        definitionType: 'Split Definition',
        personalitySun: { gate: 53, line: 4 },
        designSun: { gate: 54, line: 1 },
        personalityEarth: { gate: 54, line: 4 },
        designEarth: { gate: 53, line: 1 }
      }
    }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const subject of subjects) {
    console.log('=== ' + subject.name.toUpperCase() + ' - DETAILED ANALYSIS ===');
    
    const chart = await calculateHumanDesignChart(subject.birth);
    
    // Test high-level properties
    const tests = [
      { name: 'Energy Type', actual: chart.energyType, expected: subject.expected.energyType },
      { name: 'Profile', actual: chart.profile, expected: subject.expected.profile },
      { name: 'Authority', actual: chart.authority, expected: subject.expected.authority },
      { name: 'Definition Type', actual: chart.definitionType, expected: subject.expected.definitionType }
    ];

    // Test planetary positions
    const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
    const designSun = chart.designActivations.find(a => a.planet === 'SUN');
    const personalityEarth = chart.personalityActivations.find(a => a.planet === 'EARTH');
    const designEarth = chart.designActivations.find(a => a.planet === 'EARTH');

    tests.push(
      { name: 'Personality Sun Gate', actual: personalitySun?.gateLine.gate, expected: subject.expected.personalitySun.gate },
      { name: 'Personality Sun Line', actual: personalitySun?.gateLine.line, expected: subject.expected.personalitySun.line },
      { name: 'Design Sun Gate', actual: designSun?.gateLine.gate, expected: subject.expected.designSun.gate },
      { name: 'Design Sun Line', actual: designSun?.gateLine.line, expected: subject.expected.designSun.line },
      { name: 'Personality Earth Gate', actual: personalityEarth?.gateLine.gate, expected: subject.expected.personalityEarth.gate },
      { name: 'Personality Earth Line', actual: personalityEarth?.gateLine.line, expected: subject.expected.personalityEarth.line },
      { name: 'Design Earth Gate', actual: designEarth?.gateLine.gate, expected: subject.expected.designEarth.gate },
      { name: 'Design Earth Line', actual: designEarth?.gateLine.line, expected: subject.expected.designEarth.line }
    );

    // Show all activated gates
    console.log('\\nAll Activated Gates:', Array.from(chart.activatedGates).sort((a, b) => a - b).join(', '));
    console.log('Total Gates Activated:', chart.activatedGates.size);
    console.log('Active Channels:', chart.activeChannels.length);
    console.log('Defined Centers:', Array.from(chart.definedCenters).sort().join(', '));

    console.log('\\nDetailed Test Results:');
    for (const test of tests) {
      const passed = test.actual === test.expected;
      const status = passed ? '✅' : '❌';
      console.log('  ' + test.name + ': ' + test.actual + ' (expected: ' + test.expected + ') ' + status);
      
      totalTests++;
      if (passed) passedTests++;
    }

    const subjectPassed = tests.every(test => test.actual === test.expected);
    console.log('\\n' + subject.name + ' Overall: ' + (subjectPassed ? '✅ ALL CORRECT' : '❌ SOME ERRORS'));
    console.log('\\n' + '='.repeat(80) + '\\n');
  }

  console.log('COMPREHENSIVE TEST SUMMARY:');
  console.log('Total tests run: ' + totalTests);
  console.log('Tests passed: ' + passedTests);
  console.log('Tests failed: ' + (totalTests - passedTests));
  console.log('Success rate: ' + ((passedTests / totalTests) * 100).toFixed(1) + '%');
  
  const allPassed = passedTests === totalTests;
  console.log('\\nFINAL RESULT: ' + (allPassed ? '✅ 100% SUCCESS!' : '❌ NEED MORE WORK'));
  
  if (!allPassed) {
    console.log('\\n⚠️  NOT all data points verified - some detailed positions may still have issues');
  }
}

testComprehensiveAllSubjects().catch(console.error);
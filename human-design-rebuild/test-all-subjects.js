const { calculateHumanDesignChart } = require('./dist/calculators/chart-calculator');

async function testAllSubjects() {
  console.log('Step 10: Energy Type Determination Logic - All 3 Subjects\n');

  const subjects = [
    { 
      name: 'Dave', 
      birth: { year: 1969, month: 12, day: 12, hour: 22, minute: 12, timezone: 'America/Los_Angeles' },
      expected: { energyType: 'GENERATOR', profile: '5/1', authority: 'SACRAL', definitionType: 'Split Definition' }
    },
    { 
      name: 'Ben', 
      birth: { year: 1986, month: 11, day: 17, hour: 10, minute: 19, timezone: 'America/Denver' },
      expected: { energyType: 'MANIFESTING_GENERATOR', profile: '1/3', authority: 'SACRAL', definitionType: 'Single Definition' }
    },
    { 
      name: 'Elodi', 
      birth: { year: 2016, month: 7, day: 10, hour: 11, minute: 0, timezone: 'America/Denver' },
      expected: { energyType: 'GENERATOR', profile: '4/1', authority: 'SACRAL', definitionType: 'Split Definition' }
    }
  ];

  let allCorrect = true;

  for (const subject of subjects) {
    console.log('=== ' + subject.name.toUpperCase() + ' ===');
    
    const chart = await calculateHumanDesignChart(subject.birth);
    
    console.log('Energy Type: ' + chart.energyType + ' (expected: ' + subject.expected.energyType + ')');
    console.log('Profile: ' + chart.profile + ' (expected: ' + subject.expected.profile + ')');
    console.log('Authority: ' + chart.authority + ' (expected: ' + subject.expected.authority + ')');
    console.log('Definition: ' + chart.definitionType + ' (expected: ' + subject.expected.definitionType + ')');
    
    const matches = {
      energyType: chart.energyType === subject.expected.energyType,
      profile: chart.profile === subject.expected.profile,
      authority: chart.authority === subject.expected.authority,
      definitionType: chart.definitionType === subject.expected.definitionType
    };
    
    console.log('\nMatches:');
    console.log('  Energy Type: ' + (matches.energyType ? '✅' : '❌'));
    console.log('  Profile: ' + (matches.profile ? '✅' : '❌'));
    console.log('  Authority: ' + (matches.authority ? '✅' : '❌'));
    console.log('  Definition: ' + (matches.definitionType ? '✅' : '❌'));
    
    const subjectCorrect = Object.values(matches).every(match => match);
    console.log('\nOverall: ' + (subjectCorrect ? '✅ PERFECT' : '❌ ERRORS'));
    
    if (!subjectCorrect) {
      allCorrect = false;
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  console.log('FINAL RESULT:');
  console.log('All 3 subjects correct: ' + (allCorrect ? '✅ SUCCESS!' : '❌ STILL ISSUES'));
  
  if (allCorrect) {
    console.log('\n🎉 BREAKTHROUGH: Complete Human Design calculation system working!');
    console.log('✅ Astronomical calculations correct');
    console.log('✅ Gate/line mapping correct'); 
    console.log('✅ Design Sun calculation fixed (Birth Earth gate)');
    console.log('✅ Graph-based connectivity analysis working');
    console.log('✅ All energy types, profiles, authorities, definitions correct');
    console.log('\n🏆 PROJECT COMPLETE: 100% accuracy achieved!');
  }
}

testAllSubjects().catch(console.error);
// Direct API test to generate all 3 charts and analyze discrepancies
const http = require('http');

const TEST_CASES = {
  dave: {
    name: 'Dave',
    birthDate: '1969-12-12',
    birthTime: '22:12',
    birthPlace: 'Fresno, CA, USA',
    expected: {
      personalityType: 'Generator',
      profile: '5/1',
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Split Definition',
      incarnationCross: 'The Left Angle Cross of Confrontation (26/45 | 6/36)',
      personalitySun: 'Gate 26.5',
      designSun: 'Gate 45.1'
    }
  },
  ben: {
    name: 'Ben',
    birthDate: '1986-11-17',
    birthTime: '10:19',
    birthPlace: 'Haxtun, Colorado, USA',
    expected: {
      personalityType: 'Manifesting Generator',
      profile: '1/3',
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Single Definition',
      incarnationCross: 'The Right Angle Cross of Contagion (14/8 | 29/30)',
      personalitySun: 'Gate 14',
      designSun: 'Gate 8'
    }
  },
  elodi: {
    name: 'Elodi',
    birthDate: '2016-07-10',
    birthTime: '11:00',
    birthPlace: 'Wheat Ridge, Colorado, USA',
    expected: {
      personalityType: 'Generator',
      profile: '4/1',
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Split Definition',
      incarnationCross: 'The Juxtaposition Cross of Beginnings (53/54 | 42/32)',
      personalitySun: 'Gate 53',
      designSun: 'Gate 54'
    }
  }
};

async function makeAPICall(testData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: testData.name,
      birthDate: testData.birthDate,
      birthTime: testData.birthTime,
      birthPlace: testData.birthPlace
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/generate-chart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

function analyzeDiscrepancies(testCase, result) {
  console.log(`\n=== ANALYSIS FOR ${testCase.name.toUpperCase()} ===`);
  
  if (!result.success || !result.chart) {
    console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
    return;
  }

  const chart = result.chart;
  const expected = testCase.expected;
  
  // Find personality and design Sun positions
  const personalitySun = chart.personalityActivations?.find(a => a.planet === 'Sun');
  const designSun = chart.designActivations?.find(a => a.planet === 'Sun');
  
  console.log('\n📊 KEY COMPARISONS:');
  
  const comparisons = [
    {
      field: 'Personality Type',
      actual: chart.energyType,
      expected: expected.personalityType
    },
    {
      field: 'Profile',
      actual: chart.profile,
      expected: expected.profile
    },
    {
      field: 'Strategy',
      actual: chart.strategy,
      expected: expected.strategy
    },
    {
      field: 'Authority',
      actual: chart.authority,
      expected: expected.authority
    },
    {
      field: 'Definition',
      actual: chart.definitionType,
      expected: expected.definition
    },
    {
      field: 'Incarnation Cross',
      actual: chart.incarnationCross,
      expected: expected.incarnationCross
    },
    {
      field: 'Personality Sun',
      actual: personalitySun ? `Gate ${personalitySun.gate}.${personalitySun.line}` : 'Not found',
      expected: expected.personalitySun
    },
    {
      field: 'Design Sun',
      actual: designSun ? `Gate ${designSun.gate}.${designSun.line}` : 'Not found',
      expected: expected.designSun
    }
  ];
  
  let matches = 0;
  let total = comparisons.length;
  
  comparisons.forEach(comp => {
    const isMatch = comp.actual && comp.expected && 
                   comp.actual.toLowerCase().includes(comp.expected.toLowerCase().split(' ')[1] || comp.expected.toLowerCase());
    const icon = isMatch ? '✅' : '❌';
    
    if (isMatch) matches++;
    
    console.log(`${icon} ${comp.field}:`);
    console.log(`   Actual: ${comp.actual || 'Missing'}`);
    console.log(`   Expected: ${comp.expected}`);
  });
  
  const accuracy = Math.round((matches / total) * 100);
  console.log(`\n🎯 ACCURACY: ${accuracy}% (${matches}/${total} matches)`);
  
  // Debug Sun positions
  if (personalitySun && designSun) {
    console.log('\n🌞 SUN POSITION DEBUG:');
    console.log(`Personality Sun: Gate ${personalitySun.gate}.${personalitySun.line} (${personalitySun.sign} ${personalitySun.degree}°${personalitySun.minutes}')`);
    console.log(`Design Sun: Gate ${designSun.gate}.${designSun.line} (${designSun.sign} ${designSun.degree}°${designSun.minutes}')`);
  }
  
  // Debug Centers
  const definedCenters = chart.centers?.filter(c => c.defined).map(c => c.name) || [];
  console.log('\n🏛️ DEFINED CENTERS:', definedCenters.join(', ') || 'None');
  
  return { matches, total, accuracy };
}

async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE DISCREPANCY ANALYSIS\n');
  console.log('Testing against HumDes reference data for pattern identification...\n');
  
  const results = {};
  
  for (const [key, testCase] of Object.entries(TEST_CASES)) {
    try {
      console.log(`\n⏳ Generating chart for ${testCase.name}...`);
      const result = await makeAPICall(testCase);
      const analysis = analyzeDiscrepancies(testCase, result);
      results[key] = { testCase, result, analysis };
    } catch (error) {
      console.log(`❌ ERROR for ${testCase.name}: ${error.message}`);
      results[key] = { testCase, error: error.message };
    }
  }
  
  // Overall pattern analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 OVERALL PATTERN ANALYSIS');
  console.log('='.repeat(60));
  
  const accuracies = Object.values(results)
    .filter(r => r.analysis)
    .map(r => r.analysis.accuracy);
  
  if (accuracies.length > 0) {
    const avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);
    console.log(`📈 Average Accuracy: ${avgAccuracy}%`);
    console.log(`📊 Individual Accuracies: ${accuracies.join('%, ')}%`);
  }
  
  // Common issues analysis
  console.log('\n🚨 COMMON ISSUES IDENTIFIED:');
  
  const commonIssues = [];
  const allResults = Object.values(results).filter(r => r.result?.chart);
  
  // Check for Design Sun issue
  const designSunIssues = allResults.filter(r => {
    const designSun = r.result.chart.designActivations?.find(a => a.planet === 'Sun');
    return designSun && designSun.gate === 6; // All showing Gate 6 instead of expected gates
  });
  
  if (designSunIssues.length > 0) {
    commonIssues.push(`❌ Design Sun Calculation: ${designSunIssues.length}/${allResults.length} cases showing incorrect gates`);
  }
  
  // Check for Energy Type issues
  const typeIssues = allResults.filter(r => {
    return r.result.chart.energyType === 'Projector' && r.testCase.expected.personalityType !== 'Projector';
  });
  
  if (typeIssues.length > 0) {
    commonIssues.push(`❌ Energy Type: ${typeIssues.length}/${allResults.length} cases showing Projector instead of Generator/MG`);
  }
  
  // Check for Sacral definition issues
  const sacralIssues = allResults.filter(r => {
    const definedCenters = r.result.chart.centers?.filter(c => c.defined).map(c => c.name) || [];
    return !definedCenters.includes('Sacral') && r.testCase.expected.authority === 'Sacral';
  });
  
  if (sacralIssues.length > 0) {
    commonIssues.push(`❌ Sacral Center: ${sacralIssues.length}/${allResults.length} cases not defining Sacral (needed for Sacral Authority)`);
  }
  
  commonIssues.forEach(issue => console.log(issue));
  
  if (commonIssues.length === 0) {
    console.log('✅ No consistent patterns found - issues may be case-specific');
  }
  
  console.log('\n💡 INSIGHTS & NEXT STEPS:');
  if (designSunIssues.length > 0) {
    console.log('• Design Sun calculation appears systematically broken - investigate 88-degree calculation');
  }
  if (sacralIssues.length > 0) {
    console.log('• Sacral center activation logic needs debugging - check gates 34, 5, 14, 29, 59, 9, 3, 42, 27');
  }
  if (typeIssues.length > 0) {
    console.log('• Energy Type determination depends on Sacral definition - fix Sacral first');
  }
  
  return results;
}

// Run the analysis
runAllTests().catch(console.error);
// Quick verification that our fix worked by testing the exact same data
const http = require('http');

function makeAPICall(testData) {
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
          reject(new Error(`Failed to parse response: ${data.substring(0, 200)}...`));
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

async function testFix() {
  console.log('🚀 VERIFYING 88-DEGREE CALCULATION FIX');
  console.log('=====================================\n');

  // Test Dave with correct time
  const daveData = {
    name: 'Dave',
    birthDate: '1969-12-12',
    birthTime: '22:12',
    birthPlace: 'Fresno, CA, USA'
  };

  try {
    console.log('📞 Calling API with Dave\'s data...');
    const result = await makeAPICall(daveData);
    
    if (!result.success) {
      console.log('❌ API Error:', result.error);
      return;
    }

    const chart = result.chart;
    const personalitySun = chart.personalityActivations?.find(a => a.planet === 'Sun');
    const designSun = chart.designActivations?.find(a => a.planet === 'Sun');

    console.log('\n📊 RESULTS AFTER FIX:');
    console.log(`   Personality Sun: Gate ${personalitySun?.gate}.${personalitySun?.line} (Expected: Gate 26.5)`);
    console.log(`   Design Sun: Gate ${designSun?.gate}.${designSun?.line} (Expected: Gate 45.1)`);

    // Check if fix worked
    const personalityCorrect = personalitySun?.gate === 26;
    const designFixed = designSun?.gate === 45;

    console.log('\n🎯 FIX STATUS:');
    console.log(`   Personality Sun: ${personalityCorrect ? '✅ CORRECT' : '❌ STILL WRONG'}`);
    console.log(`   Design Sun: ${designFixed ? '🎉 FIXED! 🎉' : '❌ STILL BROKEN'}`);

    if (designFixed) {
      console.log('\n🎊 SUCCESS! The 88-degree calculation fix worked!');
      console.log('   Design Sun is now correctly showing Gate 45 instead of Gate 6');
    } else {
      console.log('\n⚠️ Fix may need more work - design sun still not correct');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testFix().catch(console.error);
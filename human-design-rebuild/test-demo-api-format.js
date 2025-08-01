/**
 * Test API using the exact format from the official demo
 * GET request with URL parameters as shown in main.js line 125
 */

const https = require('https');

function callDemoAPIFormat(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    // Format exactly like the demo: YYYY-MM-DD HH:MM
    const date = `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`;
    
    // Build URL exactly like the demo
    const path = `/v210502/hd-data?api_key=${apiKey}&date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(birthData.timezone)}`;
    
    console.log(`API URL: https://api.bodygraphchart.com${path}`);

    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {}
    };

    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}\nRaw: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testDemoAPIFormat() {
  console.log('🔍 Testing API with Official Demo Format - ALL 3 SUBJECTS\n');
  
  const apiKey = '9d0bb04f-34f4-4c22-92b1-008bba6bf02e';
  
  // Test subjects with verified reference data
  const TEST_SUBJECTS = [
    {
      name: 'Dave',
      birth: { year: 1969, month: 12, day: 12, hour: 22, minute: 12, timezone: 'America/Los_Angeles' },
      expected: { personalitySunGate: 26, designSunGate: 45, personalitySunLine: 5, designSunLine: 1 }
    },
    {
      name: 'Ben',
      birth: { year: 1986, month: 11, day: 17, hour: 10, minute: 19, timezone: 'America/Denver' },
      expected: { personalitySunGate: 14, designSunGate: 8, personalitySunLine: 1, designSunLine: 3 }
    },
    {
      name: 'Elodi',
      birth: { year: 2016, month: 7, day: 10, hour: 11, minute: 0, timezone: 'America/Denver' },
      expected: { personalitySunGate: 53, designSunGate: 54, personalitySunLine: 4, designSunLine: 1 }
    }
  ];
  
  for (const subject of TEST_SUBJECTS) {
    console.log(`=== ${subject.name.toUpperCase()} ===`);
    console.log(`Birth: ${JSON.stringify(subject.birth)}`);
    
    try {
      const result = await callDemoAPIFormat(apiKey, subject.birth);
      
      if (result.error) {
        console.log(`❌ API Error: ${result.error}`);
        continue;
      }
      
      console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
      console.log('Design Date Returned:', result.Properties?.DesignDateUtc);
      
      // Check if we're getting real data (not the static 1990 data)
      const birthDate = result.Properties?.BirthDateLocal;
      if (birthDate && birthDate.includes('1990')) {
        console.log('⚠️ Still getting static 1990 test data');
      } else if (birthDate) {
        console.log('✅ SUCCESS! API is processing our real birth data');
      }
      
      // Extract Sun positions
      const personalitySun = result.Personality?.Sun;
      const designSun = result.Design?.Sun;
      
      console.log('\n--- SUN POSITIONS ---');
      console.log(`API Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
      console.log(`Expected: Gate ${subject.expected.personalitySunGate} Line ${subject.expected.personalitySunLine}`);
      const personalityMatch = personalitySun?.Gate === subject.expected.personalitySunGate && personalitySun?.Line === subject.expected.personalitySunLine;
      console.log(`Personality Match: ${personalityMatch ? '✅' : '❌'}`);
      
      console.log(`API Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
      console.log(`Expected: Gate ${subject.expected.designSunGate} Line ${subject.expected.designSunLine}`);
      const designMatch = designSun?.Gate === subject.expected.designSunGate && designSun?.Line === subject.expected.designSunLine;
      console.log(`Design Match: ${designMatch ? '✅' : '❌'}`);
      
      // Show chart properties
      console.log('\n--- CHART PROPERTIES ---');
      console.log(`Type: ${result.Properties?.Type?.id || result.Properties?.Type}`);
      console.log(`Profile: ${result.Properties?.Profile?.id || result.Properties?.Profile}`);
      console.log(`Authority: ${result.Properties?.InnerAuthority?.id || result.Properties?.InnerAuthority}`);
      console.log(`Definition: ${result.Properties?.Definition?.id || result.Properties?.Definition}`);
      
      if (personalityMatch && designMatch) {
        console.log('\n🎯 PERFECT MATCH! This confirms our reference data is correct');
        console.log('We can now use this API data to debug our calculations');
      }
      
    } catch (error) {
      console.error(`❌ Error for ${subject.name}:`, error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

testDemoAPIFormat().catch(console.error);
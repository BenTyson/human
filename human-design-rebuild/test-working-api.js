/**
 * Test the working API format for all 3 subjects
 * Using: POST /v221006/hd-data?api_key=KEY with JSON content-type
 */

const https = require('https');

function callWorkingAPI(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(birthData);

    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: `/v221006/hd-data?api_key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testWorkingAPIAllThree() {
  console.log('🔍 Testing Working API Format - ALL 3 SUBJECTS\n');
  
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
      const result = await callWorkingAPI(apiKey, subject.birth);
      
      console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
      console.log('Design Date Returned:', result.Properties?.DesignDateUtc);
      
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
      console.log(`Type: ${result.Properties?.Type?.id}`);
      console.log(`Profile: ${result.Properties?.Profile?.id}`);
      console.log(`Authority: ${result.Properties?.InnerAuthority?.id}`);
      console.log(`Definition: ${result.Properties?.Definition?.id}`);
      
      if (personalityMatch && designMatch) {
        console.log('\n🎯 PERFECT MATCH! This API data is our authoritative reference');
      } else {
        console.log('\n⚠️ API data differs from our expected values');
        console.log('The API data should be considered authoritative - our reference data may need updating');
      }
      
    } catch (error) {
      console.error(`❌ API Error for ${subject.name}:`, error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  console.log('🎯 NEXT STEPS:');
  console.log('1. If API matches our expected data: Use API to validate our calculations');
  console.log('2. If API differs: Update our reference data to match the authoritative API');
  console.log('3. Use API data to reverse-engineer the correct calculation methodology');
}

testWorkingAPIAllThree().catch(console.error);
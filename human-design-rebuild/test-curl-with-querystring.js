/**
 * Test the curl format but using querystring instead of form-data
 * Since the API key was working with GET requests
 */

const https = require('https');
const querystring = require('querystring');

function testCurlWithQuerystring(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    // Format date exactly like the curl example
    const dateString = `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`;
    
    console.log(`Formatted date: ${dateString}`);
    console.log(`Timezone: ${birthData.timezone}`);
    
    // Create form data using the curl array format
    const formData = {
      'api_key': apiKey,
      'date[0]': dateString,
      'timezone[0]': birthData.timezone,
      'relationship': '1'
    };
    
    console.log('Form data being sent:', formData);
    
    const postData = querystring.stringify(formData);

    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: '/v221006/hd-data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
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

    req.write(postData);
    req.end();
  });
}

async function testCurlFormat() {
  console.log('🔍 Testing Curl Format with Querystring - Ben\'s Data\n');
  
  const apiKey = '9d0bb04f-34f4-4c22-92b1-008bba6bf02e';
  
  // Ben's birth data
  const benBirth = {
    year: 1986,
    month: 11,
    day: 17,
    hour: 10,
    minute: 19,
    timezone: 'America/Denver'
  };
  
  console.log('=== BEN\'S BIRTH DATA ===');
  console.log(`Birth: ${JSON.stringify(benBirth)}`);
  console.log('Expected: Personality Sun Gate 14 Line 1, Design Sun Gate 8 Line 3\n');
  
  try {
    const result = await testCurlWithQuerystring(apiKey, benBirth);
    
    if (result.error) {
      console.log(`❌ API Error: ${result.error}`);
      return;
    }
    
    console.log('\n=== API RESPONSE ===');
    console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
    console.log('Design Date Returned:', result.Properties?.DesignDateUtc);
    
    // Extract Sun positions
    const personalitySun = result.Personality?.Sun;
    const designSun = result.Design?.Sun;
    
    console.log('\n--- SUN POSITIONS ---');
    console.log(`API Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
    console.log(`Expected: Gate 14 Line 1`);
    console.log(`Personality Match: ${personalitySun?.Gate === 14 && personalitySun?.Line === 1 ? '✅' : '❌'}`);
    
    console.log(`API Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
    console.log(`Expected: Gate 8 Line 3`);
    console.log(`Design Match: ${designSun?.Gate === 8 && designSun?.Line === 3 ? '✅' : '❌'}`);
    
    if (designSun?.Gate === 8) {
      console.log('\n🎯 SUCCESS! Found the correct API format for accurate results');
    } else {
      console.log(`\n⚠️ Still getting Gate ${designSun?.Gate} instead of expected Gate 8`);
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testCurlFormat().catch(console.error);
/**
 * Debug the actual API response to understand the structure
 */

const https = require('https');
const querystring = require('querystring');

function debugAPIResponse(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    const dateString = `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`;
    
    const formData = {
      'api_key': apiKey,
      'date[0]': dateString,
      'timezone[0]': birthData.timezone,
      'relationship': '1'
    };
    
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
      console.log(`Headers:`, res.headers);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\nRaw Response (first 1000 chars):\n${data.substring(0, 1000)}`);
        
        try {
          const result = JSON.parse(data);
          console.log('\nParsed JSON keys:', Object.keys(result));
          resolve(result);
        } catch (error) {
          console.log('\nFailed to parse as JSON');
          resolve({ raw: data, error: error.message });
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

async function debugAPI() {
  console.log('🔍 Debugging API Response Structure\n');
  
  const apiKey = '03e6281c-9d38-46b8-9f80-13c469630d31';
  
  const testBirth = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  try {
    const result = await debugAPIResponse(apiKey, testBirth);
    
    console.log('\n=== FULL ANALYSIS ===');
    
    if (result.error) {
      console.log('Response is not valid JSON');
      console.log('This might be HTML error page or different format');
    } else {
      console.log('\nFull response structure:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('Request Error:', error.message);
  }
}

debugAPI().catch(console.error);
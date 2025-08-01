/**
 * Test different authentication methods for Bodygraph API
 */

const https = require('https');

function testAuthMethod(method, apiKey, description) {
  return new Promise((resolve) => {
    console.log(`\n=== Testing ${description} ===`);
    
    const testData = {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      timezone: 'America/New_York'
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: '/v221006/hd-data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    // Apply different auth methods
    switch (method) {
      case 'bearer':
        options.headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'apikey-header':
        options.headers['X-API-Key'] = apiKey;
        break;
      case 'apikey-param':
        options.path = `/v221006/hd-data?api_key=${apiKey}`;
        break;
      case 'in-body':
        const dataWithKey = { ...testData, api_key: apiKey };
        const newPostData = JSON.stringify(dataWithKey);
        options.headers['Content-Length'] = Buffer.byteLength(newPostData);
        testData.api_key = apiKey;
        break;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const result = JSON.parse(data);
          if (result.error) {
            console.log(`Error: ${result.error}`);
          } else {
            console.log('✅ SUCCESS! Got valid response');
            console.log('Response keys:', Object.keys(result));
          }
        } catch (error) {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      resolve();
    });
    
    if (method === 'in-body') {
      req.write(JSON.stringify({ ...testData, api_key: apiKey }));
    } else {
      req.write(postData);
    }
    req.end();
  });
}

async function testAllAuthMethods(apiKey) {
  console.log('🔍 Testing Different Authentication Methods\n');
  console.log(`API Key: ${apiKey}\n`);
  
  await testAuthMethod('bearer', apiKey, 'Bearer Token in Authorization Header');
  await testAuthMethod('apikey-header', apiKey, 'API Key in X-API-Key Header');
  await testAuthMethod('apikey-param', apiKey, 'API Key as URL Parameter');
  await testAuthMethod('in-body', apiKey, 'API Key in Request Body');
  
  console.log('\n🎯 Try visiting the API documentation again to check for updated auth requirements');
  console.log('or contact Bodygraph support for API key activation status');
}

const apiKey = process.argv[2] || '03e6281c-9d38-46b8-9f80-13c469630d31';
testAllAuthMethods(apiKey).catch(console.error);
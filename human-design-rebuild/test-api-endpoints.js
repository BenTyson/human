/**
 * Test different API endpoints and methods to find the working one
 */

const https = require('https');
const querystring = require('querystring');

function testEndpoint(path, method, data, contentType, apiKey) {
  return new Promise((resolve) => {
    console.log(`\n=== Testing ${method} ${path} ===`);
    console.log(`Content-Type: ${contentType}`);
    
    let postData = '';
    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: path,
      method: method,
      headers: {}
    };
    
    if (method === 'POST') {
      if (contentType === 'application/json') {
        postData = JSON.stringify(data);
        options.headers['Content-Type'] = 'application/json';
      } else if (contentType === 'application/x-www-form-urlencoded') {
        postData = querystring.stringify(data);
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            console.log(`Error: ${result.error}`);
          } else {
            console.log('✅ Success! Got valid response');
            console.log(`Keys: ${Object.keys(result).join(', ')}`);
          }
        } catch (error) {
          console.log(`Raw response (first 200 chars): ${responseData.substring(0, 200)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`Request error: ${error.message}`);
      resolve();
    });
    
    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🔍 Testing Different API Endpoints and Methods\n');
  
  const apiKey = '03e6281c-9d38-46b8-9f80-13c469630d31';
  
  const testData = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  const formData = {
    'api_key': apiKey,
    'date[0]': '1969-12-12 22:12',
    'timezone[0]': 'America/Los_Angeles',
    'relationship': '1'
  };
  
  const jsonDataWithKey = {
    ...testData,
    api_key: apiKey
  };
  
  // Test different combinations
  await testEndpoint('/v221006/hd-data', 'POST', formData, 'application/x-www-form-urlencoded');
  await testEndpoint('/v221006/hd-data', 'POST', jsonDataWithKey, 'application/json');
  await testEndpoint(`/v221006/hd-data?api_key=${apiKey}`, 'POST', formData, 'application/x-www-form-urlencoded');
  await testEndpoint(`/v221006/hd-data?api_key=${apiKey}`, 'POST', testData, 'application/json');
  
  // Try older API versions
  await testEndpoint('/v210502/hd-data', 'POST', formData, 'application/x-www-form-urlencoded');
  await testEndpoint(`/v210502/hd-data?api_key=${apiKey}`, 'POST', testData, 'application/json');
  
  // Try different paths
  await testEndpoint('/hd-data', 'POST', formData, 'application/x-www-form-urlencoded');
  await testEndpoint(`/hd-data?api_key=${apiKey}`, 'POST', testData, 'application/json');
  
  console.log('\n🎯 If none work, the API key might need activation or have different requirements');
  console.log('Consider contacting Bodygraph support to verify API key status and correct usage');
}

testAllEndpoints().catch(console.error);
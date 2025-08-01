/**
 * Test Bodygraph API structure and authentication
 * This helps us understand the API before using the real key
 */

const https = require('https');

function testAPIStructure() {
  console.log('🔍 Testing Bodygraph API Structure\n');
  
  // Test with dummy data to see authentication error format
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
      'Authorization': 'Bearer DUMMY_KEY',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('Making test request to understand API response format...\n');
  
  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const result = JSON.parse(data);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log('Raw response (not JSON):', data);
      }
      
      console.log('\n🎯 ANALYSIS:');
      if (res.statusCode === 401) {
        console.log('✅ API endpoint exists but requires valid authentication');
        console.log('Ready to test with real API key');
      } else if (res.statusCode === 404) {
        console.log('❌ API endpoint not found - check URL');
      } else {
        console.log(`Unexpected status code: ${res.statusCode}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testAPIStructure();
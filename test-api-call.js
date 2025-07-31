// Test our current API with the December 12, 1969 data

const fetch = require('http');

const postData = JSON.stringify({
  birthDate: '1969-12-12',
  birthTime: '18:32',
  birthPlace: 'Fresno, CA'
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

console.log('Testing our current API calculation...');
console.log('Data:', postData);

const req = fetch.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n=== API RESPONSE ===');
      
      if (result.personality && result.design) {
        const personalitySun = result.personality.find(p => p.planet === 'Sun');
        const designSun = result.design.find(p => p.planet === 'Sun');
        
        console.log('Personality Sun:', personalitySun);
        console.log('Design Sun:', designSun);
        
        if (personalitySun && designSun) {
          console.log('\n=== COMPARISON ===');
          console.log(`Personality: Gate ${personalitySun.gate}.${personalitySun.line}`);
          console.log(`Design: Gate ${designSun.gate}.${designSun.line}`);
          console.log(`Expected: Personality=Gate 26.5, Design=Gate 45.1`);
        }
      } else {
        console.log('Full response:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
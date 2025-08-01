/**
 * Test Bodygraph API with correct form-data format
 * Based on documentation showing form-data is required, not JSON
 */

const https = require('https');
const querystring = require('querystring');

function callBodygraphAPICorrectFormat(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    // Format date as YYYY-MM-DD HH:MM
    const dateString = `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`;
    
    console.log(`Formatted date string: ${dateString}`);
    console.log(`Timezone: ${birthData.timezone}`);
    
    // Prepare form data according to documentation
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
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}\nRaw response: ${data}`));
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

async function testCorrectAPIFormat() {
  console.log('🔍 Testing Bodygraph API with Correct Form-Data Format\n');
  
  const apiKey = '03e6281c-9d38-46b8-9f80-13c469630d31';
  
  // Test with Dave's data first
  const daveBirth = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  console.log('=== TESTING DAVE\'S BIRTH DATA ===');
  console.log(`Original: ${daveBirth.year}-${daveBirth.month}-${daveBirth.day} ${daveBirth.hour}:${daveBirth.minute} ${daveBirth.timezone}`);
  console.log('Expected: Personality Sun Gate 26, Design Sun Gate 45');
  
  try {
    const result = await callBodygraphAPICorrectFormat(apiKey, daveBirth);
    
    console.log('\n=== API RESPONSE ===');
    console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
    console.log('Design Date Returned:', result.Properties?.DesignDateUtc);
    
    // Check if the birth date matches what we sent
    const personalitySun = result.Personality?.Sun;
    const designSun = result.Design?.Sun;
    
    console.log('\n--- SUN POSITIONS ---');
    console.log(`Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
    console.log(`Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
    
    // Check if this matches Dave's expected results
    const personalityMatch = personalitySun?.Gate === 26;
    const designMatch = designSun?.Gate === 45;
    
    console.log(`\nPersonality Sun Match: ${personalityMatch ? '✅' : '❌'} (expected Gate 26)`);
    console.log(`Design Sun Match: ${designMatch ? '✅' : '❌'} (expected Gate 45)`);
    
    if (personalityMatch && designMatch) {
      console.log('\n🎯 SUCCESS! API is now working correctly with form-data format');
      console.log('We can now use this to validate all 3 subjects');
    } else {
      console.log('\n⚠️ API accepting our data but results don\'t match expected values');
      console.log('This could indicate our reference data needs verification');
    }
    
    // Show type and profile too
    console.log('\n--- CHART PROPERTIES ---');
    console.log(`Type: ${result.Properties?.Type?.id}`);
    console.log(`Profile: ${result.Properties?.Profile?.id}`);
    console.log(`Authority: ${result.Properties?.InnerAuthority?.id}`);
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testCorrectAPIFormat().catch(console.error);
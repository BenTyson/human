/**
 * Test API using the exact curl format from documentation
 * POST with form-data and array-style parameters
 */

const https = require('https');
const FormData = require('form-data');

function callCorrectAPIFormat(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    // Format date exactly like the curl example: YYYY-MM-DD HH:MM
    const dateString = `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`;
    
    console.log(`Formatted date: ${dateString}`);
    console.log(`Timezone: ${birthData.timezone}`);
    
    // Create form data exactly like the curl example
    const form = new FormData();
    form.append('api_key', apiKey);
    form.append('date[0]', dateString);
    form.append('timezone[0]', birthData.timezone);
    form.append('relationship', '1');
    
    console.log('Form data fields:');
    console.log(`  api_key: ${apiKey}`);
    console.log(`  date[0]: ${dateString}`);
    console.log(`  timezone[0]: ${birthData.timezone}`);
    console.log(`  relationship: 1`);

    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: '/v221006/hd-data',
      method: 'POST',
      headers: form.getHeaders()
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

    form.pipe(req);
  });
}

async function testCorrectCurlFormat() {
  console.log('🔍 Testing API with Correct Curl Format - Ben\'s Data\n');
  
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
  console.log('Expected: Personality Sun Gate 14 Line 1, Design Sun Gate 8 Line 3');
  console.log('Expected: Manifesting Generator, 1/3, Sacral Authority, Single Definition\n');
  
  try {
    const result = await callCorrectAPIFormat(apiKey, benBirth);
    
    if (result.error) {
      console.log(`❌ API Error: ${result.error}`);
      return;
    }
    
    console.log('\n=== API RESPONSE ===');
    console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
    console.log('Design Date Returned:', result.Properties?.DesignDateUtc);
    
    // Check if we're getting real data (not static test data)
    const birthDate = result.Properties?.BirthDateLocal;
    if (birthDate && birthDate.includes('1986')) {
      console.log('✅ SUCCESS! API is processing Ben\'s real birth data');
    } else {
      console.log('⚠️ API might not be processing our data correctly');
    }
    
    // Extract and verify Sun positions
    const personalitySun = result.Personality?.Sun;
    const designSun = result.Design?.Sun;
    
    console.log('\n--- SUN POSITIONS ---');
    console.log(`API Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
    console.log(`Expected: Gate 14 Line 1`);
    const personalityMatch = personalitySun?.Gate === 14 && personalitySun?.Line === 1;
    console.log(`Personality Match: ${personalityMatch ? '✅' : '❌'}`);
    
    console.log(`API Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
    console.log(`Expected: Gate 8 Line 3`);
    const designMatch = designSun?.Gate === 8 && designSun?.Line === 3;
    console.log(`Design Match: ${designMatch ? '✅' : '❌'}`);
    
    // Check other chart properties
    console.log('\n--- CHART PROPERTIES ---');
    const type = result.Properties?.Type?.id || result.Properties?.Type;
    const profile = result.Properties?.Profile?.id || result.Properties?.Profile;
    const authority = result.Properties?.InnerAuthority?.id || result.Properties?.InnerAuthority;
    const definition = result.Properties?.Definition?.id || result.Properties?.Definition;
    
    console.log(`Type: ${type}`);
    console.log(`Profile: ${profile}`);
    console.log(`Authority: ${authority}`);
    console.log(`Definition: ${definition}`);
    
    // Check matches
    const typeMatch = type && type.includes('Manifesting Generator');
    const profileMatch = profile === '1 / 3';
    const authorityMatch = authority && authority.includes('Sacral');
    const definitionMatch = definition && definition.includes('Single');
    
    console.log(`\nType Match: ${typeMatch ? '✅' : '❌'} (expected Manifesting Generator)`);
    console.log(`Profile Match: ${profileMatch ? '✅' : '❌'} (expected 1/3)`);
    console.log(`Authority Match: ${authorityMatch ? '✅' : '❌'} (expected Sacral)`);
    console.log(`Definition Match: ${definitionMatch ? '✅' : '❌'} (expected Single)`);
    
    if (personalityMatch && designMatch && typeMatch && profileMatch) {
      console.log('\n🎯 PERFECT MATCH! This is the correct API format');
      console.log('Now we can test all 3 subjects with confidence');
    } else {
      console.log('\n⚠️ Some results don\'t match - need further investigation');
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testCorrectCurlFormat().catch(console.error);
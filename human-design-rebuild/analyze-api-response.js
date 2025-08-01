/**
 * Analyze the Bodygraph API response structure to understand their methodology
 * Test with Dave's birth data specifically
 */

const https = require('https');

function callBodygraphAPI(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    console.log('Sending birth data:', JSON.stringify(birthData, null, 2));
    
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

async function analyzeDaveAPIResponse(apiKey) {
  console.log('🔍 Analyzing Bodygraph API Response for Dave\n');
  
  // Dave's exact birth data
  const daveBirth = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  console.log('=== DAVE\'S BIRTH DATA ===');
  console.log(`Date: ${daveBirth.year}-${daveBirth.month}-${daveBirth.day}`);
  console.log(`Time: ${daveBirth.hour}:${daveBirth.minute}`);
  console.log(`Timezone: ${daveBirth.timezone}`);
  console.log('Expected: Generator, 5/1, Gate 26 Personality, Gate 45 Design\n');
  
  try {
    const apiResult = await callBodygraphAPI(apiKey, daveBirth);
    
    console.log('=== API RESPONSE ANALYSIS ===');
    
    // Check if we got the right birth date back
    console.log('Birth Date Returned:', apiResult.Properties?.BirthDateLocal);
    console.log('Design Date Returned:', apiResult.Properties?.DesignDateUtc);
    
    // Extract Sun positions
    const personalitySun = apiResult.Personality?.Sun;
    const designSun = apiResult.Design?.Sun;
    
    console.log('\n--- SUN POSITIONS ---');
    console.log(`Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
    console.log(`Expected: Gate 26 Line 5`);
    console.log(`Match: ${personalitySun?.Gate === 26 && personalitySun?.Line === 5 ? '✅' : '❌'}`);
    
    console.log(`Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
    console.log(`Expected: Gate 45 Line 1`);
    console.log(`Match: ${designSun?.Gate === 45 && designSun?.Line === 1 ? '✅' : '❌'}`);
    
    // Extract chart properties
    const type = apiResult.Properties?.Type?.id;
    const profile = apiResult.Properties?.Profile?.id;
    const authority = apiResult.Properties?.InnerAuthority?.id;
    
    console.log('\n--- CHART PROPERTIES ---');
    console.log(`Type: ${type} (expected GENERATOR)`);
    console.log(`Profile: ${profile} (expected 5/1)`);
    console.log(`Authority: ${authority} (expected Sacral)`);
    
    // Check if this matches our expected results
    const typeMatch = type?.includes('Generator') || type?.includes('GENERATOR');
    const profileMatch = profile === '5 / 1';
    const authorityMatch = authority?.includes('Sacral') || authority?.includes('SACRAL');
    
    console.log(`Type Match: ${typeMatch ? '✅' : '❌'}`);
    console.log(`Profile Match: ${profileMatch ? '✅' : '❌'}`);
    console.log(`Authority Match: ${authorityMatch ? '✅' : '❌'}`);
    
    // If data doesn't match, there might be a timezone or date format issue
    if (!personalitySun || personalitySun.Gate !== 26) {
      console.log('\n⚠️ API data doesn\'t match expected results for Dave');
      console.log('This could indicate:');
      console.log('1. Timezone conversion issue');
      console.log('2. Date format problem');
      console.log('3. Different calculation methodology');
      
      console.log('\nLet me try alternative timezone formats...');
      
      // Try different timezone formats
      const alternativeFormats = [
        { ...daveBirth, timezone: 'PST' },
        { ...daveBirth, timezone: 'UTC-8' },
        { ...daveBirth, timezone: 'America/Los_Angeles' },
        { ...daveBirth, timezone: 'Pacific/Los_Angeles' }
      ];
      
      for (const altFormat of alternativeFormats) {
        console.log(`\nTrying timezone: ${altFormat.timezone}`);
        try {
          const altResult = await callBodygraphAPI(apiKey, altFormat);
          const altPersonalitySun = altResult.Personality?.Sun;
          
          if (altPersonalitySun?.Gate === 26) {
            console.log(`✅ Found correct format: ${altFormat.timezone}`);
            console.log(`Personality Sun: Gate ${altPersonalitySun.Gate} Line ${altPersonalitySun.Line}`);
            break;
          } else {
            console.log(`Gate ${altPersonalitySun?.Gate} (still not 26)`);
          }
        } catch (error) {
          console.log(`Error with ${altFormat.timezone}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

const apiKey = '03e6281c-9d38-46b8-9f80-13c469630d31';
analyzeDaveAPIResponse(apiKey).catch(console.error);
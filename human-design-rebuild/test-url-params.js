/**
 * Test API with birth data as URL parameters instead of POST body
 */

const https = require('https');

function testURLParams(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    // Try different URL parameter formats
    const formats = [
      // Format 1: Simple parameters
      {
        name: 'Simple Parameters',
        path: `/v221006/hd-data?api_key=${apiKey}&year=${birthData.year}&month=${birthData.month}&day=${birthData.day}&hour=${birthData.hour}&minute=${birthData.minute}&timezone=${encodeURIComponent(birthData.timezone)}`
      },
      // Format 2: Date string parameter
      {
        name: 'Date String Parameter',
        path: `/v221006/hd-data?api_key=${apiKey}&date=${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}&timezone=${encodeURIComponent(birthData.timezone)}`
      },
      // Format 3: Array-style parameters (like the form-data)
      {
        name: 'Array Style Parameters',
        path: `/v221006/hd-data?api_key=${apiKey}&date[0]=${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')} ${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}&timezone[0]=${encodeURIComponent(birthData.timezone)}&relationship=1`
      }
    ];
    
    async function testFormat(format) {
      return new Promise((resolve) => {
        console.log(`\n--- Testing ${format.name} ---`);
        console.log(`URL: ${format.path.substring(0, 100)}...`);
        
        const options = {
          hostname: 'api.bodygraphchart.com',
          port: 443,
          path: format.path,
          method: 'GET',
          headers: {}
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              
              if (result.error) {
                console.log(`Error: ${result.error}`);
              } else {
                console.log('Birth Date Returned:', result.Properties?.BirthDateLocal);
                const personalitySun = result.Personality?.Sun;
                console.log(`Personality Sun: Gate ${personalitySun?.Gate} Line ${personalitySun?.Line}`);
                
                // Check if this is NOT the static 1990 data
                const birthDate = result.Properties?.BirthDateLocal;
                if (birthDate && !birthDate.includes('1990')) {
                  console.log('✅ SUCCESS! API processed our birth data correctly');
                  return resolve({ success: true, data: result, format: format.name });
                } else {
                  console.log('Still getting static 1990 data');
                }
              }
            } catch (error) {
              console.log(`Parse error: ${error.message}`);
            }
            resolve({ success: false, format: format.name });
          });
        });

        req.on('error', (error) => {
          console.log(`Request error: ${error.message}`);
          resolve({ success: false, format: format.name });
        });

        req.end();
      });
    }
    
    // Test all formats
    (async () => {
      for (const format of formats) {
        const result = await testFormat(format);
        if (result.success) {
          return resolve(result);
        }
      }
      resolve({ success: false });
    })();
  });
}

async function testURLParameterApproach() {
  console.log('🔍 Testing API with URL Parameters Instead of POST Body\n');
  
  const apiKey = '03e6281c-9d38-46b8-9f80-13c469630d31';
  
  // Test with Dave's data
  const daveBirth = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  console.log('=== TESTING DAVE\'S DATA WITH URL PARAMETERS ===');
  console.log(`Birth: ${JSON.stringify(daveBirth)}`);
  
  try {
    const result = await testURLParams(apiKey, daveBirth);
    
    if (result.success) {
      console.log(`\n🎯 FOUND WORKING FORMAT: ${result.format}`);
      console.log('Now we can test all 3 subjects with this format');
    } else {
      console.log('\n❌ None of the URL parameter formats worked');
      console.log('The API might require special activation or have different requirements');
      console.log('Consider contacting Bodygraph support for API usage guidance');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testURLParameterApproach().catch(console.error);
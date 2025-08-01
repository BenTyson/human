/**
 * Compare different API versions and parameter combinations
 * Test v210502 vs v221006 and different parameter formats
 */

const https = require('https');

function callAPI(version, apiKey, params, description) {
  return new Promise((resolve) => {
    console.log(`\n=== ${description} ===`);
    
    let path;
    if (params.method === 'GET') {
      path = `/${version}/hd-data?api_key=${apiKey}&${params.query}`;
    } else {
      path = `/${version}/hd-data?api_key=${apiKey}`;
    }
    
    console.log(`URL: https://api.bodygraphchart.com${path}`);

    const options = {
      hostname: 'api.bodygraphchart.com',
      port: 443,
      path: path,
      method: params.method || 'GET',
      headers: params.headers || {}
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
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
            const birthDate = result.Properties?.BirthDateLocal;
            const designSun = result.Design?.Sun;
            
            console.log(`Birth Date: ${birthDate}`);
            console.log(`Design Sun: Gate ${designSun?.Gate} Line ${designSun?.Line}`);
            
            // Check if this matches Dave's expected design (Gate 45)
            if (designSun?.Gate === 45) {
              console.log('🎯 CORRECT RESULT! Design Sun matches expected Gate 45');
              resolve({ success: true, result, version, description });
              return;
            } else if (designSun?.Gate) {
              console.log(`❌ Wrong result: Got Gate ${designSun.Gate}, expected Gate 45`);
            }
          }
        } catch (error) {
          console.log(`Parse error: ${error.message}`);
        }
        resolve({ success: false, version, description });
      });
    });

    req.on('error', (error) => {
      console.log(`Request error: ${error.message}`);
      resolve({ success: false, version, description });
    });

    if (params.method === 'POST' && params.body) {
      req.write(params.body);
    }
    req.end();
  });
}

async function compareAPIVersions() {
  console.log('🔍 Comparing API Versions and Parameter Formats');
  console.log('Testing with Dave\'s data - Expected Design Sun: Gate 45 Line 1\n');
  
  const apiKey = '9d0bb04f-34f4-4c22-92b1-008bba6bf02e';
  
  // Dave's birth data
  const daveBirth = {
    year: 1969,
    month: 12,
    day: 12,
    hour: 22,
    minute: 12,
    timezone: 'America/Los_Angeles'
  };
  
  const date = `${daveBirth.year}-${daveBirth.month.toString().padStart(2, '0')}-${daveBirth.day.toString().padStart(2, '0')} ${daveBirth.hour.toString().padStart(2, '0')}:${daveBirth.minute.toString().padStart(2, '0')}`;
  
  const testCases = [
    // Current working format from demo
    {
      version: 'v210502',
      params: {
        method: 'GET',
        query: `date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(daveBirth.timezone)}`
      },
      description: 'v210502 GET with date/timezone (current working)'
    },
    
    // Try newer version with same format
    {
      version: 'v221006',
      params: {
        method: 'GET', 
        query: `date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(daveBirth.timezone)}`
      },
      description: 'v221006 GET with date/timezone'
    },
    
    // Try with array-style parameters
    {
      version: 'v210502',
      params: {
        method: 'GET',
        query: `date[0]=${encodeURIComponent(date)}&timezone[0]=${encodeURIComponent(daveBirth.timezone)}&relationship=1`
      },
      description: 'v210502 GET with array-style parameters'
    },
    
    // Try with individual date components
    {
      version: 'v210502',
      params: {
        method: 'GET',
        query: `year=${daveBirth.year}&month=${daveBirth.month}&day=${daveBirth.day}&hour=${daveBirth.hour}&minute=${daveBirth.minute}&timezone=${encodeURIComponent(daveBirth.timezone)}`
      },
      description: 'v210502 GET with individual components'
    },
    
    // Try POST with JSON (what I was doing before)
    {
      version: 'v221006',
      params: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(daveBirth)
      },
      description: 'v221006 POST with JSON body'
    }
  ];
  
  let correctFormat = null;
  
  for (const testCase of testCases) {
    const result = await callAPI(testCase.version, apiKey, testCase.params, testCase.description);
    
    if (result.success) {
      correctFormat = result;
      break;
    }
  }
  
  if (correctFormat) {
    console.log(`\n🎯 FOUND CORRECT FORMAT: ${correctFormat.description}`);
    console.log('This format gives the expected Design Sun Gate 45 for Dave');
    console.log('Now we can test all 3 subjects with this correct format');
  } else {
    console.log('\n❌ None of the tested formats returned the expected results');
    console.log('This suggests either:');
    console.log('1. Additional parameters are needed');
    console.log('2. Different timezone handling is required'); 
    console.log('3. Precision or calculation settings need to be specified');
    console.log('4. The API may have calculation differences vs the web calculators');
  }
}

compareAPIVersions().catch(console.error);
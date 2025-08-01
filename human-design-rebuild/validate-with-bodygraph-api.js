/**
 * Validate our calculations against Bodygraph API for ALL 3 subjects
 * This will help us understand the correct methodology
 */

const https = require('https');

// Test subjects - ALL 3 MUST BE TESTED
const TEST_SUBJECTS = [
  {
    name: 'Dave',
    birth: {
      year: 1969,
      month: 12,
      day: 12,
      hour: 22,
      minute: 12,
      timezone: 'America/Los_Angeles'
    },
    expected: {
      personalitySunGate: 26,
      designSunGate: 45,
      personalitySunLine: 5,
      designSunLine: 1,
      energyType: 'GENERATOR',
      profile: '5/1',
      authority: 'SACRAL'
    }
  },
  {
    name: 'Ben',
    birth: {
      year: 1986,
      month: 11,
      day: 17,
      hour: 10,
      minute: 19,
      timezone: 'America/Denver'
    },
    expected: {
      personalitySunGate: 14,
      designSunGate: 8,
      personalitySunLine: 1,
      designSunLine: 3,
      energyType: 'MANIFESTING_GENERATOR',
      profile: '1/3',
      authority: 'SACRAL'
    }
  },
  {
    name: 'Elodi',
    birth: {
      year: 2016,
      month: 7,
      day: 10,
      hour: 11,
      minute: 0,
      timezone: 'America/Denver'
    },
    expected: {
      personalitySunGate: 53,
      designSunGate: 54,
      personalitySunLine: 4,
      designSunLine: 1,
      energyType: 'GENERATOR',
      profile: '4/1',
      authority: 'SACRAL'
    }
  }
];

/**
 * Make API call to Bodygraph
 */
function callBodygraphAPI(apiKey, birthData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour,
      minute: birthData.minute,
      timezone: birthData.timezone
    });

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

/**
 * Validate all 3 subjects against Bodygraph API
 */
async function validateWithBodygraphAPI(apiKey) {
  console.log('🔍 Validating Against Bodygraph API - ALL 3 SUBJECTS\\n');
  console.log('This will help us understand the correct calculation methodology\\n');

  if (!apiKey) {
    console.log('❌ API Key required. Please provide your Bodygraph API key.');
    console.log('Usage: node validate-with-bodygraph-api.js YOUR_API_KEY');
    return;
  }

  for (const subject of TEST_SUBJECTS) {
    console.log(`=== ${subject.name.toUpperCase()} ===`);
    console.log(`Birth: ${subject.birth.year}-${subject.birth.month}-${subject.birth.day} ${subject.birth.hour}:${subject.birth.minute} ${subject.birth.timezone}`);

    try {
      const apiResult = await callBodygraphAPI(apiKey, subject.birth);
      
      console.log('\\n--- API RESPONSE ANALYSIS ---');
      
      // Look for personality and design Sun positions
      if (apiResult.personality && apiResult.design) {
        console.log('✅ API returned personality and design data');
        
        // Extract Sun positions if available
        const personalitySun = apiResult.personality.find(p => p.planet === 'Sun' || p.name === 'Sun');
        const designSun = apiResult.design.find(p => p.planet === 'Sun' || p.name === 'Sun');
        
        if (personalitySun) {
          console.log(`Personality Sun API: Gate ${personalitySun.gate} Line ${personalitySun.line}`);
          console.log(`Expected: Gate ${subject.expected.personalitySunGate} Line ${subject.expected.personalitySunLine}`);
          console.log(`Match: ${personalitySun.gate === subject.expected.personalitySunGate && personalitySun.line === subject.expected.personalitySunLine ? '✅' : '❌'}`);
        }
        
        if (designSun) {
          console.log(`Design Sun API: Gate ${designSun.gate} Line ${designSun.line}`);
          console.log(`Expected: Gate ${subject.expected.designSunGate} Line ${subject.expected.designSunLine}`);
          console.log(`Match: ${designSun.gate === subject.expected.designSunGate && designSun.line === subject.expected.designSunLine ? '✅' : '❌'}`);
        }
        
        // Check if API provides astronomical coordinates
        if (personalitySun && personalitySun.longitude !== undefined) {
          console.log(`Personality Sun longitude: ${personalitySun.longitude}°`);
        }
        if (designSun && designSun.longitude !== undefined) {
          console.log(`Design Sun longitude: ${designSun.longitude}°`);
        }
        
        // Check other chart properties
        if (apiResult.type) {
          console.log(`Energy Type API: ${apiResult.type} (expected ${subject.expected.energyType})`);
        }
        if (apiResult.profile) {
          console.log(`Profile API: ${apiResult.profile} (expected ${subject.expected.profile})`);
        }
        if (apiResult.authority) {
          console.log(`Authority API: ${apiResult.authority} (expected ${subject.expected.authority})`);
        }
        
      } else {
        console.log('❌ Unexpected API response format');
        console.log('Raw response keys:', Object.keys(apiResult));
      }
      
      console.log('\\n--- FULL API RESPONSE (for debugging) ---');
      console.log(JSON.stringify(apiResult, null, 2));
      
    } catch (error) {
      console.error(`❌ API Error for ${subject.name}:`, error.message);
    }
    
    console.log('\\n' + '='.repeat(60) + '\\n');
  }
  
  console.log('🎯 NEXT STEPS:');
  console.log('1. Compare API astronomical coordinates with our calculations');
  console.log('2. Identify differences in gate/line assignments');
  console.log('3. Reverse-engineer their coordinate-to-gate conversion logic');  
  console.log('4. Apply learnings to fix our gate wheel or calculation methodology');
}

// Get API key from command line argument
const apiKey = process.argv[2];
validateWithBodygraphAPI(apiKey).catch(console.error);
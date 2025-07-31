// Test binary search 88-degree calculation fix against ALL 3 subjects
const swisseph = require('swisseph');
const { fromZonedTime } = require('date-fns-tz');

const TEST_SUBJECTS = {
  dave: {
    name: 'Dave',
    birthData: {
      date: '1969-12-12',
      time: '22:12',
      timezone: 'America/Los_Angeles'
    },
    expected: {
      personalityType: 'Generator',
      personalitySun: 'Gate 26.5',
      designSun: 'Gate 45.1',
      incarnationCross: '(26/45 | 6/36)'
    }
  },
  ben: {
    name: 'Ben',
    birthData: {
      date: '1986-11-17',
      time: '10:19',
      timezone: 'America/Denver'
    },
    expected: {
      personalityType: 'Manifesting Generator',
      personalitySun: 'Gate 14',
      designSun: 'Gate 8',
      incarnationCross: '(14/8 | 29/30)'
    }
  },
  elodi: {
    name: 'Elodi',
    birthData: {
      date: '2016-07-10',
      time: '11:00',
      timezone: 'America/Denver'
    },
    expected: {
      personalityType: 'Generator',
      personalitySun: 'Gate 53',
      designSun: 'Gate 54',
      incarnationCross: '(53/54 | 42/32)'
    }
  }
};

function dateToJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

function degreeToGate(longitude) {
  let normalizedLongitude = ((longitude % 360) + 360) % 360;
  normalizedLongitude += 58;
  if (normalizedLongitude >= 360) {
    normalizedLongitude -= 360;
  }
  
  const GATE_WHEEL = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  const percentageThrough = normalizedLongitude / 360;
  const gateIndex = Math.floor(percentageThrough * 64);
  const gate = GATE_WHEEL[gateIndex];
  const exactLine = 384 * percentageThrough;
  const line = Math.floor((exactLine % 6) + 1);
  
  return { gate, line };
}

// Binary search implementation of exact 88-degree calculation
function calculateExact88DegreeBinarySearch(birthJD) {
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  // Calculate sun position at birth
  const birthSunResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_SUN, flags);
  if (!birthSunResult || birthSunResult.error) {
    return birthJD - 88.135417; // fallback
  }
  
  const birthSunLongitude = birthSunResult.longitude;
  
  // Use binary search approach with reasonable bounds
  let minJD = birthJD - 95;
  let maxJD = birthJD - 80;  
  let bestJD = birthJD - 88.135417;
  let bestDiff = 999;
  
  const MAX_ITERATIONS = 30;
  const PRECISION_THRESHOLD = 0.01; // Slightly less precise for speed
  
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const testJD = (minJD + maxJD) / 2;
    
    // Calculate sun position at test date
    const testSunResult = swisseph.swe_calc_ut(testJD, swisseph.SE_SUN, flags);
    
    if (!testSunResult || testSunResult.error) {
      break;
    }
    
    const testSunLongitude = testSunResult.longitude;
    
    // Calculate actual solar arc
    let actualArc = birthSunLongitude - testSunLongitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;
    actualArc = Math.abs(actualArc);
    
    const diff = Math.abs(actualArc - 88);
    
    // Track best result
    if (diff < bestDiff) {
      bestDiff = diff;
      bestJD = testJD;
    }
    
    // Check if we're close enough
    if (diff < PRECISION_THRESHOLD) {
      bestJD = testJD;
      break;
    }
    
    // Adjust search bounds
    if (actualArc < 88) {
      maxJD = testJD;
    } else {
      minJD = testJD;
    }
    
    // If search bounds are too close, we're done  
    if (Math.abs(maxJD - minJD) < 0.01) {
      break;
    }
  }
  
  return bestJD;
}

function testSubject(key, subject) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTING ${subject.name.toUpperCase()} (${key})`);
  console.log(`${'='.repeat(60)}`);
  
  const { date, time, timezone } = subject.birthData;
  const localBirthTime = `${date}T${time}:00`;
  
  console.log(`📅 Birth Info:`);
  console.log(`   Date/Time: ${date} ${time} (${timezone})`);
  
  // Convert to UTC
  const utcBirthTime = fromZonedTime(localBirthTime, timezone);
  const personalityJD = dateToJulianDay(utcBirthTime);
  
  console.log(`   UTC: ${utcBirthTime.toISOString()}`);
  console.log(`   Personality JD: ${personalityJD.toFixed(6)}`);
  
  // Calculate design JDs
  const fixedDesignJD = personalityJD - 88.135417;
  const binaryDesignJD = calculateExact88DegreeBinarySearch(personalityJD);
  
  console.log(`\n📊 Design Calculations:`);
  console.log(`   Fixed offset: ${(personalityJD - fixedDesignJD).toFixed(3)} days`);
  console.log(`   Binary search: ${(personalityJD - binaryDesignJD).toFixed(3)} days`);
  console.log(`   Difference: ${Math.abs(binaryDesignJD - fixedDesignJD).toFixed(3)} days`);
  
  // Calculate Sun positions
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const fixedDesignSun = swisseph.swe_calc_ut(fixedDesignJD, swisseph.SE_SUN, flags);
  const binaryDesignSun = swisseph.swe_calc_ut(binaryDesignJD, swisseph.SE_SUN, flags);
  
  console.log(`\n🌞 SUN POSITIONS:`);
  
  let pGate, pMatch;
  if (personalitySun && !personalitySun.error) {
    pGate = degreeToGate(personalitySun.longitude);
    console.log(`   Personality Sun: ${personalitySun.longitude.toFixed(2)}° → Gate ${pGate.gate}.${pGate.line}`);
    console.log(`   Expected: ${subject.expected.personalitySun}`);
    
    pMatch = subject.expected.personalitySun.includes(pGate.gate.toString());
    console.log(`   Status: ${pMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
  }
  
  if (fixedDesignSun && !fixedDesignSun.error && binaryDesignSun && !binaryDesignSun.error && pGate) {
    const fixedGate = degreeToGate(fixedDesignSun.longitude);
    const binaryGate = degreeToGate(binaryDesignSun.longitude);
    
    console.log(`   Design Sun (Fixed): ${fixedDesignSun.longitude.toFixed(2)}° → Gate ${fixedGate.gate}.${fixedGate.line}`);
    console.log(`   Design Sun (Binary): ${binaryDesignSun.longitude.toFixed(2)}° → Gate ${binaryGate.gate}.${binaryGate.line}`);
    console.log(`   Expected: ${subject.expected.designSun}`);
    
    const fixedMatch = subject.expected.designSun.includes(fixedGate.gate.toString());
    const binaryMatch = subject.expected.designSun.includes(binaryGate.gate.toString());
    
    console.log(`   Fixed Method: ${fixedMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
    console.log(`   Binary Method: ${binaryMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
    
    // Verify actual solar arc for binary method
    if (personalitySun && !personalitySun.error) {
      let actualArc = personalitySun.longitude - binaryDesignSun.longitude;
      if (actualArc > 180) actualArc -= 360;
      if (actualArc < -180) actualArc += 360;
      console.log(`   Binary Solar Arc: ${Math.abs(actualArc).toFixed(2)}° (target: 88°)`);
    }
    
    return {
      name: subject.name,
      personality: { gate: pGate, expected: subject.expected.personalitySun, match: pMatch },
      fixedDesign: { gate: fixedGate, expected: subject.expected.designSun, match: fixedMatch },
      binaryDesign: { gate: binaryGate, expected: subject.expected.designSun, match: binaryMatch }
    };
  }
  
  return null;
}

function analyzePatterns(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 COMPREHENSIVE PATTERN ANALYSIS`);
  console.log(`${'='.repeat(60)}`);
  
  const validResults = results.filter(r => r);
  
  console.log(`\n📈 ACCURACY SUMMARY:`);
  let personalityMatches = 0;
  let fixedDesignMatches = 0;
  let binaryDesignMatches = 0;
  
  validResults.forEach(result => {
    const pMatch = result.personality.match;
    const fMatch = result.fixedDesign.match;
    const bMatch = result.binaryDesign.match;
    
    if (pMatch) personalityMatches++;
    if (fMatch) fixedDesignMatches++;
    if (bMatch) binaryDesignMatches++;
    
    console.log(`   ${result.name}:`);
    console.log(`     Personality: ${pMatch ? '✅' : '❌'} Gate ${result.personality.gate.gate}.${result.personality.gate.line} (expected ${result.personality.expected})`);
    console.log(`     Fixed Design: ${fMatch ? '✅' : '❌'} Gate ${result.fixedDesign.gate.gate}.${result.fixedDesign.gate.line} (expected ${result.fixedDesign.expected})`);
    console.log(`     Binary Design: ${bMatch ? '✅' : '❌'} Gate ${result.binaryDesign.gate.gate}.${result.binaryDesign.gate.line} (expected ${result.binaryDesign.expected})`);
  });
  
  console.log(`\n🎯 OVERALL ACCURACY:`);
  console.log(`   Personality Sun: ${personalityMatches}/${validResults.length} (${Math.round(personalityMatches/validResults.length*100)}%)`);
  console.log(`   Fixed Design Sun: ${fixedDesignMatches}/${validResults.length} (${Math.round(fixedDesignMatches/validResults.length*100)}%)`);
  console.log(`   Binary Design Sun: ${binaryDesignMatches}/${validResults.length} (${Math.round(binaryDesignMatches/validResults.length*100)}%)`);
  
  console.log(`\n🚨 KEY FINDINGS:`);
  
  if (personalityMatches === validResults.length) {
    console.log(`   ✅ Personality calculations are PERFECT (100% accuracy)`);
  }
  
  if (fixedDesignMatches === 0 && binaryDesignMatches === 0) {
    console.log(`   ❌ BOTH design methods are completely wrong (0% accuracy)`);
    console.log(`   🔍 This suggests the issue is NOT in the 88-degree calculation`);
    console.log(`   💡 The problem may be in our REFERENCE DATA or GATE MAPPING`);
  } else if (binaryDesignMatches > fixedDesignMatches) {
    console.log(`   🎉 Binary search method improved design accuracy!`);
  } else if (binaryDesignMatches === fixedDesignMatches) {
    console.log(`   ⚠️ Binary search method shows same results as fixed method`);
    console.log(`   💡 The 88-degree calculation may not be the primary issue`);
  }
  
  // Check for systematic patterns
  const allFixedGates = validResults.map(r => r.fixedDesign.gate.gate);
  const allBinaryGates = validResults.map(r => r.binaryDesign.gate.gate);
  
  console.log(`\n📊 GATE PATTERNS:`);
  console.log(`   Fixed method gates: ${allFixedGates.join(', ')}`);
  console.log(`   Binary method gates: ${allBinaryGates.join(', ')}`);
  console.log(`   Expected gates: 45, 8, 54`);
  
  const improvement = binaryDesignMatches - fixedDesignMatches;
  if (improvement > 0) {
    console.log(`\n🎊 IMPROVEMENT: Binary search fixed ${improvement} additional case(s)!`);
  } else if (improvement === 0) {
    console.log(`\n🤔 NO IMPROVEMENT: Binary search shows identical results to fixed method`);
    console.log(`   This means the 88-degree calculation accuracy is not the main issue`);
  }
}

// Run all tests
console.log(`🚀 COMPREHENSIVE BINARY SEARCH FIX TEST`);
console.log(`Testing exact 88-degree calculation against ALL 3 subjects`);

const results = [];
for (const [key, subject] of Object.entries(TEST_SUBJECTS)) {
  const result = testSubject(key, subject);
  if (result) results.push(result);
}

analyzePatterns(results);
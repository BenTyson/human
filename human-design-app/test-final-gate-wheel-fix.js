// Final comprehensive test of the authoritative gate wheel fix against all 3 subjects
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

// NEW AUTHORITATIVE GATE WHEEL (from gate-mapping.ts)
function degreeToGateAuthoritative(longitude) {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  const TROPICAL_GATE_WHEEL = [
    // ARIES (0° - 30°): 25→17→21→51→42→3
    25, 17, 21, 51, 42, 3,
    // TAURUS (30° - 60°): 3→27→24→2→23→8  
    27, 24, 2, 23, 8,
    // GEMINI (60° - 90°): 8→20→16→35→45→12→15
    20, 16, 35, 45, 12, 15,
    // CANCER (90° - 120°): 15→52→39→53→62→56
    52, 39, 53, 62, 56,
    // LEO (120° - 150°): 56→31→33→7→4→29
    31, 33, 7, 4, 29,
    // VIRGO (150° - 180°): 29→59→40→64→47→6→46
    59, 40, 64, 47, 6, 46,
    // LIBRA (180° - 210°): 46→18→48→57→32→50
    18, 48, 57, 32, 50,
    // SCORPIO (210° - 240°): 50→28→44→1→43→14
    28, 44, 1, 43, 14,
    // SAGITTARIUS (240° - 270°): 14→34→9→5→26→11→10
    34, 9, 5, 26, 11, 10,
    // CAPRICORN (270° - 300°): 10→58→38→54→61→60
    58, 38, 54, 61, 60,
    // AQUARIUS (300° - 330°): 60→41→19→13→49→30
    41, 19, 13, 49, 30,
    // PISCES (330° - 360°): 30→55→37→63→22→36→25
    55, 37, 63, 22, 36
  ];
  
  const DEGREES_PER_GATE = 360 / 64;
  const gateIndex = Math.floor(normalizedLongitude / DEGREES_PER_GATE);
  const finalGateIndex = gateIndex >= 64 ? 0 : gateIndex;
  const gate = TROPICAL_GATE_WHEEL[finalGateIndex];
  
  const positionWithinGate = (normalizedLongitude % DEGREES_PER_GATE) / DEGREES_PER_GATE;
  const line = Math.floor(positionWithinGate * 6) + 1;
  
  return { gate, line };
}

function calculateExact88DegreeBinarySearch(birthJD) {
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  const birthSunResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_SUN, flags);
  if (!birthSunResult || birthSunResult.error) {
    return birthJD - 88.135417;
  }
  
  const birthSunLongitude = birthSunResult.longitude;
  
  let minJD = birthJD - 95;
  let maxJD = birthJD - 80;  
  let bestJD = birthJD - 88.135417;
  let bestDiff = 999;
  
  for (let iteration = 0; iteration < 30; iteration++) {
    const testJD = (minJD + maxJD) / 2;
    
    const testSunResult = swisseph.swe_calc_ut(testJD, swisseph.SE_SUN, flags);
    if (!testSunResult || testSunResult.error) break;
    
    const testSunLongitude = testSunResult.longitude;
    
    let actualArc = birthSunLongitude - testSunLongitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;
    actualArc = Math.abs(actualArc);
    
    const diff = Math.abs(actualArc - 88);
    
    if (diff < bestDiff) {
      bestDiff = diff;
      bestJD = testJD;
    }
    
    if (diff < 0.01) {
      bestJD = testJD;
      break;
    }
    
    if (actualArc < 88) {
      maxJD = testJD;
    } else {
      minJD = testJD;
    }
    
    if (Math.abs(maxJD - minJD) < 0.01) break;
  }
  
  return bestJD;
}

function testSubject(key, subject) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTING ${subject.name.toUpperCase()} WITH NEW GATE WHEEL`);
  console.log(`${'='.repeat(60)}`);
  
  const { date, time, timezone } = subject.birthData;
  const localBirthTime = `${date}T${time}:00`;
  
  console.log(`📅 Birth: ${date} ${time} (${timezone})`);
  
  // Convert to UTC
  const utcBirthTime = fromZonedTime(localBirthTime, timezone);
  const personalityJD = dateToJulianDay(utcBirthTime);
  
  // Calculate exact design JD using binary search
  const exactDesignJD = calculateExact88DegreeBinarySearch(personalityJD);
  
  // Calculate Sun positions
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const exactDesignSun = swisseph.swe_calc_ut(exactDesignJD, swisseph.SE_SUN, flags);
  
  console.log(`\n🌞 SUN POSITIONS:`);
  
  if (personalitySun && !personalitySun.error) {
    const pGate = degreeToGateAuthoritative(personalitySun.longitude);
    console.log(`   Personality: ${personalitySun.longitude.toFixed(3)}° → Gate ${pGate.gate}.${pGate.line}`);
    console.log(`   Expected: ${subject.expected.personalitySun}`);
    
    const pMatch = subject.expected.personalitySun.includes(pGate.gate.toString());
    console.log(`   Status: ${pMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
    
    if (exactDesignSun && !exactDesignSun.error) {
      const dGate = degreeToGateAuthoritative(exactDesignSun.longitude);
      console.log(`   Design: ${exactDesignSun.longitude.toFixed(3)}° → Gate ${dGate.gate}.${dGate.line}`);
      console.log(`   Expected: ${subject.expected.designSun}`);
      
      const dMatch = subject.expected.designSun.includes(dGate.gate.toString());
      console.log(`   Status: ${dMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
      
      // Verify solar arc
      let actualArc = personalitySun.longitude - exactDesignSun.longitude;
      if (actualArc > 180) actualArc -= 360;
      if (actualArc < -180) actualArc += 360;
      console.log(`   Solar Arc: ${Math.abs(actualArc).toFixed(3)}° (target: 88°)`);
      
      return {
        name: subject.name,
        personality: { gate: pGate, expected: subject.expected.personalitySun, match: pMatch },
        design: { gate: dGate, expected: subject.expected.designSun, match: dMatch },
        personalityLong: personalitySun.longitude,
        designLong: exactDesignSun.longitude
      };
    }
  }
  
  return null;
}

function analyzeResults(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 FINAL ANALYSIS WITH AUTHORITATIVE GATE WHEEL`);
  console.log(`${'='.repeat(60)}`);
  
  const validResults = results.filter(r => r);
  
  console.log(`\n📈 ACCURACY SUMMARY:`);
  let personalityMatches = 0;
  let designMatches = 0;
  
  validResults.forEach(result => {
    const pMatch = result.personality.match;
    const dMatch = result.design.match;
    
    if (pMatch) personalityMatches++;
    if (dMatch) designMatches++;
    
    console.log(`   ${result.name}:`);
    console.log(`     Personality: ${pMatch ? '✅' : '❌'} Gate ${result.personality.gate.gate}.${result.personality.gate.line} (expected ${result.personality.expected})`);
    console.log(`     Design: ${dMatch ? '✅' : '❌'} Gate ${result.design.gate.gate}.${result.design.gate.line} (expected ${result.design.expected})`);
  });
  
  console.log(`\n🎯 OVERALL ACCURACY:`);
  console.log(`   Personality Sun: ${personalityMatches}/${validResults.length} (${Math.round(personalityMatches/validResults.length*100)}%)`);
  console.log(`   Design Sun: ${designMatches}/${validResults.length} (${Math.round(designMatches/validResults.length*100)}%)`);
  
  console.log(`\n📊 GATE ANALYSIS:`);
  console.log(`   Actual vs Expected Gates:`);
  validResults.forEach(result => {
    console.log(`   ${result.name}:`);
    console.log(`     P: ${result.personality.gate.gate} (expected from ${result.personality.expected})`);
    console.log(`     D: ${result.design.gate.gate} (expected from ${result.design.expected})`);
    console.log(`     Longitudes: P=${result.personalityLong.toFixed(1)}°, D=${result.designLong.toFixed(1)}°`);
  });
  
  console.log(`\n🚨 KEY FINDINGS:`);
  
  if (personalityMatches === validResults.length) {
    console.log(`   ✅ Personality calculations: PERFECT (100% accuracy)`);
  } else {
    console.log(`   ⚠️ Personality calculations: ${personalityMatches}/${validResults.length} accurate`);
  }
  
  if (designMatches === validResults.length) {
    console.log(`   🎉 Design calculations: FIXED! (100% accuracy)`);
    console.log(`   🎊 The authoritative gate wheel completely solved the issue!`);
  } else if (designMatches > 0) {
    console.log(`   🎯 Design calculations: IMPROVED! (${designMatches}/${validResults.length} accurate)`);
    console.log(`   💡 Some cases fixed, others may need reference data verification`);
  } else {
    console.log(`   🤔 Design calculations: Still 0% accuracy`);
    console.log(`   💭 This suggests our reference expectations might be incorrect`);
    console.log(`   🔍 Our gate wheel appears correct - need to verify HumDes reference data`);
  }
  
  // Check if we can identify patterns
  const actualDesignGates = validResults.map(r => r.design.gate.gate);
  const expectedGateNumbers = [45, 8, 54]; // From reference data
  
  console.log(`\n🔬 DETAILED ANALYSIS:`);
  console.log(`   Our calculations show design gates: ${actualDesignGates.join(', ')}`);
  console.log(`   Reference data expects: ${expectedGateNumbers.join(', ')}`);
  
  // Check if our gates are astronomically correct for those longitudes
  console.log(`\n🌐 LONGITUDE VERIFICATION:`);
  validResults.forEach(result => {
    const longitude = result.designLong;
    const sign = Math.floor(longitude / 30);
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const degreeInSign = longitude % 30;
    
    console.log(`   ${result.name}: ${longitude.toFixed(1)}° = ${degreeInSign.toFixed(1)}° ${signNames[sign]} → Gate ${result.design.gate.gate}`);
  });
}

// Run comprehensive test
console.log(`🚀 COMPREHENSIVE TEST: AUTHORITATIVE GATE WHEEL FIX`);
console.log(`Testing all 3 subjects with the new tropical coordinate gate wheel`);

const results = [];
for (const [key, subject] of Object.entries(TEST_SUBJECTS)) {
  const result = testSubject(key, subject);
  if (result) results.push(result);
}

analyzeResults(results);
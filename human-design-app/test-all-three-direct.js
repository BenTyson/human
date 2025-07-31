// Test all 3 subjects directly with Swiss Ephemeris to analyze patterns
const swisseph = require('swisseph');
const { fromZonedTime } = require('date-fns-tz');

const TEST_SUBJECTS = {
  dave: {
    name: 'Dave',
    birthData: {
      date: '1969-12-12',
      time: '22:12',  // Correct time (not 18:32)
      place: 'Fresno, CA',
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
      place: 'Haxtun, Colorado',
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
      place: 'Wheat Ridge, Colorado',
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

function testSubject(key, subject) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTING ${subject.name.toUpperCase()} (${key})`);
  console.log(`${'='.repeat(60)}`);
  
  const { date, time, timezone } = subject.birthData;
  const localBirthTime = `${date}T${time}:00`;
  
  console.log(`📅 Birth Info:`);
  console.log(`   Date/Time: ${date} ${time} (${timezone})`);
  console.log(`   Local: ${localBirthTime}`);
  
  // Convert to UTC
  const utcBirthTime = fromZonedTime(localBirthTime, timezone);
  console.log(`   UTC: ${utcBirthTime.toISOString()}`);
  
  // Calculate Julian Days
  const personalityJD = dateToJulianDay(utcBirthTime);
  const designJD = personalityJD - 88.135417;
  
  console.log(`\n📊 Julian Days:`);
  console.log(`   Personality JD: ${personalityJD.toFixed(6)}`);
  console.log(`   Design JD: ${designJD.toFixed(6)}`);
  console.log(`   Offset: ${(personalityJD - designJD).toFixed(6)} days`);
  
  // Calculate Sun positions
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const designSun = swisseph.swe_calc_ut(designJD, swisseph.SE_SUN, flags);
  
  console.log(`\n🌞 SUN POSITIONS:`);
  
  if (personalitySun && personalitySun.longitude !== undefined) {
    const pGate = degreeToGate(personalitySun.longitude);
    console.log(`   Personality Sun: ${personalitySun.longitude.toFixed(2)}° → Gate ${pGate.gate}.${pGate.line}`);
    console.log(`   Expected: ${subject.expected.personalitySun}`);
    
    const pMatch = subject.expected.personalitySun.includes(pGate.gate.toString());
    console.log(`   Status: ${pMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
  } else {
    console.log(`   ❌ Personality Sun calculation failed`);
  }
  
  if (designSun && designSun.longitude !== undefined) {
    const dGate = degreeToGate(designSun.longitude);
    console.log(`   Design Sun: ${designSun.longitude.toFixed(2)}° → Gate ${dGate.gate}.${dGate.line}`);
    console.log(`   Expected: ${subject.expected.designSun}`);
    
    const dMatch = subject.expected.designSun.includes(dGate.gate.toString());
    console.log(`   Status: ${dMatch ? '✅ MATCH' : '❌ DIFFERENT'}`);
    
    // Calculate solar arc
    if (personalitySun && personalitySun.longitude !== undefined) {
      const diff = Math.abs(personalitySun.longitude - designSun.longitude);
      const circularDiff = diff > 180 ? 360 - diff : diff;
      console.log(`   Solar Arc: ${circularDiff.toFixed(2)}° (target: 88°)`);
    }
  } else {
    console.log(`   ❌ Design Sun calculation failed`);
  }
  
  return {
    name: subject.name,
    personality: personalitySun ? {
      longitude: personalitySun.longitude,
      gate: degreeToGate(personalitySun.longitude),
      expected: subject.expected.personalitySun
    } : null,
    design: designSun ? {
      longitude: designSun.longitude,
      gate: degreeToGate(designSun.longitude),
      expected: subject.expected.designSun
    } : null
  };
}

function analyzePatterns(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 PATTERN ANALYSIS ACROSS ALL 3 SUBJECTS`);
  console.log(`${'='.repeat(60)}`);
  
  const validResults = results.filter(r => r.personality && r.design);
  
  console.log(`\n📈 ACCURACY SUMMARY:`);
  let personalityMatches = 0;
  let designMatches = 0;
  
  validResults.forEach(result => {
    const pMatch = result.personality.expected.includes(result.personality.gate.gate.toString());
    const dMatch = result.design.expected.includes(result.design.gate.gate.toString());
    
    if (pMatch) personalityMatches++;
    if (dMatch) designMatches++;
    
    console.log(`   ${result.name}:`);
    console.log(`     Personality: ${pMatch ? '✅' : '❌'} Gate ${result.personality.gate.gate}.${result.personality.gate.line} (expected ${result.personality.expected})`);
    console.log(`     Design: ${dMatch ? '✅' : '❌'} Gate ${result.design.gate.gate}.${result.design.gate.line} (expected ${result.design.expected})`);
  });
  
  console.log(`\n🎯 OVERALL ACCURACY:`);
  console.log(`   Personality Sun: ${personalityMatches}/${validResults.length} (${Math.round(personalityMatches/validResults.length*100)}%)`);
  console.log(`   Design Sun: ${designMatches}/${validResults.length} (${Math.round(designMatches/validResults.length*100)}%)`);
  
  // Analyze specific issues
  console.log(`\n🚨 ISSUES IDENTIFIED:`);
  
  if (personalityMatches < validResults.length) {
    console.log(`   ❌ Personality Sun: ${validResults.length - personalityMatches} cases incorrect`);
    validResults.forEach(result => {
      const pMatch = result.personality.expected.includes(result.personality.gate.gate.toString());
      if (!pMatch) {
        console.log(`      ${result.name}: Got Gate ${result.personality.gate.gate}, expected ${result.personality.expected}`);
      }
    });
  }
  
  if (designMatches < validResults.length) {
    console.log(`   ❌ Design Sun: ${validResults.length - designMatches} cases incorrect`);
    validResults.forEach(result => {
      const dMatch = result.design.expected.includes(result.design.gate.gate.toString());
      if (!dMatch) {
        console.log(`      ${result.name}: Got Gate ${result.design.gate.gate}, expected ${result.design.expected}`);
      }
    });
  }
  
  // Check for systematic issues
  const allDesignGates = validResults.map(r => r.design.gate.gate);
  const uniqueDesignGates = [...new Set(allDesignGates)];
  
  if (uniqueDesignGates.length === 1) {
    console.log(`   🚨 CRITICAL: All design suns showing same gate (${uniqueDesignGates[0]}) - systematic calculation error!`);
  }
  
  console.log(`\n💡 NEXT STEPS:`);
  if (designMatches === 0) {
    console.log(`   • Design calculation is completely broken - investigate 88-degree offset`);
    console.log(`   • Check if timezone conversion affects design dates differently`);
    console.log(`   • Verify gate mapping algorithm against multiple reference points`);
  }
  if (personalityMatches < validResults.length) {
    console.log(`   • Personality calculation has partial issues - check specific cases`);
    console.log(`   • Verify timezone handling for different locations`);
  }
}

// Run all tests
console.log(`🚀 COMPREHENSIVE CALCULATION ANALYSIS`);
console.log(`Testing Swiss Ephemeris calculations against HumDes reference data`);

const results = [];
for (const [key, subject] of Object.entries(TEST_SUBJECTS)) {
  const result = testSubject(key, subject);
  results.push(result);
}

analyzePatterns(results);
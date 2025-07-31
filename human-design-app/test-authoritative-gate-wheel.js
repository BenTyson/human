// Test the new authoritative gate wheel fix
const swisseph = require('swisseph');
const { fromZonedTime } = require('date-fns-tz');

function dateToJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

// NEW AUTHORITATIVE GATE WHEEL (matching gate-mapping.ts)
function degreeToGateAuthoritative(longitude) {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // AUTHORITATIVE HUMAN DESIGN GATE WHEEL (Tropical Zodiac)
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
  
  // Each gate covers exactly 5.625 degrees (360° ÷ 64 gates)
  const DEGREES_PER_GATE = 360 / 64;
  
  // Calculate gate index directly from longitude
  const gateIndex = Math.floor(normalizedLongitude / DEGREES_PER_GATE);
  
  // Handle edge case at exactly 360°
  const finalGateIndex = gateIndex >= 64 ? 0 : gateIndex;
  const gate = TROPICAL_GATE_WHEEL[finalGateIndex];
  
  // Calculate line (1-6) within the gate
  const positionWithinGate = (normalizedLongitude % DEGREES_PER_GATE) / DEGREES_PER_GATE;
  const line = Math.floor(positionWithinGate * 6) + 1;
  
  console.log(`   ${longitude.toFixed(3)}° -> gateIndex ${finalGateIndex} -> Gate ${gate}.${line}`);
  
  return { gate, line };
}

// OLD METHOD (for comparison)
function degreeToGateOld(longitude) {
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

async function testAuthoritativeGateWheel() {
  console.log('🚀 TESTING AUTHORITATIVE GATE WHEEL FIX');
  console.log('=======================================\n');

  // Test Dave's data (the one we know should show Gate 45 for design)
  const birthData = {
    date: '1969-12-12',
    time: '22:12',
    timezone: 'America/Los_Angeles'
  };

  console.log('📅 Testing Dave (1969-12-12 22:12 Fresno, CA)');
  console.log('Expected: Personality Sun Gate 26.5, Design Sun Gate 45.1\n');

  // Convert to UTC
  const localBirthTime = `${birthData.date}T${birthData.time}:00`;
  const utcBirthTime = fromZonedTime(localBirthTime, birthData.timezone);
  const personalityJD = dateToJulianDay(utcBirthTime);

  // Calculate exact design JD using binary search
  const exactDesignJD = calculateExact88DegreeBinarySearch(personalityJD);

  // Test both methods
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const exactDesignSun = swisseph.swe_calc_ut(exactDesignJD, swisseph.SE_SUN, flags);

  console.log('📈 RESULTS WITH AUTHORITATIVE GATE WHEEL:');
  
  if (personalitySun && !personalitySun.error) {
    console.log('\n🌞 PERSONALITY SUN:');
    const oldPGate = degreeToGateOld(personalitySun.longitude);
    const newPGate = degreeToGateAuthoritative(personalitySun.longitude);
    
    console.log(`   Longitude: ${personalitySun.longitude.toFixed(3)}°`);
    console.log(`   Old method: Gate ${oldPGate.gate}.${oldPGate.line}`);
    console.log(`   New method: Gate ${newPGate.gate}.${newPGate.line}`);
    console.log(`   Expected: Gate 26.5`);
    console.log(`   Status: ${newPGate.gate === 26 ? '✅ CORRECT' : '❌ WRONG'}`);
  }
  
  if (exactDesignSun && !exactDesignSun.error) {
    console.log('\n🌙 DESIGN SUN:');
    const oldDGate = degreeToGateOld(exactDesignSun.longitude);
    const newDGate = degreeToGateAuthoritative(exactDesignSun.longitude);
    
    console.log(`   Longitude: ${exactDesignSun.longitude.toFixed(3)}°`);
    console.log(`   Old method: Gate ${oldDGate.gate}.${oldDGate.line}`);
    console.log(`   New method: Gate ${newDGate.gate}.${newDGate.line}`);
    console.log(`   Expected: Gate 45.1`);
    console.log(`   Status: ${newDGate.gate === 45 ? '🎉 FIXED! 🎉' : '❌ STILL WRONG'}`);
    
    // Verify solar arc
    let actualArc = personalitySun.longitude - exactDesignSun.longitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;
    console.log(`   Solar Arc: ${Math.abs(actualArc).toFixed(3)}° (target: 88°)`);
  }

  console.log('\n🎯 SUMMARY:');
  if (exactDesignSun && !exactDesignSun.error) {
    const newDGate = degreeToGateAuthoritative(exactDesignSun.longitude);
    const newPGate = degreeToGateAuthoritative(personalitySun.longitude);
    
    const personalityCorrect = newPGate.gate === 26;
    const designFixed = newDGate.gate === 45;
    
    if (personalityCorrect && designFixed) {
      console.log('🎊 COMPLETE SUCCESS! Both personality and design gates are correct!');
      console.log('   The authoritative gate wheel fix worked perfectly!');
    } else if (designFixed) {
      console.log('🎉 DESIGN FIXED! Design sun now correctly shows Gate 45!');
    } else {
      console.log('⚠️ Still need more work on the gate wheel mapping');
    }
  }
}

testAuthoritativeGateWheel().catch(console.error);
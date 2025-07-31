// Test the exact 88-degree calculation fix directly using Swiss Ephemeris
const swisseph = require('swisseph');
const { fromZonedTime } = require('date-fns-tz');

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

// Implement the exact same 88-degree calculation we fixed
function calculateExact88DegreeSolarArc(birthJD) {
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  // Calculate sun position at birth
  const birthSunResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_SUN, flags);
  if (!birthSunResult || birthSunResult.error) {
    console.log('❌ Error calculating birth sun position');
    return birthJD - 88.135417; // fallback
  }
  
  const birthSunLongitude = birthSunResult.longitude;
  
  // Target sun position: 88 degrees earlier (backward in zodiac)
  const targetSunLongitude = (birthSunLongitude - 88 + 360) % 360;
  
  // Start with approximate position (use fixed offset as starting point)  
  let designJD = birthJD - 88.135417;
  let iterations = 0;
  const MAX_ITERATIONS = 50;
  const PRECISION_THRESHOLD = 0.001;
  
  console.log(`🎯 Calculating exact 88° solar arc:`);
  console.log(`   Birth Sun: ${birthSunLongitude.toFixed(6)}°`);
  console.log(`   Target Sun: ${targetSunLongitude.toFixed(6)}° (88° earlier)`);
  console.log(`   Starting JD offset: 88.135417 days`);
  
  while (iterations < MAX_ITERATIONS) {
    // Calculate current sun position at design date
    const currentSunResult = swisseph.swe_calc_ut(designJD, swisseph.SE_SUN, flags);
    
    if (!currentSunResult || currentSunResult.error) {
      console.log(`   Error in iteration ${iterations}, using approximation`);
      break;
    }
    
    const currentSunLongitude = currentSunResult.longitude;
    const dailySolarMovement = Math.abs(currentSunResult.longitudeSpeed || 0.985);
    
    // Calculate how far we are from target
    let diff = targetSunLongitude - currentSunLongitude;
    
    // Handle circular nature of degrees (0°/360° wrap-around)
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    console.log(`   Iteration ${iterations}: Current=${currentSunLongitude.toFixed(3)}°, Diff=${diff.toFixed(3)}°, Speed=${dailySolarMovement.toFixed(3)}°/day`);
    
    // Check if we're close enough
    if (Math.abs(diff) < PRECISION_THRESHOLD) {
      console.log(`   ✅ Converged after ${iterations} iterations! Final difference: ${Math.abs(diff).toFixed(6)}°`);
      break;
    }
    
    // Calculate adjustment needed in days
    // If diff is positive, we need to go back further in time (subtract days)
    // If diff is negative, we need to go forward in time (add days)
    const adjustment = diff / dailySolarMovement;
    designJD -= adjustment;
    
    iterations++;
    
    // Safety check for reasonable JD values
    if (designJD < birthJD - 150 || designJD > birthJD - 50) {
      console.log(`   JD adjustment out of reasonable range, breaking`);
      break;
    }
  }
  
  if (iterations >= MAX_ITERATIONS) {
    console.log(`   ⚠️ Failed to converge after ${MAX_ITERATIONS} iterations, using approximation`);
    return birthJD - 88.135417;
  }
  
  const finalOffset = birthJD - designJD;
  console.log(`   🎯 Design date calculation complete. Final offset: ${finalOffset.toFixed(6)} days`);
  
  // Verify the final calculation
  const verifyResult = swisseph.swe_calc_ut(designJD, swisseph.SE_SUN, flags);
  if (verifyResult && !verifyResult.error) {
    const finalSunLongitude = verifyResult.longitude;
    let actualArc = birthSunLongitude - finalSunLongitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;
    console.log(`   ✅ Verification: Actual solar arc = ${Math.abs(actualArc).toFixed(3)}° (target: 88°)`);
  }
  
  return designJD;
}

async function testExactFix() {
  console.log('🚀 TESTING EXACT 88-DEGREE CALCULATION FIX');
  console.log('===========================================\n');

  // Test Dave's data
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

  console.log(`🕐 Times:`);
  console.log(`   Local: ${localBirthTime} (${birthData.timezone})`);
  console.log(`   UTC: ${utcBirthTime.toISOString()}`);
  console.log(`   Personality JD: ${personalityJD.toFixed(6)}\n`);

  // Calculate using FIXED 88.135417 days (old method)
  const fixedDesignJD = personalityJD - 88.135417;
  
  // Calculate using EXACT 88-degree arc (new method)
  const exactDesignJD = calculateExact88DegreeSolarArc(personalityJD);

  console.log(`\n📊 COMPARISON OF METHODS:`);
  console.log(`   Fixed offset JD: ${fixedDesignJD.toFixed(6)} (${(personalityJD - fixedDesignJD).toFixed(6)} days)`);
  console.log(`   Exact 88° JD: ${exactDesignJD.toFixed(6)} (${(personalityJD - exactDesignJD).toFixed(6)} days)`);
  console.log(`   Difference: ${Math.abs(exactDesignJD - fixedDesignJD).toFixed(6)} days\n`);

  // Test both methods
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  // Personality Sun (should be same for both)
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const pGate = degreeToGate(personalitySun.longitude);
  
  // Design Sun - fixed method
  const fixedDesignSun = swisseph.swe_calc_ut(fixedDesignJD, swisseph.SE_SUN, flags);
  const fixedGate = degreeToGate(fixedDesignSun.longitude);
  
  // Design Sun - exact method  
  const exactDesignSun = swisseph.swe_calc_ut(exactDesignJD, swisseph.SE_SUN, flags);
  const exactGate = degreeToGate(exactDesignSun.longitude);

  console.log('📈 RESULTS:');
  console.log(`   Personality Sun: ${personalitySun.longitude.toFixed(2)}° → Gate ${pGate.gate}.${pGate.line}`);
  console.log(`   Expected: Gate 26.5`);
  console.log(`   Status: ${pGate.gate === 26 ? '✅ CORRECT' : '❌ WRONG'}\n`);
  
  console.log(`   Design Sun (Fixed): ${fixedDesignSun.longitude.toFixed(2)}° → Gate ${fixedGate.gate}.${fixedGate.line}`);
  console.log(`   Design Sun (Exact): ${exactDesignSun.longitude.toFixed(2)}° → Gate ${exactGate.gate}.${exactGate.line}`);
  console.log(`   Expected: Gate 45.1`);
  
  console.log('\n🎯 FIX STATUS:');
  console.log(`   Fixed method: ${fixedGate.gate === 45 ? '✅ CORRECT' : '❌ WRONG (Gate ' + fixedGate.gate + ')'}`);
  console.log(`   Exact method: ${exactGate.gate === 45 ? '🎉 FIXED! 🎉' : '❌ STILL WRONG (Gate ' + exactGate.gate + ')'}`);

  if (exactGate.gate === 45) {
    console.log('\n🎊 SUCCESS! The exact 88-degree calculation works!');
    console.log('   This proves our fix will work when applied to the API');
  } else {
    console.log('\n⚠️ The fix needs more refinement');
    console.log(`   We got Gate ${exactGate.gate} instead of Gate 45`);
  }
}

testExactFix().catch(console.error);
// Test the binary search 88-degree calculation fix
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

// Binary search implementation of exact 88-degree calculation
function calculateExact88DegreeBinarySearch(birthJD) {
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  // Calculate sun position at birth
  const birthSunResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_SUN, flags);
  if (!birthSunResult || birthSunResult.error) {
    console.log('❌ Error calculating birth sun position');
    return birthJD - 88.135417; // fallback
  }
  
  const birthSunLongitude = birthSunResult.longitude;
  
  console.log(`🎯 Calculating exact 88° solar arc using binary search:`);
  console.log(`   Birth Sun: ${birthSunLongitude.toFixed(6)}°`);
  
  // Use binary search approach with reasonable bounds
  let minJD = birthJD - 95; // Minimum reasonable offset  
  let maxJD = birthJD - 80; // Maximum reasonable offset
  let bestJD = birthJD - 88.135417;
  let bestDiff = 999;
  
  const MAX_ITERATIONS = 50;
  const PRECISION_THRESHOLD = 0.001;
  
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const testJD = (minJD + maxJD) / 2;
    
    // Calculate sun position at test date
    const testSunResult = swisseph.swe_calc_ut(testJD, swisseph.SE_SUN, flags);
    
    if (!testSunResult || testSunResult.error) {
      console.log(`   Error in iteration ${iteration}, using approximation`);
      break;
    }
    
    const testSunLongitude = testSunResult.longitude;
    
    // Calculate actual solar arc
    let actualArc = birthSunLongitude - testSunLongitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;
    actualArc = Math.abs(actualArc);
    
    const diff = Math.abs(actualArc - 88);
    
    console.log(`   Iteration ${iteration}: JD=${testJD.toFixed(3)}, Arc=${actualArc.toFixed(3)}°, Diff=${diff.toFixed(3)}°`);
    
    // Track best result
    if (diff < bestDiff) {
      bestDiff = diff;
      bestJD = testJD;
    }
    
    // Check if we're close enough
    if (diff < PRECISION_THRESHOLD) {
      console.log(`   ✅ Converged after ${iteration} iterations! Final difference: ${diff.toFixed(6)}°`);
      bestJD = testJD;
      break;
    }
    
    // Adjust search bounds
    if (actualArc < 88) {
      // Need to go back further in time
      maxJD = testJD;
    } else {
      // Need to go forward in time  
      minJD = testJD;
    }
    
    // If search bounds are too close, we're done  
    if (Math.abs(maxJD - minJD) < 0.01) {
      console.log(`   ✅ Search bounds converged after ${iteration} iterations`);
      break;
    }
  }
  
  const finalOffset = birthJD - bestJD;
  console.log(`   🎯 Design date calculation complete. Final offset: ${finalOffset.toFixed(6)} days`);
  
  // Verify the final calculation
  const verifyResult = swisseph.swe_calc_ut(bestJD, swisseph.SE_SUN, flags);
  if (verifyResult && !verifyResult.error) {
    const finalSunLongitude = verifyResult.longitude;
    let actualArc = birthSunLongitude - finalSunLongitude;
    if (actualArc > 180) actualArc -= 360;
    if (actualArc < -180) actualArc += 360;  
    console.log(`   ✅ Verification: Actual solar arc = ${Math.abs(actualArc).toFixed(3)}° (target: 88°)`);
  }
  
  return bestJD;
}

async function testBinarySearchFix() {
  console.log('🚀 TESTING BINARY SEARCH 88-DEGREE CALCULATION FIX');
  console.log('================================================\n');

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
  
  // Calculate using BINARY SEARCH 88-degree arc (new method)
  const binaryDesignJD = calculateExact88DegreeBinarySearch(personalityJD);

  console.log(`\n📊 COMPARISON OF METHODS:`);
  console.log(`   Fixed offset JD: ${fixedDesignJD.toFixed(6)} (${(personalityJD - fixedDesignJD).toFixed(6)} days)`);
  console.log(`   Binary search JD: ${binaryDesignJD.toFixed(6)} (${(personalityJD - binaryDesignJD).toFixed(6)} days)`);
  console.log(`   Difference: ${Math.abs(binaryDesignJD - fixedDesignJD).toFixed(6)} days\n`);

  // Test both methods
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  // Personality Sun (should be same for both)
  const personalitySun = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
  const pGate = degreeToGate(personalitySun.longitude);
  
  // Design Sun - fixed method
  const fixedDesignSun = swisseph.swe_calc_ut(fixedDesignJD, swisseph.SE_SUN, flags);
  const fixedGate = degreeToGate(fixedDesignSun.longitude);
  
  // Design Sun - binary search method  
  const binaryDesignSun = swisseph.swe_calc_ut(binaryDesignJD, swisseph.SE_SUN, flags);
  const binaryGate = degreeToGate(binaryDesignSun.longitude);

  console.log('📈 RESULTS:');
  console.log(`   Personality Sun: ${personalitySun.longitude.toFixed(2)}° → Gate ${pGate.gate}.${pGate.line}`);
  console.log(`   Expected: Gate 26.5`);
  console.log(`   Status: ${pGate.gate === 26 ? '✅ CORRECT' : '❌ WRONG'}\n`);
  
  console.log(`   Design Sun (Fixed): ${fixedDesignSun.longitude.toFixed(2)}° → Gate ${fixedGate.gate}.${fixedGate.line}`);
  console.log(`   Design Sun (Binary): ${binaryDesignSun.longitude.toFixed(2)}° → Gate ${binaryGate.gate}.${binaryGate.line}`);
  console.log(`   Expected: Gate 45.1`);
  
  console.log('\n🎯 FIX STATUS:');
  console.log(`   Fixed method: ${fixedGate.gate === 45 ? '✅ CORRECT' : '❌ WRONG (Gate ' + fixedGate.gate + ')'}`);
  console.log(`   Binary method: ${binaryGate.gate === 45 ? '🎉 FIXED! 🎉' : '❌ STILL WRONG (Gate ' + binaryGate.gate + ')'}`);

  if (binaryGate.gate === 45) {
    console.log('\n🎊 SUCCESS! The binary search 88-degree calculation works!');
    console.log('   This proves our fix will work when applied to the API');
  } else {
    console.log('\n⚠️ The fix needs more refinement');
    console.log(`   We got Gate ${binaryGate.gate} instead of Gate 45`);
    
    // Let's see how close we are
    const distance = Math.abs(binaryGate.gate - 45);
    if (distance <= 2) {
      console.log(`   But we're very close! Only ${distance} gate(s) away.`);
    }
  }
}

testBinarySearchFix().catch(console.error);
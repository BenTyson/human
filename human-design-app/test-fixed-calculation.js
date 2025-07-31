// Test the fixed 88-degree calculation directly
const { calculateRealPlanetaryPositions, getLocationCoordinates } = require('./src/lib/calculations/ephemeris.ts');

async function testFixedCalculation() {
  console.log('🚀 Testing Fixed 88-Degree Calculation');
  console.log('==========================================\n');

  // Test Dave's data
  const daveData = {
    date: '1969-12-12',
    time: '22:12',
    place: 'Fresno, CA, USA',
    timezone: 'America/Los_Angeles'
  };

  console.log('📅 Testing Dave (1969-12-12 22:12 Fresno, CA)');
  console.log('Expected: Personality Sun Gate 26.5, Design Sun Gate 45.1\n');

  try {
    const result = await calculateRealPlanetaryPositions(daveData);
    
    const personalitySun = result.personality.find(p => p.planet === 'Sun');
    const designSun = result.design.find(p => p.planet === 'Sun');
    
    console.log('📊 RESULTS:');
    if (personalitySun) {
      console.log(`   Personality Sun: Gate ${personalitySun.gate}.${personalitySun.line} (${personalitySun.sign} ${personalitySun.degree}°${personalitySun.minutes}')`);
      console.log(`   Expected: Gate 26.5`);
      console.log(`   Status: ${personalitySun.gate === 26 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    }
    
    if (designSun) {
      console.log(`   Design Sun: Gate ${designSun.gate}.${designSun.line} (${designSun.sign} ${designSun.degree}°${designSun.minutes}')`);
      console.log(`   Expected: Gate 45.1`);
      console.log(`   Status: ${designSun.gate === 45 ? '✅ FIXED!' : '❌ STILL BROKEN'}`);
    }

    if (personalitySun && designSun) {
      // Calculate the actual solar arc achieved
      const pLong = (personalitySun.degree + personalitySun.minutes/60) + 
                   (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                    .indexOf(personalitySun.sign) * 30);
      
      const dLong = (designSun.degree + designSun.minutes/60) + 
                   (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                    .indexOf(designSun.sign) * 30);
      
      let arc = pLong - dLong;
      if (arc > 180) arc -= 360;
      if (arc < -180) arc += 360;
      
      console.log(`\n🎯 Solar Arc: ${Math.abs(arc).toFixed(2)}° (target: 88°)`);
      console.log(`   Accuracy: ${Math.abs(88 - Math.abs(arc)) < 0.1 ? '✅ EXCELLENT' : '⚠️ NEEDS ADJUSTMENT'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testFixedCalculation().catch(console.error);
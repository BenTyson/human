/**
 * Debug script to investigate design date calculation error
 * Tests the 88° solar arc calculation against verified reference data
 */

const { 
  calculateHumanDesignChart,
  calculateDesignDate,
  calculatePlanetPosition,
  birthDataToJulianDay,
  initializeEphemeris,
  PLANETS
} = require('./dist/index.js');

// Test subjects with verified reference data
const TEST_SUBJECTS = {
  dave: {
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
      designSunLine: 1
    }
  },
  ben: {
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
      designSunLine: 3
    }
  },
  elodi: {
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
      designSunLine: 1
    }
  }
};

async function debugDesignCalculation() {
  console.log('🔍 Debugging Design Date Calculation\n');
  
  initializeEphemeris();
  
  for (const [name, subject] of Object.entries(TEST_SUBJECTS)) {
    console.log(`\n=== ${name.toUpperCase()} ===`);
    console.log(`Birth: ${JSON.stringify(subject.birth)}`);
    
    try {
      // Calculate Julian Day for birth
      const birthJD = birthDataToJulianDay(subject.birth);
      console.log(`Birth Julian Day: ${birthJD}`);
      
      // Get Sun position at birth
      const birthSun = calculatePlanetPosition(birthJD, PLANETS.SUN);
      console.log(`Birth Sun longitude: ${birthSun.longitude.toFixed(6)}°`);
      
      // Calculate design date using our function
      const designJD = calculateDesignDate(birthJD);
      console.log(`Design Julian Day: ${designJD}`);
      console.log(`Days difference: ${(birthJD - designJD).toFixed(2)}`);
      
      // Get Sun position at design date
      const designSun = calculatePlanetPosition(designJD, PLANETS.SUN);
      console.log(`Design Sun longitude: ${designSun.longitude.toFixed(6)}°`);
      
      // Calculate the actual solar arc
      let actualArc = birthSun.longitude - designSun.longitude;
      if (actualArc < 0) actualArc += 360;
      if (actualArc > 180) actualArc = 360 - actualArc;
      console.log(`Actual solar arc: ${actualArc.toFixed(6)}°`);
      
      // Generate full chart to see gate results
      const chart = await calculateHumanDesignChart(subject.birth);
      
      const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
      const designSunResult = chart.designActivations.find(a => a.planet === 'SUN');
      
      console.log(`\nPersonality Sun: Gate ${personalitySun?.gateLine.gate}, Line ${personalitySun?.gateLine.line}`);
      console.log(`Expected: Gate ${subject.expected.personalitySunGate}, Line ${subject.expected.personalitySunLine}`);
      console.log(`✅ Personality match: ${personalitySun?.gateLine.gate === subject.expected.personalitySunGate}`);
      
      console.log(`\nDesign Sun: Gate ${designSunResult?.gateLine.gate}, Line ${designSunResult?.gateLine.line}`);
      console.log(`Expected: Gate ${subject.expected.designSunGate}, Line ${subject.expected.designSunLine}`);
      console.log(`❌ Design match: ${designSunResult?.gateLine.gate === subject.expected.designSunGate}`);
      
      // Calculate what longitude would give us the expected design gate
      // Each gate is 5.625°, gates start at 0° = Gate 41
      const expectedGate = subject.expected.designSunGate;
      const gateIndex = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60].indexOf(expectedGate);
      const expectedLongitude = gateIndex * 5.625;
      console.log(`Expected design longitude for Gate ${expectedGate}: ${expectedLongitude.toFixed(6)}°`);
      
      // Calculate what target longitude our current calculation is looking for
      let ourTargetLongitude = birthSun.longitude - 88;
      if (ourTargetLongitude < 0) ourTargetLongitude += 360;
      console.log(`Our calculated target longitude: ${ourTargetLongitude.toFixed(6)}°`);
      
      const longitudeDiff = Math.abs(ourTargetLongitude - expectedLongitude);
      console.log(`Longitude difference: ${longitudeDiff.toFixed(6)}° (${(longitudeDiff * 60).toFixed(2)} arc-minutes)`);
      
    } catch (error) {
      console.error(`Error processing ${name}:`, error);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

debugDesignCalculation().catch(console.error);
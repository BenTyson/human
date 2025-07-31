// Detailed test of Swiss Ephemeris calculations

console.log('=== SWISS EPHEMERIS DETAILED TEST ===\n');

const swisseph = require('swisseph');

// Test data: December 12, 1969, 18:32 UTC
const year = 1969;
const month = 12;
const day = 12;
const hour = 18.5333; // 18:32 in decimal hours

console.log('1. Testing Julian Day calculation...');
const julianDay = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
console.log(`Julian Day: ${julianDay}`);

console.log('\n2. Testing Sun calculation...');
const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

try {
  const sunResult = swisseph.swe_calc_ut(julianDay, swisseph.SE_SUN, flags);
  console.log('Sun result structure:', sunResult);
  console.log('Sun result type:', typeof sunResult);
  
  if (sunResult && typeof sunResult === 'object') {
    console.log('Keys in result:', Object.keys(sunResult));
    
    // The node-swisseph library returns results in different formats
    if (sunResult.longitude !== undefined) {
      console.log(`✅ Sun longitude: ${sunResult.longitude}°`);
    } else if (sunResult.data) {
      console.log(`✅ Sun longitude (data[0]): ${sunResult.data[0]}°`);
    } else if (Array.isArray(sunResult)) {
      console.log(`✅ Sun longitude (array[0]): ${sunResult[0]}°`);
    }
    
    if (sunResult.error) {
      console.log('❌ Error in result:', sunResult.error);
    }
  }
  
} catch (error) {
  console.error('❌ Error calculating Sun:', error);
}

console.log('\n3. Testing all planets...');
const planets = {
  'Sun': swisseph.SE_SUN,
  'Moon': swisseph.SE_MOON,
  'Mercury': swisseph.SE_MERCURY,
  'Venus': swisseph.SE_VENUS,
  'Mars': swisseph.SE_MARS,
  'Jupiter': swisseph.SE_JUPITER,
  'Saturn': swisseph.SE_SATURN,
  'Uranus': swisseph.SE_URANUS,
  'Neptune': swisseph.SE_NEPTUNE,
  'Pluto': swisseph.SE_PLUTO,
  'TrueNode': swisseph.SE_TRUE_NODE
};

for (const [name, planetId] of Object.entries(planets)) {
  try {
    const result = swisseph.swe_calc_ut(julianDay, planetId, flags);
    let longitude = 'unknown';
    
    if (result && typeof result === 'object') {
      if (result.longitude !== undefined) {
        longitude = result.longitude.toFixed(6);
      } else if (result.data && result.data[0] !== undefined) {
        longitude = result.data[0].toFixed(6);
      } else if (Array.isArray(result) && result[0] !== undefined) {
        longitude = result[0].toFixed(6);
      }
    }
    
    console.log(`${name.padEnd(10)}: ${longitude}°`);
  } catch (error) {
    console.log(`${name.padEnd(10)}: ERROR - ${error.message}`);
  }
}
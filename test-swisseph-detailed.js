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
      console.log(`Sun latitude: ${sunResult.latitude}°`);
      console.log(`Sun distance: ${sunResult.distance} AU`);
      console.log(`Sun speed: ${sunResult.speed}°/day`);
    } else if (sunResult.data) {
      console.log(`✅ Sun longitude (data[0]): ${sunResult.data[0]}°`);
      console.log(`Sun latitude (data[1]): ${sunResult.data[1]}°`);
      console.log(`Sun distance (data[2]): ${sunResult.data[2]} AU`);
      console.log(`Sun speed (data[3]): ${sunResult.data[3]}°/day`);
    } else if (Array.isArray(sunResult)) {
      console.log(`✅ Sun longitude (array[0]): ${sunResult[0]}°`);
      console.log(`Sun latitude (array[1]): ${sunResult[1]}°`);
      console.log(`Sun distance (array[2]): ${sunResult[2]} AU`);
      console.log(`Sun speed (array[3]): ${sunResult[3]}°/day`);
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

console.log('\n4. Testing gate mapping...');
// Gate mapping function (simplified version)
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

// Test with Sun position if we got it
try {
  const sunResult = swisseph.swe_calc_ut(julianDay, swisseph.SE_SUN, flags);
  let sunLongitude;
  
  if (sunResult && typeof sunResult === 'object') {
    if (sunResult.longitude !== undefined) {
      sunLongitude = sunResult.longitude;
    } else if (sunResult.data && sunResult.data[0] !== undefined) {
      sunLongitude = sunResult.data[0];
    } else if (Array.isArray(sunResult) && sunResult[0] !== undefined) {
      sunLongitude = sunResult[0];
    }
    
    if (sunLongitude !== undefined) {
      const gateResult = degreeToGate(sunLongitude);
      console.log(`Sun at ${sunLongitude.toFixed(6)}° -> Gate ${gateResult.gate}.${gateResult.line}`);
      console.log(`Expected: Gate 26.5 (if this matches HumDes reference)`);
    }
  }
} catch (error) {
  console.error('Error in gate mapping test:', error);
}

console.log('\n5. Testing version and status...');
try {
  const version = swisseph.swe_version();
  console.log('Swiss Ephemeris version:', version);
} catch (error) {
  console.log('Could not get version:', error.message);
}
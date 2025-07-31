// Test our actual app logic to see where it's failing

const swisseph = require('swisseph');
const { fromZonedTime } = require('date-fns-tz');

console.log('=== TESTING OUR APP LOGIC ===\n');

// Mimic the exact same inputs as our API
const birthInfo = {
  date: '1969-12-12',
  time: '18:32',
  place: 'Fresno, CA',
  timezone: 'America/Los_Angeles'
};

console.log('1. Input data:', birthInfo);

console.log('\n2. Converting timezone...');
const localBirthTime = `${birthInfo.date}T${birthInfo.time}:00`;
const utcBirthTime = fromZonedTime(localBirthTime, birthInfo.timezone);
console.log(`Local: ${localBirthTime}`);
console.log(`UTC: ${utcBirthTime.toISOString()}`);

console.log('\n3. Converting to Julian Day...');
function dateToJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

const personalityJD = dateToJulianDay(utcBirthTime);
console.log(`Personality JD: ${personalityJD}`);

console.log('\n4. Calculating Sun position...');
const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
const sunResult = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
console.log('Sun result:', sunResult);

if (sunResult && sunResult.longitude !== undefined) {
  console.log(`Sun longitude: ${sunResult.longitude}°`);
  
  console.log('\n5. Testing gate mapping...');
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
  
  const gateResult = degreeToGate(sunResult.longitude);
  console.log(`Gate result: ${gateResult.gate}.${gateResult.line}`);
  console.log(`Expected: 26.5`);
  
  console.log('\n6. Testing 88-degree design calculation...');
  const designOffsetDays = 88.135417;
  const designJD = personalityJD - designOffsetDays;
  console.log(`Design JD: ${designJD}`);
  
  const designSunResult = swisseph.swe_calc_ut(designJD, swisseph.SE_SUN, flags);
  console.log('Design Sun result:', designSunResult);
  
  if (designSunResult && designSunResult.longitude !== undefined) {
    console.log(`Design Sun longitude: ${designSunResult.longitude}°`);
    const designGateResult = degreeToGate(designSunResult.longitude);
    console.log(`Design Gate result: ${designGateResult.gate}.${designGateResult.line}`);
    console.log(`Expected: 45.1`);
    
    // Check the difference
    const diff = Math.abs(sunResult.longitude - designSunResult.longitude);
    const circularDiff = diff > 180 ? 360 - diff : diff;
    console.log(`Solar arc difference: ${circularDiff.toFixed(2)}°`);
  }
} else {
  console.log('❌ No Sun longitude in result');
}

console.log('\n7. Comparing with direct test...');
console.log('This test should show the same Sun longitude as our direct test');
console.log('If it differs, the problem is in our conversion logic');
console.log('If it matches, the problem is in our API/ephemeris.ts integration');
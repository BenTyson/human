// Test to investigate design sun longitude discrepancy
// Expected: HumDes shows Gate 45.1 for design sun
// Actual: Our calculation shows Gate 6.1 (173.07°)

// Test data from create-chart form (December 12, 1969, 6:32 PM, Fresno, CA)
const birthInfo = {
  date: '1969-12-12',
  time: '18:32',
  place: 'Fresno, CA',
  timezone: 'America/Los_Angeles'
};

console.log('=== DESIGN SUN LONGITUDE INVESTIGATION ===\n');

// Convert local birth time to UTC (simplified PST = UTC-8 for December 1969)
const localBirthTime = `${birthInfo.date}T${birthInfo.time}:00`;
const localDate = new Date(localBirthTime);
const utcBirthTime = new Date(localDate.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for PST

console.log('Birth Info:');
console.log(`Local time: ${localBirthTime} (${birthInfo.timezone})`);
console.log(`UTC time: ${utcBirthTime.toISOString()}`);

// Calculate Julian Day for birth
function dateToJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  // Use simple Julian Day calculation for testing
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd + (hour - 12) / 24;
}

const birthJD = dateToJulianDay(utcBirthTime);
console.log(`\nBirth Julian Day: ${birthJD.toFixed(6)}`);

// Our current design offset methods
const DESIGN_OFFSET_DAYS = 88.135417;
const fixedOffsetDesignJD = birthJD - DESIGN_OFFSET_DAYS;

console.log(`\nDesign Date Calculations:`);
console.log(`Fixed offset JD: ${fixedOffsetDesignJD.toFixed(6)} (${DESIGN_OFFSET_DAYS} days before birth)`);

// Convert design JD back to date for verification
const designDate = new Date((fixedOffsetDesignJD - 2440587.5) * 86400000);
console.log(`Design date: ${designDate.toISOString()}`);

console.log('\n=== EXPECTED VS ACTUAL ===');
console.log('HumDes reference:');
console.log('  Personality Sun: Gate 26.5 (261.07°)');
console.log('  Design Sun: Gate 45.1 (~77.1°)');

console.log('\nOur calculation should give:');
console.log('  Personality Sun: ~261° (Gate 26.5) ✓');
console.log('  Design Sun: ~77° (Gate 45.1) ✗ (we get ~173°)');

console.log('\n=== ANALYSIS QUESTIONS ===');
console.log('1. Is our timezone conversion correct?');
console.log('2. Is our Julian Day calculation accurate?');
console.log('3. Is the design offset calculation method correct?');
console.log('4. Are we using the right astronomical coordinate system?');

// Let's test what longitude should give Gate 45.1
function degreeToGateSimple(longitude) {
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
  
  return { gate, line, longitude: normalizedLongitude };
}

console.log('\n=== REVERSE ENGINEERING TARGET LONGITUDE ===');
// Gate 45 is at index 24 in the wheel
// So percentage should be around 24/64 = 0.375
// After +58° adjustment: 0.375 * 360 = 135°
// So original longitude: 135° - 58° = 77°

console.log('Testing longitude 77° (theoretical Gate 45 position):');
const test77 = degreeToGateSimple(77);
console.log(`77° -> Gate ${test77.gate}.${test77.line ? Math.ceil(test77.line) : 1}`);

console.log('\nTesting what our 173° actually gives:');
const test173 = degreeToGateSimple(173);
console.log(`173° -> Gate ${test173.gate}.${test173.line ? Math.ceil(test173.line) : 1}`);

console.log('\n=== POTENTIAL ISSUES TO INVESTIGATE ===');
console.log('A. Timezone conversion: PST vs UTC offset');
console.log('B. Swiss Ephemeris coordinate system (tropical vs sidereal)');
console.log('C. Design calculation method (fixed days vs exact 88° solar arc)');
console.log('D. Julian Day Number accuracy');
console.log('E. Birth time precision (seconds matter for sun position)');
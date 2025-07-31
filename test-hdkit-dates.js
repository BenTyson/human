// Analyze HDKit sample chart dates to understand the design offset calculation

console.log('=== HDKit SAMPLE CHART DATE ANALYSIS ===\n');

// From jonah-dempcy-chart.js
const birthDateStr = 'Sun Sep 25 1983 20:48:00 GMT-0700 (EDT)';
const designDateStr = 'Sun Jun 26 1983 13:08:00 GMT';

const birthDate = new Date(birthDateStr);
const designDate = new Date(designDateStr);

console.log('HDKit Sample Chart (Jonah Dempcy):');
console.log(`Birth date: ${birthDate.toISOString()}`);
console.log(`Design date: ${designDate.toISOString()}`);

const timeDiffMs = birthDate.getTime() - designDate.getTime();
const daysDifference = timeDiffMs / (1000 * 60 * 60 * 24);

console.log(`\nTime difference: ${daysDifference.toFixed(6)} days`);
console.log(`Expected ~88 days, actual: ${daysDifference.toFixed(1)} days`);

// Let's check the millisecond values from the chart
const birthMs = 433396080000;
const designMs = 425480880000;
const msDiff = birthMs - designMs;
const msDaysDiff = msDiff / (1000 * 60 * 60 * 24);

console.log(`\nFrom millisecond values in chart:`);
console.log(`Birth: ${new Date(birthMs).toISOString()}`);
console.log(`Design: ${new Date(designMs).toISOString()}`);
console.log(`Difference: ${msDaysDiff.toFixed(6)} days`);

// Now let's test our test data (Dec 12, 1969)
console.log('\n=== OUR TEST DATA ANALYSIS ===');

const ourBirthLocal = new Date('1969-12-12T18:32:00');
const ourBirthUTC = new Date(ourBirthLocal.getTime() + (8 * 60 * 60 * 1000));

console.log(`Our birth UTC: ${ourBirthUTC.toISOString()}`);

// Try different design offset values
const offsets = [88, 88.135417, 91.02];

console.log('\nTesting different design offsets:');
offsets.forEach(offset => {
  const designTime = new Date(ourBirthUTC.getTime() - (offset * 24 * 60 * 60 * 1000));
  console.log(`${offset} days: ${designTime.toISOString()}`);
});

console.log('\n=== POTENTIAL SOLUTION ===');
console.log('The HDKit sample shows ~91 days offset, not 88.');
console.log('This could explain why our design sun is off by ~96°.');
console.log('Let\'s investigate if we should use ~91 days instead of 88.135417 days.');

// Calculate what ~91 days would give us for sun position difference
console.log('\nSun moves ~1°/day, so:');
console.log(`88 days = ~88° solar arc`);
console.log(`91 days = ~91° solar arc`);
console.log(`Difference: ~3° (could account for some discrepancy)`);

console.log('\nBut we still have a 96° discrepancy, so this is not the full answer.');
console.log('Need to investigate other factors...');
// Basic test of Swiss Ephemeris library functionality

console.log('=== SWISS EPHEMERIS BASIC TEST ===\n');

try {
  console.log('1. Attempting to load swisseph...');
  const swisseph = require('swisseph');
  console.log('✅ swisseph loaded successfully');
  
  console.log('\n2. Checking available constants...');
  console.log('SE_SUN:', swisseph.SE_SUN);
  console.log('SEFLG_SWIEPH:', swisseph.SEFLG_SWIEPH);
  console.log('SEFLG_SPEED:', swisseph.SEFLG_SPEED);
  console.log('SE_GREG_CAL:', swisseph.SE_GREG_CAL);
  
  console.log('\n3. Testing Julian Day calculation...');
  const testJD = swisseph.swe_julday(1969, 12, 12, 18.5333, swisseph.SE_GREG_CAL);
  console.log('Julian Day for Dec 12, 1969, 18:32 UTC:', testJD);
  
  console.log('\n4. Testing basic Sun calculation...');
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  try {
    const result = swisseph.swe_calc_ut(testJD, swisseph.SE_SUN, flags);
    console.log('Sun calculation result:', result);
    
    if (result && typeof result === 'object') {
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      
      // Check for different possible result formats
      if (result.longitude !== undefined) {
        console.log('✅ Sun longitude:', result.longitude);
      } else if (result.data && result.data[0] !== undefined) {
        console.log('✅ Sun longitude (data[0]):', result.data[0]);
      } else if (Array.isArray(result) && result[0] !== undefined) {
        console.log('✅ Sun longitude (array[0]):', result[0]);
      } else {
        console.log('❌ Could not find longitude in result');
      }
      
      if ('error' in result) {
        console.log('❌ Error in result:', result.error);
      }
    } else {
      console.log('❌ Unexpected result type:', typeof result);
      console.log('Result value:', result);
    }
    
  } catch (calcError) {
    console.error('❌ Error in swe_calc_ut:', calcError);
  }
  
  console.log('\n5. Testing with different approach (synchronous)...');
  try {
    // Some versions might be callback-based
    const syncResult = swisseph.swe_calc_ut(testJD, swisseph.SE_SUN, flags, (result) => {
      console.log('Callback result:', result);
    });
    console.log('Sync call returned:', syncResult);
  } catch (syncError) {
    console.log('Sync approach failed (normal if callback-based):', syncError.message);
  }
  
} catch (error) {
  console.error('❌ Failed to load or use swisseph:', error);
  console.log('\nPossible issues:');
  console.log('- Library not properly installed');
  console.log('- Missing native bindings');
  console.log('- Platform compatibility issues');
  console.log('- Missing ephemeris data files');
}
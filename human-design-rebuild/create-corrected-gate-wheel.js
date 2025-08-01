/**
 * Create corrected gate wheel based on discovered offsets
 * Use the design offset (-34°) as the base since it matched all 3 subjects perfectly
 */

const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];

function createCorrectedGateWheel() {
  console.log('🔧 Creating Corrected Gate Wheel\n');
  
  // Use the design offset that worked perfectly: -34°
  // This means our gate wheel should start at 34° instead of 0°
  const correction = 34;
  
  console.log('export const CORRECTED_GATE_WHEEL: GateInfo[] = [');
  
  for (let i = 0; i < 64; i++) {
    const gateNumber = GATE_ORDER[i];
    const startDegree = (i * 5.625 + correction) % 360;
    const endDegree = ((i + 1) * 5.625 + correction) % 360;
    
    // Handle wrap-around case
    const actualEndDegree = endDegree === 0 ? 360 : endDegree;
    
    // Get zodiac sign
    let sign = '';
    if (startDegree >= 0 && startDegree < 30) sign = 'Aries';
    else if (startDegree >= 30 && startDegree < 60) sign = 'Taurus';
    else if (startDegree >= 60 && startDegree < 90) sign = 'Gemini';
    else if (startDegree >= 90 && startDegree < 120) sign = 'Cancer';
    else if (startDegree >= 120 && startDegree < 150) sign = 'Leo';
    else if (startDegree >= 150 && startDegree < 180) sign = 'Virgo';
    else if (startDegree >= 180 && startDegree < 210) sign = 'Libra';
    else if (startDegree >= 210 && startDegree < 240) sign = 'Scorpio';
    else if (startDegree >= 240 && startDegree < 270) sign = 'Sagittarius';
    else if (startDegree >= 270 && startDegree < 300) sign = 'Capricorn';
    else if (startDegree >= 300 && startDegree < 330) sign = 'Aquarius';
    else sign = 'Pisces';
    
    console.log(`  { number: ${gateNumber}, name: "Gate ${gateNumber}", startDegree: ${startDegree.toFixed(6)}, endDegree: ${actualEndDegree.toFixed(6)}, sign: "${sign}" }${i < 63 ? ',' : ''}`);
  }
  
  console.log('];');
  
  // Test this corrected wheel
  console.log('\n🧪 Testing corrected gate wheel:');
  
  const testPositions = [
    { name: 'Dave P', longitude: 261.072537, expected: 26 },
    { name: 'Dave D', longitude: 173.072538, expected: 45 },
    { name: 'Ben P', longitude: 235.062733, expected: 14 },
    { name: 'Ben D', longitude: 147.062734, expected: 8 },
    { name: 'Elodi P', longitude: 108.852136, expected: 53 },
    { name: 'Elodi D', longitude: 20.852139, expected: 54 }
  ];
  
  for (const test of testPositions) {
    // Apply correction
    let correctedLongitude = (test.longitude + correction) % 360;
    const gateIndex = Math.floor(correctedLongitude / 5.625);
    const calculatedGate = GATE_ORDER[gateIndex];
    
    const match = calculatedGate === test.expected;
    console.log(`${test.name}: ${test.longitude.toFixed(2)}° + ${correction}° = Gate ${calculatedGate} (expected ${test.expected}) ${match ? '✅' : '❌'}`);
  }
}

createCorrectedGateWheel();
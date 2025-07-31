// Precise Human Design gate-to-degree mapping
// Each gate covers exactly 5.625 degrees (360° / 64 gates)
// Starting from 0° Aries, following the wheel order

export const GATE_DEGREE_MAPPING: Record<number, { startDegree: number; endDegree: number }> = {
  // Gates in order starting from 0° Aries
  41: { startDegree: 0, endDegree: 5.625 },
  19: { startDegree: 5.625, endDegree: 11.25 },
  13: { startDegree: 11.25, endDegree: 16.875 },
  49: { startDegree: 16.875, endDegree: 22.5 },
  30: { startDegree: 22.5, endDegree: 28.125 },
  55: { startDegree: 28.125, endDegree: 33.75 },
  
  37: { startDegree: 33.75, endDegree: 39.375 },
  63: { startDegree: 39.375, endDegree: 45 },
  22: { startDegree: 45, endDegree: 50.625 },
  36: { startDegree: 50.625, endDegree: 56.25 },
  25: { startDegree: 56.25, endDegree: 61.875 },
  17: { startDegree: 61.875, endDegree: 67.5 },
  
  21: { startDegree: 67.5, endDegree: 73.125 },
  51: { startDegree: 73.125, endDegree: 78.75 },
  42: { startDegree: 78.75, endDegree: 84.375 },
  3: { startDegree: 84.375, endDegree: 90 },
  27: { startDegree: 90, endDegree: 95.625 },
  24: { startDegree: 95.625, endDegree: 101.25 },
  
  2: { startDegree: 101.25, endDegree: 106.875 },
  23: { startDegree: 106.875, endDegree: 112.5 },
  8: { startDegree: 112.5, endDegree: 118.125 },
  20: { startDegree: 118.125, endDegree: 123.75 },
  16: { startDegree: 123.75, endDegree: 129.375 },
  35: { startDegree: 129.375, endDegree: 135 },
  
  45: { startDegree: 135, endDegree: 140.625 },
  12: { startDegree: 140.625, endDegree: 146.25 },
  15: { startDegree: 146.25, endDegree: 151.875 },
  52: { startDegree: 151.875, endDegree: 157.5 },
  39: { startDegree: 157.5, endDegree: 163.125 },
  53: { startDegree: 163.125, endDegree: 168.75 },
  
  62: { startDegree: 168.75, endDegree: 174.375 },
  56: { startDegree: 174.375, endDegree: 180 },
  31: { startDegree: 180, endDegree: 185.625 },
  33: { startDegree: 185.625, endDegree: 191.25 },
  7: { startDegree: 191.25, endDegree: 196.875 },
  4: { startDegree: 196.875, endDegree: 202.5 },
  
  29: { startDegree: 202.5, endDegree: 208.125 },
  59: { startDegree: 208.125, endDegree: 213.75 },
  40: { startDegree: 213.75, endDegree: 219.375 },
  64: { startDegree: 219.375, endDegree: 225 },
  47: { startDegree: 225, endDegree: 230.625 },
  6: { startDegree: 230.625, endDegree: 236.25 },
  
  46: { startDegree: 236.25, endDegree: 241.875 },
  18: { startDegree: 241.875, endDegree: 247.5 },
  48: { startDegree: 247.5, endDegree: 253.125 },
  57: { startDegree: 253.125, endDegree: 258.75 },
  32: { startDegree: 258.75, endDegree: 264.375 },
  50: { startDegree: 264.375, endDegree: 270 },
  
  28: { startDegree: 270, endDegree: 275.625 },
  44: { startDegree: 275.625, endDegree: 281.25 },
  1: { startDegree: 281.25, endDegree: 286.875 },
  43: { startDegree: 286.875, endDegree: 292.5 },
  14: { startDegree: 292.5, endDegree: 298.125 },
  34: { startDegree: 298.125, endDegree: 303.75 },
  
  9: { startDegree: 303.75, endDegree: 309.375 },
  5: { startDegree: 309.375, endDegree: 315 },
  26: { startDegree: 315, endDegree: 320.625 },
  11: { startDegree: 320.625, endDegree: 326.25 },
  10: { startDegree: 326.25, endDegree: 331.875 },
  58: { startDegree: 331.875, endDegree: 337.5 },
  
  38: { startDegree: 337.5, endDegree: 343.125 },
  54: { startDegree: 343.125, endDegree: 348.75 },
  61: { startDegree: 348.75, endDegree: 354.375 },
  60: { startDegree: 354.375, endDegree: 360 }
};

// Function to get gate from tropical longitude using the correct HDKit algorithm
export function degreeToGate(longitude: number): { gate: number; line: number } {
  // Normalize longitude to 0-360 range
  let normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // CRITICAL: Human Design gates start at Gate 41 at 02º00'00" Aquarius
  // We need to adjust from 00º00'00" Aries. The distance is 58º00'00" exactly.
  normalizedLongitude += 58;
  if (normalizedLongitude >= 360) {
    normalizedLongitude -= 360;
  }
  
  // Verified gate wheel from original HDKit constants
  const GATE_WHEEL = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  // Calculate percentage through the 360° wheel
  const percentageThrough = normalizedLongitude / 360;
  
  // Calculate gate using the original HDKit method
  const gateIndex = Math.floor(percentageThrough * 64);
  const gate = GATE_WHEEL[gateIndex];
  
  // Calculate line (1-6) - 384 is the total number of lines (64 gates × 6 lines)
  const exactLine = 384 * percentageThrough;
  const line = Math.floor((exactLine % 6) + 1);
  
  console.log(`GATE MAPPING: ${longitude}° -> +58° = ${normalizedLongitude}° -> ${percentageThrough.toFixed(6)} -> gateIndex ${gateIndex} -> Gate ${gate}.${line}`);
  
  return { gate, line };
}

// Function to get astrological sign from tropical longitude
export function degreeToSign(longitude: number): { sign: string; degree: number; minutes: number; seconds: number } {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const signDegrees = normalizedLongitude % 30;
  
  const degree = Math.floor(signDegrees);
  const minutes = Math.floor((signDegrees % 1) * 60);
  const seconds = Math.floor(((signDegrees % 1) * 60 % 1) * 60);
  
  return {
    sign: signs[signIndex],
    degree,
    minutes,
    seconds
  };
}
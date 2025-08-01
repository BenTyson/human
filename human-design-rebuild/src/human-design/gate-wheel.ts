/**
 * Human Design Gate Wheel - Complete 64 Gates with Tropical Degree Ranges
 * Based on verified reference data from GateWheel.txt
 */

/**
 * Gate information structure
 */
export interface GateInfo {
  number: number;
  name: string;
  startDegree: number;  // Starting degree (inclusive)
  endDegree: number;    // Ending degree (exclusive)
  sign: string;         // Zodiac sign
}

/**
 * Gate and line position result
 */
export interface GateLinePosition {
  gate: number;
  line: number;        // 1-6
  degrees: number;     // Original longitude
  gateInfo: GateInfo;
}

/**
 * Complete Human Design Gate Wheel
 * Gates arranged in Rave Mandala order (not numerical 1-64)
 */
export const GATE_WHEEL: GateInfo[] = [
  // ARIES (0° - 30°)
  { number: 25, name: "Innocence/Spirit of the Self", startDegree: 0.0, endDegree: 3.875, sign: "Aries" },
  { number: 17, name: "Following/Opinions", startDegree: 3.875, endDegree: 9.5, sign: "Aries" },
  { number: 21, name: "Control/The Hunter", startDegree: 9.5, endDegree: 15.125, sign: "Aries" },
  { number: 51, name: "Shock/Arousing", startDegree: 15.125, endDegree: 20.75, sign: "Aries" },
  { number: 42, name: "Increase/Completion", startDegree: 20.75, endDegree: 26.375, sign: "Aries" },
  { number: 3, name: "Ordering/Difficulty at the Beginning", startDegree: 26.375, endDegree: 30.0, sign: "Aries" },

  // TAURUS (30° - 60°)  
  { number: 3, name: "Ordering/Difficulty at the Beginning", startDegree: 30.0, endDegree: 32.0, sign: "Taurus" },
  { number: 27, name: "Nourishment/Caring", startDegree: 32.0, endDegree: 37.625, sign: "Taurus" },
  { number: 24, name: "Return/Rationalization", startDegree: 37.625, endDegree: 43.25, sign: "Taurus" },
  { number: 2, name: "Direction of the Self/The Receptive", startDegree: 43.25, endDegree: 48.875, sign: "Taurus" },
  { number: 23, name: "Splitting Apart/Assimilation", startDegree: 48.875, endDegree: 54.5, sign: "Taurus" },
  { number: 8, name: "Holding Together/Contribution", startDegree: 54.5, endDegree: 60.0, sign: "Taurus" },

  // GEMINI (60° - 90°)
  { number: 8, name: "Holding Together/Contribution", startDegree: 60.0, endDegree: 60.125, sign: "Gemini" },
  { number: 20, name: "Contemplation/The Now", startDegree: 60.125, endDegree: 65.75, sign: "Gemini" },
  { number: 16, name: "Skills/Enthusiasm", startDegree: 65.75, endDegree: 71.375, sign: "Gemini" },
  { number: 35, name: "Progress/Change", startDegree: 71.375, endDegree: 77.0, sign: "Gemini" },
  { number: 45, name: "Gathering Together/The King", startDegree: 77.0, endDegree: 82.625, sign: "Gemini" },
  { number: 12, name: "Standstill/Caution", startDegree: 82.625, endDegree: 88.25, sign: "Gemini" },
  { number: 15, name: "Extremes/Modesty", startDegree: 88.25, endDegree: 90.0, sign: "Gemini" },

  // CANCER (90° - 120°)
  { number: 15, name: "Extremes/Modesty", startDegree: 90.0, endDegree: 93.875, sign: "Cancer" },
  { number: 52, name: "Keeping Still/Inaction", startDegree: 93.875, endDegree: 99.5, sign: "Cancer" },
  { number: 39, name: "Obstruction/Provocation", startDegree: 99.5, endDegree: 105.125, sign: "Cancer" },
  { number: 53, name: "Development/Beginnings", startDegree: 105.125, endDegree: 110.75, sign: "Cancer" },
  { number: 62, name: "Preponderance of the Small/Details", startDegree: 110.75, endDegree: 116.375, sign: "Cancer" },
  { number: 56, name: "The Wanderer/Stimulation", startDegree: 116.375, endDegree: 120.0, sign: "Cancer" },

  // LEO (120° - 150°)
  { number: 56, name: "The Wanderer/Stimulation", startDegree: 120.0, endDegree: 122.0, sign: "Leo" },
  { number: 31, name: "Influence/Leading", startDegree: 122.0, endDegree: 127.625, sign: "Leo" },
  { number: 33, name: "Retreat/Privacy", startDegree: 127.625, endDegree: 133.25, sign: "Leo" },
  { number: 7, name: "The Army/The Role of Self", startDegree: 133.25, endDegree: 138.875, sign: "Leo" },
  { number: 4, name: "Youthful Folly/Formulization", startDegree: 138.875, endDegree: 144.5, sign: "Leo" },
  { number: 29, name: "The Abysmal/Perseverance", startDegree: 144.5, endDegree: 150.0, sign: "Leo" },

  // VIRGO (150° - 180°)
  { number: 29, name: "The Abysmal/Perseverance", startDegree: 150.0, endDegree: 150.125, sign: "Virgo" },
  { number: 59, name: "Dispersion/Sexuality", startDegree: 150.125, endDegree: 155.75, sign: "Virgo" },
  { number: 40, name: "Deliverance/Aloneness", startDegree: 155.75, endDegree: 161.375, sign: "Virgo" },
  { number: 64, name: "Before Completion/Confusion", startDegree: 161.375, endDegree: 167.0, sign: "Virgo" },
  { number: 47, name: "Oppression/Realization", startDegree: 167.0, endDegree: 172.625, sign: "Virgo" },
  { number: 6, name: "Conflict/Friction", startDegree: 172.625, endDegree: 178.25, sign: "Virgo" },
  { number: 46, name: "Pushing Upward/Determination", startDegree: 178.25, endDegree: 180.0, sign: "Virgo" },

  // LIBRA (180° - 210°)
  { number: 46, name: "Pushing Upward/Determination", startDegree: 180.0, endDegree: 183.875, sign: "Libra" },
  { number: 18, name: "Work on What Has Been Spoiled/Correction", startDegree: 183.875, endDegree: 189.5, sign: "Libra" },
  { number: 48, name: "The Well/Depth", startDegree: 189.5, endDegree: 195.125, sign: "Libra" },
  { number: 57, name: "The Gentle/Intuitive Insight", startDegree: 195.125, endDegree: 200.75, sign: "Libra" },
  { number: 32, name: "Duration/Continuity", startDegree: 200.75, endDegree: 206.375, sign: "Libra" },
  { number: 50, name: "The Caldron/Values", startDegree: 206.375, endDegree: 210.0, sign: "Libra" },

  // SCORPIO (210° - 240°)
  { number: 50, name: "The Caldron/Values", startDegree: 210.0, endDegree: 212.0, sign: "Scorpio" },
  { number: 28, name: "Preponderance of the Great/The Game Player", startDegree: 212.0, endDegree: 217.625, sign: "Scorpio" },
  { number: 44, name: "Coming to Meet/Alertness", startDegree: 217.625, endDegree: 223.25, sign: "Scorpio" },
  { number: 1, name: "The Creative/Self-Expression", startDegree: 223.25, endDegree: 228.875, sign: "Scorpio" },
  { number: 43, name: "Breakthrough/Insight", startDegree: 228.875, endDegree: 234.5, sign: "Scorpio" },
  { number: 14, name: "Possession in Great Measure/Power Skills", startDegree: 234.5, endDegree: 240.0, sign: "Scorpio" },

  // SAGITTARIUS (240° - 270°)
  { number: 14, name: "Possession in Great Measure/Power Skills", startDegree: 240.0, endDegree: 240.125, sign: "Sagittarius" },
  { number: 34, name: "The Power of the Great/Power", startDegree: 240.125, endDegree: 245.75, sign: "Sagittarius" },
  { number: 9, name: "The Taming Power of the Small/Focus", startDegree: 245.75, endDegree: 251.375, sign: "Sagittarius" },
  { number: 5, name: "Waiting/Fixed Patterns", startDegree: 251.375, endDegree: 257.0, sign: "Sagittarius" },
  { number: 26, name: "The Taming Power of the Great/The Egoist", startDegree: 257.0, endDegree: 262.625, sign: "Sagittarius" },
  { number: 11, name: "Peace/Ideas", startDegree: 262.625, endDegree: 268.25, sign: "Sagittarius" },
  { number: 10, name: "Treading/Behavior of the Self", startDegree: 268.25, endDegree: 270.0, sign: "Sagittarius" },

  // CAPRICORN (270° - 300°)
  { number: 10, name: "Treading/Behavior of the Self", startDegree: 270.0, endDegree: 273.875, sign: "Capricorn" },
  { number: 58, name: "The Joyous/Vitality", startDegree: 273.875, endDegree: 279.5, sign: "Capricorn" },
  { number: 38, name: "Opposition/The Fighter", startDegree: 279.5, endDegree: 285.125, sign: "Capricorn" },
  { number: 54, name: "The Marrying Maiden/Ambition", startDegree: 285.125, endDegree: 290.75, sign: "Capricorn" },
  { number: 61, name: "Inner Truth/Mystery", startDegree: 290.75, endDegree: 296.375, sign: "Capricorn" },
  { number: 60, name: "Limitation/Acceptance", startDegree: 296.375, endDegree: 300.0, sign: "Capricorn" },

  // AQUARIUS (300° - 330°)
  { number: 60, name: "Limitation/Acceptance", startDegree: 300.0, endDegree: 302.0, sign: "Aquarius" },
  { number: 41, name: "Decrease/Contraction", startDegree: 302.0, endDegree: 307.625, sign: "Aquarius" },
  { number: 19, name: "Approach/Wanting", startDegree: 307.625, endDegree: 313.25, sign: "Aquarius" },
  { number: 13, name: "Fellowship with Men/The Listener", startDegree: 313.25, endDegree: 318.875, sign: "Aquarius" },
  { number: 49, name: "Revolution/Principles", startDegree: 318.875, endDegree: 324.5, sign: "Aquarius" },
  { number: 30, name: "The Clinging Fire/Feelings", startDegree: 324.5, endDegree: 330.0, sign: "Aquarius" },

  // PISCES (330° - 360°)
  { number: 30, name: "The Clinging Fire/Feelings", startDegree: 330.0, endDegree: 330.125, sign: "Pisces" },
  { number: 55, name: "Abundance/Spirit", startDegree: 330.125, endDegree: 335.75, sign: "Pisces" },
  { number: 37, name: "The Family/Friendship", startDegree: 335.75, endDegree: 341.375, sign: "Pisces" },
  { number: 63, name: "After Completion/Doubt", startDegree: 341.375, endDegree: 347.0, sign: "Pisces" },
  { number: 22, name: "Grace/Openness", startDegree: 347.0, endDegree: 352.625, sign: "Pisces" },
  { number: 36, name: "Darkening of the Light/Crisis", startDegree: 352.625, endDegree: 358.25, sign: "Pisces" },
  { number: 25, name: "Innocence/Spirit of the Self", startDegree: 358.25, endDegree: 360.0, sign: "Pisces" }
];

/**
 * Find gate and line for a given tropical longitude
 * @param longitude - Tropical longitude in degrees (0-360)
 * @returns Gate and line information
 */
export function longitudeToGateLine(longitude: number): GateLinePosition {
  // Normalize longitude to 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Find the gate that contains this longitude
  const gateInfo = GATE_WHEEL.find(gate => 
    normalizedLongitude >= gate.startDegree && normalizedLongitude < gate.endDegree
  );
  
  if (!gateInfo) {
    throw new Error(`No gate found for longitude ${longitude}° (normalized: ${normalizedLongitude}°)`);
  }
  
  // Calculate position within the gate (0-1)
  const gateSpan = gateInfo.endDegree - gateInfo.startDegree;
  const positionInGate = (normalizedLongitude - gateInfo.startDegree) / gateSpan;
  
  // Convert to line (1-6)
  const line = Math.floor(positionInGate * 6) + 1;
  const clampedLine = Math.min(6, Math.max(1, line));
  
  return {
    gate: gateInfo.number,
    line: clampedLine,
    degrees: longitude,
    gateInfo
  };
}

/**
 * Get all gates in numerical order (1-64) with their degree ranges
 * @returns Array of gates sorted by gate number
 */
export function getGatesNumericalOrder(): GateInfo[] {
  return [...GATE_WHEEL].sort((a, b) => a.number - b.number);
}

/**
 * Get gate information by gate number
 * @param gateNumber - Gate number (1-64)
 * @returns Gate information or undefined if not found
 */
export function getGateInfo(gateNumber: number): GateInfo | undefined {
  return GATE_WHEEL.find(gate => gate.number === gateNumber);
}

/**
 * Calculate the exact degree range for a specific line within a gate
 * @param gateNumber - Gate number (1-64)
 * @param line - Line number (1-6)
 * @returns Start and end degrees for the line
 */
export function getLineRange(gateNumber: number, line: number): { start: number; end: number } | null {
  const gate = getGateInfo(gateNumber);
  if (!gate || line < 1 || line > 6) {
    return null;
  }
  
  const gateSpan = gate.endDegree - gate.startDegree;
  const lineSpan = gateSpan / 6;
  
  const lineStart = gate.startDegree + (line - 1) * lineSpan;
  const lineEnd = gate.startDegree + line * lineSpan;
  
  return {
    start: lineStart,
    end: lineEnd
  };
}
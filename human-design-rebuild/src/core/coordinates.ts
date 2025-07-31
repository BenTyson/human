/**
 * Coordinate utilities for Human Design calculations
 * Handles tropical zodiac coordinates and gate/line calculations
 */

/**
 * Zodiac signs in order
 */
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

/**
 * Convert absolute longitude to zodiac position
 * @param longitude - Absolute longitude in degrees (0-360)
 * @returns Zodiac sign and degrees within sign
 */
export function longitudeToZodiac(longitude: number): {
  sign: string;
  degrees: number;
  minutes: number;
  seconds: number;
  signIndex: number;
} {
  // Normalize longitude to 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Calculate sign (each sign is 30 degrees)
  const signIndex = Math.floor(normalizedLongitude / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  
  // Calculate position within sign
  const degreesInSign = normalizedLongitude % 30;
  const degrees = Math.floor(degreesInSign);
  const minutesDecimal = (degreesInSign - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  
  return {
    sign,
    degrees,
    minutes,
    seconds,
    signIndex
  };
}

/**
 * Format longitude as zodiac position string
 * @param longitude - Absolute longitude in degrees
 * @returns Formatted string (e.g., "25°30'45" Sagittarius")
 */
export function formatZodiacPosition(longitude: number): string {
  const pos = longitudeToZodiac(longitude);
  return `${pos.degrees}°${String(pos.minutes).padStart(2, '0')}'${String(pos.seconds).padStart(2, '0')}" ${pos.sign}`;
}

/**
 * Calculate the angular distance between two longitudes
 * @param long1 - First longitude
 * @param long2 - Second longitude
 * @returns Shortest angular distance (-180 to 180)
 */
export function angularDistance(long1: number, long2: number): number {
  let diff = long2 - long1;
  
  // Normalize to -180 to 180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  
  return diff;
}

/**
 * Geographic location data
 */
export interface GeographicLocation {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
  altitude?: number;  // meters above sea level (optional)
}

/**
 * Validate geographic coordinates
 * @param location - Geographic location to validate
 * @throws Error if coordinates are invalid
 */
export function validateLocation(location: GeographicLocation): void {
  if (location.latitude < -90 || location.latitude > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }
  
  if (location.longitude < -180 || location.longitude > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }
  
  if (location.altitude !== undefined && location.altitude < -500) {
    throw new Error('Altitude cannot be below -500 meters');
  }
}

/**
 * Normalize longitude to 0-360 range
 * @param longitude - Longitude in any range
 * @returns Normalized longitude (0-360)
 */
export function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

/**
 * Check if a longitude is within a given range
 * Handles wrap-around at 0/360 boundary
 * @param longitude - Longitude to check
 * @param start - Start of range
 * @param end - End of range
 * @returns True if longitude is within range
 */
export function isLongitudeInRange(
  longitude: number,
  start: number,
  end: number
): boolean {
  const normalized = normalizeLongitude(longitude);
  const normalizedStart = normalizeLongitude(start);
  const normalizedEnd = normalizeLongitude(end);
  
  if (normalizedStart <= normalizedEnd) {
    // Normal case: range doesn't cross 0°
    return normalized >= normalizedStart && normalized < normalizedEnd;
  } else {
    // Range crosses 0° (e.g., 350° to 10°)
    return normalized >= normalizedStart || normalized < normalizedEnd;
  }
}
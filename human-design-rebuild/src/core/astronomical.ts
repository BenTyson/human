/**
 * Core astronomical calculations using Swiss Ephemeris
 * Handles planetary position calculations for Human Design
 */

import * as swisseph from 'swisseph';

// Swiss Ephemeris planet constants
export const PLANETS = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MERCURY: swisseph.SE_MERCURY,
  VENUS: swisseph.SE_VENUS,
  MARS: swisseph.SE_MARS,
  JUPITER: swisseph.SE_JUPITER,
  SATURN: swisseph.SE_SATURN,
  URANUS: swisseph.SE_URANUS,
  NEPTUNE: swisseph.SE_NEPTUNE,
  PLUTO: swisseph.SE_PLUTO,
  TRUE_NODE: swisseph.SE_TRUE_NODE,
  // Earth is calculated as opposite Sun
  EARTH: -1,
  // South Node is opposite North Node
  SOUTH_NODE: -2
} as const;

// Standard Human Design Swiss Ephemeris flags
const HD_EPHEMERIS_FLAGS = 
  swisseph.SEFLG_SWIEPH |  // Use Swiss Ephemeris
  swisseph.SEFLG_SPEED;     // Include daily motion

/**
 * Planetary position result
 */
export interface PlanetaryPosition {
  planet: string;
  longitude: number;      // Tropical longitude in degrees (0-360)
  latitude: number;       // Ecliptic latitude in degrees
  distance: number;       // Distance in AU
  longitudeSpeed: number; // Daily motion in degrees
  latitudeSpeed: number;  // Daily latitude motion
  distanceSpeed: number;  // Daily distance change
}

/**
 * Initialize Swiss Ephemeris with data path
 * @param ephemerisPath - Path to Swiss Ephemeris data files
 */
export function initializeEphemeris(ephemerisPath?: string): void {
  if (ephemerisPath) {
    swisseph.swe_set_ephe_path(ephemerisPath);
  } else {
    // Try default path from existing installation
    const defaultPath = '/Users/bentyson/human/human-design-app/node_modules/swisseph/ephe';
    try {
      swisseph.swe_set_ephe_path(defaultPath);
    } catch (error) {
      console.warn('Swiss Ephemeris files not found at default path, will use Moshier fallback');
    }
  }
}

/**
 * Calculate planetary position for a given Julian Day
 * @param julianDay - Julian Day number (UT)
 * @param planet - Planet constant from PLANETS
 * @returns Planetary position data
 */
export function calculatePlanetPosition(
  julianDay: number,
  planet: number
): PlanetaryPosition {
  // Handle special cases
  if (planet === PLANETS.EARTH) {
    // Earth is always 180° opposite Sun
    const sunPosition = calculatePlanetPosition(julianDay, PLANETS.SUN);
    return {
      planet: 'EARTH',
      longitude: (sunPosition.longitude + 180) % 360,
      latitude: -sunPosition.latitude,
      distance: sunPosition.distance,
      longitudeSpeed: sunPosition.longitudeSpeed,
      latitudeSpeed: -sunPosition.latitudeSpeed,
      distanceSpeed: sunPosition.distanceSpeed
    };
  }
  
  if (planet === PLANETS.SOUTH_NODE) {
    // South Node is always 180° opposite North Node
    const northNode = calculatePlanetPosition(julianDay, PLANETS.TRUE_NODE);
    return {
      planet: 'SOUTH_NODE',
      longitude: (northNode.longitude + 180) % 360,
      latitude: -northNode.latitude,
      distance: northNode.distance,
      longitudeSpeed: northNode.longitudeSpeed,
      latitudeSpeed: -northNode.latitudeSpeed,
      distanceSpeed: northNode.distanceSpeed
    };
  }

  // Calculate actual planetary position
  const result = swisseph.swe_calc_ut(
    julianDay,
    planet,
    HD_EPHEMERIS_FLAGS
  );

  if (result.error) {
    throw new Error(`Swiss Ephemeris calculation error: ${result.error}`);
  }

  const planetName = Object.entries(PLANETS).find(([_, val]) => val === planet)?.[0] || 'UNKNOWN';

  return {
    planet: planetName,
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    longitudeSpeed: result.longitudeSpeed,
    latitudeSpeed: result.latitudeSpeed,
    distanceSpeed: result.distanceSpeed
  };
}

/**
 * Calculate all 13 planetary positions for Human Design
 * @param julianDay - Julian Day number (UT)
 * @returns Array of all planetary positions
 */
export function calculateAllPlanets(julianDay: number): PlanetaryPosition[] {
  const positions: PlanetaryPosition[] = [];
  
  // Calculate standard planets
  const standardPlanets = [
    PLANETS.SUN,
    PLANETS.MOON,
    PLANETS.MERCURY,
    PLANETS.VENUS,
    PLANETS.MARS,
    PLANETS.JUPITER,
    PLANETS.SATURN,
    PLANETS.URANUS,
    PLANETS.NEPTUNE,
    PLANETS.PLUTO,
    PLANETS.TRUE_NODE
  ];

  for (const planet of standardPlanets) {
    try {
      positions.push(calculatePlanetPosition(julianDay, planet));
    } catch (error) {
      console.error(`Error calculating position for planet ${planet}:`, error);
      throw error;
    }
  }

  // Add Earth (opposite Sun)
  positions.push(calculatePlanetPosition(julianDay, PLANETS.EARTH));
  
  // Add South Node (opposite North Node)
  positions.push(calculatePlanetPosition(julianDay, PLANETS.SOUTH_NODE));

  return positions;
}

/**
 * Find when the Sun was at a specific longitude
 * Used for design calculation (88° before birth)
 * @param targetLongitude - Target sun longitude in degrees
 * @param startJulianDay - Starting point for search
 * @param searchBackward - Search direction (true for design calc)
 * @returns Julian Day when Sun was at target longitude
 */
export function findSunAtLongitude(
  targetLongitude: number,
  startJulianDay: number,
  searchBackward: boolean = true
): number {
  const TOLERANCE = 0.00001; // About 0.036 arc seconds
  const MAX_ITERATIONS = 50;
  
  let jd = startJulianDay;
  let iteration = 0;
  
  while (iteration < MAX_ITERATIONS) {
    const sunPos = calculatePlanetPosition(jd, PLANETS.SUN);
    const currentLongitude = sunPos.longitude;
    
    // Calculate angular difference (handling 360° wrap)
    let diff = targetLongitude - currentLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    if (Math.abs(diff) < TOLERANCE) {
      return jd;
    }
    
    // Estimate days to target (Sun moves ~1° per day)
    const daysToTarget = diff / sunPos.longitudeSpeed;
    
    // Apply correction with damping factor
    jd += daysToTarget * 0.9;
    
    iteration++;
  }
  
  throw new Error(`Failed to find Sun at ${targetLongitude}° after ${MAX_ITERATIONS} iterations`);
}

/**
 * Calculate design date (88° solar arc before birth)
 * @param birthJulianDay - Birth time Julian Day
 * @returns Design calculation Julian Day
 */
export function calculateDesignDate(birthJulianDay: number): number {
  // Get Sun position at birth
  const birthSun = calculatePlanetPosition(birthJulianDay, PLANETS.SUN);
  
  // Calculate target longitude (88° before)
  let targetLongitude = birthSun.longitude - 88;
  if (targetLongitude < 0) {
    targetLongitude += 360;
  }
  
  // Find when Sun was at that position
  // Start search ~88 days before (rough estimate)
  const searchStart = birthJulianDay - 88;
  
  return findSunAtLongitude(targetLongitude, searchStart, true);
}
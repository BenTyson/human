// Real astronomical calculations using Swiss Ephemeris (server-side only)
import { degreeToGate, degreeToSign } from './gate-mapping';
import { PlanetaryPosition, BirthInfo } from './types';
import { DESIGN_OFFSET_DAYS } from './constants';
import { fromZonedTime } from 'date-fns-tz';

// Custom error class for Swiss Ephemeris errors
export class SwissEphemerisError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SwissEphemerisError';
  }
}

// Swiss Ephemeris Configuration Constants
export const SWISS_EPHEMERIS_CONFIG = {
  // Standard calculation flags for Human Design
  // Uses Swiss Ephemeris files with speed calculations and tropical coordinates
  STANDARD_FLAGS: null as number | null, // Will be set when swisseph loads
  
  // Planet constants for Human Design (excluding Chiron)
  PLANETS: {
    Sun: null as number | null,
    Moon: null as number | null, 
    Mercury: null as number | null,
    Venus: null as number | null,
    Mars: null as number | null,
    Jupiter: null as number | null,
    Saturn: null as number | null,
    Uranus: null as number | null,
    Neptune: null as number | null,
    Pluto: null as number | null,
    NorthNode: null as number | null  // True Node, not Mean Node
  },
  
  // Calendar type (Gregorian)
  CALENDAR_TYPE: null as number | null,
  
  // Precision thresholds
  PRECISION: {
    SOLAR_ARC_DEGREES: 0.001,    // 0.001 degrees = ~3.6 arcseconds
    MAX_ITERATIONS: 50
  }
};

// Initialize Swiss Ephemeris constants
function initializeSwissEphemerisConfig(swe: typeof import('swisseph')): void {
  SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  SWISS_EPHEMERIS_CONFIG.CALENDAR_TYPE = swe.SE_GREG_CAL;
  
  SWISS_EPHEMERIS_CONFIG.PLANETS.Sun = swe.SE_SUN;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Moon = swe.SE_MOON;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Mercury = swe.SE_MERCURY;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Venus = swe.SE_VENUS;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Mars = swe.SE_MARS;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Jupiter = swe.SE_JUPITER;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Saturn = swe.SE_SATURN;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Uranus = swe.SE_URANUS;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Neptune = swe.SE_NEPTUNE;
  SWISS_EPHEMERIS_CONFIG.PLANETS.Pluto = swe.SE_PLUTO;
  SWISS_EPHEMERIS_CONFIG.PLANETS.NorthNode = swe.SE_TRUE_NODE;
}

// Dynamically import swisseph only on server side
let swisseph: typeof import('swisseph') | null = null;

async function getSwisseph(): Promise<typeof import('swisseph') | null> {
  if (!swisseph && typeof window === 'undefined') {
    try {
      swisseph = await import('swisseph');
      
      // Initialize standardized configuration
      initializeSwissEphemerisConfig(swisseph);
      
      // Verify the library is functional by testing a basic call
      try {
        if (!SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS || !SWISS_EPHEMERIS_CONFIG.PLANETS.Sun) {
          throw new Error('Swiss Ephemeris configuration not properly initialized');
        }
        
        const testJD = 2451545.0; // J2000.0 epoch
        const testResult = swisseph.swe_calc_ut(testJD, SWISS_EPHEMERIS_CONFIG.PLANETS.Sun, SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS);
        if ('error' in testResult && testResult.error) {
          throw new Error(`Swiss Ephemeris verification failed: ${testResult.error}`);
        }
      } catch (verifyError) {
        console.error('Swiss Ephemeris functionality test failed:', verifyError);
        throw new SwissEphemerisError('Swiss Ephemeris library verification failed', 'LIBRARY_VERIFICATION_FAILED', verifyError);
      }
      
      console.log('Swiss Ephemeris loaded, configured, and verified successfully');
    } catch (error) {
      console.error('Failed to load Swiss Ephemeris:', error);
      if (error instanceof SwissEphemerisError) {
        throw error;
      }
      throw new SwissEphemerisError('Swiss Ephemeris library could not be loaded', 'LIBRARY_LOAD_FAILED', error);
    }
  }
  return swisseph;
}

export async function calculateRealPlanetaryPositions(birthInfo: BirthInfo): Promise<{
  personality: PlanetaryPosition[];
  design: PlanetaryPosition[];
}> {
  try {
    const swe = await getSwisseph();
    if (!swe) {
      throw new SwissEphemerisError('Swiss Ephemeris library not available', 'LIBRARY_NOT_LOADED');
    }
    
    // Validate birth info
    if (!birthInfo.date || !birthInfo.time) {
      throw new SwissEphemerisError('Birth date and time are required', 'INVALID_INPUT');
    }
    
    // Parse birth date and time and convert to UTC using proper timezone handling
    const localBirthTime = `${birthInfo.date}T${birthInfo.time}:00`;
    const timezone = birthInfo.timezone || 'America/Los_Angeles';
    
    let utcBirthTime: Date;
    try {
      // Use date-fns-tz to properly convert local time to UTC
      // This handles DST transitions and historical timezone changes
      utcBirthTime = fromZonedTime(localBirthTime, timezone);
    } catch (error) {
      throw new SwissEphemerisError(`Invalid date/time or timezone: ${error}`, 'INVALID_DATETIME', error);
    }
    
    // Convert to Julian Day Number for personality (birth time)
    let personalityJD: number;
    try {
      personalityJD = dateToJulianDay(utcBirthTime, swe);
    } catch (error) {
      throw new SwissEphemerisError(`Failed to convert birth time to Julian Day: ${error}`, 'JULIAN_DAY_CONVERSION', error);
    }
    
    // Calculate design date using exact 88-degree solar arc (not fixed days)
    let designJD: number;
    try {
      designJD = await calculateExact88DegreeSolarArc(personalityJD, swe);
    } catch (error) {
      console.warn('88-degree calculation failed, using fixed offset fallback');
      designJD = personalityJD - DESIGN_OFFSET_DAYS;
    }
    
    // Calculate planetary positions
    let personality: PlanetaryPosition[];
    let design: PlanetaryPosition[];
    
    try {
      personality = await calculatePlanetsForDate(personalityJD, 'personality', swe);
      if (personality.length === 0) {
        throw new SwissEphemerisError('No personality planets calculated', 'NO_PERSONALITY_DATA');
      }
    } catch (error) {
      throw new SwissEphemerisError(`Failed to calculate personality positions: ${error}`, 'PERSONALITY_CALCULATION', error);
    }
    
    try {
      design = await calculatePlanetsForDate(designJD, 'design', swe);
      if (design.length === 0) {
        throw new SwissEphemerisError('No design planets calculated', 'NO_DESIGN_DATA');
      }
    } catch (error) {
      throw new SwissEphemerisError(`Failed to calculate design positions: ${error}`, 'DESIGN_CALCULATION', error);
    }
    
    return { personality, design };
    
  } catch (error) {
    if (error instanceof SwissEphemerisError) {
      console.error(`Swiss Ephemeris Error [${error.code}]:`, error.message);
      throw error;
    }
    console.error('Unexpected error calculating planetary positions:', error);
    throw new SwissEphemerisError('Unexpected calculation error', 'UNKNOWN_ERROR', error);
  }
}

// Helper function to calculate angle difference accounting for 360° wrap-around
function angleDifference(angle1: number, angle2: number): number {
  let diff = angle1 - angle2;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

// Calculate exact 88-degree solar arc before birth
async function calculateExact88DegreeSolarArc(birthJD: number, swe: typeof import('swisseph')): Promise<number> {
  if (!SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS || !SWISS_EPHEMERIS_CONFIG.PLANETS.Sun) {
    throw new SwissEphemerisError('Swiss Ephemeris configuration not initialized', 'CONFIG_NOT_INITIALIZED');
  }
  
  try {
    // Calculate sun position at birth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const birthSunResult = swe.swe_calc_ut(birthJD, SWISS_EPHEMERIS_CONFIG.PLANETS.Sun, SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS) as any;
    
    if ('error' in birthSunResult) {
      console.warn('Error calculating birth sun position, falling back to fixed offset');
      return birthJD - DESIGN_OFFSET_DAYS;
    }
    
    const birthSunLongitude = birthSunResult.longitude || birthSunResult.data?.[0] || 0;
    
    // Target sun position: 88 degrees earlier (backward in zodiac)
    const targetSunLongitude = (birthSunLongitude - 88 + 360) % 360;
    
    // Start with approximate position (use fixed offset as starting point)
    let designJD = birthJD - DESIGN_OFFSET_DAYS;
    let iterations = 0;
    const { MAX_ITERATIONS, SOLAR_ARC_DEGREES: PRECISION_THRESHOLD } = SWISS_EPHEMERIS_CONFIG.PRECISION;
    
    console.log(`Calculating exact 88° solar arc from birth longitude ${birthSunLongitude.toFixed(6)}° to target ${targetSunLongitude.toFixed(6)}°`);
    
    while (iterations < MAX_ITERATIONS) {
      // Calculate current sun position
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentSunResult = swe.swe_calc_ut(designJD, SWISS_EPHEMERIS_CONFIG.PLANETS.Sun, SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS) as any;
      
      if ('error' in currentSunResult) {
        console.warn(`Error in iteration ${iterations}, using approximation`);
        break;
      }
      
      const currentSunLongitude = currentSunResult.longitude || currentSunResult.data?.[0] || 0;
      const diff = angleDifference(currentSunLongitude, targetSunLongitude);
      
      // Check if we're close enough
      if (Math.abs(diff) < PRECISION_THRESHOLD) {
        console.log(`Converged after ${iterations} iterations. Final difference: ${Math.abs(diff).toFixed(6)}°`);
        break;
      }
      
      // Adjust Julian Day based on difference
      // Average solar movement is about 0.985°/day, but it varies
      const dailySolarMovement = currentSunResult.speed?.[0] || currentSunResult.data?.[3] || 0.985;
      const adjustment = diff / Math.abs(dailySolarMovement);
      
      designJD -= adjustment;
      iterations++;
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.warn(`Failed to converge after ${MAX_ITERATIONS} iterations, using approximation`);
      return birthJD - DESIGN_OFFSET_DAYS;
    }
    
    console.log(`Design date calculation complete. JD offset: ${(birthJD - designJD).toFixed(6)} days`);
    return designJD;
    
  } catch (error) {
    console.error('Error in exact 88-degree calculation:', error);
    console.warn('Falling back to fixed offset calculation');
    return birthJD - DESIGN_OFFSET_DAYS;
  }
}

async function calculatePlanetsForDate(julianDay: number, type: 'personality' | 'design', swe: typeof import('swisseph')): Promise<PlanetaryPosition[]> {
  const positions: PlanetaryPosition[] = [];
  const errors: string[] = [];
  
  // Verify configuration is initialized
  if (!SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS) {
    throw new SwissEphemerisError('Swiss Ephemeris configuration not initialized', 'CONFIG_NOT_INITIALIZED');
  }
  
  // Use standardized planet constants
  const PLANET_NUMBERS = SWISS_EPHEMERIS_CONFIG.PLANETS;
  
  // Use standardized calculation flags (null check already done above)
  const CALC_FLAGS = SWISS_EPHEMERIS_CONFIG.STANDARD_FLAGS;
  
  // Validate Julian Day
  if (!isFinite(julianDay) || julianDay < 0) {
    throw new SwissEphemerisError(`Invalid Julian Day: ${julianDay}`, 'INVALID_JULIAN_DAY');
  }
  
  for (const [planetName, planetNum] of Object.entries(PLANET_NUMBERS)) {
    if (planetNum === null) {
      errors.push(`${planetName}: Planet constant not initialized`);
      continue;
    }
    
    try {
      // Calculate planet position  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = swe.swe_calc_ut(julianDay, planetNum, CALC_FLAGS) as any;
      
      if ('error' in result && result.error) {
        errors.push(`${planetName}: ${result.error}`);
        console.warn(`Error calculating ${planetName}:`, result.error);
        continue;  
      }
      
      const longitude = result.longitude !== undefined ? result.longitude : result.data?.[0];
      
      if (longitude === undefined || !isFinite(longitude)) {
        errors.push(`${planetName}: Invalid longitude value`);
        console.warn(`Invalid longitude for ${planetName}:`, longitude);
        continue;
      }
      
      // Convert longitude to gate and line
      const { gate, line } = degreeToGate(longitude);
      
      // Debug logging for Sun positions
      if (planetName === 'Sun') {
        console.log(`${type} Sun longitude: ${longitude}° -> Gate ${gate}.${line} (JD: ${julianDay})`);
        console.log(`  Expected HumDes: Personality=Gate 26.5, Design=Gate 45.1`);
      }
      
      // Convert to astrological sign and position
      const { sign, degree, minutes, seconds } = degreeToSign(longitude);
      
      // Handle Earth (opposite of Sun)
      if (planetName === 'Sun') {
        // Add Earth as opposite of Sun
        const earthLongitude = (longitude + 180) % 360;
        const earthGateData = degreeToGate(earthLongitude);
        const earthSignData = degreeToSign(earthLongitude);
        
        positions.push({
          planet: 'Earth',
          sign: earthSignData.sign,
          degree: earthSignData.degree,
          minutes: earthSignData.minutes,
          seconds: earthSignData.seconds,
          gate: earthGateData.gate,
          line: earthGateData.line,
          julianDay
        });
      }
      
      // Handle South Node (opposite of North Node)
      if (planetName === 'NorthNode') {
        // Add South Node as opposite of North Node
        const southNodeLongitude = (longitude + 180) % 360;
        const southNodeGateData = degreeToGate(southNodeLongitude);
        const southNodeSignData = degreeToSign(southNodeLongitude);
        
        positions.push({
          planet: 'SouthNode',
          sign: southNodeSignData.sign,
          degree: southNodeSignData.degree,
          minutes: southNodeSignData.minutes,
          seconds: southNodeSignData.seconds,
          gate: southNodeGateData.gate,
          line: southNodeGateData.line,
          julianDay
        });
      }
      
      positions.push({
        planet: planetName,
        sign,
        degree,
        minutes,
        seconds,
        gate,
        line,
        julianDay
      });
      
    } catch (error) {
      errors.push(`${planetName}: Unexpected error - ${error}`);
      console.error(`Error calculating ${planetName}:`, error);
    }
  }
  
  // Check that we have at least the critical planets (Sun, Moon, and some others)
  const calculatedPlanets = positions.map(p => p.planet);
  const criticalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  const missingCritical = criticalPlanets.filter(planet => !calculatedPlanets.includes(planet));
  
  if (missingCritical.length > 0) {
    const errorMsg = `Missing critical planets for ${type}: ${missingCritical.join(', ')}`;
    if (errors.length > 0) {
      throw new SwissEphemerisError(`${errorMsg}. Errors: ${errors.join('; ')}`, 'MISSING_CRITICAL_PLANETS');
    } else {
      throw new SwissEphemerisError(errorMsg, 'MISSING_CRITICAL_PLANETS');
    }
  }
  
  // Log warnings if we have non-critical planet errors but continue
  if (errors.length > 0) {
    console.warn(`Non-critical planet calculation errors for ${type}:`, errors.join('; '));
  }
  
  return positions;
}

function dateToJulianDay(date: Date, swe: typeof import('swisseph')): number {
  if (!SWISS_EPHEMERIS_CONFIG.CALENDAR_TYPE) {
    throw new SwissEphemerisError('Swiss Ephemeris configuration not initialized', 'CONFIG_NOT_INITIALIZED');
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  // Use Swiss Ephemeris Julian Day calculation with standardized calendar type
  const julianDay = swe.swe_julday(year, month, day, hour, SWISS_EPHEMERIS_CONFIG.CALENDAR_TYPE as 0 | 1);
  
  return julianDay;
}

// Function to get coordinates for a location (placeholder - would use real geocoding)
export function getLocationCoordinates(place: string): { latitude: number; longitude: number; timezone: string } {
  // This is a simplified lookup - in production would use a geocoding service
  const locationMap: Record<string, { latitude: number; longitude: number; timezone: string }> = {
    'fresno, ca': { latitude: 36.7378, longitude: -119.7871, timezone: 'America/Los_Angeles' },
    'fresno': { latitude: 36.7378, longitude: -119.7871, timezone: 'America/Los_Angeles' },
    'new york, ny': { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    'london': { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    'los angeles, ca': { latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
    'haxtun, co': { latitude: 40.6364, longitude: -102.6188, timezone: 'America/Denver' },
    'denver, co': { latitude: 39.7392, longitude: -104.9903, timezone: 'America/Denver' },
    'chicago, il': { latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  };
  
  const normalizedPlace = place.toLowerCase().trim()
    .replace(/,\s*usa$/, '') // Remove ", USA" suffix
    .replace(/,\s*us$/, ''); // Remove ", US" suffix
  
  // Try exact match first
  if (locationMap[normalizedPlace]) {
    return locationMap[normalizedPlace];
  }
  
  // Try partial matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedPlace.includes(key) || key.includes(normalizedPlace)) {
      return coords;
    }
  }
  
  // Try state-based fallback for US locations
  if (normalizedPlace.includes(', co')) {
    console.warn(`Location "${place}" not found, using Colorado default (Denver)`);
    return { latitude: 39.7392, longitude: -104.9903, timezone: 'America/Denver' };
  }
  if (normalizedPlace.includes(', ca')) {
    console.warn(`Location "${place}" not found, using California default (Los Angeles)`);
    return { latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' };
  }
  
  // Default fallback (New York)
  console.warn(`Location "${place}" not found, using default coordinates (New York)`);
  return { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' };
}


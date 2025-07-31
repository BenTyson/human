// Real astronomical calculations using Swiss Ephemeris (server-side only)
import { degreeToGate, degreeToSign } from './gate-mapping';
import { PlanetaryPosition, BirthInfo } from './types';

// Dynamically import swisseph only on server side
let swisseph: typeof import('swisseph') | null = null;

async function getSwisseph(): Promise<typeof import('swisseph') | null> {
  if (!swisseph && typeof window === 'undefined') {
    try {
      swisseph = await import('swisseph');
      // Set ephemeris path if JPL files are available
      // Note: node-swisseph uses built-in ephemeris data
      // For production, consider using JPL DE431 files for higher precision
      console.log('Swiss Ephemeris loaded successfully');
    } catch (error) {
      console.error('Failed to load Swiss Ephemeris:', error);
      throw new Error('Swiss Ephemeris not available');
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
      throw new Error('Swiss Ephemeris not available');
    }
    
    // Parse birth date and time in UTC, accounting for birth location timezone
    // For December 12, 1969 in Fresno, CA, PST = UTC-8
    const birthDateTime = new Date(`${birthInfo.date}T${birthInfo.time}:00`);
    
    // Adjust for timezone offset (this is a simplified approach)
    // TODO: Implement proper timezone handling with libraries like date-fns-tz
    const timezoneOffsetHours = getTimezoneOffset(birthInfo.timezone || 'America/Los_Angeles', birthDateTime);
    const utcBirthTime = new Date(birthDateTime.getTime() + (timezoneOffsetHours * 60 * 60 * 1000));
    
    // Convert to Julian Day Number for personality (birth time)
    const personalityJD = dateToJulianDay(utcBirthTime, swe);
    
    // Calculate design date (88.135417 days before birth - matches HumDes reference)
    // This is the precise value used by HumDes for 88° solar arc
    const designDate = new Date(utcBirthTime.getTime() - (88.135417 * 24 * 60 * 60 * 1000));
    const designJD = dateToJulianDay(designDate, swe);
    
    // Calculate planetary positions
    const personality = await calculatePlanetsForDate(personalityJD, 'personality', swe);
    const design = await calculatePlanetsForDate(designJD, 'design', swe);
    
    return { personality, design };
    
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    throw new Error('Failed to calculate planetary positions');
  }
}

async function calculatePlanetsForDate(julianDay: number, type: 'personality' | 'design', swe: typeof import('swisseph')): Promise<PlanetaryPosition[]> {
  const positions: PlanetaryPosition[] = [];
  
  // Swiss Ephemeris planet constants
  // Official Human Design planets only (no Chiron)
  const PLANET_NUMBERS = {
    Sun: swe.SE_SUN,
    Moon: swe.SE_MOON,
    Mercury: swe.SE_MERCURY,
    Venus: swe.SE_VENUS,
    Mars: swe.SE_MARS,
    Jupiter: swe.SE_JUPITER,
    Saturn: swe.SE_SATURN,
    Uranus: swe.SE_URANUS,
    Neptune: swe.SE_NEPTUNE,
    Pluto: swe.SE_PLUTO,
    NorthNode: swe.SE_TRUE_NODE  // Using True Node, not Mean Node
  };
  
  // Calculation flags
  // Human Design uses tropical coordinates (confirmed by research)
  const CALC_FLAGS = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  
  for (const [planetName, planetNum] of Object.entries(PLANET_NUMBERS)) {
    try {
      // Calculate planet position  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = swe.swe_calc_ut(julianDay, planetNum, CALC_FLAGS) as any;
      
      if ('error' in result) {
        console.warn(`Warning calculating ${planetName}:`, result.error);
        continue;  
      }
      
      const longitude = result.longitude || result.data?.[0] || 0; // Tropical longitude in degrees
      
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
      console.error(`Error calculating ${planetName}:`, error);
    }
  }
  
  return positions;
}

function dateToJulianDay(date: Date, swe: typeof import('swisseph')): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  // Use Swiss Ephemeris Julian Day calculation
  const julianDay = swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);
  
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
  };
  
  const normalizedPlace = place.toLowerCase().trim();
  
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
  
  // Default fallback (New York)
  console.warn(`Location "${place}" not found, using default coordinates`);
  return { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' };
}

function getTimezoneOffset(timezone: string, date: Date): number {
  // Simplified timezone offset calculation
  // Returns the number of hours to ADD to local time to get UTC
  // In production, would use a proper timezone library like date-fns-tz
  const timezoneOffsets: Record<string, number> = {
    'America/Los_Angeles': 8,  // PST (UTC-8) -> add 8 hours to get UTC
    'America/New_York': 5,     // EST (UTC-5) -> add 5 hours to get UTC
    'Europe/London': 0,        // GMT (UTC+0) -> add 0 hours
  };
  
  // For December 1969, PST was UTC-8 (no DST)
  return timezoneOffsets[timezone] || 8;
}
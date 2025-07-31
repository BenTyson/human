// Planetary position calculations using real astronomical data
import { PlanetaryPosition, BirthInfo, Activation } from './types';
import { calculateRealPlanetaryPositions, getLocationCoordinates } from './ephemeris';
import { DESIGN_OFFSET_DAYS } from './constants';

export async function calculatePlanetaryPositions(birthInfo: BirthInfo): Promise<{
  personality: PlanetaryPosition[];
  design: PlanetaryPosition[];
}> {
  try {
    // Get location coordinates for accurate calculations
    const coords = getLocationCoordinates(birthInfo.place);
    
    // Update birth info with coordinates
    const enhancedBirthInfo = {
      ...birthInfo,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: coords.timezone
    };
    
    // Use real astronomical calculations
    return await calculateRealPlanetaryPositions(enhancedBirthInfo);
    
  } catch (error) {
    console.error('Error in planetary calculations:', error);
    
    // Fallback to mock data if real calculations fail
    console.warn('Falling back to mock data due to calculation error');
    return calculateMockPositions(birthInfo);
  }
}

// Fallback mock function (keep existing logic as backup)
function calculateMockPositions(birthInfo: BirthInfo): {
  personality: PlanetaryPosition[];
  design: PlanetaryPosition[];
} {
  const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Chiron'];
  
  const birthDate = new Date(birthInfo.date + 'T' + birthInfo.time);
  const designDate = new Date(birthDate.getTime() - (DESIGN_OFFSET_DAYS * 24 * 60 * 60 * 1000));
  
  const personality = PLANETS.map((planet, index) => 
    mockPlanetaryPosition(planet, birthDate, index)
  );
  
  const design = PLANETS.map((planet, index) => 
    mockPlanetaryPosition(planet, designDate, index + 7)
  );
  
  return { personality, design };
}

function mockPlanetaryPosition(planet: string, date: Date, seedOffset: number = 0): PlanetaryPosition {
  const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  
  // Generate pseudo-random but consistent positions based on date and planet
  const seed = date.getTime() + planet.charCodeAt(0) * 1000 + seedOffset;
  const random = (seed % 360) / 360;
  
  // Calculate position in zodiac (0-360 degrees)
  const totalDegrees = random * 360;
  
  // Convert to gate and line
  const gateIndex = Math.floor((totalDegrees / 360) * 64);
  const gate = GATE_ORDER[gateIndex] || GATE_ORDER[0];
  
  // Calculate line (1-6)
  const gateProgress = ((totalDegrees / 360) * 64) % 1;
  const line = Math.floor(gateProgress * 6) + 1;
  
  // Calculate astrological sign and position
  const signIndex = Math.floor(totalDegrees / 30);
  const signDegrees = totalDegrees % 30;
  const degree = Math.floor(signDegrees);
  const minutes = Math.floor((signDegrees % 1) * 60);
  const seconds = Math.floor(((signDegrees % 1) * 60 % 1) * 60);
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  return {
    planet,
    sign: signs[signIndex],
    degree,
    minutes,
    seconds,
    gate,
    line,
    julianDay: dateToJulianDay(date)
  };
}

function dateToJulianDay(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function calculateActivations(
  personality: PlanetaryPosition[], 
  design: PlanetaryPosition[]
): Activation[] {
  const activations: Activation[] = [];
  
  // Add personality activations
  personality.forEach(position => {
    activations.push({
      planet: position.planet,
      gate: position.gate,
      line: position.line,
      type: 'personality',
      position
    });
  });
  
  // Add design activations
  design.forEach(position => {
    activations.push({
      planet: position.planet,
      gate: position.gate,
      line: position.line,
      type: 'design',
      position
    });
  });
  
  return activations;
}
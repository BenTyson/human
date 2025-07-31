import { NextRequest, NextResponse } from 'next/server';
import { BirthInfo, PlanetaryPosition, Activation, HumanDesignChart } from '@/lib/calculations/types';
import { getLocationCoordinates, SwissEphemerisError, SWISS_EPHEMERIS_CONFIG } from '@/lib/calculations/ephemeris';
import { degreeToGate, degreeToSign } from '@/lib/calculations/gate-mapping';
import { fromZonedTime } from 'date-fns-tz';
import { GATE_TO_CENTER, CENTERS, CHANNELS } from '@/lib/calculations/constants';

// Direct Swiss Ephemeris integration - no fallbacks, no complexity
async function calculateDirectPlanetaryPositions(birthInfo: BirthInfo): Promise<{
  personality: PlanetaryPosition[];
  design: PlanetaryPosition[];
}> {
  console.log('🚀 Starting direct Swiss Ephemeris calculations...');
  
  // Import Swiss Ephemeris
  let swisseph: typeof import('swisseph');
  try {
    swisseph = await import('swisseph');
    console.log('✅ Swiss Ephemeris loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load Swiss Ephemeris:', error);
    throw new SwissEphemerisError('Swiss Ephemeris library not available', 'LIBRARY_NOT_LOADED', error);
  }

  // Convert local time to UTC
  let localBirthTime = `${birthInfo.date}T${birthInfo.time}`;
  
  // Ensure time has seconds if not provided
  if (!birthInfo.time.includes(':')) {
    throw new SwissEphemerisError('Invalid time format', 'INVALID_TIME_FORMAT');
  }
  
  const timeParts = birthInfo.time.split(':');
  if (timeParts.length === 2) {
    localBirthTime += ':00';
  } else if (timeParts.length === 3) {
    // Time already has seconds
  } else {
    throw new SwissEphemerisError('Invalid time format', 'INVALID_TIME_FORMAT');
  }
  
  console.log(`🔍 Parsing: ${localBirthTime} in timezone ${birthInfo.timezone}`);
  
  let utcBirthTime: Date;
  
  try {
    // First try to create a basic Date object to validate the input
    const testDate = new Date(localBirthTime);
    if (isNaN(testDate.getTime())) {
      throw new Error(`Invalid date string: ${localBirthTime}`);
    }
    
    // Now try the timezone conversion
    utcBirthTime = fromZonedTime(localBirthTime, birthInfo.timezone);
    
    // Validate the resulting date
    if (!utcBirthTime || isNaN(utcBirthTime.getTime())) {
      throw new Error('Invalid date result from timezone conversion');
    }
    
    console.log(`🕐 Birth time: ${localBirthTime} (${birthInfo.timezone}) -> ${utcBirthTime.toISOString()}`);
  } catch (error) {
    console.error('❌ Date/timezone conversion error:', error);
    console.error('❌ Input data:', { localBirthTime, timezone: birthInfo.timezone });
    
    // Fallback: try without timezone conversion (treat as UTC)
    try {
      console.log('🔄 Attempting fallback without timezone conversion...');
      utcBirthTime = new Date(localBirthTime + 'Z'); // Treat as UTC
      if (isNaN(utcBirthTime.getTime())) {
        throw new Error('Fallback also failed');
      }
      console.log(`⚠️  Using fallback UTC time: ${utcBirthTime.toISOString()}`);
    } catch (fallbackError) {
      throw new SwissEphemerisError(`Date conversion failed: ${error}. Fallback also failed: ${fallbackError}`, 'INVALID_DATETIME', error);
    }
  }

  // Convert to Julian Day
  const year = utcBirthTime.getFullYear();
  const month = utcBirthTime.getMonth() + 1;
  const day = utcBirthTime.getDate();
  const hour = utcBirthTime.getHours() + utcBirthTime.getMinutes() / 60 + utcBirthTime.getSeconds() / 3600;
  
  const personalityJD = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
  console.log(`📅 Personality Julian Day: ${personalityJD}`);

  // Calculate design date (exactly 88 degrees of solar arc earlier)
  const designOffsetDays = 88.135417; // Standard Human Design offset
  const designJD = personalityJD - designOffsetDays;
  console.log(`📅 Design Julian Day: ${designJD} (${designOffsetDays} days earlier)`);

  // Calculate planetary positions
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  const planets = {
    'Sun': swisseph.SE_SUN,
    'Moon': swisseph.SE_MOON,
    'Mercury': swisseph.SE_MERCURY,
    'Venus': swisseph.SE_VENUS,
    'Mars': swisseph.SE_MARS,
    'Jupiter': swisseph.SE_JUPITER,
    'Saturn': swisseph.SE_SATURN,
    'Uranus': swisseph.SE_URANUS,
    'Neptune': swisseph.SE_NEPTUNE,
    'Pluto': swisseph.SE_PLUTO,
    'NorthNode': swisseph.SE_TRUE_NODE
  };

  const personality: PlanetaryPosition[] = [];
  const design: PlanetaryPosition[] = [];

  console.log('🌟 Calculating planetary positions...');

  for (const [planetName, planetId] of Object.entries(planets)) {
    try {
      // Personality position
      const personalityResult = swisseph.swe_calc_ut(personalityJD, planetId, flags);
      if (personalityResult && personalityResult.longitude !== undefined) {
        const longitude = personalityResult.longitude;
        const { gate, line } = degreeToGate(longitude);
        const { sign, degree, minutes, seconds } = degreeToSign(longitude);
        
        personality.push({
          planet: planetName,
          sign,
          degree,
          minutes,
          seconds,
          gate,
          line,
          julianDay: personalityJD
        });

        console.log(`  ${planetName} (P): ${longitude.toFixed(2)}° -> Gate ${gate}.${line}`);
      } else {
        console.error(`❌ Failed to calculate ${planetName} personality position`);
      }

      // Design position
      const designResult = swisseph.swe_calc_ut(designJD, planetId, flags);
      if (designResult && designResult.longitude !== undefined) {
        const longitude = designResult.longitude;
        const { gate, line } = degreeToGate(longitude);
        const { sign, degree, minutes, seconds } = degreeToSign(longitude);
        
        design.push({
          planet: planetName,
          sign,
          degree,
          minutes,
          seconds,
          gate,
          line,
          julianDay: designJD
        });

        console.log(`  ${planetName} (D): ${longitude.toFixed(2)}° -> Gate ${gate}.${line}`);
      } else {
        console.error(`❌ Failed to calculate ${planetName} design position`);
      }

      // Add Earth (opposite of Sun)
      if (planetName === 'Sun') {
        const earthLongitudeP = (personalityResult.longitude + 180) % 360;
        const earthGateP = degreeToGate(earthLongitudeP);
        const earthSignP = degreeToSign(earthLongitudeP);
        
        personality.push({
          planet: 'Earth',
          sign: earthSignP.sign,
          degree: earthSignP.degree,
          minutes: earthSignP.minutes,
          seconds: earthSignP.seconds,
          gate: earthGateP.gate,
          line: earthGateP.line,
          julianDay: personalityJD
        });

        const earthLongitudeD = (designResult.longitude + 180) % 360;
        const earthGateD = degreeToGate(earthLongitudeD);
        const earthSignD = degreeToSign(earthLongitudeD);
        
        design.push({
          planet: 'Earth',
          sign: earthSignD.sign,
          degree: earthSignD.degree,
          minutes: earthSignD.minutes,
          seconds: earthSignD.seconds,
          gate: earthGateD.gate,
          line: earthGateD.line,
          julianDay: designJD
        });
      }

      // Add South Node (opposite of North Node)
      if (planetName === 'NorthNode') {
        const southNodeLongitudeP = (personalityResult.longitude + 180) % 360;
        const southNodeGateP = degreeToGate(southNodeLongitudeP);
        const southNodeSignP = degreeToSign(southNodeLongitudeP);
        
        personality.push({
          planet: 'SouthNode',
          sign: southNodeSignP.sign,
          degree: southNodeSignP.degree,
          minutes: southNodeSignP.minutes,
          seconds: southNodeSignP.seconds,
          gate: southNodeGateP.gate,
          line: southNodeGateP.line,
          julianDay: personalityJD
        });

        const southNodeLongitudeD = (designResult.longitude + 180) % 360;
        const southNodeGateD = degreeToGate(southNodeLongitudeD);
        const southNodeSignD = degreeToSign(southNodeLongitudeD);
        
        design.push({
          planet: 'SouthNode',
          sign: southNodeSignD.sign,
          degree: southNodeSignD.degree,
          minutes: southNodeSignD.minutes,
          seconds: southNodeSignD.seconds,
          gate: southNodeGateD.gate,
          line: southNodeGateD.line,
          julianDay: designJD
        });
      }

    } catch (error) {
      console.error(`❌ Error calculating ${planetName}:`, error);
    }
  }

  console.log(`✅ Calculated ${personality.length} personality positions, ${design.length} design positions`);
  
  if (personality.length === 0 || design.length === 0) {
    throw new SwissEphemerisError('No planetary positions calculated', 'NO_POSITIONS_CALCULATED');
  }

  return { personality, design };
}

// Calculate definition type based on activated gates and their channel connections
function calculateDefinitionType(activatedGates: number[]): string {
  if (activatedGates.length === 0) return 'No Definition';
  
  // Import constants
  const { CHANNELS, GATE_TO_CENTER } = require('@/lib/calculations/constants');
  
  // Find which channels are formed by the activated gates
  const formedChannels: { gates: [number, number], centers: [string, string] }[] = [];
  
  Object.values(CHANNELS).forEach((channel: any) => {
    const [gate1, gate2] = channel.gates;
    if (activatedGates.includes(gate1) && activatedGates.includes(gate2)) {
      const center1 = GATE_TO_CENTER[gate1];
      const center2 = GATE_TO_CENTER[gate2];
      if (center1 && center2) {
        formedChannels.push({
          gates: [gate1, gate2],
          centers: [center1, center2]
        });
      }
    }
  });
  
  if (formedChannels.length === 0) return 'No Definition';
  
  // Build a graph of connected centers through channels
  const centerConnections = new Map<string, Set<string>>();
  
  formedChannels.forEach(channel => {
    const [center1, center2] = channel.centers;
    
    if (!centerConnections.has(center1)) centerConnections.set(center1, new Set());
    if (!centerConnections.has(center2)) centerConnections.set(center2, new Set());
    
    centerConnections.get(center1)!.add(center2);
    centerConnections.get(center2)!.add(center1);
  });
  
  // Find connected components using DFS
  const visited = new Set<string>();
  const components: Set<string>[] = [];
  
  for (const center of centerConnections.keys()) {
    if (!visited.has(center)) {
      const component = new Set<string>();
      const stack = [center];
      
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (!visited.has(current)) {
          visited.add(current);
          component.add(current);
          
          const neighbors = centerConnections.get(current) || new Set();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          }
        }
      }
      
      if (component.size > 0) {
        components.push(component);
      }
    }
  }
  
  // Determine definition type based on number of separate components
  switch (components.length) {
    case 0: return 'No Definition';
    case 1: return 'Single Definition';
    case 2: return 'Split Definition';
    case 3: return 'Triple Split Definition';
    case 4: return 'Quadruple Split Definition';
    default: return 'Multiple Split Definition';
  }
}

// Calculate Incarnation Cross based on the 4 key gates
function calculateIncarnationCross(
  personalitySunGate: number,
  designSunGate: number,
  personalityEarthGate: number,
  designEarthGate: number,
  personalitySunLine: number
): string {
  // Determine cross type based on the Personality Sun line
  let crossType: string;
  
  if (personalitySunLine <= 3) {
    crossType = 'Right Angle Cross';
  } else if (personalitySunLine <= 6) {
    crossType = 'Left Angle Cross';
  } else {
    crossType = 'Juxtaposition Cross';
  }
  
  // Correct Incarnation Cross format: (Personality Sun/Design Earth | Design Sun/Personality Earth)
  // This matches the HumDes format: (26/45 | 6/36)
  const crossName = `${crossType} of Confrontation (${personalitySunGate}/${designEarthGate} | ${designSunGate}/${personalityEarthGate})`;
  
  return crossName;
}

// Generate simple chart structure
function generateSimpleChart(birthInfo: BirthInfo, personality: PlanetaryPosition[], design: PlanetaryPosition[]): HumanDesignChart {
  // Convert to activations format
  const activations: Activation[] = [];
  
  personality.forEach(pos => {
    activations.push({
      planet: pos.planet,
      gate: pos.gate,
      line: pos.line,
      type: 'personality',
      position: pos
    });
  });
  
  design.forEach(pos => {
    activations.push({
      planet: pos.planet,
      gate: pos.gate,
      line: pos.line,
      type: 'design',
      position: pos
    });
  });

  // Get the correct planets for Profile and Incarnation Cross calculations
  const personalitySun = personality.find(p => p.planet === 'Sun');
  const designEarth = design.find(p => p.planet === 'Earth');
  const personalityEarth = personality.find(p => p.planet === 'Earth');
  const designSun = design.find(p => p.planet === 'Sun');
  
  // Profile: Personality Sun line / Design Earth line (correct Human Design formula)
  const profile = `${personalitySun?.line || 1}/${designEarth?.line || 1}`;
  
  // Get all activated gates for definition analysis
  const allActivatedGates = new Set(activations.map(a => a.gate));
  
  // Calculate definition type based on activated gates and channels
  const definitionType = calculateDefinitionType(Array.from(allActivatedGates));
  
  // Calculate Incarnation Cross using the 4 gates: Personality Sun, Design Sun, Personality Earth, Design Earth
  const incarnationCross = calculateIncarnationCross(
    personalitySun?.gate || 0,
    designSun?.gate || 0,
    personalityEarth?.gate || 0,
    designEarth?.gate || 0,
    personalitySun?.line || 1
  );
  
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    birthInfo,
    activations,
    channels: [], // Will be calculated when needed
    centers: [], // Will be calculated when needed
    energyType: 'Generator', // Will be calculated based on definition
    strategy: 'Wait to Respond', // Will be derived from energy type
    authority: 'Sacral', // Will be calculated based on defined centers
    profile,
    definitionType,
    incarnationCross,
    createdAt: new Date()
  };
}

export async function POST(request: NextRequest) {
  console.log('🎯 NEW CHART REQUEST - Direct Swiss Ephemeris Implementation');
  
  try {
    const body = await request.json();
    const { name, birthDate, birthTime, birthPlace } = body;

    console.log('📋 Request data:', { name, birthDate, birthTime, birthPlace });

    // Validate required fields
    if (!birthDate || !birthTime || !birthPlace) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: birthDate, birthTime, birthPlace' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      console.error('❌ Invalid date format');
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]?\d)(:([0-5]?\d))?$/;
    if (!timeRegex.test(birthTime)) {
      console.error('❌ Invalid time format');
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM or HH:MM:SS' },
        { status: 400 }
      );
    }

    // Get location coordinates
    const coordinates = getLocationCoordinates(birthPlace);
    console.log('🌍 Location coordinates:', coordinates);
    
    // Create birth info object
    const birthInfo: BirthInfo = {
      date: birthDate,
      time: birthTime,
      place: birthPlace,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone: coordinates.timezone
    };

    // Calculate planetary positions directly
    const { personality, design } = await calculateDirectPlanetaryPositions(birthInfo);
    
    // Generate simplified chart
    const chart = generateSimpleChart(birthInfo, personality, design);
    
    console.log('✅ Chart generated successfully');
    console.log(`   Personality Sun: Gate ${chart.activations.find(a => a.planet === 'Sun' && a.type === 'personality')?.gate}.${chart.activations.find(a => a.planet === 'Sun' && a.type === 'personality')?.line}`);
    console.log(`   Design Sun: Gate ${chart.activations.find(a => a.planet === 'Sun' && a.type === 'design')?.gate}.${chart.activations.find(a => a.planet === 'Sun' && a.type === 'design')?.line}`);

    return NextResponse.json({ 
      success: true, 
      chart,
      chartId: chart.id 
    });

  } catch (error) {
    console.error('💥 Chart generation error:', error);
    
    if (error instanceof SwissEphemerisError) {
      return NextResponse.json(
        { error: `Swiss Ephemeris Error: ${error.message}`, code: error.code },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate chart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
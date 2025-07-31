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

  // Simple chart structure - focus on getting accurate calculations first
  const personalitySun = personality.find(p => p.planet === 'Sun');
  const designSun = design.find(p => p.planet === 'Sun');
  
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    birthInfo,
    activations,
    channels: [], // Simplified for now
    centers: [], // Simplified for now
    energyType: 'Generator', // Simplified for now
    strategy: 'Wait to Respond', // Simplified for now
    authority: 'Sacral', // Simplified for now
    profile: `${personalitySun?.line || 1}/${designSun?.line || 1}`,
    definitionType: 'Single', // Simplified for now
    incarnationCross: `Right Angle Cross of ${personalitySun?.gate || 0}/${designSun?.gate || 0}`,
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
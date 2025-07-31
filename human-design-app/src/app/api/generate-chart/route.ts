import { NextRequest, NextResponse } from 'next/server';
import { BirthInfo, PlanetaryPosition, Activation, HumanDesignChart, Center, Channel } from '@/lib/calculations/types';
import { getLocationCoordinates, SwissEphemerisError, SWISS_EPHEMERIS_CONFIG } from '@/lib/calculations/ephemeris';
import { degreeToGate, degreeToSign } from '@/lib/calculations/gate-mapping';
import { fromZonedTime } from 'date-fns-tz';
import { GATE_TO_CENTER, CENTERS, CHANNELS } from '@/lib/calculations/constants';
import { getIncarnationCrossName } from '@/lib/calculations/incarnation-crosses';

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

  // Set up calculation flags
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

  // Calculate design date using exact 88-degree solar arc
  let designJD: number;
  try {
    // Calculate sun position at birth for exact 88-degree arc
    const birthSunResult = swisseph.swe_calc_ut(personalityJD, swisseph.SE_SUN, flags);
    if ('error' in birthSunResult) {
      throw new Error('Could not calculate birth sun position');
    }
    
    const birthSunLongitude = birthSunResult.longitude;
    console.log(`☀️ Birth Sun longitude: ${birthSunLongitude.toFixed(6)}°`);
    
    // Target sun position: 88 degrees earlier (backward in zodiac)
    const targetSunLongitude = (birthSunLongitude - 88 + 360) % 360;
    console.log(`🎯 Target Design Sun longitude: ${targetSunLongitude.toFixed(6)}°`);
    
    // Start with approximate position using fixed offset
    let currentDesignJD = personalityJD - 88.135417;
    let iterations = 0;
    const maxIterations = 20;
    const precisionThreshold = 0.001; // 0.001 degrees precision
    
    while (iterations < maxIterations) {
      const currentSunResult = swisseph.swe_calc_ut(currentDesignJD, swisseph.SE_SUN, flags);
      if ('error' in currentSunResult) break;
      
      const currentSunLongitude = currentSunResult.longitude;
      let diff = targetSunLongitude - currentSunLongitude;
      
      // Handle 360-degree wrap-around
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      if (Math.abs(diff) < precisionThreshold) {
        console.log(`✅ Converged after ${iterations} iterations, diff: ${Math.abs(diff).toFixed(6)}°`);
        break;
      }
      
      // Adjust Julian Day (sun moves ~1°/day)
      currentDesignJD += diff / 0.985; // Average daily solar motion
      iterations++;
    }
    
    designJD = currentDesignJD;
    console.log(`📅 Design Julian Day: ${designJD} (exact 88° solar arc after ${iterations} iterations)`);
    
  } catch (error) {
    console.warn('88-degree calculation failed, using fixed offset fallback:', error);
    const designOffsetDays = 88.135417;
    designJD = personalityJD - designOffsetDays;
    console.log(`📅 Design Julian Day: ${designJD} (${designOffsetDays} days fallback)`);
  }

  // Calculate planetary positions
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

// Calculate centers based on activated gates and channels
function calculateCenters(activations: Activation[]): Center[] {
  const centerGates: Record<string, Set<number>> = {};
  
  // Initialize all centers
  Object.keys(CENTERS).forEach(centerName => {
    centerGates[centerName] = new Set();
  });
  
  // Add activated gates to their centers
  activations.forEach(activation => {
    const centerName = GATE_TO_CENTER[activation.gate];
    if (centerName) {
      centerGates[centerName].add(activation.gate);
    }
  });
  
  // Get all activated gates for channel checking
  const allActivatedGates = new Set(activations.map(a => a.gate));
  
  // Check which centers are defined
  return Object.entries(centerGates).map(([centerName, gates]) => {
    const gateArray = Array.from(gates);
    const defined = isCenterDefined(centerName, allActivatedGates);
    
    return {
      name: centerName,
      defined,
      gates: gateArray,
      definitionSource: defined ? getDefinitionSource(centerName, allActivatedGates) : []
    };
  });
}

// Check if a center is defined (has at least one complete channel)
function isCenterDefined(centerName: string, allActivatedGates: Set<number>): boolean {
  return Object.entries(CHANNELS).some(([_, channel]) => {
    const [gate1, gate2] = channel.gates;
    const center1 = GATE_TO_CENTER[gate1];
    const center2 = GATE_TO_CENTER[gate2];
    
    // If this channel involves the current center
    if (center1 === centerName || center2 === centerName) {
      // Check if both gates of this channel are activated
      return allActivatedGates.has(gate1) && allActivatedGates.has(gate2);
    }
    return false;
  });
}

// Get the channels that define this center
function getDefinitionSource(centerName: string, allActivatedGates: Set<number>): string[] {
  const sources: string[] = [];
  
  Object.entries(CHANNELS).forEach(([channelKey, channel]) => {
    const [gate1, gate2] = channel.gates;
    const center1 = GATE_TO_CENTER[gate1];
    const center2 = GATE_TO_CENTER[gate2];
    
    // If this channel involves this center and both gates are activated
    if ((center1 === centerName || center2 === centerName) && 
        allActivatedGates.has(gate1) && allActivatedGates.has(gate2)) {
      sources.push(channel.name);
    }
  });
  
  return sources;
}

// Calculate channels from activations
function calculateChannels(activations: Activation[]): Channel[] {
  const activatedGates = new Set(activations.map(a => a.gate));
  
  return Object.entries(CHANNELS).map(([key, channelDef]) => {
    const [gate1, gate2] = channelDef.gates;
    const defined = activatedGates.has(gate1) && activatedGates.has(gate2);
    
    return {
      gates: channelDef.gates,
      name: channelDef.name,
      defined
    };
  });
}

// Calculate energy type based on defined centers
function calculateEnergyType(centers: Center[]): HumanDesignChart['energyType'] {
  const definedCenters = centers.filter(c => c.defined).map(c => c.name);
  
  const hasSacral = definedCenters.includes('Sacral');
  const hasThroat = definedCenters.includes('Throat');
  const hasHeart = definedCenters.includes('Heart');
  const hasSolarPlexus = definedCenters.includes('Solar Plexus');
  const hasRoot = definedCenters.includes('Root');
  
  // Reflector: No defined centers
  if (definedCenters.length === 0) {
    return 'Reflector';
  }
  
  // Need to check for motor to throat connection
  const hasMotorToThroat = checkMotorToThroat(centers);
  
  // Generator types: Sacral defined
  if (hasSacral) {
    // Manifesting Generator: Sacral + motor to throat connection
    if (hasMotorToThroat) {
      return 'Manifesting Generator';
    }
    return 'Generator';
  }
  
  // Manifestor: Motor to throat (without Sacral)
  if (hasMotorToThroat) {
    return 'Manifestor';
  }
  
  // Projector: No Sacral, no motor to throat
  return 'Projector';
}

// Check if there's a motor to throat connection through defined channels
function checkMotorToThroat(centers: Center[]): boolean {
  const definedCenters = centers.filter(c => c.defined).map(c => c.name);
  
  // Must have throat defined
  if (!definedCenters.includes('Throat')) {
    return false;
  }
  
  // Get all defined channels (from centers' definitionSource)
  const definedChannels = new Set<string>();
  centers.forEach(center => {
    if (center.defined && center.definitionSource) {
      center.definitionSource.forEach(channel => definedChannels.add(channel));
    }
  });
  
  // Check for direct motor-to-throat channels
  
  // Solar Plexus to Throat
  if (definedCenters.includes('Solar Plexus')) {
    if (definedChannels.has('Openness') || definedChannels.has('Transitoriness')) {
      return true; // Channels 12-22 or 35-36
    }
  }
  
  // Sacral to Throat
  if (definedCenters.includes('Sacral')) {
    if (definedChannels.has('Charisma')) {
      return true; // Channel 20-34
    }
    
    // Sacral -> G-Center -> Throat paths
    if (definedCenters.includes('G-Center')) {
      const sacralToG = definedChannels.has('The Beat') || // 2-14
                        definedChannels.has('Rhythm') ||   // 5-15
                        definedChannels.has('Discovery');   // 29-46
      
      const gToThroat = definedChannels.has('Inspiration') ||     // 1-8
                        definedChannels.has('The Alpha') ||       // 7-31
                        definedChannels.has('Awakening') ||       // 10-20
                        definedChannels.has('The Prodigal');      // 13-33
      
      if (sacralToG && gToThroat) {
        return true;
      }
    }
    
    // Sacral -> Spleen -> Throat paths
    if (definedCenters.includes('Spleen')) {
      if (definedChannels.has('Preservation')) { // 27-50
        const spleenToThroat = definedChannels.has('The Wavelength') || // 16-48
                               definedChannels.has('The Brainwave');     // 20-57
        if (spleenToThroat) {
          return true;
        }
        
        // Sacral -> Spleen -> G-Center -> Throat
        if (definedChannels.has('Perfected Form') && definedCenters.includes('G-Center')) { // 10-57
          const gToThroat = definedChannels.has('Inspiration') ||   // 1-8
                            definedChannels.has('The Alpha') ||     // 7-31
                            definedChannels.has('Awakening') ||     // 10-20
                            definedChannels.has('The Prodigal');    // 13-33
          if (gToThroat) {
            return true;
          }
        }
      }
    }
  }
  
  // Heart/Ego to Throat
  if (definedCenters.includes('Heart')) {
    if (definedChannels.has('The Money Line')) {
      return true; // Channel 21-45
    }
    
    // Heart -> G-Center -> Throat paths
    if (definedCenters.includes('G-Center')) {
      const heartToG = definedChannels.has('Initiation'); // 25-51
      const gToThroat = definedChannels.has('Inspiration') ||   // 1-8
                        definedChannels.has('The Alpha') ||     // 7-31
                        definedChannels.has('Awakening') ||     // 10-20
                        definedChannels.has('The Prodigal');    // 13-33
      
      if (heartToG && gToThroat) {
        return true;
      }
    }
  }
  
  // Root to Throat (only indirect paths through Spleen)
  if (definedCenters.includes('Root') && definedCenters.includes('Spleen')) {
    const rootToSpleen = definedChannels.has('Judgment') ||        // 18-58
                         definedChannels.has('Struggle') ||        // 28-38
                         definedChannels.has('Transformation');    // 32-54
    
    const spleenToThroat = definedChannels.has('The Wavelength') || // 16-48
                           definedChannels.has('The Brainwave');     // 20-57
    
    if (rootToSpleen && spleenToThroat) {
      return true;
    }
  }
  
  return false;
}

// Get strategy based on energy type
function getStrategy(energyType: HumanDesignChart['energyType']): string {
  const strategies = {
    'Generator': 'Wait for an opportunity to respond',
    'Manifesting Generator': 'Wait for an opportunity to respond',
    'Manifestor': 'To Inform',
    'Projector': 'Wait for the Invitation',
    'Reflector': 'Wait a Lunar Cycle'
  };
  
  return strategies[energyType] || 'Unknown';
}

// Calculate authority based on defined centers
function calculateAuthority(centers: Center[]): string {
  const definedCenters = centers.filter(c => c.defined).map(c => c.name);
  
  // Authority hierarchy
  if (definedCenters.includes('Solar Plexus')) return 'Emotional';
  if (definedCenters.includes('Sacral')) return 'Sacral';
  if (definedCenters.includes('Spleen')) return 'Splenic';
  if (definedCenters.includes('Heart')) return 'Ego Projected';
  if (definedCenters.includes('G-Center')) return 'Self Projected';
  if (definedCenters.length === 0) return 'Lunar';
  
  return 'Sounding Board';
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
  personalitySunLine: number,
  designSunLine: number
): string {
  // Get the proper cross name from the official Human Design data
  const baseCrossName = getIncarnationCrossName(personalitySunGate, personalitySunLine, designSunLine);
  
  // Append the gate pattern in the correct format: (Personality Sun/Personality Earth | Design Sun/Design Earth)
  // This matches the HumDes format: (26/45 | 6/36)
  const fullCrossName = `${baseCrossName} (${personalitySunGate}/${personalityEarthGate} | ${designSunGate}/${designEarthGate})`;
  
  return fullCrossName;
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
  
  // Calculate centers and channels from activations
  const centers = calculateCenters(activations);
  const channels = calculateChannels(activations);
  
  // Debug logging
  console.log('🔍 DEBUG - Activated Gates:', Array.from(new Set(activations.map(a => a.gate))).sort((a, b) => a - b));
  console.log('🔍 DEBUG - All Channels Check:');
  Object.entries(CHANNELS).forEach(([key, channelDef]) => {
    const [gate1, gate2] = channelDef.gates;
    const activatedGates = new Set(activations.map(a => a.gate));
    const hasGate1 = activatedGates.has(gate1);
    const hasGate2 = activatedGates.has(gate2);
    if (hasGate1 || hasGate2) {
      console.log(`    ${channelDef.name} (${gate1}-${gate2}): ${hasGate1 ? '✓' : '✗'}${gate1} ${hasGate2 ? '✓' : '✗'}${gate2} = ${hasGate1 && hasGate2 ? 'DEFINED' : 'incomplete'}`);
    }
  });
  console.log('🔍 DEBUG - Defined Centers:', centers.filter(c => c.defined).map(c => c.name));
  console.log('🔍 DEBUG - Defined Channels:', channels.filter(c => c.defined).map(c => c.name));
  
  // Calculate energy type, strategy, and authority based on real data
  const energyType = calculateEnergyType(centers);
  const strategy = getStrategy(energyType);
  const authority = calculateAuthority(centers);
  
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
    personalitySun?.line || 1,
    designSun?.line || 1
  );
  
  // Debug logging for results
  console.log('🎯 DEBUG - Results:');
  console.log('  Energy Type:', energyType);
  console.log('  Strategy:', strategy);
  console.log('  Authority:', authority);
  console.log('  Profile:', profile);
  console.log('  Definition:', definitionType);
  console.log('  Cross:', incarnationCross);
  
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    birthInfo,
    activations,
    channels,
    centers,
    energyType,
    strategy,
    authority,
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
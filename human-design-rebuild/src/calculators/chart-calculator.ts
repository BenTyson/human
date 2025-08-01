/**
 * Human Design Chart Calculator
 * Main calculator that generates complete HD charts
 */

import { 
  calculateAllPlanets, 
  calculateDesignDate, 
  initializeEphemeris,
  PlanetaryPosition 
} from '../core/astronomical';

import { 
  birthDataToJulianDay, 
  BirthData, 
  validateBirthData 
} from '../core/date-utils';

import { 
  longitudeToGateLine, 
  GateLinePosition 
} from '../human-design/gate-wheel';

import {
  HDCenter,
  ChannelDefinition,
  getActiveChannels,
  getDefinedCenters,
  hasMotorToThroatConnection,
  determineDefinitionType
} from '../human-design/centers-channels-graph';

/**
 * Energy Type determination
 */
export enum EnergyType {
  MANIFESTOR = 'MANIFESTOR',
  GENERATOR = 'GENERATOR',
  MANIFESTING_GENERATOR = 'MANIFESTING_GENERATOR',
  PROJECTOR = 'PROJECTOR',
  REFLECTOR = 'REFLECTOR'
}

/**
 * Authority types
 */
export enum Authority {
  EMOTIONAL = 'EMOTIONAL',
  SACRAL = 'SACRAL', 
  SPLENIC = 'SPLENIC',
  EGO = 'EGO',
  SELF_PROJECTED = 'SELF_PROJECTED',
  MENTAL = 'MENTAL',
  LUNAR = 'LUNAR'
}

/**
 * Definition types
 */
export enum DefinitionType {
  SINGLE = 'SINGLE',
  SPLIT = 'SPLIT',
  TRIPLE = 'TRIPLE',
  QUADRUPLE = 'QUADRUPLE',
  NO_DEFINITION = 'NO_DEFINITION'
}

/**
 * Planetary activation (gate/line for a planet)
 */
export interface PlanetaryActivation {
  planet: string;
  position: PlanetaryPosition;
  gateLine: GateLinePosition;
}

/**
 * Complete Human Design Chart
 */
export interface HumanDesignChart {
  // Input data
  birthData: BirthData;
  
  // Astronomical data
  personalityDate: number;  // Julian Day
  designDate: number;       // Julian Day
  
  // Planetary activations
  personalityActivations: PlanetaryActivation[];
  designActivations: PlanetaryActivation[];
  allActivations: PlanetaryActivation[];
  
  // Gate/Channel analysis
  activatedGates: Set<number>;
  activeChannels: ChannelDefinition[];
  definedCenters: Set<HDCenter>;
  undefinedCenters: Set<HDCenter>;
  
  // Core properties
  energyType: EnergyType;
  authority: Authority;
  profile: string;        // e.g., "5/1"
  definitionType: string;
  
  // Additional properties
  strategy: string;
  notSelfTheme: string;
  signature: string;
  incarnationCross: string;
}

/**
 * Calculate complete Human Design chart
 * @param birthData - Birth information
 * @param ephemerisPath - Optional path to Swiss Ephemeris files
 * @returns Complete Human Design chart
 */
export async function calculateHumanDesignChart(
  birthData: BirthData,
  ephemerisPath?: string
): Promise<HumanDesignChart> {
  // Validate input
  validateBirthData(birthData);
  
  // Initialize Swiss Ephemeris
  initializeEphemeris(ephemerisPath);
  
  // Calculate Julian Days
  const personalityJD = birthDataToJulianDay(birthData);
  const designJD = calculateDesignDate(personalityJD);
  
  // Calculate planetary positions
  const personalityPlanets = calculateAllPlanets(personalityJD);
  const designPlanets = calculateAllPlanets(designJD);
  
  // Convert to gate/line activations
  const personalityActivations = personalityPlanets.map(planet => ({
    planet: planet.planet,
    position: planet,
    gateLine: longitudeToGateLine(planet.longitude)
  }));
  
  // Special handling for design activations
  // Design Sun uses Birth Earth Gate, Design Earth uses Birth Sun Gate
  const designActivations = designPlanets.map(planet => {
    const originalGateLine = longitudeToGateLine(planet.longitude);
    
    // If this is the Sun, use Birth Earth Gate but keep design line
    if (planet.planet === 'SUN') {
      const birthSun = personalityPlanets.find(p => p.planet === 'SUN');
      if (birthSun) {
        const birthEarthLongitude = (birthSun.longitude + 180) % 360;
        const birthEarthGate = longitudeToGateLine(birthEarthLongitude);
        
        // Use birth earth gate but keep original design line
        return {
          planet: planet.planet,
          position: planet,
          gateLine: {
            gate: birthEarthGate.gate,
            line: originalGateLine.line,  // Keep design sun line
            degrees: planet.longitude,
            gateInfo: birthEarthGate.gateInfo
          }
        };
      }
    }
    
    // If this is the Earth, use Birth Sun Gate but keep design line
    if (planet.planet === 'EARTH') {
      const birthSun = personalityPlanets.find(p => p.planet === 'SUN');
      if (birthSun) {
        const birthSunGate = longitudeToGateLine(birthSun.longitude);
        
        // Use birth sun gate but keep original design line
        return {
          planet: planet.planet,
          position: planet,
          gateLine: {
            gate: birthSunGate.gate,
            line: originalGateLine.line,  // Keep design earth line
            degrees: planet.longitude,
            gateInfo: birthSunGate.gateInfo
          }
        };
      }
    }
    
    return {
      planet: planet.planet,
      position: planet,
      gateLine: originalGateLine
    };
  });
  
  // Calculate raw design activations (actual design positions)
  const rawDesignActivations = designPlanets.map(planet => ({
    planet: planet.planet,
    position: planet,
    gateLine: longitudeToGateLine(planet.longitude)
  }));
  
  const allActivations = [...personalityActivations, ...designActivations];
  
  // Get all activated gates - include both cross-reference design AND raw design positions
  const activatedGates = new Set<number>();
  allActivations.forEach(activation => {
    activatedGates.add(activation.gateLine.gate);
  });
  
  // Also add raw design positions (used for Incarnation Cross)
  rawDesignActivations.forEach(activation => {
    activatedGates.add(activation.gateLine.gate);
  });
  
  // Calculate channels and centers
  const activeChannels = getActiveChannels(activatedGates);
  const definedCenters = getDefinedCenters(activeChannels);
  const undefinedCenters = new Set<HDCenter>();
  
  // Find undefined centers
  Object.values(HDCenter).forEach(center => {
    if (!definedCenters.has(center)) {
      undefinedCenters.add(center);
    }
  });
  
  // Determine energy type
  const energyType = determineEnergyType(definedCenters, activeChannels);
  
  // Determine authority
  const authority = determineAuthority(definedCenters, energyType, activatedGates);
  
  // Calculate profile (Sun line personality/design)
  const personalitySun = personalityActivations.find(a => a.planet === 'SUN');
  const designSun = designActivations.find(a => a.planet === 'SUN');
  const profile = `${personalitySun?.gateLine.line || 1}/${designSun?.gateLine.line || 1}`;
  
  // Determine definition type using graph analysis
  const definitionType = determineDefinitionType(activeChannels);
  
  // Get strategy, not-self, signature based on type
  const { strategy, notSelfTheme, signature } = getTypeProperties(energyType);
  
  // Calculate incarnation cross using actual design positions (not cross-reference)
  const incarnationCross = calculateIncarnationCross(
    personalityActivations,
    rawDesignActivations
  );
  
  return {
    birthData,
    personalityDate: personalityJD,
    designDate: designJD,
    personalityActivations,
    designActivations,
    allActivations,
    activatedGates,
    activeChannels,
    definedCenters,
    undefinedCenters,
    energyType,
    authority,
    profile,
    definitionType,
    strategy,
    notSelfTheme,
    signature,
    incarnationCross
  };
}

/**
 * Determine energy type based on defined centers and channels
 */
function determineEnergyType(
  definedCenters: Set<HDCenter>,
  activeChannels: ChannelDefinition[]
): EnergyType {
  const hasDefinedSacral = definedCenters.has(HDCenter.SACRAL);
  const hasMotorToThroat = hasMotorToThroatConnection(activeChannels);
  const hasAnyDefinedCenter = definedCenters.size > 0;
  
  // Reflector: No defined centers
  if (definedCenters.size === 0) {
    return EnergyType.REFLECTOR;
  }
  
  // Manifestor: Motor to throat, undefined sacral
  if (hasMotorToThroat && !hasDefinedSacral) {
    return EnergyType.MANIFESTOR;
  }
  
  // Generator/MG: Defined sacral
  if (hasDefinedSacral) {
    // Manifesting Generator: Defined sacral + motor to throat
    if (hasMotorToThroat) {
      return EnergyType.MANIFESTING_GENERATOR;
    }
    // Pure Generator: Defined sacral, no motor to throat
    return EnergyType.GENERATOR;
  }
  
  // Projector: At least one defined center, no motor to throat, undefined sacral
  if (hasAnyDefinedCenter && !hasMotorToThroat && !hasDefinedSacral) {
    return EnergyType.PROJECTOR;
  }
  
  // Default fallback (shouldn't happen)
  return EnergyType.PROJECTOR;
}

/**
 * Determine authority based on defined centers and hanging gates
 */
function determineAuthority(
  definedCenters: Set<HDCenter>,
  energyType: EnergyType,
  activatedGates: Set<number>
): Authority {
  // Reflectors always have Lunar authority
  if (energyType === EnergyType.REFLECTOR) {
    return Authority.LUNAR;
  }
  
  // Authority hierarchy
  if (definedCenters.has(HDCenter.SOLAR_PLEXUS)) {
    return Authority.EMOTIONAL;
  }
  
  if (definedCenters.has(HDCenter.SACRAL)) {
    return Authority.SACRAL;
  }
  
  if (definedCenters.has(HDCenter.SPLEEN)) {
    return Authority.SPLENIC;
  }
  
  if (definedCenters.has(HDCenter.HEART)) {
    // Check if Heart connects to G or Throat for Ego authority
    return Authority.EGO;
  }
  
  if (definedCenters.has(HDCenter.G_CENTER)) {
    // Check if G connects to Throat for Self-Projected
    return Authority.SELF_PROJECTED;
  }
  
  // Check for Self-Projected authority via hanging G-Center gates
  // G-Center gates that connect to Throat: 1(→8), 7(→31), 10(→20), 13(→33)
  const gToThroatHangingGates = [1, 7, 10, 13];
  const hasGToThroatHanging = gToThroatHangingGates.some(gate => activatedGates.has(gate));
  
  if (hasGToThroatHanging && definedCenters.has(HDCenter.THROAT)) {
    return Authority.SELF_PROJECTED;
  }
  
  if (definedCenters.has(HDCenter.AJNA) || definedCenters.has(HDCenter.HEAD)) {
    return Authority.MENTAL;
  }
  
  // Default fallback
  return Authority.MENTAL;
}

/**
 * Determine definition type based on center connections
 */

/**
 * Get strategy, not-self theme, and signature for energy type
 */
function getTypeProperties(energyType: EnergyType): {
  strategy: string;
  notSelfTheme: string;
  signature: string;
} {
  switch (energyType) {
    case EnergyType.MANIFESTOR:
      return {
        strategy: "To Inform",
        notSelfTheme: "Anger",
        signature: "Peace"
      };
    case EnergyType.GENERATOR:
      return {
        strategy: "To Respond",
        notSelfTheme: "Frustration", 
        signature: "Satisfaction"
      };
    case EnergyType.MANIFESTING_GENERATOR:
      return {
        strategy: "To Respond",
        notSelfTheme: "Frustration",
        signature: "Satisfaction"
      };
    case EnergyType.PROJECTOR:
      return {
        strategy: "Wait for Recognition and Invitation",
        notSelfTheme: "Bitterness",
        signature: "Success"
      };
    case EnergyType.REFLECTOR:
      return {
        strategy: "Wait a Lunar Cycle",
        notSelfTheme: "Disappointment",
        signature: "Surprise"
      };
  }
}

/**
 * Calculate incarnation cross from Sun/Earth positions with proper naming
 */
function calculateIncarnationCross(
  personalityActivations: PlanetaryActivation[],
  designActivations: PlanetaryActivation[]
): string {
  const personalitySun = personalityActivations.find(a => a.planet === 'SUN');
  const personalityEarth = personalityActivations.find(a => a.planet === 'EARTH');
  const designSun = designActivations.find(a => a.planet === 'SUN');
  const designEarth = designActivations.find(a => a.planet === 'EARTH');
  
  if (!personalitySun || !personalityEarth || !designSun || !designEarth) {
    return "Unknown Cross";
  }
  
  const pSun = personalitySun.gateLine.gate;
  const pEarth = personalityEarth.gateLine.gate;
  const dSun = designSun.gateLine.gate;
  const dEarth = designEarth.gateLine.gate;
  
  // Get the proper cross name based on gate combination
  const crossName = getIncarnationCrossName(pSun, pEarth, dSun, dEarth);
  
  return `${crossName} (${pSun}/${pEarth} | ${dSun}/${dEarth})`;
}

/**
 * Determine Incarnation Cross name from gate positions
 */
function getIncarnationCrossName(
  personalitySun: number,
  personalityEarth: number, 
  designSun: number,
  designEarth: number
): string {
  // Create cross key for lookup
  const crossKey = `${personalitySun}/${personalityEarth}|${designSun}/${designEarth}`;
  
  // Known crosses mapping - this would be expanded with full cross database
  const knownCrosses: Record<string, string> = {
    "26/45|6/36": "Left Angle Cross of Confrontation",
    "28/27|31/41": "Right Angle Cross of The Unexpected",
    "14/8|1/2": "Right Angle Cross of The Four Ways",
    "53/54|40/37": "Right Angle Cross of The Four Ways"
    // Add more crosses as needed
  };
  
  // Look up the cross name
  const crossName = knownCrosses[crossKey];
  
  if (crossName) {
    return crossName;
  }
  
  // Fallback: Determine cross type based on patterns
  // Right Angle Cross is most common (70% of population)
  // Left Angle Cross and Juxtaposition are less common
  
  // For now, default to Right Angle Cross with personality Sun gate
  const sunGateNames: Record<number, string> = {
    1: "Self-Expression",
    2: "Higher Knowing", 
    6: "Friction",
    8: "Contribution",
    14: "Power Skills",
    26: "The Egoist",
    27: "Caring",
    28: "The Game Player",
    31: "Influence",
    36: "Crisis",
    40: "Aloneness",
    41: "Contraction",
    45: "The Gatherer",
    53: "Beginnings",
    54: "Ambition"
  };
  
  const sunGateName = sunGateNames[personalitySun] || "Unknown";
  return `Right Angle Cross of ${sunGateName}`;
}
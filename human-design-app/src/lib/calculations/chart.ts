// Human Design chart calculations
import { GATE_TO_CENTER, CENTERS, CHANNELS } from './constants';
import { calculatePlanetaryPositions, calculateActivations } from './planetary';
import { 
  BirthInfo, 
  HumanDesignChart, 
  Activation, 
  Channel, 
  Center 
} from './types';

export async function generateHumanDesignChart(birthInfo: BirthInfo): Promise<HumanDesignChart> {
  // Calculate planetary positions
  const { personality, design } = await calculatePlanetaryPositions(birthInfo);
  
  // Get all activations
  const activations = calculateActivations(personality, design);
  
  // Calculate centers and channels
  const centers = calculateCenters(activations);
  const channels = calculateChannels(activations);
  
  // Determine energy type, strategy, authority, etc.
  const energyType = calculateEnergyType(centers);
  const strategy = getStrategy(energyType);
  const authority = calculateAuthority(centers);
  const profile = calculateProfile(activations);
  const definitionType = calculateDefinitionType(centers);
  const incarnationCross = calculateIncarnationCross(activations);
  
  return {
    id: generateChartId(),
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
  
  // Check which centers are defined
  return Object.entries(centerGates).map(([centerName, gates]) => {
    const gateArray = Array.from(gates);
    const defined = isCenterDefined(centerName, gateArray);
    
    return {
      name: centerName,
      defined,
      gates: gateArray,
      definitionSource: defined ? getDefinitionSource(centerName, gateArray) : []
    };
  });
}

function isCenterDefined(centerName: string, gates: number[]): boolean {
  // A center is defined if it has at least one complete channel
  const centerChannels = Object.entries(CHANNELS).filter(([_, channel]) => {
    const [gate1, gate2] = channel.gates;
    return GATE_TO_CENTER[gate1] === centerName || GATE_TO_CENTER[gate2] === centerName;
  });
  
  return centerChannels.some(([_, channel]) => {
    const [gate1, gate2] = channel.gates;
    return gates.includes(gate1) && gates.includes(gate2);
  });
}

function getDefinitionSource(centerName: string, gates: number[]): string[] {
  // Return the channels that define this center
  const sources: string[] = [];
  
  Object.entries(CHANNELS).forEach(([channelKey, channel]) => {
    const [gate1, gate2] = channel.gates;
    if (gates.includes(gate1) && gates.includes(gate2)) {
      const center1 = GATE_TO_CENTER[gate1];
      const center2 = GATE_TO_CENTER[gate2];
      if (center1 === centerName || center2 === centerName) {
        sources.push(channel.name);
      }
    }
  });
  
  return sources;
}

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

function calculateEnergyType(centers: Center[]): HumanDesignChart['energyType'] {
  const definedCenters = centers.filter(c => c.defined).map(c => c.name);
  
  const hasSacral = definedCenters.includes('Sacral');
  const hasThroat = definedCenters.includes('Throat');
  const hasHeart = definedCenters.includes('Heart');
  const hasSolarPlexus = definedCenters.includes('Solar Plexus');
  const hasSpleen = definedCenters.includes('Spleen');
  
  // Reflector: No defined centers
  if (definedCenters.length === 0) {
    return 'Reflector';
  }
  
  // Manifestor: Throat connected to motor center (not Sacral)
  if (hasThroat && (hasHeart || hasSolarPlexus) && !hasSacral) {
    return 'Manifestor';
  }
  
  // Generator types: Sacral defined
  if (hasSacral) {
    // Manifesting Generator: Sacral + Throat connection
    if (hasThroat) {
      return 'Manifesting Generator';
    }
    return 'Generator';
  }
  
  // Projector: No Sacral, no motor to throat connection
  return 'Projector';
}

function getStrategy(energyType: HumanDesignChart['energyType']): string {
  const strategies = {
    'Generator': 'Wait to Respond',
    'Manifesting Generator': 'Wait to Respond',
    'Manifestor': 'Inform',
    'Projector': 'Wait for the Invitation',
    'Reflector': 'Wait a Lunar Cycle'
  };
  
  return strategies[energyType];
}

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

function calculateProfile(activations: Activation[]): string {
  // Profile is determined by conscious (personality) and unconscious (design) Sun
  const personalitySun = activations.find(a => a.planet === 'Sun' && a.type === 'personality');
  const designSun = activations.find(a => a.planet === 'Sun' && a.type === 'design');
  
  const conscioussLine = personalitySun?.line || 1;
  const unconsciousLine = designSun?.line || 3;
  
  return `${conscioussLine}/${unconsciousLine}`;
}

function calculateDefinitionType(centers: Center[]): HumanDesignChart['definitionType'] {
  const definedCenters = centers.filter(c => c.defined);
  
  if (definedCenters.length === 0) return 'None';
  if (definedCenters.length === 1) return 'Single';
  
  // For now, simplified logic - in production would need graph analysis
  if (definedCenters.length <= 3) return 'Split';
  if (definedCenters.length <= 5) return 'Triple Split';
  
  return 'Quadruple Split';
}

function calculateIncarnationCross(activations: Activation[]): string {
  // Incarnation Cross is determined by Sun/Earth positions at birth and 88 days prior
  const personalitySun = activations.find(a => a.planet === 'Sun' && a.type === 'personality');
  const designSun = activations.find(a => a.planet === 'Sun' && a.type === 'design');
  
  if (!personalitySun || !designSun) return 'Unknown';
  
  // Simplified - would need full incarnation cross database
  return `Right Angle Cross of ${personalitySun.gate}/${designSun.gate}`;
}

function generateChartId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
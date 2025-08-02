/**
 * BodyGraph Renderer - Core SVG Generation Engine
 * Converts Human Design Chart data into visual BodyGraph state
 * CRITICAL: Maintains 100% numerical accuracy
 */

import { 
  HumanDesignChart,
  PlanetaryActivation,
  HDCenter as ChartHDCenter,
  ChannelDefinition
} from './ChartTypes';
import {
  HDChannel,
  HD_CHANNELS,
  GateVisualState,
  CenterVisualState,
  ChannelVisualState,
  BodyGraphState,
  ValidationResult,
  BodyGraphValidation
} from './BodyGraphTypes';

// ===== ACCURACY VALIDATION =====

/**
 * Validate BodyGraph data integrity - CRITICAL for accuracy
 */
export function validateBodyGraphData(chart: HumanDesignChart): BodyGraphValidation {
  const validation: BodyGraphValidation = {
    gateCount: validateGateCount(chart),
    channelDefinitions: validateChannelDefinitions(),
    centerConnections: validateCenterConnections(),
    dataIntegrity: validateDataIntegrity(chart)
  };

  return validation;
}

function validateGateCount(chart: HumanDesignChart): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Should have exactly 13 personality + 13 design activations = 26 total
  const personalityCount = chart.personalityActivations.length;
  const designCount = chart.designActivations.length;

  if (personalityCount !== 13) {
    errors.push(`Invalid personality activation count: ${personalityCount}, expected 13`);
  }

  if (designCount !== 13) {
    errors.push(`Invalid design activation count: ${designCount}, expected 13`);
  }

  // Validate gate numbers are within 1-64 range
  const allActivations = [...chart.personalityActivations, ...chart.designActivations];
  for (const activation of allActivations) {
    const gate = activation.gateLine.gate;
    if (gate < 1 || gate > 64) {
      errors.push(`Invalid gate number: ${gate}, must be 1-64`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateChannelDefinitions(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verify we have exactly 36 channels defined
  if (HD_CHANNELS.length !== 36) {
    errors.push(`Invalid channel count: ${HD_CHANNELS.length}, expected 36`);
  }

  // Validate each channel has exactly 2 gates and 2 centers
  for (const channel of HD_CHANNELS) {
    if (channel.gates.length !== 2) {
      errors.push(`Channel ${channel.id} has ${channel.gates.length} gates, expected 2`);
    }
    
    if (channel.centers.length !== 2) {
      errors.push(`Channel ${channel.id} has ${channel.centers.length} centers, expected 2`);
    }

    // Validate gate numbers
    for (const gate of channel.gates) {
      if (gate < 1 || gate > 64) {
        errors.push(`Channel ${channel.id} has invalid gate: ${gate}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateCenterConnections(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate all 9 centers are represented in channel connections
  const centerSet = new Set<HDCenter>();
  for (const channel of HD_CHANNELS) {
    channel.centers.forEach(center => centerSet.add(center));
  }

  const expectedCenters = Object.values(HDCenter);
  if (centerSet.size !== expectedCenters.length) {
    errors.push(`Missing center connections. Found: ${centerSet.size}, expected: ${expectedCenters.length}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateDataIntegrity(chart: HumanDesignChart): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verify activated gates set matches activations
  const calculatedGates = new Set<number>();
  chart.personalityActivations.forEach(a => calculatedGates.add(a.gateLine.gate));
  chart.designActivations.forEach(a => calculatedGates.add(a.gateLine.gate));

  if (calculatedGates.size !== chart.activatedGates.size) {
    errors.push(`Gate set mismatch: calculated ${calculatedGates.size}, stored ${chart.activatedGates.size}`);
  }

  // Verify all calculated gates are in the stored set
  for (const gate of calculatedGates) {
    if (!chart.activatedGates.has(gate)) {
      errors.push(`Missing gate ${gate} in activatedGates set`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ===== CORE RENDERING LOGIC =====

/**
 * Generate complete BodyGraph visual state from HD chart
 * CRITICAL: Must maintain 100% accuracy to chart data
 */
export function generateBodyGraphState(chart: HumanDesignChart): BodyGraphState {
  // First validate data integrity
  const validation = validateBodyGraphData(chart);
  if (!validation.gateCount.isValid || !validation.dataIntegrity.isValid) {
    console.error('BodyGraph validation failed:', validation);
    throw new Error('Chart data failed validation - cannot render BodyGraph');
  }

  // Generate gate visual states
  const gates = generateGateStates(chart);
  
  // Generate channel visual states
  const channels = generateChannelStates(chart);
  
  // Generate center visual states
  const centers = generateCenterStates(chart, channels);

  return {
    gates,
    centers,
    channels,
    hoveredGate: null,
    hoveredChannel: null,
    selectedCenter: null
  };
}

/**
 * Generate visual state for all 64 gates
 */
function generateGateStates(chart: HumanDesignChart): Map<number, GateVisualState> {
  const gateStates = new Map<number, GateVisualState>();

  // Initialize all 64 gates as inactive
  for (let gateNum = 1; gateNum <= 64; gateNum++) {
    gateStates.set(gateNum, {
      gateNumber: gateNum,
      isActivated: false,
      opacity: 0.3 // Inactive gates are dimmed
    });
  }

  // Process personality activations (conscious)
  for (const activation of chart.personalityActivations) {
    const gate = activation.gateLine.gate;
    const existing = gateStates.get(gate);
    
    gateStates.set(gate, {
      gateNumber: gate,
      isActivated: true,
      activationSource: existing?.activationSource === 'DESIGN' ? 'BOTH' : 'PERSONALITY',
      planet: activation.planet,
      line: activation.gateLine.line,
      color: '#000000', // Black for activated gates
      opacity: 1.0,
      hasGlow: true
    });
  }

  // Process design activations (unconscious)
  for (const activation of chart.designActivations) {
    const gate = activation.gateLine.gate;
    const existing = gateStates.get(gate);
    
    gateStates.set(gate, {
      gateNumber: gate,
      isActivated: true,
      activationSource: existing?.activationSource === 'PERSONALITY' ? 'BOTH' : 'DESIGN',
      planet: activation.planet,
      line: activation.gateLine.line,
      color: '#000000', // Black for activated gates
      opacity: 1.0,
      hasGlow: true
    });
  }

  return gateStates;
}

/**
 * Generate visual state for all 36 channels
 */
function generateChannelStates(chart: HumanDesignChart): Map<string, ChannelVisualState> {
  const channelStates = new Map<string, ChannelVisualState>();

  for (const channel of HD_CHANNELS) {
    const [gate1, gate2] = channel.gates;
    const isActive = chart.activatedGates.has(gate1) && chart.activatedGates.has(gate2);
    
    channelStates.set(channel.id, {
      channel,
      isActive,
      strength: isActive ? 1.0 : 0.1,
      color: isActive ? '#000000' : '#CCCCCC',
      strokeWidth: isActive ? 3 : 1
    });
  }

  return channelStates;
}

/**
 * Generate visual state for all 9 centers
 * CRITICAL: Center definition must match chart.definedCenters exactly
 */
function generateCenterStates(
  chart: HumanDesignChart,
  channels: Map<string, ChannelVisualState>
): Map<ChartHDCenter, CenterVisualState> {
  const centerStates = new Map<ChartHDCenter, CenterVisualState>();

  // Standard HD center colors (can be enhanced with gradients)
  const centerColors: Record<ChartHDCenter, string> = {
    [ChartHDCenter.HEAD]: '#FFFF00',        // Yellow
    [ChartHDCenter.AJNA]: '#00FF00',        // Green  
    [ChartHDCenter.THROAT]: '#8B4513',      // Brown
    [ChartHDCenter.G_CENTER]: '#FFFF00',    // Yellow
    [ChartHDCenter.HEART]: '#FF0000',       // Red
    [ChartHDCenter.SOLAR_PLEXUS]: '#8B4513', // Brown
    [ChartHDCenter.SPLEEN]: '#8B4513',      // Brown
    [ChartHDCenter.SACRAL]: '#FF0000',      // Red
    [ChartHDCenter.ROOT]: '#8B4513'         // Brown
  };

  for (const center of Object.values(ChartHDCenter)) {
    const isDefined = chart.definedCenters.has(center);
    
    // Find channels that define this center
    const definingChannels: HDChannel[] = [];
    for (const [channelId, channelState] of channels) {
      if (channelState.isActive && channelState.channel.centers.includes(center)) {
        definingChannels.push(channelState.channel);
      }
    }

    centerStates.set(center, {
      center,
      isDefined,
      definitionSource: definingChannels,
      color: isDefined ? centerColors[center] : '#FFFFFF', // White when undefined
      gradient: isDefined ? `linear-gradient(135deg, ${centerColors[center]}, ${centerColors[center]}88)` : undefined,
      shadow: isDefined ? '0 2px 8px rgba(0,0,0,0.1)' : undefined,
      borderColor: isDefined ? centerColors[center] : '#CCCCCC'
    });
  }

  return centerStates;
}

// ===== CHANNEL PATH SYSTEM =====

/**
 * Channel path data extracted from SVG analysis
 * CRITICAL: These paths must match the SVG template exactly
 */
export const CHANNEL_PATHS: Record<string, string> = {
  // HEAD-AJNA CHANNELS
  '64-47': 'M391.91,183.35l.38,31.39-17.4.17-.38-31.56',
  '61-24': 'M429.37,183.54l.38,30.8-17.39.16-.38-31',
  '63-4': 'M466.89,183.91,467.26,213.93,449.86,214.09,449.49,183.73',

  // AJNA-THROAT CHANNELS
  '17-62': 'M374.7,350.15,373.82,266.79,391.22,266.62,392.1,350.34',
  '43-23': 'M429.3,373.22l.48,27.3-17.39.16-.49-27.46',
  '11-56': 'M449.65,350.52,448.79,272.34,466.19,272.17,467.05,350.15',

  // THROAT-G CHANNELS
  '20-10': 'M207.63,700.23,347,485.46l15.32,8.23L228,700.69',
  '31-7': 'M374.41,587.09,373.82,544.05,391.22,543.89,391.81,586.9',
  '8-1': 'M411.94,572.77l-.35-29,17.4-.16.35,29',
  '13-33': 'M449.37,587.09l-.59-43,17.4-.17.59,43',

  // THROAT-HEART CHANNELS
  '21-45': 'M537.66,636.79,478.37,503.44l14.89-4.37,59.4,131.07',

  // THROAT-SOLAR PLEXUS CHANNELS
  '12-22': 'M627.89,707.14,478.12,463.22l15.13-8.59L642.37,697.5',
  '35-36': 'M656.89,690.37,480.23,418.14l15-8.82L671.37,680.74',

  // THROAT-SPLEEN CHANNELS
  '20-57': 'M147.44,824.86,79.76,929.14l-15.32-8.22L133.78,814Z',
  '16-48': 'M176.37,686.82,345.85,430.73,361.18,439,191.8,694.87',

  // THROAT-SACRAL CHANNELS
  '34-20': 'M139.46,819.72l213,148.33-6.21,14-213-148.32,6.21-14.05',

  // G-HEART CHANNELS
  '51-25': 'M537.18,733.07l42.22,46L565.87,790l-42.19-46',

  // G-SPLEEN CHANNELS
  '10-57': 'M342.37,683.81l.15,15.4L224,700.67l-.14-15.39,118.48-1.47',

  // G-SACRAL CHANNELS
  '5-15': 'M391.93,837.64,393,929.22l-17.4.16-1.07-91.31',
  '2-14': 'M411.75,838.49l-.52-67.76,17.4-.16.52,67.49',
  '29-46': 'M466.89,838.48l1.08,90-17.4.16L449.49,838',

  // HEART-SOLAR PLEXUS CHANNELS
  '37-40': 'M703.37,882,750,945.61l-17,3.8-42.4-57.87',

  // HEART-SPLEEN CHANNELS
  '44-26': 'M329.22,893.75l-223.06,61-7.58-15.66,226.28-61.85',

  // SOLAR PLEXUS-SACRAL CHANNELS
  '6-59': 'M594,1007.68l-101.47,23.19-.16-17.39L592,990.7',

  // SPLEEN-SACRAL CHANNELS
  '50-27': 'M241.79,989.74l105.77,26.54.16,17.4L239.43,1006.5',

  // SACRAL-ROOT CHANNELS
  '53-42': 'M391.92,1113.38,392.29,1152.9,374.89,1153.06,374.52,1113.38',
  '60-3': 'M429.37,1114.14l.36,38.37-17.4.16-.36-38.9',
  '52-9': 'M466.91,1114.14l.35,38-17.4.16-.36-38.49',

  // SPLEEN-ROOT CHANNELS
  '54-32': 'M232.37,1096.67,355.56,1191l-8.51,15.13-125-95.76',
  '38-28': 'M212.72,1121.9l142,108.27-8.54,15.16L202.37,1135.64',
  '58-18': 'M194.22,1145.83l160.44,120.41-8.58,15.13L184,1159.72',

  // SOLAR PLEXUS-ROOT CHANNELS
  '19-49': 'M618.84,1109.91,494,1206.14,485.49,1191l123-94.88',
  '39-55': 'M639.63,1135.14,494.37,1246l-8.53-15.15L629,1121.64',
  '41-30': 'M658.83,1160.14l-164,122.58-8.58-15.13,162-121.12'
};

// ===== GATE POSITIONING SYSTEM =====

/**
 * Gate positioning data extracted from SVG analysis
 * CRITICAL: These coordinates must match the SVG template exactly
 */
export const GATE_POSITIONS: Record<number, { x: number, y: number, textAnchor: 'start' | 'middle' | 'end' }> = {
  // HEAD CENTER GATES
  61: { x: 420, y: 183, textAnchor: 'middle' },
  63: { x: 450, y: 183, textAnchor: 'middle' },
  64: { x: 375, y: 183, textAnchor: 'middle' },
  
  // AJNA CENTER GATES  
  47: { x: 392, y: 183, textAnchor: 'middle' },
  24: { x: 429, y: 183, textAnchor: 'middle' },
  4: { x: 467, y: 183, textAnchor: 'middle' },
  17: { x: 375, y: 350, textAnchor: 'middle' },
  43: { x: 412, y: 373, textAnchor: 'middle' },
  23: { x: 429, y: 373, textAnchor: 'middle' },
  11: { x: 449, y: 350, textAnchor: 'middle' },
  62: { x: 392, y: 350, textAnchor: 'middle' },
  56: { x: 467, y: 350, textAnchor: 'middle' },

  // THROAT CENTER GATES
  31: { x: 375, y: 587, textAnchor: 'middle' },
  7: { x: 392, y: 587, textAnchor: 'middle' },
  1: { x: 429, y: 573, textAnchor: 'middle' },
  13: { x: 458, y: 663, textAnchor: 'middle' },
  33: { x: 458, y: 552, textAnchor: 'middle' },
  8: { x: 421, y: 552, textAnchor: 'middle' },
  20: { x: 362, y: 507, textAnchor: 'middle' },
  16: { x: 362, y: 459, textAnchor: 'middle' },
  35: { x: 479, y: 454, textAnchor: 'middle' },
  12: { x: 479, y: 489, textAnchor: 'middle' },
  45: { x: 479, y: 522, textAnchor: 'middle' },
  21: { x: 604, y: 782, textAnchor: 'middle' },
  34: { x: 364, y: 991, textAnchor: 'middle' },

  // G CENTER GATES  
  25: { x: 493, y: 712, textAnchor: 'middle' },
  51: { x: 580, y: 806, textAnchor: 'middle' },
  10: { x: 345, y: 703, textAnchor: 'middle' },
  2: { x: 421, y: 779, textAnchor: 'middle' },
  46: { x: 458, y: 747, textAnchor: 'middle' },
  15: { x: 375, y: 838, textAnchor: 'middle' },
  5: { x: 392, y: 838, textAnchor: 'middle' },
  14: { x: 421, y: 955, textAnchor: 'middle' },
  29: { x: 458, y: 955, textAnchor: 'middle' },

  // HEART/EGO CENTER GATES
  26: { x: 554, y: 832, textAnchor: 'middle' },
  40: { x: 638, y: 832, textAnchor: 'middle' },
  37: { x: 748, y: 970, textAnchor: 'middle' },
  21: { x: 604, y: 782, textAnchor: 'middle' }, // Duplicate with throat - channel 21-45
  44: { x: 96, y: 970, textAnchor: 'middle' },

  // SOLAR PLEXUS CENTER GATES
  36: { x: 814, y: 931, textAnchor: 'middle' },
  22: { x: 781, y: 951, textAnchor: 'middle' },
  12: { x: 479, y: 489, textAnchor: 'middle' }, // Duplicate with throat - channel 12-22
  35: { x: 479, y: 454, textAnchor: 'middle' }, // Duplicate with throat - channel 35-36
  6: { x: 713, y: 989, textAnchor: 'middle' },
  37: { x: 748, y: 970, textAnchor: 'middle' }, // Duplicate with heart - channel 37-40
  49: { x: 748, y: 1006, textAnchor: 'middle' },
  19: { x: 478, y: 1202, textAnchor: 'middle' },
  39: { x: 478, y: 1251, textAnchor: 'middle' },
  55: { x: 781, y: 1025, textAnchor: 'middle' },
  30: { x: 814, y: 1044, textAnchor: 'middle' },
  41: { x: 478, y: 1287, textAnchor: 'middle' },

  // SPLEEN CENTER GATES
  57: { x: 63, y: 951, textAnchor: 'middle' },
  48: { x: 30, y: 931, textAnchor: 'middle' },
  16: { x: 362, y: 459, textAnchor: 'middle' }, // Duplicate with throat - channel 16-48
  20: { x: 362, y: 507, textAnchor: 'middle' }, // Duplicate with throat - channel 20-57
  10: { x: 345, y: 703, textAnchor: 'middle' }, // Duplicate with G - channel 10-57
  50: { x: 131, y: 989, textAnchor: 'middle' },
  27: { x: 364, y: 1037, textAnchor: 'middle' },
  28: { x: 63, y: 1025, textAnchor: 'middle' },
  32: { x: 96, y: 1006, textAnchor: 'middle' },
  44: { x: 96, y: 970, textAnchor: 'middle' }, // Duplicate with heart - channel 44-26
  18: { x: 30, y: 1044, textAnchor: 'middle' },
  58: { x: 363, y: 1287, textAnchor: 'middle' },
  54: { x: 363, y: 1215, textAnchor: 'middle' },
  38: { x: 363, y: 1251, textAnchor: 'middle' },

  // SACRAL CENTER GATES
  34: { x: 364, y: 991, textAnchor: 'middle' }, // Duplicate with throat - channel 34-20
  59: { x: 476, y: 1037, textAnchor: 'middle' },
  6: { x: 713, y: 989, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 6-59
  27: { x: 364, y: 1037, textAnchor: 'middle' }, // Duplicate with spleen - channel 27-50
  57: { x: 63, y: 951, textAnchor: 'middle' }, // Duplicate with spleen - channel 57-34
  5: { x: 392, y: 838, textAnchor: 'middle' }, // Duplicate with G - channel 5-15
  15: { x: 375, y: 838, textAnchor: 'middle' }, // Duplicate with G - channel 15-5
  2: { x: 421, y: 779, textAnchor: 'middle' }, // Duplicate with G - channel 2-14
  14: { x: 421, y: 955, textAnchor: 'middle' }, // Duplicate with G - channel 14-2
  29: { x: 458, y: 955, textAnchor: 'middle' }, // Duplicate with G - channel 29-46
  46: { x: 458, y: 747, textAnchor: 'middle' }, // Duplicate with G - channel 46-29
  42: { x: 375, y: 1113, textAnchor: 'middle' },
  53: { x: 392, y: 1113, textAnchor: 'middle' },
  3: { x: 412, y: 1114, textAnchor: 'middle' },
  60: { x: 429, y: 1114, textAnchor: 'middle' },
  52: { x: 467, y: 1114, textAnchor: 'middle' },
  9: { x: 449, y: 1114, textAnchor: 'middle' },

  // ROOT CENTER GATES
  53: { x: 392, y: 1113, textAnchor: 'middle' }, // Duplicate with sacral - channel 53-42
  42: { x: 375, y: 1113, textAnchor: 'middle' }, // Duplicate with sacral - channel 42-53
  60: { x: 429, y: 1114, textAnchor: 'middle' }, // Duplicate with sacral - channel 60-3
  3: { x: 412, y: 1114, textAnchor: 'middle' }, // Duplicate with sacral - channel 3-60
  52: { x: 467, y: 1114, textAnchor: 'middle' }, // Duplicate with sacral - channel 52-9
  9: { x: 449, y: 1114, textAnchor: 'middle' }, // Duplicate with sacral - channel 9-52
  54: { x: 363, y: 1215, textAnchor: 'middle' }, // Duplicate with spleen - channel 54-32
  32: { x: 96, y: 1006, textAnchor: 'middle' }, // Duplicate with spleen - channel 32-54
  38: { x: 363, y: 1251, textAnchor: 'middle' }, // Duplicate with spleen - channel 38-28
  28: { x: 63, y: 1025, textAnchor: 'middle' }, // Duplicate with spleen - channel 28-38
  58: { x: 363, y: 1287, textAnchor: 'middle' }, // Duplicate with spleen - channel 58-18
  18: { x: 30, y: 1044, textAnchor: 'middle' }, // Duplicate with spleen - channel 18-58
  19: { x: 478, y: 1202, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 19-49
  49: { x: 748, y: 1006, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 49-19
  39: { x: 478, y: 1251, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 39-55
  55: { x: 781, y: 1025, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 55-39
  41: { x: 478, y: 1287, textAnchor: 'middle' }, // Duplicate with solar plexus - channel 41-30
  30: { x: 814, y: 1044, textAnchor: 'middle' } // Duplicate with solar plexus - channel 30-41
};

// ===== COLOR SYSTEMS =====

/**
 * Modern color palette for BodyGraph visualization
 */
export const BODYGRAPH_COLORS = {
  // Center colors (can be enhanced with gradients)
  centers: {
    defined: {
      [ChartHDCenter.HEAD]: '#FFD700',        // Gold
      [ChartHDCenter.AJNA]: '#32CD32',        // Lime Green
      [ChartHDCenter.THROAT]: '#8B4513',      // Saddle Brown
      [ChartHDCenter.G_CENTER]: '#FFD700',    // Gold  
      [ChartHDCenter.HEART]: '#DC143C',       // Crimson
      [ChartHDCenter.SOLAR_PLEXUS]: '#D2691E', // Chocolate
      [ChartHDCenter.SPLEEN]: '#A0522D',      // Sienna
      [ChartHDCenter.SACRAL]: '#FF4500',      // Orange Red
      [ChartHDCenter.ROOT]: '#8B4513'         // Saddle Brown
    },
    undefined: '#FFFFFF'
  },
  
  // Gate colors
  gates: {
    activated: '#000000',
    inactive: '#CCCCCC',
    text: {
      activated: '#FFFFFF',
      inactive: '#666666'
    }
  },
  
  // Channel colors
  channels: {
    active: '#000000',
    inactive: '#E0E0E0',
    hover: '#4169E1'
  },
  
  // Interactive states
  interactive: {
    hover: '#4169E1',
    selected: '#FF6347',
    glow: 'rgba(65, 105, 225, 0.3)'
  }
} as const;
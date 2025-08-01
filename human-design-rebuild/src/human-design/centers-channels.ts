/**
 * Human Design Centers and Channels
 * Based on verified gate_channels.txt data
 */

/**
 * Human Design Center definitions
 */
export enum HDCenter {
  HEAD = 'HEAD',
  AJNA = 'AJNA', 
  THROAT = 'THROAT',
  G_CENTER = 'G_CENTER',
  HEART = 'HEART',
  SPLEEN = 'SPLEEN',
  SOLAR_PLEXUS = 'SOLAR_PLEXUS',
  SACRAL = 'SACRAL',
  ROOT = 'ROOT'
}

/**
 * Circuit types for gates and channels
 */
export enum CircuitType {
  INDIVIDUAL = 'INDIVIDUAL',
  COLLECTIVE = 'COLLECTIVE', 
  TRIBAL = 'TRIBAL'
}

/**
 * Channel definition
 */
export interface ChannelDefinition {
  gate1: number;
  gate2: number;
  name: string;
  circuit: CircuitType;
  centers: [HDCenter, HDCenter]; // Centers this channel connects
}

/**
 * Center gate associations
 */
export const CENTER_GATES: Record<HDCenter, number[]> = {
  [HDCenter.HEAD]: [61, 63, 64],
  [HDCenter.AJNA]: [47, 24, 4, 17, 43, 11],
  [HDCenter.THROAT]: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  [HDCenter.G_CENTER]: [1, 13, 25, 46, 2, 15, 10, 7],
  [HDCenter.HEART]: [21, 40, 26, 51],
  [HDCenter.SPLEEN]: [48, 57, 44, 50, 32, 28, 18],
  [HDCenter.SOLAR_PLEXUS]: [6, 37, 22, 36, 30, 55, 49],
  [HDCenter.SACRAL]: [3, 42, 9, 59, 14, 29, 27, 34, 5],
  [HDCenter.ROOT]: [53, 60, 52, 19, 39, 41, 58, 38, 54]
};

/**
 * All 36 Human Design Channels
 */
export const CHANNELS: ChannelDefinition[] = [
  { gate1: 1, gate2: 8, name: "Channel of Inspiration", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.THROAT] },
  { gate1: 2, gate2: 14, name: "Channel of the Beat", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.G_CENTER, HDCenter.SACRAL] },
  { gate1: 3, gate2: 60, name: "Channel of Mutation", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.SACRAL, HDCenter.ROOT] },
  { gate1: 4, gate2: 63, name: "Channel of Logic", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.AJNA, HDCenter.HEAD] },
  { gate1: 5, gate2: 15, name: "Channel of Rhythm", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.G_CENTER] },
  { gate1: 6, gate2: 59, name: "Channel of Intimacy", circuit: CircuitType.TRIBAL, centers: [HDCenter.SOLAR_PLEXUS, HDCenter.SACRAL] },
  { gate1: 7, gate2: 31, name: "Channel of the Alpha", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.G_CENTER, HDCenter.THROAT] },
  { gate1: 9, gate2: 52, name: "Channel of Concentration", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.ROOT] },
  { gate1: 10, gate2: 20, name: "Channel of Awakening", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.THROAT] },
  { gate1: 10, gate2: 34, name: "Channel of Exploration", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.SACRAL] },
  { gate1: 10, gate2: 57, name: "Channel of Perfected Form", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.SPLEEN] },
  { gate1: 11, gate2: 56, name: "Channel of Curiosity", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.AJNA, HDCenter.THROAT] },
  { gate1: 12, gate2: 22, name: "Channel of Openness", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.THROAT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 13, gate2: 33, name: "Channel of the Prodigal", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.G_CENTER, HDCenter.THROAT] },
  { gate1: 16, gate2: 48, name: "Channel of the Wavelength", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.THROAT, HDCenter.SPLEEN] },
  { gate1: 17, gate2: 62, name: "Channel of Acceptance", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.AJNA, HDCenter.THROAT] },
  { gate1: 18, gate2: 58, name: "Channel of Judgment", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SPLEEN, HDCenter.ROOT] },
  { gate1: 19, gate2: 49, name: "Channel of Synthesis", circuit: CircuitType.TRIBAL, centers: [HDCenter.ROOT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 20, gate2: 34, name: "Channel of Charisma", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.THROAT, HDCenter.SACRAL] },
  { gate1: 20, gate2: 57, name: "Channel of the Brainwave", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.THROAT, HDCenter.SPLEEN] },
  { gate1: 21, gate2: 45, name: "Channel of Money", circuit: CircuitType.TRIBAL, centers: [HDCenter.HEART, HDCenter.THROAT] },
  { gate1: 23, gate2: 43, name: "Channel of Structuring", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.THROAT, HDCenter.AJNA] },
  { gate1: 24, gate2: 61, name: "Channel of Awareness", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.AJNA, HDCenter.HEAD] },
  { gate1: 25, gate2: 51, name: "Channel of Initiation", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.HEART] },
  { gate1: 26, gate2: 44, name: "Channel of Surrender", circuit: CircuitType.TRIBAL, centers: [HDCenter.HEART, HDCenter.SPLEEN] },
  { gate1: 27, gate2: 50, name: "Channel of Preservation", circuit: CircuitType.TRIBAL, centers: [HDCenter.SACRAL, HDCenter.SPLEEN] },
  { gate1: 28, gate2: 38, name: "Channel of Struggle", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.SPLEEN, HDCenter.ROOT] },
  { gate1: 29, gate2: 46, name: "Channel of Discovery", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.G_CENTER] },
  { gate1: 30, gate2: 41, name: "Channel of Recognition", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SOLAR_PLEXUS, HDCenter.ROOT] },
  { gate1: 32, gate2: 54, name: "Channel of Transformation", circuit: CircuitType.TRIBAL, centers: [HDCenter.SPLEEN, HDCenter.ROOT] },
  { gate1: 34, gate2: 57, name: "Channel of Power", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.SACRAL, HDCenter.SPLEEN] },
  { gate1: 35, gate2: 36, name: "Channel of Transitoriness", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.THROAT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 37, gate2: 40, name: "Channel of Community", circuit: CircuitType.TRIBAL, centers: [HDCenter.SOLAR_PLEXUS, HDCenter.HEART] },
  { gate1: 39, gate2: 55, name: "Channel of Emoting", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.ROOT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 42, gate2: 53, name: "Channel of Maturation", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.ROOT] },
  { gate1: 47, gate2: 64, name: "Channel of Abstraction", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.AJNA, HDCenter.HEAD] }
];

/**
 * Find which center a gate belongs to
 * @param gateNumber - Gate number (1-64)
 * @returns Center that contains this gate, or null if not found
 */
export function getGateCenter(gateNumber: number): HDCenter | null {
  for (const [center, gates] of Object.entries(CENTER_GATES)) {
    if (gates.includes(gateNumber)) {
      return center as HDCenter;
    }
  }
  return null;
}

/**
 * Find all channels that include a specific gate
 * @param gateNumber - Gate number (1-64)
 * @returns Array of channels containing this gate
 */
export function getChannelsForGate(gateNumber: number): ChannelDefinition[] {
  return CHANNELS.filter(channel => 
    channel.gate1 === gateNumber || channel.gate2 === gateNumber
  );
}

/**
 * Get channel definition by gate pair
 * @param gate1 - First gate number
 * @param gate2 - Second gate number
 * @returns Channel definition or null if not found
 */
export function getChannel(gate1: number, gate2: number): ChannelDefinition | null {
  return CHANNELS.find(channel => 
    (channel.gate1 === gate1 && channel.gate2 === gate2) ||
    (channel.gate1 === gate2 && channel.gate2 === gate1)
  ) || null;
}

/**
 * Check if a channel is active (both gates are activated)
 * @param channel - Channel definition
 * @param activatedGates - Set of activated gate numbers
 * @returns True if both gates in the channel are activated
 */
export function isChannelActive(channel: ChannelDefinition, activatedGates: Set<number>): boolean {
  return activatedGates.has(channel.gate1) && activatedGates.has(channel.gate2);
}

/**
 * Get all active channels from a set of activated gates
 * @param activatedGates - Set of activated gate numbers
 * @returns Array of active channels
 */
export function getActiveChannels(activatedGates: Set<number>): ChannelDefinition[] {
  return CHANNELS.filter(channel => isChannelActive(channel, activatedGates));
}

/**
 * Determine which centers are defined based on active channels
 * @param activeChannels - Array of active channels
 * @returns Set of defined centers
 */
export function getDefinedCenters(activeChannels: ChannelDefinition[]): Set<HDCenter> {
  const definedCenters = new Set<HDCenter>();
  
  for (const channel of activeChannels) {
    definedCenters.add(channel.centers[0]);
    definedCenters.add(channel.centers[1]);
  }
  
  return definedCenters;
}

/**
 * Motor centers (sources of energy)
 */
export const MOTOR_CENTERS = new Set<HDCenter>([
  HDCenter.HEART,
  HDCenter.SOLAR_PLEXUS,
  HDCenter.SACRAL,
  HDCenter.ROOT
]);

/**
 * Check if there's a motor-to-throat connection
 * @param activeChannels - Array of active channels
 * @returns True if any motor center connects to throat
 */
export function hasMotorToThroatConnection(activeChannels: ChannelDefinition[]): boolean {
  return activeChannels.some(channel => {
    const [center1, center2] = channel.centers;
    return (MOTOR_CENTERS.has(center1) && center2 === HDCenter.THROAT) ||
           (MOTOR_CENTERS.has(center2) && center1 === HDCenter.THROAT);
  });
}
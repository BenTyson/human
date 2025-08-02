/**
 * BodyGraph TypeScript Interfaces
 * Core type definitions for modern BodyGraph visualization
 */

import { HumanDesignChart, HDCenter, ChannelDefinition } from './ChartTypes';

// ===== CORE HUMAN DESIGN ENUMS =====
// Using HDCenter from ChartTypes to maintain consistency

export enum HDGate {
  // All 64 gates - maintaining numerical accuracy
  GATE_1 = 1, GATE_2 = 2, GATE_3 = 3, GATE_4 = 4, GATE_5 = 5, GATE_6 = 6,
  GATE_7 = 7, GATE_8 = 8, GATE_9 = 9, GATE_10 = 10, GATE_11 = 11, GATE_12 = 12,
  GATE_13 = 13, GATE_14 = 14, GATE_15 = 15, GATE_16 = 16, GATE_17 = 17, GATE_18 = 18,
  GATE_19 = 19, GATE_20 = 20, GATE_21 = 21, GATE_22 = 22, GATE_23 = 23, GATE_24 = 24,
  GATE_25 = 25, GATE_26 = 26, GATE_27 = 27, GATE_28 = 28, GATE_29 = 29, GATE_30 = 30,
  GATE_31 = 31, GATE_32 = 32, GATE_33 = 33, GATE_34 = 34, GATE_35 = 35, GATE_36 = 36,
  GATE_37 = 37, GATE_38 = 38, GATE_39 = 39, GATE_40 = 40, GATE_41 = 41, GATE_42 = 42,
  GATE_43 = 43, GATE_44 = 44, GATE_45 = 45, GATE_46 = 46, GATE_47 = 47, GATE_48 = 48,
  GATE_49 = 49, GATE_50 = 50, GATE_51 = 51, GATE_52 = 52, GATE_53 = 53, GATE_54 = 54,
  GATE_55 = 55, GATE_56 = 56, GATE_57 = 57, GATE_58 = 58, GATE_59 = 59, GATE_60 = 60,
  GATE_61 = 61, GATE_62 = 62, GATE_63 = 63, GATE_64 = 64
}

// ===== CHANNEL DEFINITIONS =====
// Using ChannelDefinition from ChartTypes for consistency

export interface HDChannel extends ChannelDefinition {
  circuitry: 'INDIVIDUAL' | 'TRIBAL' | 'COLLECTIVE';
  description: string;
}

// Complete channel definitions - CRITICAL for accuracy
export const HD_CHANNELS: HDChannel[] = [
  // HEAD-AJNA CHANNELS
  { id: '64-47', name: 'Abstraction', gates: [64, 47], centers: [HDCenter.HEAD, HDCenter.AJNA], circuitry: 'COLLECTIVE', description: 'Channel of Abstraction' },
  { id: '61-24', name: 'Awareness', gates: [61, 24], centers: [HDCenter.HEAD, HDCenter.AJNA], circuitry: 'COLLECTIVE', description: 'Channel of Awareness' },
  { id: '63-4', name: 'Logic', gates: [63, 4], centers: [HDCenter.HEAD, HDCenter.AJNA], circuitry: 'COLLECTIVE', description: 'Channel of Logic' },

  // AJNA-THROAT CHANNELS  
  { id: '17-62', name: 'Acceptance', gates: [17, 62], centers: [HDCenter.AJNA, HDCenter.THROAT], circuitry: 'COLLECTIVE', description: 'Channel of Acceptance' },
  { id: '43-23', name: 'Structuring', gates: [43, 23], centers: [HDCenter.AJNA, HDCenter.THROAT], circuitry: 'COLLECTIVE', description: 'Channel of Structuring' },
  { id: '11-56', name: 'Curiosity', gates: [11, 56], centers: [HDCenter.AJNA, HDCenter.THROAT], circuitry: 'COLLECTIVE', description: 'Channel of Curiosity' },

  // THROAT-G CHANNELS
  { id: '20-10', name: 'Awakening', gates: [20, 10], centers: [HDCenter.THROAT, HDCenter.G_CENTER], circuitry: 'INDIVIDUAL', description: 'Channel of Awakening' },
  { id: '31-7', name: 'Alpha', gates: [31, 7], centers: [HDCenter.THROAT, HDCenter.G_CENTER], circuitry: 'COLLECTIVE', description: 'Channel of the Alpha' },
  { id: '8-1', name: 'Inspiration', gates: [8, 1], centers: [HDCenter.THROAT, HDCenter.G_CENTER], circuitry: 'INDIVIDUAL', description: 'Channel of Inspiration' },
  { id: '33-13', name: 'Prodigal', gates: [33, 13], centers: [HDCenter.THROAT, HDCenter.G_CENTER], circuitry: 'COLLECTIVE', description: 'Channel of the Prodigal' },

  // THROAT-HEART CHANNELS
  { id: '21-45', name: 'Money Line', gates: [21, 45], centers: [HDCenter.THROAT, HDCenter.HEART], circuitry: 'TRIBAL', description: 'Channel of Money Line' },

  // THROAT-SOLAR PLEXUS CHANNELS
  { id: '12-22', name: 'Openness', gates: [12, 22], centers: [HDCenter.THROAT, HDCenter.SOLAR_PLEXUS], circuitry: 'INDIVIDUAL', description: 'Channel of Openness' },
  { id: '35-36', name: 'Transitoriness', gates: [35, 36], centers: [HDCenter.THROAT, HDCenter.SOLAR_PLEXUS], circuitry: 'COLLECTIVE', description: 'Channel of Transitoriness' },

  // THROAT-SPLEEN CHANNELS
  { id: '20-57', name: 'Brainwave', gates: [20, 57], centers: [HDCenter.THROAT, HDCenter.SPLEEN], circuitry: 'INDIVIDUAL', description: 'Channel of the Brain Wave' },
  { id: '16-48', name: 'Wavelength', gates: [16, 48], centers: [HDCenter.THROAT, HDCenter.SPLEEN], circuitry: 'COLLECTIVE', description: 'Channel of Wavelength' },

  // THROAT-SACRAL CHANNELS
  { id: '34-20', name: 'Charisma', gates: [34, 20], centers: [HDCenter.THROAT, HDCenter.SACRAL], circuitry: 'INDIVIDUAL', description: 'Channel of Charisma' },

  // G-HEART CHANNELS
  { id: '51-25', name: 'Initiation', gates: [51, 25], centers: [HDCenter.G_CENTER, HDCenter.HEART], circuitry: 'INDIVIDUAL', description: 'Channel of Initiation' },

  // G-SPLEEN CHANNELS  
  { id: '10-57', name: 'Perfected Form', gates: [10, 57], centers: [HDCenter.G_CENTER, HDCenter.SPLEEN], circuitry: 'INDIVIDUAL', description: 'Channel of Perfected Form' },

  // G-SACRAL CHANNELS
  { id: '34-10', name: 'Exploration', gates: [34, 10], centers: [HDCenter.G_CENTER, HDCenter.SACRAL], circuitry: 'INDIVIDUAL', description: 'Channel of Exploration' },
  { id: '5-15', name: 'Rhythm', gates: [5, 15], centers: [HDCenter.G_CENTER, HDCenter.SACRAL], circuitry: 'COLLECTIVE', description: 'Channel of Rhythm' },
  { id: '2-14', name: 'Beat', gates: [2, 14], centers: [HDCenter.G_CENTER, HDCenter.SACRAL], circuitry: 'INDIVIDUAL', description: 'Channel of the Beat' },
  { id: '29-46', name: 'Discovery', gates: [29, 46], centers: [HDCenter.G_CENTER, HDCenter.SACRAL], circuitry: 'COLLECTIVE', description: 'Channel of Discovery' },

  // HEART-SOLAR PLEXUS CHANNELS
  { id: '37-40', name: 'Community', gates: [37, 40], centers: [HDCenter.HEART, HDCenter.SOLAR_PLEXUS], circuitry: 'TRIBAL', description: 'Channel of Community' },

  // HEART-SPLEEN CHANNELS
  { id: '44-26', name: 'Surrender', gates: [44, 26], centers: [HDCenter.HEART, HDCenter.SPLEEN], circuitry: 'TRIBAL', description: 'Channel of Surrender' },

  // SOLAR PLEXUS-SACRAL CHANNELS
  { id: '6-59', name: 'Mating', gates: [6, 59], centers: [HDCenter.SOLAR_PLEXUS, HDCenter.SACRAL], circuitry: 'TRIBAL', description: 'Channel of Mating' },

  // SPLEEN-SACRAL CHANNELS
  { id: '50-27', name: 'Preservation', gates: [50, 27], centers: [HDCenter.SPLEEN, HDCenter.SACRAL], circuitry: 'TRIBAL', description: 'Channel of Preservation' },
  { id: '57-34', name: 'Power', gates: [57, 34], centers: [HDCenter.SPLEEN, HDCenter.SACRAL], circuitry: 'INDIVIDUAL', description: 'Channel of Power' },

  // SACRAL-ROOT CHANNELS
  { id: '53-42', name: 'Maturation', gates: [53, 42], centers: [HDCenter.SACRAL, HDCenter.ROOT], circuitry: 'COLLECTIVE', description: 'Channel of Maturation' },
  { id: '60-3', name: 'Mutation', gates: [60, 3], centers: [HDCenter.SACRAL, HDCenter.ROOT], circuitry: 'INDIVIDUAL', description: 'Channel of Mutation' },
  { id: '52-9', name: 'Concentration', gates: [52, 9], centers: [HDCenter.SACRAL, HDCenter.ROOT], circuitry: 'COLLECTIVE', description: 'Channel of Concentration' },

  // SPLEEN-ROOT CHANNELS
  { id: '54-32', name: 'Transformation', gates: [54, 32], centers: [HDCenter.SPLEEN, HDCenter.ROOT], circuitry: 'COLLECTIVE', description: 'Channel of Transformation' },
  { id: '38-28', name: 'Struggle', gates: [38, 28], centers: [HDCenter.SPLEEN, HDCenter.ROOT], circuitry: 'INDIVIDUAL', description: 'Channel of Struggle' },
  { id: '58-18', name: 'Judgment', gates: [58, 18], centers: [HDCenter.SPLEEN, HDCenter.ROOT], circuitry: 'COLLECTIVE', description: 'Channel of Judgment' },

  // SOLAR PLEXUS-ROOT CHANNELS
  { id: '19-49', name: 'Synthesis', gates: [19, 49], centers: [HDCenter.SOLAR_PLEXUS, HDCenter.ROOT], circuitry: 'TRIBAL', description: 'Channel of Synthesis' },
  { id: '39-55', name: 'Emoting', gates: [39, 55], centers: [HDCenter.SOLAR_PLEXUS, HDCenter.ROOT], circuitry: 'INDIVIDUAL', description: 'Channel of Emoting' },
  { id: '41-30', name: 'Recognition', gates: [41, 30], centers: [HDCenter.SOLAR_PLEXUS, HDCenter.ROOT], circuitry: 'COLLECTIVE', description: 'Channel of Recognition' }
];

// ===== VISUAL INTERFACES =====

export interface GateVisualState {
  gateNumber: number;
  isActivated: boolean;
  activationSource?: 'PERSONALITY' | 'DESIGN' | 'BOTH';
  planet?: string;
  line?: number;
  color?: string;
  // Visual enhancement properties
  hasGlow?: boolean;
  opacity?: number;
  scale?: number;
}

export interface CenterVisualState {
  center: HDCenter;
  isDefined: boolean;
  definitionSource: HDChannel[];
  color: string;
  // Modern visual properties
  gradient?: string;
  shadow?: string;
  borderColor?: string;
}

export interface ChannelVisualState {
  channel: HDChannel;
  isActive: boolean;
  strength?: number; // 0-1 for visual intensity
  color?: string;
  strokeWidth?: number;
}

// ===== BODYGRAPH COMPONENT INTERFACES =====

export interface BodyGraphProps {
  chart: HumanDesignChart;
  width?: number;
  height?: number;
  interactive?: boolean;
  showTooltips?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  onGateHover?: (gate: number | null) => void;
  onCenterClick?: (center: HDCenter) => void;
  onChannelHover?: (channel: HDChannel | null) => void;
}

export interface BodyGraphState {
  gates: Map<number, GateVisualState>;
  centers: Map<HDCenter, CenterVisualState>;
  channels: Map<string, ChannelVisualState>;
  hoveredGate: number | null;
  hoveredChannel: string | null;
  selectedCenter: HDCenter | null;
}

// ===== RENDERING INTERFACES =====

export interface SVGCoordinates {
  x: number;
  y: number;
}

export interface GatePosition extends SVGCoordinates {
  gateNumber: number;
  textAnchor: 'start' | 'middle' | 'end';
  fontSize: number;
}

export interface CenterGeometry {
  center: HDCenter;
  path: string; // SVG path data
  centroid: SVGCoordinates;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ChannelPath {
  channelId: string;
  path: string; // SVG path data
  length: number;
  midpoint: SVGCoordinates;
}

// ===== ACCURACY VALIDATION INTERFACES =====

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BodyGraphValidation {
  gateCount: ValidationResult;
  channelDefinitions: ValidationResult;
  centerConnections: ValidationResult;
  dataIntegrity: ValidationResult;
}

// ===== EXPORT INTERFACES =====

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  width: number;
  height: number;
  quality?: number; // for PNG
  includeBackground?: boolean;
  includeLabels?: boolean;
}
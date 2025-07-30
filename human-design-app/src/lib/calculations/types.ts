// Human Design calculation types

export interface BirthInfo {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  place: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  gate: number;
  line: number;
  julianDay: number;
}

export interface Activation {
  planet: string;
  gate: number;
  line: number;
  type: 'design' | 'personality';
  position: PlanetaryPosition;
}

export interface Channel {
  gates: [number, number];
  name: string;
  defined: boolean;
}

export interface Center {
  name: string;
  defined: boolean;
  gates: number[];
  definitionSource: string[];
}

export interface HumanDesignChart {
  id: string;
  birthInfo: BirthInfo;
  activations: Activation[];
  channels: Channel[];
  centers: Center[];
  energyType: 'Generator' | 'Manifestor' | 'Projector' | 'Reflector' | 'Manifesting Generator';
  strategy: string;
  authority: string;
  profile: string;
  definitionType: 'None' | 'Single' | 'Split' | 'Triple Split' | 'Quadruple Split';
  incarnationCross: string;
  createdAt: Date;
}

export interface GateInfo {
  number: number;
  name: string;
  center: string;
  description: string;
}

export interface CenterInfo {
  name: string;
  type: 'motor' | 'awareness' | 'pressure';
  theme: string;
  gates: number[];
}
/**
 * Human Design Centers and Channels - Graph-Based Implementation
 * Proper connectivity analysis using graph theory principles
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
  centers: [HDCenter, HDCenter];  // Exactly 2 centers
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
 * All 36 Human Design Channels with exact center connections
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
  { gate1: 23, gate2: 43, name: "Channel of Structuring", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.AJNA, HDCenter.THROAT] },
  { gate1: 24, gate2: 61, name: "Channel of Awareness", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.AJNA, HDCenter.HEAD] },
  { gate1: 25, gate2: 51, name: "Channel of Initiation", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.G_CENTER, HDCenter.HEART] },
  { gate1: 26, gate2: 44, name: "Channel of Surrender", circuit: CircuitType.TRIBAL, centers: [HDCenter.HEART, HDCenter.SPLEEN] },
  { gate1: 27, gate2: 50, name: "Channel of Preservation", circuit: CircuitType.TRIBAL, centers: [HDCenter.SACRAL, HDCenter.SPLEEN] },
  { gate1: 28, gate2: 38, name: "Channel of Struggle", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.SPLEEN, HDCenter.ROOT] },
  { gate1: 29, gate2: 46, name: "Channel of Discovery", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.G_CENTER] },
  { gate1: 30, gate2: 41, name: "Channel of Recognition", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SOLAR_PLEXUS, HDCenter.ROOT] },
  { gate1: 32, gate2: 54, name: "Channel of Transformation", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SPLEEN, HDCenter.ROOT] },
  { gate1: 34, gate2: 57, name: "Channel of Power", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.SACRAL, HDCenter.SPLEEN] },
  { gate1: 35, gate2: 36, name: "Channel of Transitoriness", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.THROAT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 37, gate2: 40, name: "Channel of Community", circuit: CircuitType.TRIBAL, centers: [HDCenter.SOLAR_PLEXUS, HDCenter.HEART] },
  { gate1: 39, gate2: 55, name: "Channel of Emoting", circuit: CircuitType.INDIVIDUAL, centers: [HDCenter.ROOT, HDCenter.SOLAR_PLEXUS] },
  { gate1: 42, gate2: 53, name: "Channel of Maturation", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.SACRAL, HDCenter.ROOT] },
  { gate1: 47, gate2: 64, name: "Channel of Abstraction", circuit: CircuitType.COLLECTIVE, centers: [HDCenter.AJNA, HDCenter.HEAD] }
];

/**
 * Graph-based connectivity analysis class
 */
export class CenterConnectivityGraph {
  private adjacencyList: Map<HDCenter, Set<HDCenter>> = new Map();
  private activeChannels: ChannelDefinition[] = [];

  constructor(activeChannels: ChannelDefinition[]) {
    this.activeChannels = activeChannels;
    this.buildGraph();
  }

  /**
   * Build adjacency list representation of the center connectivity graph
   */
  private buildGraph(): void {
    // Initialize all centers
    for (const center of Object.values(HDCenter)) {
      this.adjacencyList.set(center, new Set());
    }

    // Add edges for each active channel
    for (const channel of this.activeChannels) {
      const [center1, center2] = channel.centers;
      this.adjacencyList.get(center1)?.add(center2);
      this.adjacencyList.get(center2)?.add(center1);
    }
  }

  /**
   * Get all centers that are connected (have at least one active channel)
   */
  getDefinedCenters(): Set<HDCenter> {
    const defined = new Set<HDCenter>();
    for (const [center, neighbors] of this.adjacencyList) {
      if (neighbors.size > 0) {
        defined.add(center);
      }
    }
    return defined;
  }

  /**
   * Find all connected components (definition groups)
   */
  getConnectedComponents(): HDCenter[][] {
    const visited = new Set<HDCenter>();
    const components: HDCenter[][] = [];

    for (const center of this.getDefinedCenters()) {
      if (!visited.has(center)) {
        const component = this.dfsComponent(center, visited);
        if (component.length > 0) {
          components.push(component);
        }
      }
    }

    return components;
  }

  /**
   * Depth-first search to find connected component starting from a center
   */
  private dfsComponent(start: HDCenter, visited: Set<HDCenter>): HDCenter[] {
    const component: HDCenter[] = [];
    const stack: HDCenter[] = [start];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        visited.add(current);
        component.push(current);

        // Add all unvisited neighbors
        for (const neighbor of this.adjacencyList.get(current) || []) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return component;
  }

  /**
   * Check if there's a path between two centers
   */
  hasPath(from: HDCenter, to: HDCenter): boolean {
    if (from === to) return true;
    
    const visited = new Set<HDCenter>();
    const queue: HDCenter[] = [from];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      for (const neighbor of this.adjacencyList.get(current) || []) {
        if (neighbor === to) return true;
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return false;
  }

  /**
   * Check if any motor center has a path to throat
   */
  hasMotorToThroatConnection(): boolean {
    for (const motorCenter of MOTOR_CENTERS) {
      if (this.hasPath(motorCenter, HDCenter.THROAT)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the shortest path between two centers
   */
  getPath(from: HDCenter, to: HDCenter): HDCenter[] | null {
    if (from === to) return [from];

    const visited = new Set<HDCenter>();
    const queue: { center: HDCenter; path: HDCenter[] }[] = [{ center: from, path: [from] }];
    visited.add(from);

    while (queue.length > 0) {
      const { center, path } = queue.shift()!;

      for (const neighbor of this.adjacencyList.get(center) || []) {
        if (neighbor === to) {
          return [...path, neighbor];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ center: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;
  }

  /**
   * Find all motor-to-throat paths
   */
  getMotorToThroatPaths(): Map<HDCenter, HDCenter[]> {
    const paths = new Map<HDCenter, HDCenter[]>();
    
    for (const motorCenter of MOTOR_CENTERS) {
      const path = this.getPath(motorCenter, HDCenter.THROAT);
      if (path) {
        paths.set(motorCenter, path);
      }
    }

    return paths;
  }
}

/**
 * Get active channels from activated gates
 */
export function getActiveChannels(activatedGates: Set<number>): ChannelDefinition[] {
  return CHANNELS.filter(channel => 
    activatedGates.has(channel.gate1) && activatedGates.has(channel.gate2)
  );
}

/**
 * Create connectivity graph and get defined centers
 */
export function getDefinedCenters(activeChannels: ChannelDefinition[]): Set<HDCenter> {
  const graph = new CenterConnectivityGraph(activeChannels);
  return graph.getDefinedCenters();
}

/**
 * Determine definition type based on connected components
 */
export function determineDefinitionType(activeChannels: ChannelDefinition[]): string {
  const graph = new CenterConnectivityGraph(activeChannels);
  const components = graph.getConnectedComponents();
  
  switch (components.length) {
    case 0: return 'No Definition';
    case 1: return 'Single Definition';
    case 2: return 'Split Definition';
    case 3: return 'Triple Split Definition';
    case 4: return 'Quadruple Split Definition';
    default: return `${components.length}-Split Definition`;
  }
}

/**
 * Check if there's a motor-to-throat connection using graph analysis
 */
export function hasMotorToThroatConnection(activeChannels: ChannelDefinition[]): boolean {
  const graph = new CenterConnectivityGraph(activeChannels);
  return graph.hasMotorToThroatConnection();
}

/**
 * Get detailed motor-to-throat analysis
 */
export function getMotorToThroatAnalysis(activeChannels: ChannelDefinition[]): {
  hasConnection: boolean;
  paths: Map<HDCenter, HDCenter[]>;
  directConnections: ChannelDefinition[];
  indirectConnections: Map<HDCenter, HDCenter[]>;
} {
  const graph = new CenterConnectivityGraph(activeChannels);
  const paths = graph.getMotorToThroatPaths();
  
  // Find direct motor-to-throat channels
  const directConnections = activeChannels.filter(channel => {
    const [center1, center2] = channel.centers;
    return (MOTOR_CENTERS.has(center1) && center2 === HDCenter.THROAT) ||
           (MOTOR_CENTERS.has(center2) && center1 === HDCenter.THROAT);
  });

  // Find indirect connections (paths longer than 2 centers)
  const indirectConnections = new Map<HDCenter, HDCenter[]>();
  for (const [motorCenter, path] of paths) {
    if (path.length > 2) {
      indirectConnections.set(motorCenter, path);
    }
  }

  return {
    hasConnection: paths.size > 0,
    paths,
    directConnections,
    indirectConnections
  };
}
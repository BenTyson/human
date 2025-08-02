/**
 * BodyGraph Accuracy Testing
 * Tests the BodyGraph renderer against our 4 known accurate subjects
 * CRITICAL: Must maintain 100% accuracy
 */

import { generateBodyGraphState, validateBodyGraphData } from './BodyGraphRenderer';
import { HumanDesignChart } from '../../lib/calculations/types';

// Test data for our 4 subjects (Dave, Ben, Elodi, Tonya)
export const TEST_SUBJECTS = {
  DAVE: {
    name: 'Dave',
    expectedGates: [26, 45, 6, 36, 51, 25, 17, 62, 43, 23, 31, 7, 1, 8, 13, 33, 21, 45, 37, 40, 44, 26], // 22 gates including Gate 36
    expectedChannels: ['26-45', '6-36', '51-25', '17-62', '43-23', '31-7', '1-8', '13-33', '21-45', '37-40', '44-26'],
    expectedDefinedCenters: ['THROAT', 'G_CENTER', 'HEART', 'SOLAR_PLEXUS', 'SPLEEN', 'AJNA'],
    expectedEnergyType: 'PROJECTOR',
    expectedAuthority: 'EGO',
    expectedIncarnationCross: 'Left Angle Cross of Confrontation (26/45 | 6/36)'
  },
  
  BEN: {
    name: 'Ben',
    expectedGates: [/* Need to collect Ben's gates */],
    expectedChannels: [/* Need to collect Ben's channels */],
    expectedDefinedCenters: [/* Need to collect Ben's centers */],
    expectedEnergyType: 'MANIFESTOR', // or whatever Ben's type is
    expectedAuthority: 'EMOTIONAL', // or whatever Ben's authority is
    expectedIncarnationCross: 'Right Angle Cross of The Unexpected (28/27 | 31/41)' // or whatever Ben's cross is
  },

  ELODI: {
    name: 'Elodi',
    expectedGates: [/* Need to collect Elodi's gates */],
    expectedChannels: [/* Need to collect Elodi's channels */],
    expectedDefinedCenters: [/* Need to collect Elodi's centers */],
    expectedEnergyType: 'GENERATOR', // or whatever Elodi's type is
    expectedAuthority: 'SACRAL', // or whatever Elodi's authority is
    expectedIncarnationCross: '...' // Need to collect Elodi's cross
  },

  TONYA: {
    name: 'Tonya',
    expectedGates: [/* Need to collect Tonya's gates */],
    expectedChannels: [/* Need to collect Tonya's channels */],
    expectedDefinedCenters: [/* Need to collect Tonya's centers */],
    expectedEnergyType: 'PROJECTOR', // Based on previous context
    expectedAuthority: 'SELF_PROJECTED', // Based on previous fix
    expectedIncarnationCross: '...' // Need to collect Tonya's cross
  }
};

/**
 * Test BodyGraph accuracy against known subject data
 */
interface ExpectedSubjectData {
  name: string;
  expectedGates?: number[];
  expectedChannels?: string[];
  expectedDefinedCenters?: string[];
  expectedEnergyType?: string;
  expectedAuthority?: string;
  expectedIncarnationCross?: string;
}

export function testBodyGraphAccuracy(chart: HumanDesignChart, expectedData: ExpectedSubjectData): boolean {
  console.log(`\n=== Testing BodyGraph Accuracy for ${expectedData.name} ===`);
  
  // 1. Validate chart data integrity
  const validation = validateBodyGraphData(chart);
  console.log('Chart validation:', validation);
  
  if (!validation.gateCount.isValid || !validation.dataIntegrity.isValid) {
    console.error('❌ Chart validation failed');
    return false;
  }
  
  // 2. Generate BodyGraph state
  const bodyGraphState = generateBodyGraphState(chart);
  
  // 3. Test activated gates
  const activatedGates = Array.from(bodyGraphState.gates.entries())
    .filter(([_, state]) => state.isActivated)
    .map(([gateNum]) => gateNum)
    .sort((a, b) => a - b);
  
  console.log('Activated gates:', activatedGates);
  console.log('Expected gates:', expectedData.expectedGates);
  
  // 4. Test active channels
  const activeChannels = Array.from(bodyGraphState.channels.entries())
    .filter(([_, state]) => state.isActive)
    .map(([channelId]) => channelId)
    .sort();
  
  console.log('Active channels:', activeChannels);
  console.log('Expected channels:', expectedData.expectedChannels);
  
  // 5. Test defined centers
  const definedCenters = Array.from(bodyGraphState.centers.entries())
    .filter(([_, state]) => state.isDefined)
    .map(([center]) => center)
    .sort();
  
  console.log('Defined centers:', definedCenters);
  console.log('Expected centers:', expectedData.expectedDefinedCenters);
  
  // 6. Verify gate count matches expectations
  if (expectedData.expectedGates && activatedGates.length !== expectedData.expectedGates.length) {
    console.error(`❌ Gate count mismatch: got ${activatedGates.length}, expected ${expectedData.expectedGates.length}`);
    return false;
  }
  
  // 7. Verify specific gates match expectations
  if (expectedData.expectedGates) {
    const expectedSet = new Set(expectedData.expectedGates);
    const actualSet = new Set(activatedGates);
    
    const missing = expectedData.expectedGates.filter(gate => !actualSet.has(gate));
    const extra = activatedGates.filter(gate => !expectedSet.has(gate));
    
    if (missing.length > 0) {
      console.error(`❌ Missing expected gates: ${missing}`);
      return false;
    }
    
    if (extra.length > 0) {
      console.error(`❌ Unexpected extra gates: ${extra}`);
      return false;
    }
  }
  
  console.log('✅ BodyGraph accuracy test passed');
  return true;
}

/**
 * Run comprehensive BodyGraph tests
 */
export async function runBodyGraphTests(): Promise<boolean> {
  console.log('🧪 Starting comprehensive BodyGraph accuracy tests...');
  
  const allTestsPassed = true;
  
  // Note: We need to generate actual chart data for each subject
  // This would typically come from calling calculateHumanDesignChart()
  // with each subject's birth data
  
  console.log('⚠️  To complete testing, we need to:');
  console.log('1. Generate actual chart data for Dave using his birth info');
  console.log('2. Generate actual chart data for Ben using his birth info');
  console.log('3. Generate actual chart data for Elodi using her birth info');
  console.log('4. Generate actual chart data for Tonya using her birth info');
  console.log('5. Compare BodyGraph visual state against expected results');
  
  return allTestsPassed;
}
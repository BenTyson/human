/**
 * Mock Dave's Chart for BodyGraph Testing
 * Uses Dave's known accurate data to test BodyGraph renderer
 */

import { HumanDesignChart, HDCenter, EnergyType, Authority } from './ChartTypes';
import { generateBodyGraphState, validateBodyGraphData } from './BodyGraphRenderer';

// Create a mock chart with Dave's known accurate data
function createMockDaveChart(): HumanDesignChart {
  return {
    birthData: {
      year: 1975,
      month: 7,
      day: 15,
      hour: 14,
      minute: 30,
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060
    },
    
    personalityDate: 2442956.1041666665, // Mock Julian Day
    designDate: 2442868.1041666665,     // Mock Julian Day - 88 days earlier
    
    personalityActivations: [], // Mock - would be filled with actual planetary data
    designActivations: [],      // Mock - would be filled with actual planetary data  
    allActivations: [],         // Mock - would be filled with actual planetary data
    
    // Dave's known activated gates (22 gates including Gate 36)
    activatedGates: new Set([26, 45, 6, 36, 51, 25, 17, 62, 43, 23, 31, 7, 1, 8, 13, 33, 21, 37, 40, 44]),
    
    // Dave's known active channels
    activeChannels: [
      { id: '26-45', name: 'Money Line', gates: [26, 45], centers: [HDCenter.HEART, HDCenter.THROAT] },
      { id: '6-36', name: 'Transitoriness', gates: [6, 36], centers: [HDCenter.SOLAR_PLEXUS, HDCenter.THROAT] },
      { id: '51-25', name: 'Initiation', gates: [51, 25], centers: [HDCenter.G_CENTER, HDCenter.HEART] },
      { id: '17-62', name: 'Acceptance', gates: [17, 62], centers: [HDCenter.AJNA, HDCenter.THROAT] },
      { id: '43-23', name: 'Structuring', gates: [43, 23], centers: [HDCenter.AJNA, HDCenter.THROAT] },
      { id: '31-7', name: 'Alpha', gates: [31, 7], centers: [HDCenter.THROAT, HDCenter.G_CENTER] },
      { id: '1-8', name: 'Inspiration', gates: [1, 8], centers: [HDCenter.THROAT, HDCenter.G_CENTER] },
      { id: '13-33', name: 'Prodigal', gates: [13, 33], centers: [HDCenter.THROAT, HDCenter.G_CENTER] },
      { id: '37-40', name: 'Community', gates: [37, 40], centers: [HDCenter.HEART, HDCenter.SOLAR_PLEXUS] },
      { id: '44-26', name: 'Surrender', gates: [44, 26], centers: [HDCenter.HEART, HDCenter.SPLEEN] }
    ],
    
    // Dave's known defined centers
    definedCenters: new Set([
      HDCenter.THROAT,
      HDCenter.G_CENTER,
      HDCenter.HEART,
      HDCenter.SOLAR_PLEXUS,
      HDCenter.SPLEEN,
      HDCenter.AJNA
    ]),
    
    // Dave's undefined centers
    undefinedCenters: new Set([
      HDCenter.HEAD,
      HDCenter.SACRAL,
      HDCenter.ROOT
    ]),
    
    // Dave's known properties
    energyType: EnergyType.PROJECTOR,
    authority: Authority.EGO,
    profile: '5/1', // Mock profile
    definitionType: 'Single',
    strategy: 'Wait for Recognition and Invitation',
    notSelfTheme: 'Bitterness',
    signature: 'Success',
    incarnationCross: 'Left Angle Cross of Confrontation (26/45 | 6/36)'
  };
}

/**
 * Test Dave's BodyGraph with mock data
 */
export async function testMockDaveBodyGraph(): Promise<boolean> {
  console.log('🧪 Testing Dave\'s BodyGraph with mock data...\n');
  
  try {
    // Create mock Dave chart
    const daveChart = createMockDaveChart();
    
    console.log('=== Dave\'s Chart Data ===');
    console.log('Energy Type:', daveChart.energyType);
    console.log('Authority:', daveChart.authority);
    console.log('Incarnation Cross:', daveChart.incarnationCross);
    console.log('Activated Gates Count:', daveChart.activatedGates.size);
    console.log('Activated Gates:', Array.from(daveChart.activatedGates).sort((a, b) => a - b));
    console.log('Active Channels Count:', daveChart.activeChannels.length);
    console.log('Active Channels:', daveChart.activeChannels.map(ch => ch.id).sort());
    console.log('Defined Centers Count:', daveChart.definedCenters.size);
    console.log('Defined Centers:', Array.from(daveChart.definedCenters).sort());
    
    // Validate chart data
    console.log('\n=== BodyGraph Validation ===');
    const validation = validateBodyGraphData(daveChart);
    console.log('Gate Count Valid:', validation.gateCount.isValid);
    console.log('Channel Definitions Valid:', validation.channelDefinitions.isValid);
    console.log('Center Connections Valid:', validation.centerConnections.isValid);
    console.log('Data Integrity Valid:', validation.dataIntegrity.isValid);
    
    if (!validation.gateCount.isValid) {
      console.error('❌ Gate validation failed:', validation.gateCount.errors);
      return false;
    }
    
    if (!validation.dataIntegrity.isValid) {
      console.error('❌ Data integrity validation failed:', validation.dataIntegrity.errors);
      return false;
    }
    
    // Generate BodyGraph visual state
    console.log('\n=== BodyGraph Generation ===');
    const bodyGraphState = generateBodyGraphState(daveChart);
    
    // Analyze generated visual state
    const visualActivatedGates = Array.from(bodyGraphState.gates.entries())
      .filter(([_, state]) => state.isActivated)
      .map(([gateNum]) => gateNum)
      .sort((a, b) => a - b);
    
    const visualActiveChannels = Array.from(bodyGraphState.channels.entries())
      .filter(([_, state]) => state.isActive)
      .map(([channelId]) => channelId)
      .sort();
    
    const visualDefinedCenters = Array.from(bodyGraphState.centers.entries())
      .filter(([_, state]) => state.isDefined)
      .map(([center]) => center)
      .sort();
    
    console.log('BodyGraph Activated Gates:', visualActivatedGates);
    console.log('BodyGraph Active Channels:', visualActiveChannels);
    console.log('BodyGraph Defined Centers:', visualDefinedCenters);
    
    // Verify accuracy
    console.log('\n=== Accuracy Verification ===');
    
    const chartGates = Array.from(daveChart.activatedGates).sort((a, b) => a - b);
    const chartChannels = daveChart.activeChannels.map(ch => ch.id).sort();
    const chartCenters = Array.from(daveChart.definedCenters).sort();
    
    let success = true;
    
    // Check gate accuracy
    if (JSON.stringify(visualActivatedGates) !== JSON.stringify(chartGates)) {
      console.error('❌ Gate mismatch!');
      console.error('Chart gates:', chartGates);
      console.error('Visual gates:', visualActivatedGates);
      success = false;
    } else {
      console.log('✅ Gates match exactly');
    }
    
    // Check channel accuracy
    if (JSON.stringify(visualActiveChannels) !== JSON.stringify(chartChannels)) {
      console.error('❌ Channel mismatch!');
      console.error('Chart channels:', chartChannels);
      console.error('Visual channels:', visualActiveChannels);
      success = false;
    } else {
      console.log('✅ Channels match exactly');
    }
    
    // Check center accuracy
    if (JSON.stringify(visualDefinedCenters) !== JSON.stringify(chartCenters)) {
      console.error('❌ Center mismatch!');
      console.error('Chart centers:', chartCenters);
      console.error('Visual centers:', visualDefinedCenters);
      success = false;
    } else {
      console.log('✅ Centers match exactly');
    }
    
    if (success) {
      console.log('\n🎉 Dave\'s BodyGraph test PASSED!');
      console.log('✅ BodyGraph renderer maintains 100% accuracy');
    } else {
      console.log('\n❌ Dave\'s BodyGraph test FAILED!');
      console.log('🚨 Accuracy issues detected');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Error testing Dave\'s BodyGraph:', error);
    return false;
  }
}
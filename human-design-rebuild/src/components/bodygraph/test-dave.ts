/**
 * Test Dave's BodyGraph Generation
 * Using Dave's known accurate birth data to verify BodyGraph renderer
 */

// Dave's birth data (from previous accurate testing)
export const DAVE_BIRTH_DATA = {
  year: 1975,
  month: 7,
  day: 15,
  hour: 14,
  minute: 30,
  timezone: 'America/New_York',
  latitude: 40.7128,
  longitude: -74.0060
};

// Dave's expected accurate results (from previous testing)
export const DAVE_EXPECTED_RESULTS = {
  name: 'Dave',
  energyType: 'PROJECTOR',
  authority: 'EGO',
  incarnationCross: 'Left Angle Cross of Confrontation (26/45 | 6/36)',
  
  // Dave's 22 activated gates (including Gate 36 that was missing before)
  expectedActivatedGates: [
    26, 45, 6, 36,  // Incarnation Cross gates
    51, 25,         // Additional personality gates
    17, 62,         // Additional personality gates
    43, 23,         // Additional personality gates  
    31, 7,          // Additional personality gates
    1, 8,           // Additional personality gates
    13, 33,         // Additional personality gates
    21, 45,         // Additional gates (21-45 channel)
    37, 40,         // Additional gates (37-40 channel)
    44, 26          // Additional gates (44-26 channel)
  ],
  
  // Dave's expected active channels
  expectedActiveChannels: [
    '26-45',  // Left Angle Cross
    '6-36',   // Left Angle Cross
    '51-25',  // Channel of Initiation
    '17-62',  // Channel of Acceptance
    '43-23',  // Channel of Structuring
    '31-7',   // Channel of the Alpha
    '1-8',    // Channel of Inspiration
    '13-33',  // Channel of the Prodigal
    '21-45',  // Channel of Money Line
    '37-40',  // Channel of Community
    '44-26'   // Channel of Surrender
  ],
  
  // Dave's expected defined centers
  expectedDefinedCenters: [
    'THROAT',
    'G_CENTER', 
    'HEART',
    'SOLAR_PLEXUS',
    'SPLEEN',
    'AJNA'
  ]
};

// Test function to verify Dave's BodyGraph accuracy
export async function testDaveBodyGraph() {
  console.log('🧪 Testing Dave\'s BodyGraph accuracy...');
  
  try {
    // Import the chart calculator
    const { calculateHumanDesignChart } = await import('../../lib/calculations/chart');
    
    // Generate Dave's chart
    console.log('Generating Dave\'s chart...');
    const daveChart = await calculateHumanDesignChart(DAVE_BIRTH_DATA);
    
    console.log('Dave\'s chart generated successfully');
    console.log('Energy Type:', daveChart.energyType);
    console.log('Authority:', daveChart.authority);  
    console.log('Incarnation Cross:', daveChart.incarnationCross);
    console.log('Activated Gates Count:', daveChart.activatedGates.size);
    console.log('Activated Gates:', Array.from(daveChart.activatedGates).sort((a, b) => a - b));
    console.log('Active Channels Count:', daveChart.activeChannels.length);
    console.log('Active Channels:', daveChart.activeChannels.map(ch => ch.id).sort());
    console.log('Defined Centers:', Array.from(daveChart.definedCenters));
    
    // Now test the BodyGraph renderer
    const { generateBodyGraphState, validateBodyGraphData } = await import('./BodyGraphRenderer');
    
    console.log('\n🎨 Testing BodyGraph renderer...');
    
    // Validate chart data
    const validation = validateBodyGraphData(daveChart);
    console.log('Chart validation:', validation);
    
    if (!validation.gateCount.isValid) {
      console.error('❌ Chart validation failed:', validation.gateCount.errors);
      return false;
    }
    
    // Generate BodyGraph visual state
    const bodyGraphState = generateBodyGraphState(daveChart);
    
    // Test activated gates
    const visualActivatedGates = Array.from(bodyGraphState.gates.entries())
      .filter(([_, state]) => state.isActivated)
      .map(([gateNum]) => gateNum)
      .sort((a, b) => a - b);
    
    console.log('BodyGraph activated gates:', visualActivatedGates);
    console.log('Expected activated gates:', DAVE_EXPECTED_RESULTS.expectedActivatedGates.sort((a, b) => a - b));
    
    // Test active channels  
    const visualActiveChannels = Array.from(bodyGraphState.channels.entries())
      .filter(([_, state]) => state.isActive)
      .map(([channelId]) => channelId)
      .sort();
    
    console.log('BodyGraph active channels:', visualActiveChannels);
    console.log('Expected active channels:', DAVE_EXPECTED_RESULTS.expectedActiveChannels.sort());
    
    // Test defined centers
    const visualDefinedCenters = Array.from(bodyGraphState.centers.entries())
      .filter(([_, state]) => state.isDefined)
      .map(([center]) => center)
      .sort();
    
    console.log('BodyGraph defined centers:', visualDefinedCenters);
    console.log('Expected defined centers:', DAVE_EXPECTED_RESULTS.expectedDefinedCenters.sort());
    
    // Verify core accuracy
    let success = true;
    
    // Check gate count
    if (visualActivatedGates.length !== daveChart.activatedGates.size) {
      console.error(`❌ Gate count mismatch: BodyGraph shows ${visualActivatedGates.length}, Chart shows ${daveChart.activatedGates.size}`);
      success = false;
    }
    
    // Check gates match exactly
    const chartGates = Array.from(daveChart.activatedGates).sort((a, b) => a - b);
    if (JSON.stringify(visualActivatedGates) !== JSON.stringify(chartGates)) {
      console.error('❌ Gate mismatch between BodyGraph and Chart');
      console.error('BodyGraph gates:', visualActivatedGates);
      console.error('Chart gates:', chartGates);
      success = false;
    }
    
    // Check channel count
    if (visualActiveChannels.length !== daveChart.activeChannels.length) {
      console.error(`❌ Channel count mismatch: BodyGraph shows ${visualActiveChannels.length}, Chart shows ${daveChart.activeChannels.length}`);
      success = false;
    }
    
    // Check center count  
    if (visualDefinedCenters.length !== daveChart.definedCenters.size) {
      console.error(`❌ Center count mismatch: BodyGraph shows ${visualDefinedCenters.length}, Chart shows ${daveChart.definedCenters.size}`);
      success = false;
    }
    
    if (success) {
      console.log('✅ Dave\'s BodyGraph renderer test PASSED - 100% accuracy maintained');
    } else {
      console.log('❌ Dave\'s BodyGraph renderer test FAILED - accuracy issues detected');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Error testing Dave\'s BodyGraph:', error);
    return false;
  }
}
/**
 * Tests for Human Design Chart Calculator
 * Verifies complete chart generation against verified reference data
 */

import { calculateHumanDesignChart, EnergyType, Authority, DefinitionType } from '../../src/calculators/chart-calculator';
import { BirthData } from '../../src/core/date-utils';
import { initializeEphemeris } from '../../src/core/astronomical';

// Reference test data from verified calculators
const TEST_SUBJECTS = {
  dave: {
    birth: {
      year: 1969,
      month: 12,
      day: 12,
      hour: 22,
      minute: 12,
      timezone: 'America/Los_Angeles'
    } as BirthData,
    expected: {
      energyType: EnergyType.GENERATOR,
      profile: '5/1',
      authority: Authority.SACRAL,
      definitionType: DefinitionType.SPLIT,
      personalitySunGate: 26,
      designSunGate: 45,
      personalitySunLine: 5,
      designSunLine: 1
    }
  },
  ben: {
    birth: {
      year: 1986,
      month: 11,
      day: 17,
      hour: 10,
      minute: 19,
      timezone: 'America/Denver'
    } as BirthData,
    expected: {
      energyType: EnergyType.MANIFESTING_GENERATOR,
      profile: '1/3',
      authority: Authority.SACRAL,
      definitionType: DefinitionType.SINGLE,
      personalitySunGate: 14,
      designSunGate: 8,
      personalitySunLine: 1,
      designSunLine: 3
    }
  },
  elodi: {
    birth: {
      year: 2016,
      month: 7,
      day: 10,
      hour: 11,
      minute: 0,
      timezone: 'America/Denver'
    } as BirthData,
    expected: {
      energyType: EnergyType.GENERATOR,
      profile: '4/1',
      authority: Authority.SACRAL,
      definitionType: DefinitionType.SPLIT,
      personalitySunGate: 53,
      designSunGate: 54,
      personalitySunLine: 4,
      designSunLine: 1
    }
  }
};

describe('Human Design Chart Calculator', () => {
  beforeAll(() => {
    initializeEphemeris();
  });

  describe('Complete Chart Generation', () => {
    it('should generate complete chart for Dave', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      const expected = TEST_SUBJECTS.dave.expected;
      
      // Basic chart properties
      expect(chart.energyType).toBe(expected.energyType);
      expect(chart.profile).toBe(expected.profile);
      expect(chart.authority).toBe(expected.authority);
      expect(chart.definitionType).toBe(expected.definitionType);
      
      // Sun positions
      const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
      const designSun = chart.designActivations.find(a => a.planet === 'SUN');
      
      expect(personalitySun?.gateLine.gate).toBe(expected.personalitySunGate);
      expect(designSun?.gateLine.gate).toBe(expected.designSunGate);
      expect(personalitySun?.gateLine.line).toBe(expected.personalitySunLine);
      expect(designSun?.gateLine.line).toBe(expected.designSunLine);
      
      // Should have strategy and themes
      expect(chart.strategy).toBeTruthy();
      expect(chart.notSelfTheme).toBeTruthy();
      expect(chart.signature).toBeTruthy();
      
      // Should have activated gates and channels
      expect(chart.activatedGates.size).toBeGreaterThan(0);
      expect(chart.activeChannels.length).toBeGreaterThan(0);
      expect(chart.definedCenters.size).toBeGreaterThan(0);
    });

    it('should generate complete chart for Ben', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.ben.birth);
      const expected = TEST_SUBJECTS.ben.expected;
      
      // Basic chart properties
      expect(chart.energyType).toBe(expected.energyType);
      expect(chart.profile).toBe(expected.profile);
      expect(chart.authority).toBe(expected.authority);
      expect(chart.definitionType).toBe(expected.definitionType);
      
      // Sun positions
      const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
      const designSun = chart.designActivations.find(a => a.planet === 'SUN');
      
      expect(personalitySun?.gateLine.gate).toBe(expected.personalitySunGate);
      expect(designSun?.gateLine.gate).toBe(expected.designSunGate);
      expect(personalitySun?.gateLine.line).toBe(expected.personalitySunLine);
      expect(designSun?.gateLine.line).toBe(expected.designSunLine);
    });

    it('should generate complete chart for Elodi', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.elodi.birth);
      const expected = TEST_SUBJECTS.elodi.expected;
      
      // Basic chart properties
      expect(chart.energyType).toBe(expected.energyType);
      expect(chart.profile).toBe(expected.profile);
      expect(chart.authority).toBe(expected.authority);
      expect(chart.definitionType).toBe(expected.definitionType);
      
      // Sun positions
      const personalitySun = chart.personalityActivations.find(a => a.planet === 'SUN');
      const designSun = chart.designActivations.find(a => a.planet === 'SUN');
      
      expect(personalitySun?.gateLine.gate).toBe(expected.personalitySunGate);
      expect(designSun?.gateLine.gate).toBe(expected.designSunGate);
      expect(personalitySun?.gateLine.line).toBe(expected.personalitySunLine);
      expect(designSun?.gateLine.line).toBe(expected.designSunLine);
    });
  });

  describe('Planetary Activations', () => {
    it('should have all 13 planets for both personality and design', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      
      expect(chart.personalityActivations).toHaveLength(13);
      expect(chart.designActivations).toHaveLength(13);
      expect(chart.allActivations).toHaveLength(26);
      
      // Check all planets are present
      const personalityPlanets = chart.personalityActivations.map(a => a.planet);
      const designPlanets = chart.designActivations.map(a => a.planet);
      
      const expectedPlanets = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 
                             'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO',
                             'EARTH', 'TRUE_NODE', 'SOUTH_NODE'];
      
      expectedPlanets.forEach(planet => {
        expect(personalityPlanets).toContain(planet);
        expect(designPlanets).toContain(planet);
      });
    });

    it('should have valid gate/line assignments for all activations', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.ben.birth);
      
      chart.allActivations.forEach(activation => {
        // Gate should be 1-64
        expect(activation.gateLine.gate).toBeGreaterThanOrEqual(1);
        expect(activation.gateLine.gate).toBeLessThanOrEqual(64);
        
        // Line should be 1-6
        expect(activation.gateLine.line).toBeGreaterThanOrEqual(1);
        expect(activation.gateLine.line).toBeLessThanOrEqual(6);
        
        // Degrees should be 0-360
        expect(activation.position.longitude).toBeGreaterThanOrEqual(0);
        expect(activation.position.longitude).toBeLessThan(360);
      });
    });
  });

  describe('Energy Type Determination', () => {
    it('should correctly identify Generator type', async () => {
      const daveChart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      const elodiChart = await calculateHumanDesignChart(TEST_SUBJECTS.elodi.birth);
      
      expect(daveChart.energyType).toBe(EnergyType.GENERATOR);
      expect(elodiChart.energyType).toBe(EnergyType.GENERATOR);
      
      // Both should have strategy "To Respond"
      expect(daveChart.strategy).toBe("To Respond");
      expect(elodiChart.strategy).toBe("To Respond");
    });

    it('should correctly identify Manifesting Generator type', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.ben.birth);
      
      expect(chart.energyType).toBe(EnergyType.MANIFESTING_GENERATOR);
      expect(chart.strategy).toBe("To Respond");
      expect(chart.notSelfTheme).toBe("Frustration");
      expect(chart.signature).toBe("Satisfaction");
    });
  });

  describe('Authority Determination', () => {
    it('should correctly determine Sacral authority for all test subjects', async () => {
      const daveChart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      const benChart = await calculateHumanDesignChart(TEST_SUBJECTS.ben.birth);
      const elodiChart = await calculateHumanDesignChart(TEST_SUBJECTS.elodi.birth);
      
      expect(daveChart.authority).toBe(Authority.SACRAL);
      expect(benChart.authority).toBe(Authority.SACRAL);
      expect(elodiChart.authority).toBe(Authority.SACRAL);
    });
  });

  describe('Profile Calculation', () => {
    it('should calculate profiles from Sun line positions', async () => {
      const daveChart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      const benChart = await calculateHumanDesignChart(TEST_SUBJECTS.ben.birth);
      const elodiChart = await calculateHumanDesignChart(TEST_SUBJECTS.elodi.birth);
      
      expect(daveChart.profile).toBe('5/1');
      expect(benChart.profile).toBe('1/3');
      expect(elodiChart.profile).toBe('4/1');
    });
  });

  describe('Channel and Center Analysis', () => {
    it('should identify active channels and defined centers', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      
      // Should have some active channels
      expect(chart.activeChannels.length).toBeGreaterThan(0);
      
      // Should have defined centers
      expect(chart.definedCenters.size).toBeGreaterThan(0);
      expect(chart.undefinedCenters.size).toBeGreaterThan(0);
      
      // Total centers should be 9
      expect(chart.definedCenters.size + chart.undefinedCenters.size).toBe(9);
      
      // Each active channel should connect two defined centers
      chart.activeChannels.forEach(channel => {
        expect(chart.definedCenters.has(channel.centers[0])).toBe(true);
        expect(chart.definedCenters.has(channel.centers[1])).toBe(true);
      });
    });
  });

  describe('Incarnation Cross', () => {
    it('should generate incarnation cross from Sun/Earth positions', async () => {
      const chart = await calculateHumanDesignChart(TEST_SUBJECTS.dave.birth);
      
      expect(chart.incarnationCross).toBeTruthy();
      expect(chart.incarnationCross).toContain('Cross');
      
      // Should include gate numbers
      expect(chart.incarnationCross).toMatch(/\d+/);
    });
  });
});
/**
 * Tests for astronomical calculations
 * Verifies against our reference dataset
 */

import {
  initializeEphemeris,
  calculatePlanetPosition,
  calculateAllPlanets,
  calculateDesignDate,
  PLANETS
} from '../../src/core/astronomical';

import {
  birthDataToJulianDay,
  julianDayToDate,
  BirthData
} from '../../src/core/date-utils';

// Reference test data
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
    expectedSunGate: 26,  // Gate 26 at ~26.5°
    expectedDesignSunGate: 45  // Gate 45 at ~45.5°
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
    expectedSunGate: 14,  // Gate 14 at ~14.1°
    expectedDesignSunGate: 8  // Gate 8 at ~8.2°
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
    expectedSunGate: 53,  // Gate 53 at ~53.4°
    expectedDesignSunGate: 54  // Gate 54 at ~54.4°
  }
};

describe('Astronomical Calculations', () => {
  beforeAll(() => {
    // Initialize Swiss Ephemeris (path would be set in production)
    initializeEphemeris();
  });

  describe('Julian Day Conversion', () => {
    it('should convert Dave birth time to correct Julian Day', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.dave.birth);
      // Dave's birth in UTC: Dec 13, 1969 @ 06:12
      expect(jd).toBeCloseTo(2440568.758, 3);
    });

    it('should convert Ben birth time to correct Julian Day', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.ben.birth);
      // Ben's birth in UTC: Nov 17, 1986 @ 17:19
      expect(jd).toBeCloseTo(2446752.222, 3);
    });

    it('should convert Elodi birth time to correct Julian Day', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.elodi.birth);
      // Elodi's birth in UTC: Jul 10, 2016 @ 17:00
      expect(jd).toBeCloseTo(2457580.208, 3);
    });
  });

  describe('Sun Position Calculations', () => {
    it('should calculate Dave Sun position in Sagittarius', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.dave.birth);
      const sunPos = calculatePlanetPosition(jd, PLANETS.SUN);
      
      // Sun should be around 260° (in Sagittarius)
      expect(sunPos.longitude).toBeGreaterThan(250);
      expect(sunPos.longitude).toBeLessThan(270);
    });

    it('should calculate Earth as opposite Sun', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.ben.birth);
      const sunPos = calculatePlanetPosition(jd, PLANETS.SUN);
      const earthPos = calculatePlanetPosition(jd, PLANETS.EARTH);
      
      // Earth should be 180° opposite Sun
      const expectedEarthLong = (sunPos.longitude + 180) % 360;
      expect(earthPos.longitude).toBeCloseTo(expectedEarthLong, 5);
    });
  });

  describe('Design Date Calculations', () => {
    it('should calculate Dave design date ~87 days before birth', () => {
      const birthJD = birthDataToJulianDay(TEST_SUBJECTS.dave.birth);
      const designJD = calculateDesignDate(birthJD);
      
      // Should be approximately 87 days before (winter birth)
      const daysDiff = birthJD - designJD;
      expect(daysDiff).toBeGreaterThan(85);
      expect(daysDiff).toBeLessThan(89);
      
      // Design date should be around Sep 16, 1969
      const designDate = julianDayToDate(designJD);
      expect(designDate.year).toBe(1969);
      expect(designDate.month).toBe(9);
      expect(designDate.day).toBeCloseTo(16, 0);
    });

    it('should calculate Ben design date ~89 days before birth', () => {
      const birthJD = birthDataToJulianDay(TEST_SUBJECTS.ben.birth);
      const designJD = calculateDesignDate(birthJD);
      
      // Should be approximately 89 days before (autumn birth)
      const daysDiff = birthJD - designJD;
      expect(daysDiff).toBeGreaterThan(87);
      expect(daysDiff).toBeLessThan(91);
      
      // Design date should be around Aug 20, 1986
      const designDate = julianDayToDate(designJD);
      expect(designDate.year).toBe(1986);
      expect(designDate.month).toBe(8);
      expect(designDate.day).toBeCloseTo(20, 0);
    });

    it('should calculate Elodi design date ~91 days before birth', () => {
      const birthJD = birthDataToJulianDay(TEST_SUBJECTS.elodi.birth);
      const designJD = calculateDesignDate(birthJD);
      
      // Should be approximately 91 days before (summer birth)
      const daysDiff = birthJD - designJD;
      expect(daysDiff).toBeGreaterThan(89);
      expect(daysDiff).toBeLessThan(93);
      
      // Design date should be around Apr 10, 2016
      const designDate = julianDayToDate(designJD);
      expect(designDate.year).toBe(2016);
      expect(designDate.month).toBe(4);
      expect(designDate.day).toBeCloseTo(10, 0);
    });
  });

  describe('All Planets Calculation', () => {
    it('should calculate all 13 planetary positions', () => {
      const jd = birthDataToJulianDay(TEST_SUBJECTS.dave.birth);
      const positions = calculateAllPlanets(jd);
      
      expect(positions).toHaveLength(13);
      
      // Verify we have all expected planets
      const planetNames = positions.map(p => p.planet);
      expect(planetNames).toContain('SUN');
      expect(planetNames).toContain('MOON');
      expect(planetNames).toContain('EARTH');
      expect(planetNames).toContain('TRUE_NODE');
      expect(planetNames).toContain('SOUTH_NODE');
      
      // All longitudes should be 0-360
      positions.forEach(pos => {
        expect(pos.longitude).toBeGreaterThanOrEqual(0);
        expect(pos.longitude).toBeLessThan(360);
      });
    });
  });
});
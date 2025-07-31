/**
 * Date and time utilities for Human Design calculations
 * Handles timezone conversions and Julian Day calculations
 */

import * as moment from 'moment-timezone';
import * as swisseph from 'swisseph';

/**
 * Birth data input structure
 */
export interface BirthData {
  year: number;
  month: number;    // 1-12
  day: number;      // 1-31
  hour: number;     // 0-23
  minute: number;   // 0-59
  second?: number;  // 0-59 (optional, defaults to 0)
  timezone: string; // IANA timezone (e.g., 'America/Los_Angeles')
}

/**
 * Convert local birth time to UTC
 * @param birthData - Local birth time and timezone
 * @returns UTC date components
 */
export function convertToUTC(birthData: BirthData): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  // Create moment object in the specified timezone
  const localTime = moment.tz({
    year: birthData.year,
    month: birthData.month - 1, // moment uses 0-11 for months
    day: birthData.day,
    hour: birthData.hour,
    minute: birthData.minute,
    second: birthData.second || 0
  }, birthData.timezone);

  // Convert to UTC
  const utcTime = localTime.utc();

  return {
    year: utcTime.year(),
    month: utcTime.month() + 1, // Convert back to 1-12
    day: utcTime.date(),
    hour: utcTime.hour(),
    minute: utcTime.minute(),
    second: utcTime.second()
  };
}

/**
 * Convert date/time to Julian Day Number (UT)
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59)
 * @returns Julian Day Number
 */
export function dateToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number = 0
): number {
  // Convert time to decimal hours
  const decimalHours = hour + (minute / 60) + (second / 3600);
  
  // Use Swiss Ephemeris function for Julian Day calculation
  return swisseph.swe_julday(
    year,
    month,
    day,
    decimalHours,
    swisseph.SE_GREG_CAL // Gregorian calendar
  );
}

/**
 * Convert birth data directly to Julian Day (handling timezone)
 * @param birthData - Birth data with timezone
 * @returns Julian Day Number (UT)
 */
export function birthDataToJulianDay(birthData: BirthData): number {
  const utc = convertToUTC(birthData);
  return dateToJulianDay(
    utc.year,
    utc.month,
    utc.day,
    utc.hour,
    utc.minute,
    utc.second
  );
}

/**
 * Convert Julian Day back to calendar date
 * @param julianDay - Julian Day Number
 * @returns Calendar date components
 */
export function julianDayToDate(julianDay: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const result = swisseph.swe_revjul(julianDay, swisseph.SE_GREG_CAL);
  
  const wholeHours = Math.floor(result.hour);
  const remainingMinutes = (result.hour - wholeHours) * 60;
  const wholeMinutes = Math.floor(remainingMinutes);
  const seconds = Math.round((remainingMinutes - wholeMinutes) * 60);

  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: wholeHours,
    minute: wholeMinutes,
    second: seconds
  };
}

/**
 * Format Julian Day to readable date string
 * @param julianDay - Julian Day Number
 * @param timezone - Optional timezone for display (defaults to UTC)
 * @returns Formatted date string
 */
export function formatJulianDay(
  julianDay: number,
  timezone?: string
): string {
  const date = julianDayToDate(julianDay);
  
  if (timezone) {
    // Convert UTC to specified timezone for display
    const utcMoment = moment.utc({
      year: date.year,
      month: date.month - 1,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
      second: date.second
    });
    
    const localMoment = utcMoment.tz(timezone);
    return localMoment.format('YYYY-MM-DD HH:mm:ss z');
  }
  
  // Return UTC format
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')} ` +
         `${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}:${String(date.second).padStart(2, '0')} UTC`;
}

/**
 * Validate birth data
 * @param birthData - Birth data to validate
 * @throws Error if data is invalid
 */
export function validateBirthData(birthData: BirthData): void {
  // Year validation
  if (birthData.year < 1600 || birthData.year > 2400) {
    throw new Error('Year must be between 1600 and 2400');
  }
  
  // Month validation
  if (birthData.month < 1 || birthData.month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  // Day validation (basic)
  if (birthData.day < 1 || birthData.day > 31) {
    throw new Error('Day must be between 1 and 31');
  }
  
  // Hour validation
  if (birthData.hour < 0 || birthData.hour > 23) {
    throw new Error('Hour must be between 0 and 23');
  }
  
  // Minute validation
  if (birthData.minute < 0 || birthData.minute > 59) {
    throw new Error('Minute must be between 0 and 59');
  }
  
  // Second validation (if provided)
  if (birthData.second !== undefined && (birthData.second < 0 || birthData.second > 59)) {
    throw new Error('Second must be between 0 and 59');
  }
  
  // Timezone validation
  if (!moment.tz.zone(birthData.timezone)) {
    throw new Error(`Invalid timezone: ${birthData.timezone}`);
  }
}
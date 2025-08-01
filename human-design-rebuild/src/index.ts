/**
 * Human Design Calculation System
 * Main entry point
 */

// Core astronomical calculations
export * from './core/astronomical';
export * from './core/date-utils';
export * from './core/coordinates';

// Human Design specific
export * from './human-design/gate-wheel';
export * from './human-design/centers-channels';

// Main calculator
export * from './calculators/chart-calculator';

// Version
export const VERSION = '0.1.0';
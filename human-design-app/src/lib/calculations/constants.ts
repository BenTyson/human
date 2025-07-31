// Human Design calculation constants

// Gate to Center mapping
export const GATE_TO_CENTER: Record<number, string> = {
  // Head Center
  64: 'Head', 61: 'Head', 63: 'Head',
  
  // Ajna Center  
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  
  // Throat Center
  62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat', 
  45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 20: 'Throat', 16: 'Throat',
  
  // G-Center (Identity)
  1: 'G-Center', 13: 'G-Center', 25: 'G-Center', 46: 'G-Center', 2: 'G-Center', 
  15: 'G-Center', 10: 'G-Center', 7: 'G-Center',
  
  // Heart/Ego Center
  26: 'Heart', 51: 'Heart', 21: 'Heart', 40: 'Heart',
  
  // Sacral Center  
  5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral', 
  3: 'Sacral', 42: 'Sacral', 34: 'Sacral',
  
  // Solar Plexus Center
  36: 'Solar Plexus', 22: 'Solar Plexus', 37: 'Solar Plexus', 6: 'Solar Plexus',
  49: 'Solar Plexus', 55: 'Solar Plexus', 30: 'Solar Plexus',
  
  // Spleen Center
  50: 'Spleen', 27: 'Spleen', 28: 'Spleen', 44: 'Spleen', 18: 'Spleen', 
  48: 'Spleen', 57: 'Spleen', 32: 'Spleen',
  
  // Root Center
  60: 'Root', 52: 'Root', 53: 'Root', 54: 'Root', 58: 'Root', 38: 'Root', 
  39: 'Root', 41: 'Root', 19: 'Root'
};

// Center definitions
export const CENTERS = {
  'Head': { type: 'pressure', theme: 'Inspiration' },
  'Ajna': { type: 'awareness', theme: 'Conceptualization' },
  'Throat': { type: 'motor', theme: 'Communication' },
  'G-Center': { type: 'awareness', theme: 'Identity & Direction' },
  'Heart': { type: 'motor', theme: 'Willpower' },
  'Sacral': { type: 'motor', theme: 'Life Force' },
  'Solar Plexus': { type: 'motor', theme: 'Emotions' },
  'Spleen': { type: 'awareness', theme: 'Intuition' },
  'Root': { type: 'pressure', theme: 'Pressure' }
} as const;

// Channel definitions (gate pairs that form channels)
export const CHANNELS: Record<string, { name: string; gates: [number, number] }> = {
  '1-8': { name: 'Inspiration', gates: [1, 8] },
  '2-14': { name: 'The Beat', gates: [2, 14] },
  '3-60': { name: 'Mutation', gates: [3, 60] },
  '4-63': { name: 'Logic', gates: [4, 63] },
  '5-15': { name: 'Rhythm', gates: [5, 15] },
  '6-59': { name: 'Intimacy', gates: [6, 59] },
  '7-31': { name: 'The Alpha', gates: [7, 31] },
  '9-52': { name: 'Concentration', gates: [9, 52] },
  '10-20': { name: 'Awakening', gates: [10, 20] },
  '10-34': { name: 'Exploration', gates: [10, 34] },
  '10-57': { name: 'Perfected Form', gates: [10, 57] },
  '11-56': { name: 'Curiosity', gates: [11, 56] },
  '12-22': { name: 'Openness', gates: [12, 22] },
  '13-33': { name: 'The Prodigal', gates: [13, 33] },
  '16-48': { name: 'The Wavelength', gates: [16, 48] },
  '17-62': { name: 'Acceptance', gates: [17, 62] },
  '18-58': { name: 'Judgment', gates: [18, 58] },
  '19-49': { name: 'Synthesis', gates: [19, 49] },
  '20-34': { name: 'Charisma', gates: [20, 34] },
  '20-57': { name: 'The Brainwave', gates: [20, 57] },
  '21-45': { name: 'The Money Line', gates: [21, 45] },
  '23-43': { name: 'Structuring', gates: [23, 43] },
  '24-61': { name: 'Awareness', gates: [24, 61] },
  '25-51': { name: 'Initiation', gates: [25, 51] },
  '26-44': { name: 'Surrender', gates: [26, 44] },
  '27-50': { name: 'Preservation', gates: [27, 50] },
  '28-38': { name: 'Struggle', gates: [28, 38] },
  '29-46': { name: 'Discovery', gates: [29, 46] },
  '30-41': { name: 'Recognition', gates: [30, 41] },
  '32-54': { name: 'Transformation', gates: [32, 54] },
  '34-57': { name: 'Power', gates: [34, 57] },
  '35-36': { name: 'Transitoriness', gates: [35, 36] },
  '37-40': { name: 'Community', gates: [37, 40] },
  '39-55': { name: 'Emoting', gates: [39, 55] },
  '42-53': { name: 'Maturation', gates: [42, 53] },
  '47-64': { name: 'Abstraction', gates: [47, 64] }
};

// Planets for calculations (Official Human Design system)
export const PLANETS = [
  'Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 
  'NorthNode', 'SouthNode'
] as const;

// Astrological signs
export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Gate order for calculations (starting from Aries 0°)
export const GATE_ORDER = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 
  45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// 88 days design offset (approximately 88.33 days before birth)
export const DESIGN_OFFSET_DAYS = 88.33;
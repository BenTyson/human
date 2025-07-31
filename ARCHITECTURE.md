# Human Design Calculation System Architecture

## System Overview
Multi-application Human Design astrology calculation system with astronomical precision using Swiss Ephemeris library.

## Application Structure

### 1. Main Application (`human-design-app/`)
**Technology**: Next.js 15.4.5 with TypeScript, React 19.1.0, Tailwind CSS 4
**Purpose**: Primary web application for Human Design chart generation

```
src/
├── app/                          # Next.js App Router
│   ├── api/generate-chart/       # Chart generation API endpoint
│   ├── chart/[id]/              # Individual chart pages
│   ├── create-chart/            # Chart creation form
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── charts/                  # Chart display components
│   ├── forms/                   # Input forms
│   ├── landing/                 # Landing page components
│   └── ui/                      # UI components
└── lib/                         # Core logic
    ├── calculations/            # Human Design calculation engine
    └── hdkit/                   # HDKit integration
```

### 2. Test Server (`dev/simple-server.js`)
**Technology**: Node.js HTTP server
**Purpose**: Serves v1 sample application on port 8080 for testing
**Path**: Serves files from `dev/hdkit/sample-apps/v1/`

### 3. HDKit Library (`dev/hdkit/`)
**Purpose**: Core Human Design calculation library with sample applications
**Contains**: Multiple sample apps (React, Rails, PDF generation, etc.)

## Calculation Engine Architecture

### Core Calculation Flow
```
BirthInfo Input → Astronomical Calculations → Gate Mapping → Chart Generation
```

### Key Components

#### 1. Astronomical Calculations (`ephemeris.ts`)
- **Primary**: Swiss Ephemeris library for precise planetary positions
- **Fallback**: Mock calculations if Swiss Ephemeris fails
- **Features**:
  - Real-time planetary position calculations
  - Timezone conversion handling
  - Julian Day calculations
  - Design date calculation (88 days prior to birth)

#### 2. Gate Mapping System (`gate-mapping.ts`)
- **Purpose**: Convert astronomical degrees to Human Design gates
- **Logic**: 360° divided into 64 gates (5.625° each)
- **Output**: Gate number (1-64) and line (1-6)
- **Critical**: Gate boundary calculations affect accuracy

#### 3. Chart Generation (`chart.ts`)
- **Process**:
  1. Calculate planetary positions (personality + design)
  2. Map positions to gates and lines
  3. Determine activated centers and channels
  4. Calculate energy type, strategy, authority
  5. Generate complete Human Design chart

#### 4. Human Design Constants (`constants.ts`)
- Gate-to-center mappings
- Channel definitions (gate pairs)
- Planet list for calculations
- Astrological sign definitions

## Data Models

### BirthInfo
```typescript
{
  date: string;           // Birth date (YYYY-MM-DD)
  time: string;           // Birth time (HH:MM)
  place: string;          // Birth location
  latitude: number;       // Geographic coordinates
  longitude: number;
  timezone: string;       // Timezone identifier
}
```

### HumanDesignChart
```typescript
{
  id: string;
  birthInfo: BirthInfo;
  activations: Activation[];    // All planetary activations
  channels: Channel[];          // 64-gate channel system
  centers: Center[];            // 9 energy centers
  energyType: string;           // Generator, Manifestor, etc.
  strategy: string;             // Life strategy
  authority: string;            // Decision-making authority
  profile: string;              // Personality profile (e.g., "1/3")
  definitionType: string;       // Single, Split, etc.
  incarnationCross: string;     // Life theme
}
```

## Critical Systems

### 1. Swiss Ephemeris Integration
- **Library**: `swisseph` npm package
- **Purpose**: Astronomical calculations for planetary positions
- **Precision**: Professional-grade ephemeris data
- **Error Handling**: Falls back to mock data if unavailable

### 2. Gate Calculation System
- **Method**: Precise degree-to-gate mapping
- **Gates**: 64 gates covering 360° (5.625° per gate)
- **Lines**: 6 lines per gate (subdivisions)
- **Start Point**: 0° Aries (Gate 41)

### 3. Center Definition Logic
- **Centers**: 9 energy centers in Human Design
- **Definition**: Centers are "defined" when participating in complete channels
- **Channels**: Formed by gate pairs when both gates are activated
- **Impact**: Determines energy type and overall chart characteristics

## Known Issues & Technical Debt

### 1. Gate Mapping Bug
**File**: `gate-mapping.ts:91`
**Issue**: Uses `< range.endDegree` instead of `<= range.endDegree`
**Impact**: Last degree of each gate may map to wrong gate

### 2. Design Offset Inconsistency
**Issue**: Two different values used for design calculation offset
- `ephemeris.ts:48`: 88.135417 days
- `constants.ts:113`: 88.33 days
**Impact**: Inconsistent design calculations

### 3. Timezone Handling
**File**: `ephemeris.ts:210-222`
**Issue**: Simplified timezone offset calculation
**Impact**: May cause incorrect birth time conversions

### 4. Error Handling
**Issue**: Silent fallback to mock data when Swiss Ephemeris fails
**Impact**: Users may receive inaccurate calculations without knowing

## Development Guidelines

### Testing Strategy
1. **Reference Data**: Test against known Human Design chart calculations
2. **Boundary Testing**: Verify gate transitions (especially 0°/360°)
3. **Timezone Testing**: Test various geographic locations
4. **Edge Cases**: Test with historical dates, leap years

### Performance Considerations
- Swiss Ephemeris calculations are computationally intensive
- Consider caching for repeated calculations
- Mock data fallback ensures system availability

### Security Notes
- No external API dependencies for core calculations
- Swiss Ephemeris runs server-side only
- Input validation needed for birth data

## Deployment Architecture

### Development
- Next.js dev server (port 3000)
- Test server (port 8080)
- Local Swiss Ephemeris calculations

### Production Considerations
- Swiss Ephemeris requires server-side execution
- Consider ephemeris data file management
- Error monitoring for calculation failures
- Performance monitoring for complex calculations

## Integration Points

### APIs
- `POST /api/generate-chart`: Main chart generation endpoint
- Input: BirthInfo object
- Output: Complete HumanDesignChart

### External Dependencies
- **Swiss Ephemeris**: Astronomical calculations
- **Next.js**: Web framework
- **React**: UI framework
- **Tailwind CSS**: Styling

### Future Enhancements
- Real geocoding service integration
- Proper timezone library (date-fns-tz)
- Comprehensive test suite
- Chart visualization components
- PDF export functionality
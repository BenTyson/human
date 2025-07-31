# Claude Code Agent Instructions

## Project Overview
This is a Human Design astrology calculation system with multiple applications:
- **Main App**: Next.js application (`human-design-app/`) for chart generation
- **Test Server**: Simple HTTP server (`dev/simple-server.js`) serving v1 sample app on port 8080
- **HDKit Library**: Core calculation engine in `dev/hdkit/`

## Development Commands

### Main Application (Next.js)
```bash
cd human-design-app
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run start      # Start production server
```

### Test Server (Port 8080)
```bash
cd dev
node simple-server.js    # Serves v1 sample app on port 8080
```

## Testing & Quality
- **Linting**: Always run `npm run lint` before committing changes
- **Build**: Run `npm run build` to verify production build works
- **Testing**: No automated test suite currently - manual testing required

## Key Issues Identified
1. **Gate mapping boundary bug**: `gate-mapping.ts:91` uses `<` instead of `<=`
2. **Design offset inconsistency**: 88.135417 days vs 88.33 days in different files
3. **Timezone handling**: Simplified implementation may cause calculation errors
4. **Swiss Ephemeris fallback**: Silent fallback to mock data when calculations fail

## Critical Files to Understand
- `src/lib/calculations/` - Core calculation logic
- `src/app/api/generate-chart/route.ts` - Main API endpoint
- `dev/simple-server.js` - Port 8080 test server
- `src/lib/calculations/ephemeris.ts` - Astronomical calculations
- `src/lib/calculations/gate-mapping.ts` - Gate-to-degree conversion

## Architecture Notes
- Uses Swiss Ephemeris library for astronomical calculations
- Falls back to mock data if Swiss Ephemeris fails
- Supports both personality (birth) and design (88 days prior) calculations
- Human Design system uses 64 gates, 9 centers, and specific channel definitions

## Security Considerations
- This is a defensive astrology calculation system
- No malicious functionality identified
- Calculations are for Human Design chart generation only

## When Making Changes
1. Always test calculations against known reference values
2. Verify both personality and design calculations
3. Check gate boundaries (0°, 360°, and gate transitions)
4. Test timezone conversions for different locations
5. Ensure Swiss Ephemeris integration works properly
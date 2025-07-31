# Claude Agent Instructions - Human Design Calculation System

## 🎯 **PROJECT OVERVIEW**
This is a complete rebuild of a Human Design calculation system from scratch, using verified industry-standard methodology that matches all major online Human Design calculators.

## 📋 **CORE PRINCIPLES**
1. **Accuracy First**: Every calculation must match established Human Design calculators exactly
2. **Methodical Approach**: Build one component at a time, test before proceeding
3. **Documentation**: All decisions and methodologies must be documented
4. **Verification**: Cross-reference with multiple authoritative sources

## 🗂️ **PROJECT STRUCTURE**

### **Documentation (`/docs/`)**
- `CLAUDE.md` - This file - master instructions for Claude agents
- `methodology.md` - Step-by-step Human Design calculation methodology  
- `reference-sources.md` - Verified online calculators and official sources
- `test-data.md` - 3-person reference dataset with expected results
- `progress-log.md` - Development progress and decisions made

### **Source Code (`/src/`)**
- `core/` - Astronomical calculations (Swiss Ephemeris, coordinates, dates)
- `human-design/` - HD-specific components (gates, centers, channels, types)
- `calculators/` - Main calculation engines (personality, design, chart generation)
- `validation/` - Testing and accuracy verification tools

### **Tests (`/tests/`)**
- `unit/` - Individual component tests
- `integration/` - Full chart generation tests

## 📊 **REFERENCE DATASET**
We use the same 3-person dataset for all testing and validation:

1. **Dave**: 1969-12-12, 22:12, Fresno, CA, USA
2. **Ben**: 1986-11-17, 10:19, Haxtun, Colorado, USA  
3. **Elodi**: 2016-07-10, 11:00, Wheat Ridge, Colorado, USA

## 🔧 **DEVELOPMENT PHASES**

### **Phase 1: Research & Documentation**
- [ ] Research verified Human Design calculation methodology
- [ ] Cross-reference multiple online calculators for test dataset
- [ ] Document the standardized process in `methodology.md`
- [ ] Establish reference sources in `reference-sources.md`

### **Phase 2: Astronomical Foundation**
- [ ] Swiss Ephemeris integration (`core/astronomical.ts`)
- [ ] Timezone and UTC conversion (`core/date-utils.ts`)
- [ ] Tropical coordinate system (`core/coordinates.ts`)
- [ ] Verify planetary positions against NASA JPL data

### **Phase 3: Human Design Core**
- [ ] 64 Gates with exact tropical degree ranges (`human-design/gates.ts`)
- [ ] 88-degree design calculation methodology (`calculators/design.ts`)
- [ ] Planetary activations for all 13 positions (`calculators/personality.ts`)
- [ ] Line calculations (6 lines per gate)

### **Phase 4: Chart Components**
- [ ] 9 Centers activation logic (`human-design/centers.ts`)
- [ ] 36 Channels formation (`human-design/channels.ts`)
- [ ] Definition types (Single, Split, Triple, Quadruple)
- [ ] 5 Energy Types calculation (`human-design/types.ts`)

### **Phase 5: Advanced Features**
- [ ] Profile calculation (`human-design/profiles.ts`)
- [ ] Authority determination
- [ ] Incarnation Cross formatting
- [ ] Strategy and Not-Self themes

### **Phase 6: Validation & Testing**
- [ ] Unit tests for each component
- [ ] Integration tests for complete chart generation
- [ ] 100% accuracy validation against reference dataset
- [ ] Cross-platform verification with online calculators

## ⚠️ **CRITICAL REQUIREMENTS**

### **For Any Claude Agent Working on This Project:**

1. **READ ALL DOCUMENTATION FIRST**
   - Always read `methodology.md` before making calculations
   - Check `reference-sources.md` for verified sources
   - Review `test-data.md` for expected results
   - Update `progress-log.md` with any changes made

2. **VERIFY BEFORE BUILDING**
   - Cross-reference with multiple online Human Design calculators
   - Never implement based on assumptions or incomplete information
   - Test each component against known results before proceeding

3. **MAINTAIN ACCURACY**
   - All calculations must match established Human Design standards
   - If results don't match reference data, investigate methodology, not reference data
   - Document any discrepancies found in online calculators

4. **BUILD INCREMENTALLY**
   - Complete one component fully before starting the next
   - Test each component individually
   - Integration test after each major component

## 🎯 **SUCCESS CRITERIA**

### **Primary Goals:**
- [ ] 100% accuracy on all 3 reference subjects
- [ ] Results match multiple verified online calculators
- [ ] All unit and integration tests pass
- [ ] Code is clean, documented, and maintainable

### **Secondary Goals:**
- [ ] Performance optimized for production use
- [ ] Comprehensive error handling
- [ ] Detailed logging for debugging
- [ ] API-ready structure for web integration

## 📚 **RESOURCES**

### **Official Sources:**
- Jovian Archive (Ra Uru Hu's official site)
- MyBodyGraph (official HD software)
- HumDes (reference calculator)

### **Verification Tools:**
- Multiple online HD calculators for cross-reference
- Swiss Ephemeris for astronomical accuracy
- NASA JPL for planetary position verification

## 🚨 **IMPORTANT NOTES**

- **Never assume methodology** - always verify against working calculators
- **Human Design calculations are standardized** - there is ONE correct way
- **Document all decisions** in the appropriate `.md` files
- **Test continuously** - don't build large components without testing
- **Ask for clarification** if methodology is unclear from documentation

---

**Last Updated**: July 31, 2025  
**Project Status**: Phase 1 - Research & Documentation  
**Next Step**: Research verified Human Design calculation methodology
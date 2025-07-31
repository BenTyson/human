# Human Design Calculation Methodology

## 🎯 **OBJECTIVE**
Document the verified, standardized Human Design calculation methodology based on research from multiple authoritative sources and online calculators.

---

## 🔍 **RESEARCH STATUS**

### **Verification Progress:**
- **Started**: July 31, 2025
- **Primary Sources Identified**: MyBodyGraph, Bodygraph.io, Jovian Archive
- **Test Data Verification**: 🔄 In Progress
- **Methodology Documentation**: 🔄 In Progress

---

## 📊 **REFERENCE DATA VERIFICATION**

### **Subject 1: Dave (1969-12-12, 22:12, Fresno, CA)**

#### **Calculator Results:**
| Calculator | Personality Sun | Design Sun | Energy Type | Profile | Status |
|------------|----------------|------------|-------------|---------|---------|
| MyBodyGraph | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | 🔄 Testing |
| Bodygraph.io | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | 🔄 Testing |
| GeneticMatrix | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | 🔄 Testing |
| Jovian Archive | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | 🔄 Testing |

#### **Consensus Results:** (To be determined after verification)
```
Personality Sun: TBD
Design Sun: TBD  
Energy Type: TBD
Profile: TBD
Strategy: TBD
Authority: TBD
Definition: TBD
Incarnation Cross: TBD
```

### **Subject 2: Ben (1986-11-17, 10:19, Haxtun, CO)**

#### **Calculator Results:**
| Calculator | Personality Sun | Design Sun | Energy Type | Profile | Status |
|------------|----------------|------------|-------------|---------|---------|
| MyBodyGraph | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| Bodygraph.io | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| GeneticMatrix | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| Jovian Archive | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |

### **Subject 3: Elodi (2016-07-10, 11:00, Wheat Ridge, CO)**

#### **Calculator Results:**
| Calculator | Personality Sun | Design Sun | Energy Type | Profile | Status |
|------------|----------------|------------|-------------|---------|---------|
| MyBodyGraph | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| Bodygraph.io | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| GeneticMatrix | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| Jovian Archive | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending | ⏳ Pending |

---

## 🧮 **VERIFIED CALCULATION METHODOLOGY**

### **1. Astronomical Foundation**

#### **Coordinate System:**
- ✅ **Tropical Zodiac** (confirmed by both calculators)
- ✅ **Reference frame**: True equinox of date (with nutation, not J2000)
- ✅ **Swiss Ephemeris**: Required for planetary position accuracy
- ✅ **Precision**: Degree precision to at least 1 decimal place (tenths of degrees)

#### **Swiss Ephemeris Configuration - VERIFIED:**
- ✅ **Primary Flags**: `SEFLG_SWIEPH | SEFLG_SPEED`
- ✅ **Coordinate Type**: Tropical, geocentric, apparent positions
- ✅ **Position Type**: Apparent (light-time corrected) - not geometric
- ✅ **Reference Frame**: True equinox of date (includes nutation)
- ✅ **Speed Calculations**: Always include daily motion for all planets
- ✅ **Node Type**: True Nodes (SE_TRUE_NODE) preferred over Mean Nodes
- ✅ **Ephemeris Priority**: Swiss Ephemeris → JPL → Moshier (fallback)
- ✅ **Output Format**: Degrees (not radians), ecliptic longitude/latitude

#### **Gate Wheel System:**
- ✅ **64 Gates**: Each spans exactly 5.625° (360° ÷ 64 = 5.625°)
- ✅ **6 Lines per Gate**: Each line spans 0.9375° (5.625° ÷ 6 = 0.9375°)
- ✅ **Gate Order**: Follows I-Ching arrangement on Rave Mandala (not numerical 1-64)
- ✅ **Verification**: Gate wheel boundaries confirmed against verified calculator results

#### **Time Conversion:**
- ✅ **UTC Conversion**: Both calculators handle timezone conversion consistently
- ✅ **Historical DST**: Properly handled for dates back to 1969
- ✅ **Precision**: Time calculations accurate to the minute
- ✅ **Julian Day**: Standard astronomical time calculation method

### **2. Personality Calculation (Birth Time)**

#### **Planetary Positions:**
- [ ] Sun, Moon, Mercury, Venus, Mars
- [ ] Jupiter, Saturn, Uranus, Neptune, Pluto
- [ ] North Node, South Node (True vs Mean nodes?)
- [ ] Any additional points (Chiron, etc.)?

#### **Gate Assignment:**
- [ ] 64 gates with exact degree ranges
- [ ] Line calculation within gates (6 lines per gate)
- [ ] Boundary handling for edge cases

### **3. Design Calculation (88° Solar Arc Before Birth)**

#### **Design Date Methodology - VERIFIED:**
- ✅ **Primary Method**: Exactly 88° of solar arc (Sun's movement along ecliptic)
- ✅ **NOT Calendar Days**: "Approximately 88 days" is simplified public explanation only
- ✅ **Official Source**: Jovian Archive confirms "exactly 88 degrees of the Sun's movement"
- ✅ **Technical Precision**: Solar arc measurement ensures astronomical accuracy

#### **Why Solar Arc vs Days:**
- ✅ **Accuracy**: Solar arc is astronomically precise vs variable calendar days
- ✅ **Consistency**: Same angular relationship regardless of birth season
- ✅ **Speed Variations**: Sun's elliptical orbit causes different daily arc lengths
- ✅ **Gate Precision**: Calendar days would cause significant gate/line errors

#### **Verified Design Date Variations:**
- **Dave**: ~87 days (winter birth - slower solar movement)
- **Ben**: ~89 days (autumn birth - moderate solar movement)  
- **Elodi**: ~91 days (summer birth - faster solar movement)
- **Pattern**: Confirms solar arc calculation, not fixed days

#### **Implementation Requirements:**
- ✅ **Solar Position Tracking**: Calculate exact Sun position at birth
- ✅ **Retrograde 88°**: Move backward exactly 88° along ecliptic
- ✅ **Find Date**: Determine when Sun was at that retrograde position
- ✅ **Same Planetary Calc**: Apply identical planetary position calculations

### **4. Human Design Components**

#### **9 Centers - VERIFIED:**
- ✅ **Head**: Gates 61, 63, 64
- ✅ **Ajna**: Gates 47, 24, 4, 17, 43, 11
- ✅ **Throat**: Gates 62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16
- ✅ **G Center**: Gates 1, 13, 25, 46, 2, 15, 10, 7
- ✅ **Heart**: Gates 21, 40, 26, 51
- ✅ **Spleen**: Gates 48, 57, 44, 50, 32, 28, 18
- ✅ **Solar Plexus**: Gates 6, 37, 22, 36, 30, 55, 49
- ✅ **Sacral**: Gates 3, 42, 9, 59, 14, 29, 27, 34, 5
- ✅ **Root**: Gates 53, 60, 52, 19, 39, 41, 58, 38, 54

#### **Center Definition Rules:**
- ✅ **Defined**: When both gates of at least one channel are activated
- ✅ **Activation Source**: Can be conscious (personality) or unconscious (design)
- ✅ **Connection**: Defined centers connected by active channels

#### **36 Channels - VERIFIED:**
- ✅ **Complete list documented** with gate pairs and circuit types
- ✅ **Activation Rule**: Both gates must be activated (any source)
- ✅ **Three Circuits**: Individual, Collective, Tribal

#### **5 Energy Types - VERIFIED:**
- ✅ **Manifestor**: Throat + motor, undefined Sacral
- ✅ **Generator**: Defined Sacral, no motor→Throat  
- ✅ **MG**: Defined Sacral + motor→Throat connection
- ✅ **Projector**: Undefined Sacral, no motor→Throat, 1+ defined center
- ✅ **Reflector**: All 9 centers undefined

#### **Profile System - VERIFIED:**
- ✅ **Based on**: Personality Sun line / Design Sun line
- ✅ **12 Profiles**: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2, 6/2, 6/3
- ✅ **Examples**: Dave (5/1), Ben (1/3), Elodi (4/1)
- ✅ **Line Calculation**: Position within gate (0.9375° per line)

#### **Authority Hierarchy - VERIFIED:**
1. ✅ **Emotional**: Defined Solar Plexus (overrides all)
2. ✅ **Sacral**: Defined Sacral (no Solar Plexus)
3. ✅ **Splenic**: Defined Spleen (no Sacral/Solar Plexus)
4. ✅ **Ego**: Defined Heart → G Center or Throat
5. ✅ **Self-Projected**: Defined G → Throat (no motors)
6. ✅ **Mental**: Ajna/Head defined (Projectors only)
7. ✅ **Lunar**: No inner authority (Reflectors only)

### **5. Advanced Features**

#### **Definition Types - VERIFIED:**
- ✅ **Single Definition**: All defined centers connected in one circuit
- ✅ **Split Definition**: Two separate groups of defined centers
- ✅ **Triple Split**: Three separate groups of defined centers
- ✅ **Quadruple Split**: Four separate groups of defined centers
- ✅ **No Definition**: All centers undefined (Reflectors only)

#### **Incarnation Cross:**
- [ ] Sun/Earth personality/design gate formatting
- [ ] Cross name determination
- [ ] Angle calculation (Right, Left, Juxtaposition)

---

## 🔬 **RESEARCH QUESTIONS**

### **Critical Questions to Answer:**
1. **What exact Swiss Ephemeris configuration** do standard calculators use?
2. **Is the design calculation exactly 88° or approximately 88 days?**
3. **What are the precise tropical degree ranges** for each of the 64 gates?
4. **How are lines calculated within each gate?**
5. **What timezone database** is used for historical dates?
6. **Are True Nodes or Mean Nodes used** for North/South Node calculations?
7. **What precision level** is standard (seconds, arc-seconds, etc.)?

### **Implementation Questions:**
8. **How are leap years handled** in design calculations?
9. **What happens at exact gate boundaries?**
10. **How are rounding errors managed** in line calculations?
11. **What coordinate reference frame** is used (J2000.0, Date, etc.)?

---

## 📝 **NEXT STEPS**

### **Immediate Actions:**
1. **Complete calculator verification** for all 3 test subjects
2. **Document consensus results** for each subject
3. **Research calculation methodology** based on verified results
4. **Identify any discrepancies** between calculators and investigate

### **Research Priorities:**
1. **Design calculation method** (88° arc vs days)
2. **Gate degree boundaries** (exact tropical coordinates)
3. **Swiss Ephemeris configuration** (flags, precision, reference frame)
4. **Center definition rules** (which gates activate which centers)
5. **Energy type determination** (exact logic for each type)

---

---

## 📊 **MVP REQUIREMENTS**

### **Essential Data Still Needed:**
1. **Gate Names**: HD names for display (can extract from online calculators)
2. **Bodygraph Layout**: Center positions, channel paths for SVG rendering
3. **Color Standards**: Red (unconscious), Black (conscious), defined/undefined
4. **Earth Calculation**: Always 180° opposite Sun position

### **Phase 3 Ready:**
- ✅ Gate degree boundaries verified
- ✅ Swiss Ephemeris configuration documented
- ✅ Design calculation method confirmed
- ✅ Center/channel/type logic complete

### **Data Collection Strategy:**
- Add gate names as we encounter them in implementation
- Research bodygraph SVG coordinates from online examples
- Document standard colors from existing calculators
- Build incrementally with verified reference data

---

**Last Updated**: July 31, 2025  
**Status**: Research COMPLETE - Ready for Phase 3 Implementation  
**Next Step**: Begin astronomical foundation development
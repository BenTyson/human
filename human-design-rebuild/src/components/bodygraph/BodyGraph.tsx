/**
 * Modern BodyGraph React Component
 * Visually stunning, interactive Human Design chart visualization
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HumanDesignChart, HDCenter } from './ChartTypes';
import { 
  generateBodyGraphState, 
  GATE_POSITIONS, 
  CHANNEL_PATHS,
  BODYGRAPH_COLORS 
} from './BodyGraphRenderer';
import { BodyGraphState } from './BodyGraphTypes';

// ===== COMPONENT INTERFACES =====

interface BodyGraphProps {
  chart: HumanDesignChart;
  width?: number;
  height?: number;
  interactive?: boolean;
  showTooltips?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  onGateHover?: (gate: number | null) => void;
  onCenterClick?: (center: HDCenter) => void;
}

interface TooltipData {
  x: number;
  y: number;
  content: string;
  visible: boolean;
}

// ===== MODERN STYLING =====

const styles = {
  container: {
    position: 'relative' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    userSelect: 'none' as const,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
  
  svg: {
    maxWidth: '100%',
    height: 'auto',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.1) 100%)',
    borderRadius: '12px',
  },
  
  tooltip: {
    position: 'absolute' as const,
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    pointerEvents: 'none' as const,
    zIndex: 1000,
    transform: 'translate(-50%, -100%)',
    marginTop: '-8px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  
  planetaryList: {
    position: 'absolute' as const,
    top: '0',
    width: '200px',
    padding: '20px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  
  planetaryListLeft: {
    left: '0',
    textAlign: 'left' as const,
  },
  
  planetaryListRight: {
    right: '0',
    textAlign: 'right' as const,
  },
  
  planetaryHeader: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid',
    color: '#ffffff',
  },
  
  planetaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '4px 0',
  },
  
  planetSymbol: {
    fontSize: '16px',
    fontWeight: '500',
    marginRight: '8px',
  },
  
  gateNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  }
};

// ===== MAIN COMPONENT =====

export default function BodyGraph({
  chart,
  width = 851,
  height = 1309,
  interactive = true,
  showTooltips = true,
  theme = 'light',
  className = '',
  onGateHover,
  onCenterClick
}: BodyGraphProps) {
  
  // ===== STATE MANAGEMENT =====
  
  const [bodyGraphState, setBodyGraphState] = useState<BodyGraphState | null>(null);
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);
  const [hoveredCenter, setHoveredCenter] = useState<HDCenter | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    content: '',
    visible: false
  });
  
  // ===== MEMOIZED COMPUTATIONS =====
  
  const computedBodyGraphState = useMemo(() => {
    try {
      return generateBodyGraphState(chart);
    } catch (error) {
      console.error('Error generating BodyGraph state:', error);
      return null;
    }
  }, [chart]);
  
  useEffect(() => {
    setBodyGraphState(computedBodyGraphState);
  }, [computedBodyGraphState]);
  
  // ===== EVENT HANDLERS =====
  
  const handleGateMouseEnter = (gateNumber: number, event: React.MouseEvent) => {
    if (!interactive || !showTooltips) return;
    
    setHoveredGate(gateNumber);
    onGateHover?.(gateNumber);
    
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const containerRect = (event.currentTarget.closest('svg') as SVGElement).getBoundingClientRect();
    
    const gateState = bodyGraphState?.gates.get(gateNumber);
    if (!gateState) return;
    
    const tooltipContent = gateState.isActivated 
      ? `Gate ${gateNumber} - ${gateState.planet || 'Unknown'} (Line ${gateState.line || 'Unknown'})`
      : `Gate ${gateNumber} - Inactive`;
    
    setTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      content: tooltipContent,
      visible: true
    });
  };
  
  const handleGateMouseLeave = () => {
    if (!interactive) return;
    
    setHoveredGate(null);
    onGateHover?.(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  const handleCenterClick = (center: HDCenter) => {
    if (!interactive) return;
    onCenterClick?.(center);
  };
  
  // ===== PLANET SYMBOLS =====
  
  const planetSymbols: Record<string, string> = {
    'SUN': '☉',
    'EARTH': '♁',
    'MOON': '☽',
    'NORTH_NODE': '☊',
    'SOUTH_NODE': '☋',
    'MERCURY': '☿',
    'VENUS': '♀',
    'MARS': '♂',
    'JUPITER': '♃',
    'SATURN': '♄',
    'URANUS': '♅',
    'NEPTUNE': '♆',
    'PLUTO': '♇'
  };
  
  // ===== RENDER HELPERS =====
  
  const renderHumanSilhouette = () => {
    return (
      <g id="human-silhouette" opacity="0.08">
        {/* Professional human-like outline encompassing all centers */}
        <path
          d="M425 50 
             Q 375 35 325 60
             Q 275 85 250 130
             Q 225 175 240 220
             Q 255 265 290 300
             Q 270 340 250 380
             Q 230 420 240 460
             Q 250 500 270 540
             Q 250 580 230 620
             Q 210 660 220 700
             Q 230 740 250 780
             Q 230 820 210 860
             Q 190 900 200 940
             Q 210 980 230 1020
             Q 210 1060 190 1100
             Q 170 1140 180 1180
             Q 190 1220 210 1260
             Q 230 1300 270 1320
             L 570 1320
             Q 610 1300 630 1260
             Q 650 1220 660 1180
             Q 670 1140 650 1100
             Q 630 1060 610 1020
             Q 630 980 650 940
             Q 670 900 660 860
             Q 650 820 630 780
             Q 650 740 670 700
             Q 680 660 660 620
             Q 640 580 620 540
             Q 640 500 650 460
             Q 660 420 640 380
             Q 620 340 600 300
             Q 635 265 650 220
             Q 665 175 640 130
             Q 615 85 565 60
             Q 515 35 465 50
             Q 445 45 425 50 Z"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
        />
      </g>
    );
  };
  
  const renderPlanetaryLists = () => {
    if (!chart.personalityActivations || !chart.designActivations) return null;
    
    return (
      <>
        {/* Design Side (Left) */}
        <div style={{...styles.planetaryList, ...styles.planetaryListLeft}}>
          <div style={{...styles.planetaryHeader, borderBottomColor: '#ff6b6b'}}>
            Design
          </div>
          {chart.designActivations.map((activation, index) => (
            <div key={`design-${index}`} style={styles.planetaryItem}>
              <span style={styles.planetSymbol}>
                {planetSymbols[activation.planet] || activation.planet}
              </span>
              <span style={styles.gateNumber}>
                {activation.gateLine.gate}.{activation.gateLine.line}
              </span>
            </div>
          ))}
        </div>
        
        {/* Personality Side (Right) */}
        <div style={{...styles.planetaryList, ...styles.planetaryListRight}}>
          <div style={{...styles.planetaryHeader, borderBottomColor: '#4ecdc4'}}>
            Personality
          </div>
          {chart.personalityActivations.map((activation, index) => (
            <div key={`personality-${index}`} style={styles.planetaryItem}>
              <span style={styles.gateNumber}>
                {activation.gateLine.gate}.{activation.gateLine.line}
              </span>
              <span style={styles.planetSymbol}>
                {planetSymbols[activation.planet] || activation.planet}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };
  
  const renderGate = (gateNumber: number) => {
    const position = GATE_POSITIONS[gateNumber];
    const gateState = bodyGraphState?.gates.get(gateNumber);
    
    if (!position || !gateState) return null;
    
    const isHovered = hoveredGate === gateNumber;
    const isActivated = gateState.isActivated;
    
    // Modern dark theme styling with smooth transitions
    const fillColor = isActivated ? '#000000' : 'rgba(255,255,255,0.1)';
    const strokeColor = isActivated ? '#000000' : 'rgba(255,255,255,0.3)';
    const textColor = isActivated ? '#FFFFFF' : '#999999';
    const opacity = isHovered ? 0.8 : (isActivated ? 1.0 : 0.6);
    const scale = isHovered ? 1.1 : 1.0;
    const glow = isActivated && isHovered;
    
    return (
      <g key={`gate-${gateNumber}`}>
        {/* Glow effect for activated + hovered gates */}
        {glow && (
          <circle
            cx={position.x}
            cy={position.y}
            r={16}
            fill="none"
            stroke="rgba(100,200,255,0.6)"
            strokeWidth="8"
            opacity="0.8"
            style={{
              filter: 'blur(2px)',
              transition: 'all 0.2s ease-in-out'
            }}
          />
        )}
        
        {/* Main gate circle */}
        <circle
          cx={position.x}
          cy={position.y}
          r={12.3}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          opacity={opacity}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            transform: `scale(${scale})`,
            transformOrigin: `${position.x}px ${position.y}px`,
            transition: 'all 0.2s ease-in-out',
            filter: isActivated ? 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' : 'none'
          }}
          onMouseEnter={interactive ? (e) => handleGateMouseEnter(gateNumber, e) : undefined}
          onMouseLeave={interactive ? handleGateMouseLeave : undefined}
        />
        
        {/* Gate number text */}
        <text
          x={position.x}
          y={position.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize="12"
          fontWeight={isActivated ? "700" : "500"}
          style={{
            pointerEvents: 'none',
            transition: 'all 0.2s ease-in-out',
            textShadow: isActivated ? '0 1px 3px rgba(0, 0, 0, 0.8)' : 'none'
          }}
        >
          {gateNumber}
        </text>
      </g>
    );
  };
  
  const renderChannel = (channelId: string) => {
    const channelState = bodyGraphState?.channels.get(channelId);
    const channelPath = CHANNEL_PATHS[channelId];
    
    if (!channelState || !channelPath) return null;
    
    const isActive = channelState.isActive;
    const strokeColor = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.2)';
    const strokeWidth = isActive ? 4 : 2;
    const opacity = isActive ? 1.0 : 0.4;
    
    return (
      <g key={`channel-${channelId}`}>
        <path
          d={channelPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          style={{
            transition: 'all 0.3s ease-in-out',
            filter: isActive ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))' : 'none'
          }}
        />
      </g>
    );
  };

  const renderCenter = (center: HDCenter) => {
    const centerState = bodyGraphState?.centers.get(center);
    if (!centerState) return null;
    
    const isHovered = hoveredCenter === center;
    const isDefined = centerState.isDefined;
    
    // Get center color with modern dark theme enhancements
    const baseColor = centerState.color;
    const fillColor = isDefined ? baseColor : 'rgba(255,255,255,0.05)';
    const strokeColor = isDefined ? baseColor : 'rgba(255,255,255,0.2)';
    const opacity = isHovered ? 1.0 : (isDefined ? 0.9 : 0.4);
    
    // Center paths - EXACT coordinates from professional BodyGraph SVG
    const centerPaths: Record<HDCenter, string> = {
      [HDCenter.HEAD]: "M340.59,156.62a5.48,5.48,0,0,1-4.68-8.32L414,17.86a5.49,5.49,0,0,1,7.54-1.9,5.64,5.64,0,0,1,1.86,1.84l81.12,131.34a5.5,5.5,0,0,1-4.68,8.39Z",
      [HDCenter.AJNA]: "M420.37,355.14a5.44,5.44,0,0,1-4.73-2.69L335.92,218.14a5.49,5.49,0,0,1,1.89-7.53,5.57,5.57,0,0,1,2.84-.78l159.5.82a5.51,5.51,0,0,1,4.7,8.32L425.12,352.49A5.48,5.48,0,0,1,420.37,355.14Z",
      [HDCenter.THROAT]: "M349.37,558.45a6,6,0,0,1-6-6l.68-148a6,6,0,0,1,6-6L491.4,399a6,6,0,0,1,6,6l-.67,148a6,6,0,0,1-6,6Z",
      [HDCenter.G_CENTER]: "M420,795.51a6.4,6.4,0,0,1-4.58-1.9l-95.86-96.68a6.48,6.48,0,0,1,0-9.13l96.69-95.92a6.46,6.46,0,0,1,9.12,0l95.9,96.72a6.48,6.48,0,0,1,0,9.12l-96.69,95.93A6.48,6.48,0,0,1,420,795.51Z",
      [HDCenter.HEART]: "M527.17,838.36a6.76,6.76,0,0,1-4.73-11.54l78.29-78.14a6.66,6.66,0,0,1,4.76-2,6.75,6.75,0,0,1,5.5,2.83l56.48,79A6.76,6.76,0,0,1,662,839.19Z",
      [HDCenter.SOLAR_PLEXUS]: "M831.56,1063.92a5.48,5.48,0,0,1-2.68-.71L685,982.36a5.5,5.5,0,0,1-2.11-7.49h0a5.48,5.48,0,0,1,2-2l145.71-86.2a5.18,5.18,0,0,1,2.79-.78,5.51,5.51,0,0,1,5.51,5.51v.06l-1.78,167A5.53,5.53,0,0,1,831.56,1063.92Z",
      [HDCenter.SPLEEN]: "M15.53,1063.92a5.53,5.53,0,0,1-5.5-5.45l-1.78-167a5.31,5.31,0,0,1,1.57-3.91,5.52,5.52,0,0,1,3.94-1.66,5.39,5.39,0,0,1,2.79.78l145.71,86.2a5.49,5.49,0,0,1,1.94,7.52h0a5.48,5.48,0,0,1-2,2l-144,80.85A5.61,5.61,0,0,1,15.53,1063.92Z",
      [HDCenter.SACRAL]: "M348.86,1078.19a5.5,5.5,0,0,1-5.48-5.52L344,930.26a5.5,5.5,0,0,1,5.5-5.48l142.43.56a5.5,5.5,0,0,1,5.48,5.52l-.57,142.41a5.54,5.54,0,0,1-5.5,5.48Z",
      [HDCenter.ROOT]: "M348.86,1295.7a5.43,5.43,0,0,1-3.88-1.62,5.49,5.49,0,0,1-1.6-3.9l.57-135.56a5.5,5.5,0,0,1,5.5-5.48l142.43.57a5.5,5.5,0,0,1,5.48,5.52l-.57,135.56a5.54,5.54,0,0,1-5.5,5.48Z"
    };
    
    return (
      <g key={`center-${center}`}>
        {/* Glow effect for defined + hovered centers */}
        {isDefined && isHovered && (
          <path
            d={centerPaths[center]}
            fill="none"
            stroke="rgba(100,200,255,0.5)"
            strokeWidth="6"
            opacity="0.6"
            style={{
              filter: 'blur(3px)',
              transition: 'all 0.3s ease-in-out'
            }}
          />
        )}
        
        {/* Main center shape */}
        <path
          d={centerPaths[center]}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1"
          opacity={opacity}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            transition: 'all 0.3s ease-in-out',
            filter: isDefined ? 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4))' : 'none'
          }}
          onMouseEnter={interactive ? () => setHoveredCenter(center) : undefined}
          onMouseLeave={interactive ? () => setHoveredCenter(null) : undefined}
          onClick={interactive ? () => handleCenterClick(center) : undefined}
        />
      </g>
    );
  };
  
  // ===== LOADING STATE =====
  
  if (!bodyGraphState) {
    return (
      <div style={styles.container} className={className}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          color: '#666'
        }}>
          <div>Loading BodyGraph...</div>
        </div>
      </div>
    );
  }
  
  // ===== MAIN RENDER =====
  
  return (
    <div style={styles.container} className={className}>
      {/* Planetary Activation Lists */}
      {renderPlanetaryLists()}
      
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.svg}
      >
        {/* SVG definitions for gradients and effects */}
        <defs>
          <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </radialGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
          
          <filter id="centerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        {/* Background */}
        <rect width="100%" height="100%" fill="url(#backgroundGradient)" />
        
        {/* Human silhouette */}
        {renderHumanSilhouette()}
        
        {/* Render centers first (background layer) */}
        {Object.values(HDCenter).map(center => renderCenter(center))}
        
        {/* Render channels (middle layer) */}
        {Object.keys(CHANNEL_PATHS).map(channelId => renderChannel(channelId))}
        
        {/* Render gates (foreground layer) */}
        {Array.from({ length: 64 }, (_, i) => i + 1).map(gateNumber => renderGate(gateNumber))}
      </svg>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            ...styles.tooltip,
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
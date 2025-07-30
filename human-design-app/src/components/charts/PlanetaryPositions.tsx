'use client';

import { HumanDesignChart } from '@/lib/calculations/types';

interface PlanetaryPositionsProps {
  chart: HumanDesignChart;
}

export default function PlanetaryPositions({ chart }: PlanetaryPositionsProps) {
  // Get planet glyphs from our HDKit constants
  const planetGlyphs: Record<string, string> = {
    Sun: '☉',
    Earth: '⨁',
    NorthNode: '☊',
    SouthNode: '☋',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Chiron: '⚷', // Chiron included!
  };

  const personalityActivations = chart.activations.filter(a => a.type === 'personality');
  const designActivations = chart.activations.filter(a => a.type === 'design');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Planetary Positions</h3>
      
      <div className="space-y-6">
        {/* Personality (Conscious) */}
        <div>
          <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Personality (Conscious)
          </h4>
          <div className="space-y-2">
            {personalityActivations.map((activation) => (
              <div key={`personality-${activation.planet}`} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg" title={activation.planet}>
                    {planetGlyphs[activation.planet] || '●'}
                  </span>
                  <span className="font-medium text-slate-700">{activation.planet}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-slate-600">
                    {activation.position.sign} {activation.position.degree}°{activation.position.minutes}'{activation.position.seconds}"
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                    Gate {activation.gate}.{activation.line}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design (Unconscious) */}
        <div>
          <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
            <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
            Design (Unconscious)
          </h4>
          <div className="space-y-2">
            {designActivations.map((activation) => (
              <div key={`design-${activation.planet}`} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg" title={activation.planet}>
                    {planetGlyphs[activation.planet] || '●'}
                  </span>
                  <span className="font-medium text-slate-700">{activation.planet}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-slate-600">
                    {activation.position.sign} {activation.position.degree}°{activation.position.minutes}'{activation.position.seconds}"
                  </span>
                  <span className="bg-slate-200 text-slate-800 px-2 py-1 rounded font-medium">
                    Gate {activation.gate}.{activation.line}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          * Personality (red) calculated from birth time. Design (black) calculated from ~88 days before birth.
        </p>
      </div>
    </div>
  );
}
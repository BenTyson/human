'use client';

import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HumanDesignChart } from '@/lib/calculations/types';
import PlanetaryPositions from '@/components/charts/PlanetaryPositions';
import HumDesComparison from '@/components/charts/HumDesComparison';

export default function ChartPage() {
  const params = useParams();
  const id = params.id as string;
  const [chartData, setChartData] = useState<HumanDesignChart | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Try to load chart data from sessionStorage
    const storedChart = sessionStorage.getItem(`chart-${id}`);
    
    if (storedChart) {
      try {
        const chart = JSON.parse(storedChart);
        setChartData(chart);
      } catch (error) {
        console.error('Error parsing chart data:', error);
        notFound();
      }
    } else {
      notFound();
    }
    
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your chart...</p>
        </div>
      </main>
    );
  }

  if (!chartData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Your Human Design Chart
          </h1>
          <p className="text-slate-600">
            Born {chartData.birthInfo.date} at {chartData.birthInfo.time} in {chartData.birthInfo.place}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Bodygraph</h2>
              
              {/* Placeholder for SVG Bodygraph */}
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔮</div>
                  <p className="text-slate-600 font-medium">Interactive Bodygraph</p>
                  <p className="text-sm text-slate-500">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Core Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Core Information</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-slate-700">Energy Type:</span>
                  <p className="text-blue-600 font-semibold">{chartData.energyType}</p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-700">Strategy:</span>
                  <p className="text-slate-600">{chartData.strategy}</p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-700">Authority:</span>
                  <p className="text-slate-600">{chartData.authority}</p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-700">Profile:</span>
                  <p className="text-slate-600">{chartData.profile}</p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-700">Definition:</span>
                  <p className="text-slate-600">{chartData.definitionType}</p>
                </div>
                
                <div>
                  <span className="font-medium text-slate-700">Incarnation Cross:</span>
                  <p className="text-slate-600 text-sm">{chartData.incarnationCross}</p>
                </div>
              </div>
            </div>

            {/* Defined Centers */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Defined Centers</h3>
              <div className="space-y-2">
                {chartData.centers.filter(center => center.defined).map((center) => (
                  <div key={center.name} className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-slate-700">{center.name}</span>
                  </div>
                ))}
              </div>
              {chartData.centers.filter(center => center.defined).length === 0 && (
                <p className="text-slate-500 text-sm">No defined centers</p>
              )}
            </div>

            {/* Activated Gates */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Activated Gates</h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from(new Set(chartData.activations.map(a => a.gate))).sort((a, b) => a - b).map((gate) => (
                  <div 
                    key={gate}
                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-center font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                    title={`Gate ${gate}`}
                  >
                    {gate}
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Positions */}
            <PlanetaryPositions chart={chartData} />
          </div>
        </div>

        {/* HumDes Comparison Section - Full Width */}
        <div className="mt-8">
          <HumDesComparison chart={chartData} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2"></div>
          <div className="space-y-6">
            {/* Export Options */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Export Options</h3>
              <div className="space-y-3">
                <button className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Save as PNG
                </button>
                <button className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2 rounded-lg transition-colors">
                  Export to HTML
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-slate-600 hover:text-slate-800 underline"
          >
            ← Create Another Chart
          </button>
        </div>
      </div>
    </main>
  );
}
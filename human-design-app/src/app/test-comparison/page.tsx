'use client';

import { useState, useEffect } from 'react';
import { HumanDesignChart } from '@/lib/calculations/types';

// Test case data from HumDesComparison component
const TEST_CASES = {
  test1: {
    name: 'Dave',
    birthData: {
      date: '1969-12-12',
      time: '22:12',
      place: 'Fresno, CA, USA'
    },
    humdesReference: {
      personalityType: 'Generator',
      profile: '5/1',
      profileDescription: 'Heretic / Investigator', 
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Split Definition',
      notSelf: 'Frustration',
      incarnationCross: 'The Left Angle Cross of Confrontation (26/45 | 6/36)',
      variables: 'PLR DRL',
      birthDateTime: '12.12.1969 22:12',
      birthDateTimeUTC: '13.12.1969 06:12',
      designDateTime: '16.09.1969 02:57',
      timezone: 'America/Los_Angeles (-08:00)',
      placeOfBirth: 'Fresno, California, United States of America'
    }
  },
  ben: {
    name: 'Ben',
    birthData: {
      date: '1986-11-17',
      time: '10:19',
      place: 'Haxtun, Colorado, USA'
    },
    humdesReference: {
      personalityType: 'Manifesting Generator',
      profile: '1/3',
      profileDescription: 'Investigator / Martyr',
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Single Definition',
      notSelf: 'Frustration',
      incarnationCross: 'The Right Angle Cross of Contagion (14/8 | 29/30)',
      variables: 'PRR DLR',
      birthDateTime: '17.11.1986 10:19',
      birthDateTimeUTC: '17.11.1986 17:19',
      designDateTime: '20.08.1986 09:12',
      timezone: 'America/Denver (-07:00)',
      placeOfBirth: 'Haxtun, Colorado, United States of America'
    }
  },
  elodi: {
    name: 'Elodi',
    birthData: {
      date: '2016-07-10',
      time: '11:00',
      place: 'Wheat Ridge, Colorado, USA'
    },
    humdesReference: {
      personalityType: 'Generator',
      profile: '4/1',
      profileDescription: 'Opportunist / Investigator',
      strategy: 'Wait for an opportunity to respond',
      authority: 'Sacral',
      definition: 'Split Definition',
      notSelf: 'Frustration',
      incarnationCross: 'The Juxtaposition Cross of Beginnings (53/54 | 42/32)',
      variables: 'PRL DRR',
      birthDateTime: '10.07.2016 11:00',
      birthDateTimeUTC: '10.07.2016 17:00',
      designDateTime: '10.04.2016 07:14',
      timezone: 'America/Denver (-06:00)',
      placeOfBirth: 'Wheat Ridge, Colorado, United States of America'
    }
  }
};

interface TestResult {
  testCase: string;
  chart: HumanDesignChart | null;
  error: string | null;
  isLoading: boolean;
}

export default function TestComparisonPage() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Initialize test results
  useEffect(() => {
    const initialResults: Record<string, TestResult> = {};
    Object.keys(TEST_CASES).forEach(key => {
      initialResults[key] = {
        testCase: key,
        chart: null,
        error: null,
        isLoading: false
      };
    });
    setTestResults(initialResults);
  }, []);

  // Generate chart for a specific test case
  const generateChart = async (testCaseKey: string) => {
    const testCase = TEST_CASES[testCaseKey as keyof typeof TEST_CASES];
    if (!testCase) return;

    setTestResults(prev => ({
      ...prev,
      [testCaseKey]: { ...prev[testCaseKey], isLoading: true, error: null }
    }));

    try {
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testCase.name,
          birthDate: testCase.birthData.date,
          birthTime: testCase.birthData.time,
          birthPlace: testCase.birthData.place
        })
      });

      const result = await response.json();
      
      if (result.success && result.chart) {
        setTestResults(prev => ({
          ...prev,
          [testCaseKey]: { ...prev[testCaseKey], isLoading: false, chart: result.chart }
        }));
      } else {
        throw new Error(result.error || 'Chart generation failed');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testCaseKey]: { 
          ...prev[testCaseKey], 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }));
    }
  };

  // Generate all charts at once
  const generateAllCharts = async () => {
    setIsGeneratingAll(true);
    const promises = Object.keys(TEST_CASES).map(key => generateChart(key));
    await Promise.all(promises);
    setIsGeneratingAll(false);
  };

  // Comparison helper functions
  const getComparisonStatus = (ourValue: string, expectedValue: string): 'match' | 'different' | 'unknown' => {
    if (!ourValue || ourValue === 'Unknown') return 'unknown';
    if (ourValue.toLowerCase().trim() === expectedValue.toLowerCase().trim()) return 'match';
    return 'different';
  };

  const getStatusIcon = (status: 'match' | 'different' | 'unknown') => {
    switch (status) {
      case 'match': return '✅';
      case 'different': return '❌';
      case 'unknown': return '❓';
    }
  };

  const getStatusColor = (status: 'match' | 'different' | 'unknown') => {
    switch (status) {
      case 'match': return 'text-green-600';
      case 'different': return 'text-red-600';
      case 'unknown': return 'text-yellow-600';
    }
  };

  // Render comparison for a single test case
  const renderTestCaseComparison = (testCaseKey: string) => {
    const testCase = TEST_CASES[testCaseKey as keyof typeof TEST_CASES];
    const result = testResults[testCaseKey];
    
    if (!testCase || !result) return null;

    const { chart, error, isLoading } = result;
    const { humdesReference } = testCase;

    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{testCase.name}</h3>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-600">Generating chart...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{testCase.name}</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => generateChart(testCaseKey)}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!chart) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{testCase.name}</h3>
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">Chart not generated yet</p>
            <button
              onClick={() => generateChart(testCaseKey)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              Generate Chart
            </button>
          </div>
        </div>
      );
    }

    // Format our chart data for comparison
    const ourData = {
      personalityType: chart.energyType,
      profile: chart.profile,
      strategy: chart.strategy,
      authority: chart.authority,
      definition: chart.definitionType,
      incarnationCross: chart.incarnationCross,
    };

    const comparisons = [
      {
        field: 'Personality Type',
        ourValue: ourData.personalityType,
        expectedValue: humdesReference.personalityType,
        status: getComparisonStatus(ourData.personalityType, humdesReference.personalityType)
      },
      {
        field: 'Profile',
        ourValue: ourData.profile,
        expectedValue: humdesReference.profile,
        status: getComparisonStatus(ourData.profile, humdesReference.profile)
      },
      {
        field: 'Strategy',
        ourValue: ourData.strategy,
        expectedValue: humdesReference.strategy,
        status: getComparisonStatus(ourData.strategy, humdesReference.strategy)
      },
      {
        field: 'Authority',
        ourValue: ourData.authority,
        expectedValue: humdesReference.authority,
        status: getComparisonStatus(ourData.authority, humdesReference.authority)
      },
      {
        field: 'Definition',
        ourValue: ourData.definition,
        expectedValue: humdesReference.definition,
        status: getComparisonStatus(ourData.definition, humdesReference.definition)
      },
      {
        field: 'Incarnation Cross',
        ourValue: ourData.incarnationCross,
        expectedValue: humdesReference.incarnationCross,
        status: getComparisonStatus(ourData.incarnationCross, humdesReference.incarnationCross)
      }
    ];

    // Calculate summary stats
    const matches = comparisons.filter(c => c.status === 'match').length;
    const differences = comparisons.filter(c => c.status === 'different').length;
    const unknown = comparisons.filter(c => c.status === 'unknown').length;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{testCase.name}</h3>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600 font-medium">✅ {matches}</span>
            <span className="text-red-600 font-medium">❌ {differences}</span>
            <span className="text-yellow-600 font-medium">❓ {unknown}</span>
          </div>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          <strong>Birth:</strong> {humdesReference.birthDateTime} • <strong>Location:</strong> {testCase.birthData.place}
        </div>

        <div className="space-y-3">
          {comparisons.map((comparison) => (
            <div key={comparison.field} className="border-b border-slate-100 pb-3 last:border-b-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">{comparison.field}</span>
                <span className="text-lg">{getStatusIcon(comparison.status)}</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 block">Our Result:</span>
                  <span className={`font-medium ${getStatusColor(comparison.status)}`}>
                    {comparison.ourValue || 'Not calculated'}
                  </span>
                </div>
                
                <div>
                  <span className="text-slate-500 block">HumDes Expected:</span>
                  <span className="font-medium text-slate-700">
                    {comparison.expectedValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed debug info for Sun positions if available */}
        {chart.personalityActivations && chart.designActivations && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2">Sun Position Debug</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block">Personality Sun:</span>
                <span className="font-medium text-slate-700">
                  {chart.personalityActivations.find(a => a.planet === 'Sun')?.gate}.{chart.personalityActivations.find(a => a.planet === 'Sun')?.line}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Design Sun:</span>
                <span className="font-medium text-slate-700">
                  {chart.designActivations.find(a => a.planet === 'Sun')?.gate}.{chart.designActivations.find(a => a.planet === 'Sun')?.line}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => generateChart(testCaseKey)}
          className="mt-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
        >
          Regenerate Chart
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Human Design Test Comparison Dashboard
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Automated comparison of our calculations vs HumDes reference data for systematic discrepancy analysis
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={generateAllCharts}
              disabled={isGeneratingAll}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isGeneratingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating All Charts...
                </>
              ) : (
                'Generate All 3 Charts'
              )}
            </button>
          </div>
        </div>

        {/* Overall Summary */}
        {Object.values(testResults).some(r => r.chart) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Overall Summary</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(testResults).map(([key, result]) => {
                if (!result.chart) return null;
                
                const testCase = TEST_CASES[key as keyof typeof TEST_CASES];
                const ourData = {
                  personalityType: result.chart.energyType,
                  profile: result.chart.profile,
                  strategy: result.chart.strategy,
                  authority: result.chart.authority,
                  definition: result.chart.definitionType,
                  incarnationCross: result.chart.incarnationCross,
                };
                
                const comparisons = [
                  getComparisonStatus(ourData.personalityType, testCase.humdesReference.personalityType),
                  getComparisonStatus(ourData.profile, testCase.humdesReference.profile),
                  getComparisonStatus(ourData.strategy, testCase.humdesReference.strategy),
                  getComparisonStatus(ourData.authority, testCase.humdesReference.authority),
                  getComparisonStatus(ourData.definition, testCase.humdesReference.definition),
                  getComparisonStatus(ourData.incarnationCross, testCase.humdesReference.incarnationCross)
                ];
                
                const matches = comparisons.filter(s => s === 'match').length;
                const total = comparisons.length;
                const accuracy = Math.round((matches / total) * 100);
                
                return (
                  <div key={`summary-${key}`} className="text-center">
                    <h3 className="font-semibold text-slate-800 mb-2">{testCase.name}</h3>
                    <div className="text-3xl font-bold mb-1" style={{
                      color: accuracy >= 80 ? '#16a34a' : accuracy >= 50 ? '#ea580c' : '#dc2626'
                    }}>
                      {accuracy}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {matches}/{total} matches
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Test Case Comparisons */}
        <div className="grid lg:grid-cols-1 gap-8">
          {Object.keys(TEST_CASES).map(key => (
            <div key={`comparison-${key}`}>
              {renderTestCaseComparison(key)}
            </div>
          ))}
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Known Issues Being Tracked</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li key="issue-1" className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Design Sun Calculation:</strong> Currently showing Gate 6.1 instead of expected Gate 45.1 for Test Subject</span>
            </li>
            <li key="issue-2" className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Energy Type:</strong> Showing Projector instead of Generator due to Sacral center not being defined</span>
            </li>
            <li key="issue-3" className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">⚠️</span>
              <span><strong>88-Degree Solar Arc:</strong> Investigating if exact calculation is working properly vs fixed offset</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
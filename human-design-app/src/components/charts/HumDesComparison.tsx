'use client';

import { HumanDesignChart } from '@/lib/calculations/types';
import { useState } from 'react';

// Test case references from HumDes
const TEST_CASES = {
  test1: {
    name: 'Test Subject',
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

interface HumDesComparisonProps {
  chart: HumanDesignChart;
}

export default function HumDesComparison({ chart }: HumDesComparisonProps) {
  // Determine which test case matches current chart
  const getCurrentTestCase = () => {
    const birthDate = chart.birthInfo.date;
    const birthTime = chart.birthInfo.time;
    
    if (birthDate === '1969-12-12' && birthTime.startsWith('22:12')) {
      return 'test1';
    } else if (birthDate === '1986-11-17' && birthTime.startsWith('10:19')) {
      return 'ben';
    } else if (birthDate === '2016-07-10' && birthTime.startsWith('11:00')) {
      return 'elodi';
    }
    return 'test1'; // default
  };
  
  const currentTestCase = getCurrentTestCase();
  const HUMDES_REFERENCE = TEST_CASES[currentTestCase].humdesReference;
  
  // Helper function to compare values and show status
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

  // Format our chart data for comparison
  const ourData = {
    personalityType: chart.energyType,
    profile: chart.profile,
    strategy: chart.strategy,
    authority: chart.authority,
    definition: chart.definitionType,
    incarnationCross: chart.incarnationCross,
    birthDateTime: `${chart.birthInfo.date.split('-').reverse().join('.')} ${chart.birthInfo.time}`,
    placeOfBirth: chart.birthInfo.place,
    timezone: chart.birthInfo.timezone
  };

  // Calculate our UTC birth time for comparison
  const ourBirthDate = new Date(`${chart.birthInfo.date}T${chart.birthInfo.time}:00`);
  const ourBirthDateTimeUTC = `${ourBirthDate.getUTCDate().toString().padStart(2, '0')}.${(ourBirthDate.getUTCMonth() + 1).toString().padStart(2, '0')}.${ourBirthDate.getUTCFullYear()} ${ourBirthDate.getUTCHours().toString().padStart(2, '0')}:${ourBirthDate.getUTCMinutes().toString().padStart(2, '0')}`;

  const comparisons = [
    {
      field: 'Personality Type',
      ourValue: ourData.personalityType,
      expectedValue: HUMDES_REFERENCE.personalityType,
      status: getComparisonStatus(ourData.personalityType, HUMDES_REFERENCE.personalityType)
    },
    {
      field: 'Profile',
      ourValue: ourData.profile,
      expectedValue: `${HUMDES_REFERENCE.profile} ${HUMDES_REFERENCE.profileDescription}`,
      status: getComparisonStatus(ourData.profile, HUMDES_REFERENCE.profile)
    },
    {
      field: 'Strategy',
      ourValue: ourData.strategy,
      expectedValue: HUMDES_REFERENCE.strategy,
      status: getComparisonStatus(ourData.strategy, HUMDES_REFERENCE.strategy)
    },
    {
      field: 'Authority',
      ourValue: ourData.authority,
      expectedValue: HUMDES_REFERENCE.authority,
      status: getComparisonStatus(ourData.authority, HUMDES_REFERENCE.authority)
    },
    {
      field: 'Definition',
      ourValue: ourData.definition,
      expectedValue: HUMDES_REFERENCE.definition,
      status: getComparisonStatus(ourData.definition, HUMDES_REFERENCE.definition)
    },
    {
      field: 'Incarnation Cross',
      ourValue: ourData.incarnationCross,
      expectedValue: HUMDES_REFERENCE.incarnationCross,
      status: getComparisonStatus(ourData.incarnationCross, HUMDES_REFERENCE.incarnationCross)
    },
    {
      field: 'Birth Date/Time',
      ourValue: ourData.birthDateTime,
      expectedValue: HUMDES_REFERENCE.birthDateTime,
      status: getComparisonStatus(ourData.birthDateTime, HUMDES_REFERENCE.birthDateTime)
    },
    {
      field: 'Birth Place',
      ourValue: ourData.placeOfBirth,
      expectedValue: HUMDES_REFERENCE.placeOfBirth,
      status: getComparisonStatus(ourData.placeOfBirth, HUMDES_REFERENCE.placeOfBirth)
    },
    {
      field: 'Timezone',
      ourValue: ourData.timezone,
      expectedValue: HUMDES_REFERENCE.timezone,
      status: getComparisonStatus(ourData.timezone, HUMDES_REFERENCE.timezone)
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">HumDes Reference Comparison</h3>
        <p className="text-sm text-slate-600">
          Comparing our calculations with known correct HumDes results for:
          <br />
          <strong>{TEST_CASES[currentTestCase].name}: {HUMDES_REFERENCE.birthDateTime} in {HUMDES_REFERENCE.placeOfBirth}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {comparisons.map((comparison) => (
          <div key={comparison.field} className="border-b border-slate-100 pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-slate-700">{comparison.field}</span>
              <span className="text-lg">{getStatusIcon(comparison.status)}</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3 text-sm">
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

      {/* Additional Reference Data */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-3">Additional HumDes Reference Data</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block">Not-Self Theme:</span>
            <span className="font-medium text-slate-700">{HUMDES_REFERENCE.notSelf}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Variables:</span>
            <span className="font-medium text-slate-700">{HUMDES_REFERENCE.variables}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Birth Date/Time (UTC):</span>
            <span className="font-medium text-slate-700">{HUMDES_REFERENCE.birthDateTimeUTC}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Design Date/Time:</span>
            <span className="font-medium text-slate-700">{HUMDES_REFERENCE.designDateTime}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 block">Timezone:</span>
            <span className="font-medium text-slate-700">{HUMDES_REFERENCE.timezone}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-800 mb-2">Comparison Summary</h4>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="text-green-600 font-medium">
                {comparisons.filter(c => c.status === 'match').length} Matches
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span className="text-red-600 font-medium">
                {comparisons.filter(c => c.status === 'different').length} Differences
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>❓</span>
              <span className="text-yellow-600 font-medium">
                {comparisons.filter(c => c.status === 'unknown').length} Unknown/Missing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Test Cases Overview */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">All Test Cases Overview</h4>
        
        {/* Quick test buttons */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-slate-700 mb-2">Generate test charts:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TEST_CASES).map(([key, testCase]) => (
              <button
                key={key}
                onClick={() => {
                  // Create form data for auto-submission
                  const form = document.createElement('form');
                  form.method = 'POST';
                  form.action = '/api/generate-chart';
                  
                  const data = {
                    name: testCase.name,
                    birthDate: testCase.birthData.date,
                    birthTime: testCase.birthData.time,
                    birthPlace: testCase.birthData.place
                  };
                  
                  Object.entries(data).forEach(([name, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                  });
                  
                  // Submit via fetch instead
                  fetch('/api/generate-chart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  })
                  .then(res => res.json())
                  .then(result => {
                    if (result.success) {
                      sessionStorage.setItem(`chart-${result.chartId}`, JSON.stringify(result.chart));
                      window.location.href = `/chart/${result.chartId}`;
                    }
                  });
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                Generate {testCase.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(TEST_CASES).map(([key, testCase]) => (
            <div key={key} className={`p-4 rounded-lg border ${key === currentTestCase ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <h5 className="font-medium text-slate-800 mb-2">{testCase.name}</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">
                    <span className="font-medium">Birth:</span> {testCase.humdesReference.birthDateTime}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Design:</span> {testCase.humdesReference.designDateTime}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Location:</span> {testCase.birthData.place}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">
                    <span className="font-medium">Type:</span> {testCase.humdesReference.personalityType}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Profile:</span> {testCase.humdesReference.profile}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    <span className="font-medium">Cross:</span> {testCase.humdesReference.incarnationCross}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
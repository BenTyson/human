'use client';

import { HumanDesignChart } from '@/lib/calculations/types';

// Known correct HumDes results for test case
const HUMDES_REFERENCE = {
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
};

interface HumDesComparisonProps {
  chart: HumanDesignChart;
}

export default function HumDesComparison({ chart }: HumDesComparisonProps) {
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
    birthDateTime: `${chart.birthInfo.date} ${chart.birthInfo.time}`,
    placeOfBirth: chart.birthInfo.place
  };

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
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">HumDes Reference Comparison</h3>
        <p className="text-sm text-slate-600">
          Comparing our calculations with known correct HumDes results for test case:
          <br />
          <strong>12.12.1969 at 22:12 in Fresno, CA, USA</strong>
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
    </div>
  );
}
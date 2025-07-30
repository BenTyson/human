import { NextRequest, NextResponse } from 'next/server';
import { generateHumanDesignChart } from '@/lib/calculations/chart';
import { BirthInfo } from '@/lib/calculations/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birthDate, birthTime, birthPlace } = body;

    // Validate required fields
    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: birthDate, birthTime, birthPlace' },
        { status: 400 }
      );
    }

    // Create birth info object
    const birthInfo: BirthInfo = {
      date: birthDate,
      time: birthTime,
      place: birthPlace,
      // TODO: Add geocoding to get latitude/longitude
      // For now, using default coordinates
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };

    // Generate the chart
    const chart = await generateHumanDesignChart(birthInfo);
    
    // Add name if provided
    if (name) {
      chart.birthInfo = { ...chart.birthInfo, place: `${name} - ${chart.birthInfo.place}` };
    }

    return NextResponse.json({ 
      success: true, 
      chart,
      chartId: chart.id 
    });

  } catch (error) {
    console.error('Chart generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}
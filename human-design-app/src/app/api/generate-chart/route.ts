import { NextRequest, NextResponse } from 'next/server';
import { generateHumanDesignChart } from '@/lib/calculations/chart';
import { BirthInfo } from '@/lib/calculations/types';
import { getLocationCoordinates } from '@/lib/calculations/ephemeris';

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

    // Get location coordinates for accurate calculations
    const coordinates = getLocationCoordinates(birthPlace);
    
    // Create birth info object
    const birthInfo: BirthInfo = {
      date: birthDate,
      time: birthTime,
      place: birthPlace,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone: coordinates.timezone
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
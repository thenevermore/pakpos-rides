import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const mapsClient = new Client({});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Google Maps API key is missing' }, { status: 500 });
    }

    const directionsRes = await mapsClient.directions({
      params: {
        origin,
        destination,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving' as any,
        avoid: ['tolls', 'highways'] as any,
        alternatives: true,
      },
    });

    if (directionsRes.data.status !== 'OK' || directionsRes.data.routes.length === 0) {
      return NextResponse.json({ error: 'Could not find any routes' }, { status: 400 });
    }

    // Extract summaries
    const routeOptions = directionsRes.data.routes.map((route: any, index: number) => {
      const leg = route.legs[0];
      return {
        index,
        summary: route.summary || `Alternatif ${index + 1}`,
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline?.points || '',
      };
    });

    return NextResponse.json({ routes: routeOptions });

  } catch (error: any) {
    console.error('Error checking routes:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

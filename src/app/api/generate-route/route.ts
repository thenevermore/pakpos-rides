import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Client } from '@googlemaps/google-maps-services-js';

// Ensure the API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const mapsClient = new Client({});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, theme, motorcycleType, isOvernight } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Pilih atau tentukan Asal dan Tujuan nya' }, { status: 400 });
    }

    if (!GEMINI_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'API keys are missing in the environment' }, { status: 500 });
    }

    // 1. Get Directions from Google Maps
    const directionsRes = await mapsClient.directions({
      params: {
        origin,
        destination,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving' as any,
      },
    });

    if (directionsRes.data.status !== 'OK' || directionsRes.data.routes.length === 0) {
      return NextResponse.json({ error: 'Could not find route via Google Maps' }, { status: 400 });
    }

    const route = directionsRes.data.routes[0].legs[0];
    const distanceText = route.distance.text;
    const durationText = route.duration.text;
    const steps = route.steps;

    // 2. Find a midpoint to recommend a rest area
    // Just taking a step roughly in the middle of the journey
    const midStepIndex = Math.floor(steps.length / 2);
    const midLocation = steps[midStepIndex].end_location;

    // 3. Search Places API for a rest stop near the midpoint
    const placesRes = await mapsClient.placesNearby({
      params: {
        location: `${midLocation.lat},${midLocation.lng}`,
        radius: 5000, // 5km
        type: 'cafe',
        keyword: 'tempat ngopi terdekat ATAU rest area sekitar sini',
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    // Take top 3 places with high ratings
    let checkpoints: any[] = [];
    if (placesRes.data.results && placesRes.data.results.length > 0) {
      const sortedPlaces = placesRes.data.results
        .filter((p: any) => p.rating && p.rating >= 4.0)
        .sort((a: any, b: any) => b.rating - a.rating)
        .slice(0, 3);

      checkpoints = sortedPlaces.map((p: any) => ({
        name: p.name,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        vicinity: p.vicinity,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
      }));
    }

    // 4. Generate Article with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `
Anda adalah seorang Karyawan Korporat, pejuang 9 to 5, yang juga seorang rider Yamaha MT dari Indonesia Usia 35 tahun ke atas, dengan tinggi 166 cm dan berat badan 67kg (mirip gaya bicara santai tapi informatif tapi gaya bahasa natural tanpa terkesan AI).
Tulis artikel panduan touring berdasarkan data asli dari Google Maps berikut:

- Asal: ${origin}
- Tujuan: ${destination}
- Jarak Tempuh Asli: ${distanceText}
- Estimasi Waktu Asli: ${durationText}
- Tema Riding: ${theme || 'Santai'}
- Cocok untuk motor: ${motorcycleType || 'Bebas'}
- Tipe Perjalanan: ${isOvernight ? 'Menginap (Sertakan rekomendasi jenis penginapan/hotel)' : 'Pulang Pergi / Tidak Menginap (Berikan tips manajemen waktu agar tidak kemalaman di jalan)'}

Titik Istirahat (Rest Area/Cafe) rekomendasi dari Google Maps (sebutkan dalam artikel):
${checkpoints.map(c => `- ${c.name} (Rating ${c.rating} dari ${c.user_ratings_total} ulasan) di ${c.vicinity}`).join('\n')}

Instruksi Format:
- Hasil HARUS berupa format HTML murni (tanpa tag \`\`\`html) yang bisa langsung dirender. Gunakan tag <h2>, <p>, <ul>, <li>, <strong>.
- Awali dengan Paragraf Pengantar yang seru.
- Buat sub-judul <h2>Persiapan & Kondisi Jalan</h2> (tambahkan tips sesuai jarak tempuh).
- Buat sub-judul <h2>Rekomendasi Titik Istirahat ${isOvernight ? '& Tempat Menginap' : ''}</h2> (bahas tempat yang direkomendasikan di atas, dan beri insight tentang penginapan jika menginap).
- Buat sub-judul <h2>Kesimpulan</h2>.
- Jangan gunakan markdown, langsung tag HTML saja. Jangan menggunakan <html> atau <body>.
`;

    const aiResult = await model.generateContent(prompt);
    let articleContent = aiResult.response.text();

    // Clean up if Gemini adds markdown block
    if (articleContent.startsWith('\`\`\`html')) {
      articleContent = articleContent.replace(/\`\`\`html/g, '').replace(/\`\`\`/g, '').trim();
    }

    // 5. Construct final response
    return NextResponse.json({
      distanceText,
      durationText,
      checkpoints,
      articleContent,
    });

  } catch (error: any) {
    console.error('Error generating route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

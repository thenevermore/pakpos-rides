import { supabase } from '@/lib/supabase';
import { TouringRoute } from '@/lib/types';
import RouteListClient from '@/components/RouteListClient';

export const metadata = {
  title: 'Rute Touring & Sunmori Pilihan - PakPOS Rides',
  description: 'Temukan rekomendasi rute touring dan sunmori terbaik lengkap dengan peta, jarak, dan titik istirahat favorit anak motor.',
};

export const revalidate = 0; // Disable cache to ensure slug updates reflect immediately

export default async function RoutesPage() {
  const { data: routes } = await supabase
    .from('touring_routes')
    .select('*')
    .order('created_at', { ascending: false });

  const touringRoutes = (routes || []) as TouringRoute[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          Eksplorasi Rute Touring
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Kumpulan panduan rute *touring* dan *sunmori* lengkap dengan detail kondisi jalan dan rekomendasi tempat istirahat/kopi.
        </p>
      </div>

      <RouteListClient initialRoutes={touringRoutes} />
    </div>
  );
}

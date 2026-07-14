import { supabase } from '@/lib/supabase';
import { TouringRoute } from '@/lib/types';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Rute Touring & Sunmori Pilihan - PakPOS Rides',
  description: 'Temukan rekomendasi rute touring dan sunmori terbaik lengkap dengan peta, jarak, dan titik istirahat favorit anak motor.',
};

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

      {touringRoutes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
          <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum Ada Rute</h3>
          <p className="text-gray-500">Rute touring sedang disiapkan oleh tim PakPOS.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {touringRoutes.map(route => (
            <Link 
              key={route.id} 
              href={`/routes/${route.slug}`}
              className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="h-48 relative bg-gray-200 dark:bg-gray-800 overflow-hidden">
                {route.cover_image_url ? (
                  <img src={route.cover_image_url} alt={route.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white">
                    <MapPin className="w-10 h-10 mb-2 opacity-80" />
                    <span className="font-bold tracking-widest uppercase opacity-50 text-sm">Touring Route</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wide">
                  {route.difficulty}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  <span>{route.distance_text}</span>
                  <span>&bull;</span>
                  <span>{route.duration_text}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {route.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                  Perjalanan dari {route.origin} menuju ke {route.destination}. Cocok untuk motor {route.recommended_motorcycles.join(', ')}.
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Baca Panduan</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TouringRoute } from '@/lib/types';
import { Plus, Loader2, MapPin, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<TouringRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('touring_routes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRoutes(data as TouringRoute[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus rute "${title}"?`)) {
      try {
        const { error } = await supabase.from('touring_routes').delete().eq('id', id);
        if (error) throw error;
        await fetchRoutes();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus rute');
      }
    }
  };

  if (loading && routes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Touring Routes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate and manage AI-powered touring routes</p>
        </div>
        <Link
          href="/admin/routes/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Generate Rute Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map(route => (
          <div key={route.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 relative">
              {route.cover_image_url ? (
                <img src={route.cover_image_url} alt={route.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-md text-xs font-bold text-gray-900 dark:text-white">
                {route.distance_text}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">{route.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{route.origin} &rarr; {route.destination}</p>
              
              <div className="mt-auto flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href={`/routes/${route.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Lihat
                </Link>
                <Link
                  href={`/admin/routes/edit/${route.id}`}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(route.id, route.title)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {routes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            Belum ada rute touring. Klik "Generate Rute Baru" untuk mulai membuat rute dengan AI.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { TouringRoute } from '@/lib/types';

export default function RouteListClient({ initialRoutes }: { initialRoutes: TouringRoute[] }) {
  const [filterOrigin, setFilterOrigin] = useState('Semua Lokasi');

  // Extract unique origins from routes
  const origins = ['Semua Lokasi', ...Array.from(new Set(initialRoutes.map(r => r.origin.split(' ')[0] || r.origin)))];

  const filteredRoutes = initialRoutes.filter(route => {
    if (filterOrigin === 'Semua Lokasi') return true;
    return route.origin.includes(filterOrigin);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Berangkat dari:</span>
        {origins.map(origin => (
          <button
            key={origin}
            onClick={() => setFilterOrigin(origin)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterOrigin === origin 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {origin}
          </button>
        ))}
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
          <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum Ada Rute</h3>
          <p className="text-gray-500">Tidak ada rute untuk kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map(route => {
            // Extract the first part of difficulty string as the main Category Badge
            const rawCategory = route.difficulty.split('•')[0]?.trim() || 'Umum';

            return (
              <Link 
                key={route.id} 
                href={`/routes/${route.slug}`}
                className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
              >
                <div className="h-56 relative bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  {route.cover_image_url ? (
                    <img src={route.cover_image_url} alt={route.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center text-white">
                      <MapPin className="w-10 h-10 mb-2 opacity-50" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white tracking-widest uppercase border border-white/10">
                      {route.origin} &rarr; {route.destination}
                    </div>
                  </div>
                  
                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {route.title}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Jarak</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{route.distance_text}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Estimasi</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{route.duration_text}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Rekomendasi Motor</p>
                    <div className="flex flex-wrap gap-2">
                      {route.recommended_motorcycles && route.recommended_motorcycles.length > 0 ? (
                        route.recommended_motorcycles.map(moto => (
                          <span key={moto} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md">
                            {moto}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md">Semua Motor</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between group/btn">
                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover/btn:text-blue-600 transition-colors">Jelajahi Rute</span>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}

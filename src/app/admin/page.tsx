'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bike, Droplets, Fuel, Database } from 'lucide-react';

interface Counts {
  brands: number;
  motorcycles: number;
  oil_brands: number;
  fuel_brands: number;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ brands: 0, motorcycles: 0, oil_brands: 0, fuel_brands: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const [brands, motorcycles, oils, fuels] = await Promise.all([
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('motorcycles').select('*', { count: 'exact', head: true }),
        supabase.from('oil_brands').select('*', { count: 'exact', head: true }),
        supabase.from('fuel_brands').select('*', { count: 'exact', head: true }),
      ]);
      setCounts({
        brands: brands.count || 0,
        motorcycles: motorcycles.count || 0,
        oil_brands: oils.count || 0,
        fuel_brands: fuels.count || 0,
      });
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const cards = [
    { label: 'Brands', value: counts.brands, icon: Bike, color: 'bg-blue-500' },
    { label: 'Motorcycles', value: counts.motorcycles, icon: Database, color: 'bg-green-500' },
    { label: 'Oil Brands', value: counts.oil_brands, icon: Droplets, color: 'bg-amber-500' },
    { label: 'Fuel Brands', value: counts.fuel_brands, icon: Fuel, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Overview of your PakposRides database</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Use the sidebar to manage <strong className="text-gray-900 dark:text-white">Oil Brands</strong> and <strong className="text-gray-900 dark:text-white">Fuel Brands</strong> affiliate links.</p>
          <p>All changes are saved directly to the Supabase database and reflected immediately on the live site.</p>
        </div>
      </div>
    </div>
  );
}

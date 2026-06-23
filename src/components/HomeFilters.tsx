'use client';

import { useState, useMemo } from 'react';
import { Motorcycle, Brand } from '@/lib/types';
import { getCompressionLevel, formatPrice, getCategoryLabel, getCategoryColor } from '@/lib/data';
import ModelCard from './ModelCard';
import Link from 'next/link';
import { Gauge, Fuel, X } from 'lucide-react';

interface HomeFiltersProps {
  motorcycles: (Motorcycle & { brand?: Brand })[];
  knowledgeBase: { motorcycle_id: string; ideal_octane: number }[];
}

type CompressionFilter = 'all' | 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';
type FuelFilter = 'all' | '90' | '92' | '95' | '98';

const compressionOptions: { value: CompressionFilter; label: string; color: string }[] = [
  { value: 'all', label: 'Semua', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'rendah', label: 'Rendah', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'sedang', label: 'Sedang', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'tinggi', label: 'Tinggi', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'sangat_tinggi', label: 'Sangat Tinggi', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

const fuelOptions: { value: FuelFilter; label: string; octane: string }[] = [
  { value: 'all', label: 'Semua', octane: '' },
  { value: '90', label: 'Oktan 90', octane: 'Pertalite' },
  { value: '92', label: 'Oktan 92', octane: 'Pertamax/Super' },
  { value: '95', label: 'Oktan 95', octane: 'Pertamax Green/BP Ultimate/V-Power/Revvo95' },
  { value: '98', label: 'Oktan 98', octane: 'Pertamax Turbo/Nitro+' },
];

export default function HomeFilters({ motorcycles, knowledgeBase }: HomeFiltersProps) {
  const [compFilter, setCompFilter] = useState<CompressionFilter>('all');
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>('all');

  const kbMap = useMemo(() => {
    const map: Record<string, number> = {};
    knowledgeBase.forEach(kb => { map[kb.motorcycle_id] = kb.ideal_octane; });
    return map;
  }, [knowledgeBase]);

  const filtered = useMemo(() => {
    return motorcycles.filter(m => {
      // Compression filter
      if (compFilter !== 'all') {
        const info = getCompressionLevel(m.compression_ratio);
        const levelMap: Record<string, CompressionFilter> = {
          'Rendah': 'rendah',
          'Sedang': 'sedang',
          'Tinggi': 'tinggi',
          'Sangat Tinggi': 'sangat_tinggi',
        };
        if (levelMap[info.level] !== compFilter) return false;
      }
      // Fuel filter
      if (fuelFilter !== 'all') {
        const idealOctane = kbMap[m.id];
        if (!idealOctane || idealOctane.toString() !== fuelFilter) return false;
      }
      return true;
    });
  }, [motorcycles, compFilter, fuelFilter, kbMap]);

  const hasFilter = compFilter !== 'all' || fuelFilter !== 'all';

  const clearFilters = () => {
    setCompFilter('all');
    setFuelFilter('all');
  };

  // Group by brand
  const grouped = useMemo(() => {
    const groups: Record<string, { brand: Brand; motors: (Motorcycle & { brand?: Brand })[] }> = {};
    filtered.forEach(m => {
      const brandId = m.brand_id;
      if (!groups[brandId]) {
        groups[brandId] = { brand: m.brand!, motors: [] };
      }
      groups[brandId].motors.push(m);
    });
    return Object.values(groups).sort((a, b) => a.brand.name.localeCompare(b.brand.name));
  }, [filtered]);

  return (
    <div className="mb-10">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        {/* Compression Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Kompresi</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {compressionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCompFilter(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  compFilter === opt.value
                    ? `${opt.color} ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500 dark:ring-offset-gray-900`
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Fuel className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Bensin</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {fuelOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFuelFilter(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  fuelFilter === opt.value
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-offset-1 ring-green-400 dark:ring-green-500 dark:ring-offset-gray-900'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
                {opt.octane && <span className="ml-1 text-[10px] opacity-70">({opt.octane})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Clear + Count */}
        {hasFilter && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> motor ditemukan
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Filtered Results */}
      {hasFilter && (
        <div className="mt-8 space-y-8">
          {grouped.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Tidak ada motor yang cocok dengan filter ini.</p>
              <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline">Reset filter</button>
            </div>
          )}
          {grouped.map(group => (
            <div key={group.brand?.id || 'unknown'}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.brand?.name || 'Unknown'}</h3>
                <span className="text-xs text-gray-400 dark:text-gray-500">{group.motors.length} motor</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.motors.map(motor => (
                  <ModelCard key={motor.id} motorcycle={motor} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

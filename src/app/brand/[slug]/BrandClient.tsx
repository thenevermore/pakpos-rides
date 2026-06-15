'use client';

import { useState, useMemo } from 'react';
import { Motorcycle } from '@/lib/types';
import { getCategoryLabel } from '@/lib/data';
import ModelCard from '@/components/ModelCard';
import { Search, Filter } from 'lucide-react';

const categories = ['all', 'sport', 'matic', 'bebek', 'naked', 'trail'];

export default function BrandClient({ motorcycles }: { motorcycles: Motorcycle[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return motorcycles.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.model_code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || m.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [motorcycles, search, category]);

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari model atau kode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {cat === 'all' ? 'Semua' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {filtered.length} model ditemukan
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(motorcycle => (
            <ModelCard key={motorcycle.id} motorcycle={motorcycle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Tidak ada model yang cocok dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}

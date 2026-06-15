import BrandCard from '@/components/BrandCard';
import { getBrands } from '@/lib/data';
import { Bike, Search } from 'lucide-react';

export default async function Home() {
  const brands = await getBrands();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
          <Bike className="w-4 h-4" />
          PakPOS Rides - Informasi Sepeda Motor Indonesia
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Temukan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">informasi tentang motor</span> Kamu
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Rasio kompresi, rekomendasi bensin, dan oli terbaik untuk setiap jenis sepeda motor di Indonesia.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StepCard step="1" title="Pilih Brand" desc="Pilih brand kendaraan kamu" />
        <StepCard step="2" title="Pilih Model" desc="Pilih model motor nya" />
        <StepCard step="3" title="Lihat Rekomendasi" desc="Dapatkan rekomendasi bensin & oli terbaik" />
      </div>

      {/* Brand grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pilih Brand</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{brands.length} brand tersedia</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map(brand => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center">
      <div className="w-10 h-10 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3">
        {step}
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
    </div>
  );
}

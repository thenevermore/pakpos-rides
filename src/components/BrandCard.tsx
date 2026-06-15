import Link from 'next/link';
import { Brand } from '@/lib/types';
import LogoImage from './LogoImage';
import { ChevronRight } from 'lucide-react';

const brandColors: Record<string, string> = {
  honda: 'from-red-500 to-red-700',
  yamaha: 'from-blue-500 to-blue-700',
  suzuki: 'from-yellow-500 to-yellow-700',
  kawasaki: 'from-green-500 to-green-700',
  tvs: 'from-orange-500 to-orange-700',
  vespa: 'from-sky-500 to-sky-700',
};

export default function BrandCard({ brand }: { brand: Brand }) {
  const gradient = brandColors[brand.slug] || 'from-gray-500 to-gray-700';

  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <LogoImage
          src={brand.logo_url}
          alt={brand.name}
          fallbackText={brand.name}
          size={72}
          bgColor={`bg-gradient-to-br ${gradient}`}
        />
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{brand.country}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Lihat Model <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { Motorcycle } from '@/lib/types';
import { getCategoryLabel, getCategoryColor, formatPrice } from '@/lib/data';
import { Bike } from 'lucide-react';

export default function ModelCard({ motorcycle }: { motorcycle: Motorcycle }) {
  return (
    <Link
      href={`/motorcycle/${motorcycle.id}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image area */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative overflow-hidden">
        {(motorcycle.cdn_url || motorcycle.image_url) ? (
          <img
            src={motorcycle.cdn_url || motorcycle.image_url!}
            alt={motorcycle.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Bike className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        )}
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(motorcycle.category)}`}>
          {getCategoryLabel(motorcycle.category)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{motorcycle.model_code}</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{motorcycle.name}</h3>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatPrice(motorcycle.latest_price)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{motorcycle.compression_ratio}</p>
        </div>
      </div>
    </Link>
  );
}

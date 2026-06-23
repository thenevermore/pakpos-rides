import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMotorcycleById, getFuelPrices } from '@/lib/data';
import TabDetail from '@/components/TabDetail';
import LogoImage from '@/components/LogoImage';
import { ArrowLeft, Bike } from 'lucide-react';

export default async function MotorcyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motorcycle = await getMotorcycleById(id);
  if (!motorcycle) notFound();
  const fuelPrices = await getFuelPrices();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/brand/${motorcycle.brand?.slug || ''}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke {motorcycle.brand?.name || 'Brand'}
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        {/* Image area */}
        <div className="h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          {(motorcycle.cdn_url || motorcycle.image_url) ? (
            <img
              src={motorcycle.cdn_url || motorcycle.image_url!}
              alt={motorcycle.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <Bike className="w-24 h-24 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {motorcycle.brand && (
              <LogoImage
                src={motorcycle.brand.logo_url}
                cdnSrc={motorcycle.brand.cdn_url}
                alt={motorcycle.brand.name}
                fallbackText={motorcycle.brand.name}
                size={48}
                bgColor="bg-gradient-to-br from-blue-500 to-indigo-700"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{motorcycle.model_code}</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                {motorcycle.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {motorcycle.brand?.name} &middot; {motorcycle.category.charAt(0).toUpperCase() + motorcycle.category.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabDetail motorcycle={motorcycle} fuelPrices={fuelPrices} />
    </div>
  );
}

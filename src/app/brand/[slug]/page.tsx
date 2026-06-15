import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getMotorcyclesByBrand, formatPrice } from '@/lib/data';
import ModelCard from '@/components/ModelCard';
import LogoImage from '@/components/LogoImage';
import { ArrowLeft, Bike } from 'lucide-react';
import BrandClient from './BrandClient';

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const motorcycles = await getMotorcyclesByBrand(brand.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Brand
      </Link>

      {/* Brand header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8 flex items-center gap-5">
        <LogoImage
          src={brand.logo_url}
          alt={brand.name}
          fallbackText={brand.name}
          size={64}
          bgColor="bg-gradient-to-br from-blue-500 to-indigo-700"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{brand.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {brand.country} &middot; {motorcycles.length} model tersedia
          </p>
        </div>
      </div>

      {/* Client-side search/filter */}
      <BrandClient motorcycles={motorcycles} />
    </div>
  );
}

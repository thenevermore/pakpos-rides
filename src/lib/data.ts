import { Brand, Motorcycle, MotorcycleDetail } from './types';
import { brands, motorcycles, getKnowledgeBase } from './seed-data';

// Data access layer - currently using local seed data
// Can be swapped to Supabase by replacing implementations

export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  return brands.find(b => b.slug === slug);
}

export async function getMotorcyclesByBrand(brandId: string): Promise<Motorcycle[]> {
  return motorcycles.filter(m => m.brand_id === brandId);
}

export async function getMotorcycleById(id: string): Promise<MotorcycleDetail | undefined> {
  const motorcycle = motorcycles.find(m => m.id === id);
  if (!motorcycle) return undefined;

  const brand = brands.find(b => b.id === motorcycle.brand_id);
  const recommendations = getKnowledgeBase(motorcycle);

  return {
    ...motorcycle,
    brand,
    recommendations,
  };
}

export async function getAllMotorcycles(): Promise<Motorcycle[]> {
  return motorcycles;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    sport: 'Sport',
    matic: 'Matic/Skuter',
    bebek: 'Bebek',
    naked: 'Naked',
    trail: 'Trail/Adventure',
  };
  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    sport: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    matic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    bebek: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    naked: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    trail: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}

export function getOctaneColor(octane: number): string {
  if (octane <= 90) return 'from-yellow-400 to-yellow-600';
  if (octane <= 92) return 'from-green-400 to-green-600';
  if (octane <= 95) return 'from-blue-400 to-blue-600';
  return 'from-purple-400 to-purple-600';
}

export function getCompressionLevel(ratio: string): { level: string; color: string; description: string } {
  const val = parseFloat(ratio);
  if (val < 9.5) return { level: 'Rendah', color: 'text-green-600 dark:text-green-400', description: 'Kompresi rendah, cocok dengan bensin oktan standar' };
  if (val < 10.5) return { level: 'Sedang', color: 'text-yellow-600 dark:text-yellow-400', description: 'Kompresi sedang, direkomendasikan bensin oktan menengah' };
  if (val < 11.5) return { level: 'Tinggi', color: 'text-orange-600 dark:text-orange-400', description: 'Kompresi tinggi, memerlukan bensin oktan tinggi' };
  return { level: 'Sangat Tinggi', color: 'text-red-600 dark:text-red-400', description: 'Kompresi sangat tinggi, wajib menggunakan bensin premium' };
}

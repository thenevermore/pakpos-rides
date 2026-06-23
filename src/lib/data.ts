import { Brand, Motorcycle, MotorcycleDetail, FuelBrand, OilBrand, FuelPrice } from './types';
import { brands as localBrands, motorcycles as localMotorcycles, fuelBrands as localFuelBrands, oilBrands as localOilBrands, getKnowledgeBase } from './seed-data';
import { supabase } from './supabase';

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ========== BRANDS ==========

export async function getBrands(): Promise<Brand[]> {
  if (!hasSupabase) return localBrands;

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error || !data) {
    console.error('Supabase getBrands error:', error?.message);
    return localBrands;
  }
  return data;
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  if (!hasSupabase) return localBrands.find(b => b.slug === slug);

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Supabase getBrandBySlug error:', error?.message);
    return localBrands.find(b => b.slug === slug);
  }
  return data;
}

// ========== MOTORCYCLES ==========

export async function getMotorcyclesByBrand(brandId: string): Promise<Motorcycle[]> {
  if (!hasSupabase) return localMotorcycles.filter(m => m.brand_id === brandId);

  const { data, error } = await supabase
    .from('motorcycles')
    .select('*')
    .eq('brand_id', brandId)
    .order('name');

  if (error || !data) {
    console.error('Supabase getMotorcyclesByBrand error:', error?.message);
    return localMotorcycles.filter(m => m.brand_id === brandId);
  }
  return data;
}

export async function getMotorcycleById(id: string): Promise<MotorcycleDetail | undefined> {
  if (!hasSupabase) {
    const motorcycle = localMotorcycles.find(m => m.id === id);
    if (!motorcycle) return undefined;
    const brand = localBrands.find(b => b.id === motorcycle.brand_id);
    const recommendations = getKnowledgeBase(motorcycle);
    return { ...motorcycle, brand, recommendations };
  }

  // Fetch motorcycle
  const { data: motorcycle, error: mError } = await supabase
    .from('motorcycles')
    .select('*')
    .eq('id', id)
    .single();

  if (mError || !motorcycle) {
    console.error('Supabase getMotorcycleById error:', mError?.message);
    const local = localMotorcycles.find(m => m.id === id);
    if (!local) return undefined;
    const brand = localBrands.find(b => b.id === local.brand_id);
    return { ...local, brand, recommendations: getKnowledgeBase(local) };
  }

  // Fetch brand separately (avoids FK join issues)
  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('id', motorcycle.brand_id)
    .single();
  const brand = (brandData as Brand) || undefined;

  // Fetch knowledge base
  const { data: kb, error: kbError } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('motorcycle_id', id)
    .single();

  if (kbError || !kb) {
    console.error('Supabase knowledge_base error:', kbError?.message);
    // Fallback to computed recommendations
    return { ...motorcycle, brand, recommendations: getKnowledgeBase(motorcycle as unknown as Motorcycle) };
  }

  // Fetch fuel brands
  const fuelIds = kb.fuel_brand_ids || [];
  const { data: fuels } = await supabase
    .from('fuel_brands')
    .select('*')
    .in('id', fuelIds.length > 0 ? fuelIds : ['none']);

  // Fetch oil brands (daily + touring)
  const allOilIds = [...(kb.oil_daily_ids || []), ...(kb.oil_touring_ids || [])];
  const uniqueOilIds = [...new Set(allOilIds)];
  const { data: oils } = await supabase
    .from('oil_brands')
    .select('*')
    .in('id', uniqueOilIds.length > 0 ? uniqueOilIds : ['none']);

  const recommendations = {
    id: kb.id,
    motorcycle_id: kb.motorcycle_id,
    min_octane: kb.min_octane,
    ideal_octane: kb.ideal_octane,
    fuel_brands: (fuels as FuelBrand[]) || [],
    oil_daily: (oils as OilBrand[] || []).filter(o => (kb.oil_daily_ids || []).includes(o.id)),
    oil_touring: (oils as OilBrand[] || []).filter(o => (kb.oil_touring_ids || []).includes(o.id)),
  };

  return { ...motorcycle, brand, recommendations };
}

export async function getAllMotorcycles(): Promise<Motorcycle[]> {
  if (!hasSupabase) return localMotorcycles;

  const { data, error } = await supabase
    .from('motorcycles')
    .select('*')
    .order('name');

  if (error || !data) {
    console.error('Supabase getAllMotorcycles error:', error?.message);
    return localMotorcycles;
  }
  return data;
}

// ========== UTILITY FUNCTIONS ==========

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

// ========== FUEL PRICES ==========

export async function getFuelPrices(): Promise<FuelPrice[]> {
  if (!hasSupabase) return localFuelBrands.map(f => ({
    id: `fp_${f.id}`,
    fuel_brand_id: f.id,
    price_per_liter: f.price_per_liter || 0,
    region: 'Jawa',
    last_updated: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('fuel_prices')
    .select('*, fuel_brand:fuel_brands(*)')
    .order('price_per_liter');

  if (error || !data) {
    console.error('Supabase getFuelPrices error:', error?.message);
    return [];
  }
  return data as FuelPrice[];
}

export async function getAllMotorcyclesWithBrands(): Promise<(Motorcycle & { brand?: Brand })[]> {
  if (!hasSupabase) return localMotorcycles.map(m => ({ ...m, brand: localBrands.find(b => b.id === m.brand_id) }));

  const { data: motors } = await supabase.from('motorcycles').select('*').order('name');
  const { data: brs } = await supabase.from('brands').select('*');
  if (!motors) return [];
  return motors.map(m => ({ ...(m as Motorcycle), brand: (brs as Brand[])?.find(b => b.id === m.brand_id) }));
}

export async function getKnowledgeBaseData(): Promise<{ motorcycle_id: string; ideal_octane: number }[]> {
  if (!hasSupabase) return localMotorcycles.map(m => {
    const kb = getKnowledgeBase(m);
    return { motorcycle_id: m.id, ideal_octane: kb.ideal_octane };
  });

  const { data } = await supabase.from('knowledge_base').select('motorcycle_id, ideal_octane');
  return (data || []) as { motorcycle_id: string; ideal_octane: number }[];
}

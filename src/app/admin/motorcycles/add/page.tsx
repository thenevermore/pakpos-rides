'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { uploadToCdn } from '@/lib/cdn-upload';

// Utilities for recommendations (from contexts.md / seed-data)
function getOctaneRecommendation(compressionRatio: string) {
  const ratio = parseFloat(compressionRatio);
  if (ratio < 9.0) return { min: 88, ideal: 90, fuelIds: ['fb_001', 'fb_008'] };
  if (ratio < 10.0) return { min: 90, ideal: 90, fuelIds: ['fb_001', 'fb_008'] };
  if (ratio < 11.0) return { min: 90, ideal: 92, fuelIds: ['fb_002', 'fb_004', 'fb_006'] };
  if (ratio < 12.0) return { min: 92, ideal: 95, fuelIds: ['fb_003', 'fb_005', 'fb_007'] };
  return { min: 95, ideal: 98, fuelIds: ['fb_003', 'fb_005', 'fb_007'] };
}

function getOilRecommendation(category: string) {
  if (category === 'matic') {
    return {
      dailyIds: ['ob_006', 'ob_002', 'ob_003'],
      touringIds: ['ob_102', 'ob_103', 'ob_105'],
    };
  }
  return {
    dailyIds: ['ob_001', 'ob_002', 'ob_004', 'ob_007'],
    touringIds: ['ob_101', 'ob_102', 'ob_104', 'ob_105'],
  };
}

export default function AddMotorcyclePage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    brand_id: '',
    model_code: '',
    name: '',
    latest_price: '',
    compression_ratio: '',
    engine_type: '',
    transmission_type: '',
    category: 'matic',
    image_url: '',
    affiliate_url: '',
    fuel_efficiency: '',
    fuel_tank_capacity: ''
  });

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase.from('brands').select('*').order('name');
      if (data) setBrands(data as Brand[]);
    };
    fetchBrands();
    setFormData(prev => ({ ...prev, id: 'mt_' + Math.random().toString(36).substr(2, 6) }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Auto-upload image to CDN if URL is provided
      let cdnUrl: string | null = null;
      if (formData.image_url && !formData.image_url.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(formData.image_url, 'pakpos-rides/motorcycles');
      }

      // 1. Insert Motorcycle
      const insertPayload: Record<string, any> = {
        id: formData.id,
        brand_id: formData.brand_id,
        model_code: formData.model_code,
        name: formData.name,
        latest_price: parseInt(formData.latest_price) || 0,
        compression_ratio: formData.compression_ratio,
        engine_type: formData.engine_type,
        transmission_type: formData.transmission_type,
        category: formData.category,
        image_url: formData.image_url || null,
        affiliate_url: formData.affiliate_url || null,
      };

      if (cdnUrl) insertPayload.cdn_url = cdnUrl;
      if (formData.fuel_efficiency) insertPayload.fuel_efficiency = parseFloat(formData.fuel_efficiency);
      if (formData.fuel_tank_capacity) insertPayload.fuel_tank_capacity = parseFloat(formData.fuel_tank_capacity);

      const { error: mtError } = await supabase.from('motorcycles').insert(insertPayload);

      if (mtError) {
        const msg = mtError.message || String(mtError);
        console.error('Motorcycle insert error:', msg, mtError);
        throw new Error('Gagal menyimpan motor: ' + msg);
      }

      // 2. Generate and Insert Knowledge Base
      const octaneRec = getOctaneRecommendation(formData.compression_ratio || '10.0:1');
      const oilRec = getOilRecommendation(formData.category);

      const { error: kbError } = await supabase.from('knowledge_base').insert({
        id: `kb_${formData.id}`,
        motorcycle_id: formData.id,
        min_octane: octaneRec.min,
        ideal_octane: octaneRec.ideal,
        fuel_brand_ids: octaneRec.fuelIds,
        oil_daily_ids: oilRec.dailyIds,
        oil_touring_ids: oilRec.touringIds,
      });

      if (kbError) {
        const msg = kbError.message || String(kbError);
        console.error('Knowledge base error:', msg, kbError);
        throw new Error('Gagal menyimpan rekomendasi: ' + msg);
      }

      // Success
      router.push('/admin/motorcycles');
      router.refresh();
    } catch (err: any) {
      const errMsg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : String(err)) || 'Terjadi kesalahan saat menyimpan data.';
      console.error('Submit error:', errMsg);
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/motorcycles" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Motor
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tambah Motor Baru</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Rekomendasi oli dan bensin (Knowledge Base) akan dibuat secara otomatis berdasarkan kategori dan rasio kompresi.
      </p>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Brand *</label>
            <select name="brand_id" required value={formData.brand_id} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih Brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Motorcycle ID (Auto)</label>
            <input type="text" name="id" required value={formData.id} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Model Motor *</label>
            <input type="text" name="name" required placeholder="Cth: Honda Vario 160" value={formData.name} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Model Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kode Model</label>
            <input type="text" name="model_code" required placeholder="Cth: K5M" value={formData.model_code} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori *</label>
            <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="matic">Matic</option>
              <option value="sport">Sport</option>
              <option value="naked">Naked</option>
              <option value="bebek">Bebek</option>
              <option value="trail">Trail</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Harga OTR (Rp) *</label>
            <input type="number" name="latest_price" required min="0" placeholder="27350000" value={formData.latest_price} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Compression Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rasio Kompresi *</label>
            <input type="text" name="compression_ratio" required placeholder="Cth: 12.0:1" value={formData.compression_ratio} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transmisi *</label>
            <input type="text" name="transmission_type" required placeholder="Cth: Automatic (CVT)" value={formData.transmission_type} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Engine */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tipe Mesin *</label>
            <input type="text" name="engine_type" required placeholder="Cth: 157cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, eSP+" value={formData.engine_type} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Fuel Efficiency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Efisiensi BBM (km/L)</label>
            <input type="number" name="fuel_efficiency" step="0.1" min="0" placeholder="Cth: 52.3" value={formData.fuel_efficiency} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Fuel Tank Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kapasitas Tangki (Liter)</label>
            <input type="number" name="fuel_tank_capacity" step="0.1" min="0" placeholder="Cth: 5.5" value={formData.fuel_tank_capacity} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Affiliate URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link Afiliasi (Opsional)</label>
            <input type="url" name="affiliate_url" placeholder="https://..." value={formData.affiliate_url} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL Gambar (Opsional)</label>
            <input type="url" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <Link href="/admin/motorcycles" className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Motor Baru
          </button>
        </div>
      </form>
    </div>
  );
}

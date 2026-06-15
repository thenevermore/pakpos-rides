'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/lib/types';
import { Plus, Save, Loader2, Tags } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    if (data) setBrands(data as Brand[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    if (!id) {
      setId('br_' + Math.random().toString(36).substr(2, 6));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const newBrand = {
        id,
        name,
        slug,
        country,
        logo_url: logoUrl || null
      };

      const { error: dbError } = await supabase
        .from('brands')
        .insert(newBrand);

      if (dbError) throw dbError;

      setShowAddForm(false);
      setId('');
      setName('');
      setSlug('');
      setCountry('');
      setLogoUrl('');
      
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vehicle Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage motorcycle brands in the database</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Brand Baru</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-900/50 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Brand Baru</h2>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Brand</label>
              <input type="text" required value={name} onChange={handleNameChange} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ID Unik (Auto)</label>
              <input type="text" required value={id} onChange={e => setId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Slug URL (Auto)</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Negara Asal</label>
              <input type="text" required value={country} onChange={e => setCountry(e.target.value)} placeholder="Cth: Japan, Italy" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL Logo (Opsional)</label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button disabled={isSubmitting} type="submit" className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Brand
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Slug / ID</th>
                <th className="px-6 py-4">Negara</th>
                <th className="px-6 py-4 text-right">Ditambahkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {brand.logo_url ? (
                          <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Tags className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white">{brand.slug}</span>
                      <span className="text-xs text-gray-500">{brand.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{brand.country}</td>
                  <td className="px-6 py-4 text-right">
                    {new Date(brand.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data brand.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

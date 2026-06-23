'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/lib/types';
import { Plus, Save, Loader2, Tags, Edit, Trash2, X } from 'lucide-react';
import { uploadToCdn } from '@/lib/cdn-upload';
import DataTable, { Column } from '@/components/DataTable';
import LogoImage from '@/components/LogoImage';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('name');
    if (data) setBrands(data as Brand[]);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      if (!id) setId('br_' + Math.random().toString(36).substr(2, 6));
    }
  };

  const handleEdit = (brand: Brand) => {
    setIsEditing(true);
    setShowAddForm(true);
    setId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setCountry(brand.country);
    setLogoUrl(brand.logo_url || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    if (window.confirm(`Yakin ingin menghapus brand "${brandName}"? Semua motor di bawah brand ini juga akan terhapus!`)) {
      const { error: dbError } = await supabase.from('brands').delete().eq('id', brandId);
      if (dbError) alert(dbError.message);
      else await fetchBrands();
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setId('');
    setName('');
    setSlug('');
    setCountry('');
    setLogoUrl('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      let cdnUrl: string | null = null;
      if (logoUrl && !logoUrl.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(logoUrl, 'pakpos-rides/brands');
      }
      const payload = {
        id, name, slug, country,
        logo_url: logoUrl || null,
        cdn_url: cdnUrl,
      };
      const { error: dbError } = isEditing
        ? await supabase.from('brands').update(payload).eq('id', id)
        : await supabase.from('brands').insert(payload);
      if (dbError) throw dbError;
      resetForm();
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan brand');
    }
    setIsSubmitting(false);
  };

  const columns: Column<Brand>[] = [
    {
      key: 'logo_url',
      header: 'Logo',
      sortable: false,
      render: (b) => (
        <LogoImage
          src={b.logo_url}
          cdnSrc={b.cdn_url}
          alt={b.name}
          fallbackText={b.name}
          size={36}
          bgColor="bg-gradient-to-br from-blue-500 to-indigo-700"
        />
      ),
    },
    { key: 'name', header: 'Nama Brand', render: (b) => <span className="font-semibold text-gray-900 dark:text-white">{b.name}</span> },
    { key: 'slug', header: 'Slug', render: (b) => <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">{b.slug}</span> },
    { key: 'country', header: 'Negara' },
  ];

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vehicle Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola brand kendaraan</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setIsEditing(false); setId('br_' + Math.random().toString(36).substr(2, 6)); setName(''); setSlug(''); setCountry(''); setLogoUrl(''); setError(''); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Brand
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{isEditing ? 'Edit Brand' : 'Tambah Brand Baru'}</h2>
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama *</label>
              <input type="text" value={name} onChange={handleNameChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug *</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required disabled={isEditing} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Negara *</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Logo</label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEditing ? 'Update' : 'Simpan'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-xl flex items-center gap-1.5">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={brands}
        keyField="id"
        searchFields={['name', 'country', 'slug']}
        searchPlaceholder="Cari brand..."
        actions={(brand) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => handleEdit(brand)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"><Edit className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(brand.id, brand.name)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      />
    </div>
  );
}

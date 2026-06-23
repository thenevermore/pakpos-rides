'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FuelBrand } from '@/lib/types';
import { Plus, Save, Loader2, X, Trash2 } from 'lucide-react';
import { uploadToCdn } from '@/lib/cdn-upload';
import DataTable, { Column } from '@/components/DataTable';
import LogoImage from '@/components/LogoImage';

export default function AdminFuelsPage() {
  const [fuels, setFuels] = useState<FuelBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [octane, setOctane] = useState('');
  const [producer, setProducer] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [affUrl, setAffUrl] = useState('');

  const fetchFuels = async () => {
    setLoading(true);
    const { data } = await supabase.from('fuel_brands').select('*').order('octane').order('name');
    if (data) setFuels(data as FuelBrand[]);
    setLoading(false);
  };

  useEffect(() => { fetchFuels(); }, []);

  const handleDelete = async (fuelId: string, fuelName: string) => {
    if (!window.confirm(`Hapus "${fuelName}"?`)) return;
    const { error } = await supabase.from('fuel_brands').delete().eq('id', fuelId);
    if (error) alert(error.message);
    else await fetchFuels();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setId(''); setName(''); setOctane(''); setProducer(''); setLogoUrl(''); setAffUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let cdnUrl: string | null = null;
      if (logoUrl && !logoUrl.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(logoUrl, 'pakpos-rides/fuels');
      }
      const { error } = await supabase.from('fuel_brands').insert({
        id: id || 'fb_' + Math.random().toString(36).substr(2, 6),
        name, octane: parseInt(octane), producer,
        logo_url: logoUrl || null, cdn_url: cdnUrl, affiliate_url: affUrl || null,
      });
      if (error) throw error;
      resetForm();
      await fetchFuels();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan bensin');
    } finally { setIsSubmitting(false); }
  };

  const columns: Column<FuelBrand>[] = [
    {
      key: 'logo_url', header: 'Logo', sortable: false,
      render: (f) => <LogoImage src={f.logo_url} cdnSrc={f.cdn_url} alt={f.name} fallbackText={f.name} size={36} bgColor="bg-gradient-to-br from-green-500 to-emerald-700" />,
    },
    { key: 'name', header: 'Nama Bensin', render: (f) => <span className="font-semibold text-gray-900 dark:text-white">{f.name}</span> },
    {
      key: 'octane', header: 'Oktan (RON)',
      render: (f) => <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">RON {f.octane}</span>,
      className: 'text-center',
      headerClassName: 'text-center',
    },
    { key: 'producer', header: 'Produsen' },
  ];

  if (loading && fuels.length === 0) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Fuel Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola merk bensin & link affiliate</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Bensin Baru</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Tambah Bensin Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama *</label><input type="text" required value={name} onChange={e => { setName(e.target.value); if (!id) setId('fb_' + Math.random().toString(36).substr(2, 6)); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID (Auto)</label><input type="text" value={id} onChange={e => setId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Oktan (RON) *</label><input type="number" required value={octane} onChange={e => setOctane(e.target.value)} placeholder="92" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Produsen *</label><input type="text" required value={producer} onChange={e => setProducer(e.target.value)} placeholder="Pertamina" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Logo</label><input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link Affiliate</label><input type="url" value={affUrl} onChange={e => setAffUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-70">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-xl flex items-center gap-1.5"><X className="w-4 h-4" /> Batal</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={fuels} keyField="id" searchFields={['name', 'producer', 'octane']} searchPlaceholder="Cari bensin..." actions={(fuel) => (
        <button onClick={() => handleDelete(fuel.id, fuel.name)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4" /></button>
      )} />
    </div>
  );
}

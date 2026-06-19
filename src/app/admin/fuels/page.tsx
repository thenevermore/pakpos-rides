'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FuelBrand } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink, Plus } from 'lucide-react';
import { uploadToCdn } from '@/lib/cdn-upload';

export default function AdminFuelsPage() {
  const [fuels, setFuels] = useState<FuelBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [octane, setOctane] = useState('');
  const [producer, setProducer] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFuels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fuel_brands')
      .select('*')
      .order('octane')
      .order('name');
    if (data) setFuels(data as FuelBrand[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFuels();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!id) {
      setId('fb_' + Math.random().toString(36).substr(2, 6));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Auto-upload logo to CDN
      let cdnUrl: string | null = null;
      if (logoUrl && !logoUrl.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(logoUrl, 'pakpos-rides/fuels');
      }

      const { error } = await supabase.from('fuel_brands').insert({
        id,
        name,
        octane: parseInt(octane),
        producer,
        logo_url: logoUrl || null,
        cdn_url: cdnUrl,
      });
      if (error) throw error;
      
      setShowAddForm(false);
      setId('');
      setName('');
      setOctane('');
      setProducer('');
      setLogoUrl('');
      await fetchFuels();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan bensin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (id: string, field: 'affiliate_url' | 'logo_url', val: string) => {
    setFuels(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
  };

  const save = async (fuel: FuelBrand) => {
    setSavingId(fuel.id);
    
    // Auto-upload logo to CDN if changed
    let cdnUrl: string | null = fuel.cdn_url || null;
    if (fuel.logo_url && !fuel.logo_url.includes('imagekit.io') && fuel.logo_url !== fuel.cdn_url) {
      const uploaded = await uploadToCdn(fuel.logo_url, 'pakpos-rides/fuels');
      if (uploaded) cdnUrl = uploaded;
    }

    const { error } = await supabase
      .from('fuel_brands')
      .update({ 
        affiliate_url: fuel.affiliate_url || null,
        logo_url: fuel.logo_url || null,
        cdn_url: cdnUrl,
      })
      .eq('id', fuel.id);

    if (!error) {
      setSavedId(fuel.id);
      setTimeout(() => setSavedId(null), 2000);
    }
    setSavingId(null);
  };

  if (loading && fuels.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Fuel Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate links, logos, and add new fuels</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Bensin Baru</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-900/50 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Bensin Baru</h2>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bensin *</label>
              <input type="text" required value={name} onChange={handleNameChange} placeholder="Cth: Pertamax Turbo" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Oktan (RON) *</label>
              <input type="number" required value={octane} onChange={e => setOctane(e.target.value)} placeholder="Cth: 98" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Produsen *</label>
              <input type="text" required value={producer} onChange={e => setProducer(e.target.value)} placeholder="Cth: Pertamina" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ID Unik (Auto)</label>
              <input type="text" required value={id} onChange={e => setId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL Logo (Opsional)</label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button disabled={isSubmitting} type="submit" className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Bensin
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {fuels.map(fuel => (
          <div key={fuel.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{fuel.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    RON {fuel.octane}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{fuel.producer}</p>
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={fuel.logo_url || ''}
                  onChange={e => updateField(fuel.id, 'logo_url', e.target.value)}
                  placeholder="URL Logo Gambar (https://...)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <input
                  type="url"
                  value={fuel.affiliate_url || ''}
                  onChange={e => updateField(fuel.id, 'affiliate_url', e.target.value)}
                  placeholder="URL Link Affiliate (https://...)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  onClick={() => save(fuel)}
                  disabled={savingId === fuel.id}
                  className={`px-4 py-2 h-[42px] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    savedId === fuel.id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {savingId === fuel.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedId === fuel.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savedId === fuel.id ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

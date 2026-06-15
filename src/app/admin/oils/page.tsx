'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OilBrand } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink, Plus } from 'lucide-react';

export default function AdminOilsPage() {
  const [oils, setOils] = useState<OilBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [baseType, setBaseType] = useState('');
  const [viscosity, setViscosity] = useState('');
  const [certification, setCertification] = useState('');
  const [usageType, setUsageType] = useState('daily');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOils = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('oil_brands')
      .select('*')
      .order('usage_type')
      .order('name');
    if (data) setOils(data as OilBrand[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOils();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!id) {
      setId('ob_' + Math.random().toString(36).substr(2, 6));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('oil_brands').insert({
        id,
        name,
        base_type: baseType,
        viscosity,
        certification,
        usage_type: usageType,
        logo_url: logoUrl || null
      });
      if (error) throw error;
      
      setShowAddForm(false);
      setId('');
      setName('');
      setBaseType('');
      setViscosity('');
      setCertification('');
      setLogoUrl('');
      await fetchOils();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan oli');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (id: string, field: 'affiliate_url' | 'logo_url', val: string) => {
    setOils(prev => prev.map(o => o.id === id ? { ...o, [field]: val } : o));
  };

  const save = async (oil: OilBrand) => {
    setSavingId(oil.id);
    const { error } = await supabase
      .from('oil_brands')
      .update({ 
        affiliate_url: oil.affiliate_url || null,
        logo_url: oil.logo_url || null
      })
      .eq('id', oil.id);

    if (!error) {
      setSavedId(oil.id);
      setTimeout(() => setSavedId(null), 2000);
    }
    setSavingId(null);
  };

  if (loading && oils.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const dailyOils = oils.filter(o => o.usage_type === 'daily');
  const touringOils = oils.filter(o => o.usage_type === 'touring');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Oil Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate links, logos, and add new oils</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Oli Baru</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-900/50 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Oli Baru</h2>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Oli *</label>
              <input type="text" required value={name} onChange={handleNameChange} placeholder="Cth: Motul 5100" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ID Unik (Auto)</label>
              <input type="text" required value={id} onChange={e => setId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Dasar (Base Type) *</label>
              <input type="text" required value={baseType} onChange={e => setBaseType(e.target.value)} placeholder="Cth: Full Synthetic" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Viskositas (SAE) *</label>
              <input type="text" required value={viscosity} onChange={e => setViscosity(e.target.value)} placeholder="Cth: 10W-40" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sertifikasi *</label>
              <input type="text" required value={certification} onChange={e => setCertification(e.target.value)} placeholder="Cth: JASO MA2" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Penggunaan *</label>
              <select required value={usageType} onChange={e => setUsageType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="daily">Daily / Harian</option>
                <option value="touring">Touring / Jarak Jauh</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL Logo (Opsional)</label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button disabled={isSubmitting} type="submit" className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Oli
              </button>
            </div>
          </form>
        </div>
      )}

      <OilSection title="Daily / Commuting" oils={dailyOils} savingId={savingId} savedId={savedId} onUpdate={updateField} onSave={save} />
      <div className="my-8 border-t border-gray-200 dark:border-gray-800" />
      <OilSection title="Touring / Long Distance" oils={touringOils} savingId={savingId} savedId={savedId} onUpdate={updateField} onSave={save} />
    </div>
  );
}

function OilSection({ title, oils, savingId, savedId, onUpdate, onSave }: {
  title: string;
  oils: OilBrand[];
  savingId: string | null;
  savedId: string | null;
  onUpdate: (id: string, field: 'affiliate_url' | 'logo_url', val: string) => void;
  onSave: (oil: OilBrand) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {oils.map(oil => (
          <div key={oil.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{oil.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {oil.base_type} &middot; {oil.viscosity} &middot; {oil.certification}
                </p>
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={oil.logo_url || ''}
                  onChange={e => onUpdate(oil.id, 'logo_url', e.target.value)}
                  placeholder="URL Logo Gambar (https://...)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <input
                  type="url"
                  value={oil.affiliate_url || ''}
                  onChange={e => onUpdate(oil.id, 'affiliate_url', e.target.value)}
                  placeholder="URL Link Affiliate (https://...)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  onClick={() => onSave(oil)}
                  disabled={savingId === oil.id}
                  className={`px-4 py-2 h-[42px] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    savedId === oil.id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {savingId === oil.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedId === oil.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savedId === oil.id ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

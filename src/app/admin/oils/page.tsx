'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OilBrand } from '@/lib/types';
import { Plus, Save, Loader2, X, Trash2, Edit2, Check } from 'lucide-react';
import { uploadToCdn } from '@/lib/cdn-upload';
import DataTable, { Column } from '@/components/DataTable';
import LogoImage from '@/components/LogoImage';

type EditForm = {
  name: string;
  base_type: string;
  viscosity: string;
  certification: string;
  usage_type: 'daily' | 'touring';
  logo_url: string;
  affiliate_url: string;
};

const emptyEdit: EditForm = { name: '', base_type: '', viscosity: '', certification: '', usage_type: 'daily', logo_url: '', affiliate_url: '' };

export default function AdminOilsPage() {
  const [oils, setOils] = useState<OilBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [baseType, setBaseType] = useState('');
  const [viscosity, setViscosity] = useState('');
  const [certification, setCertification] = useState('');
  const [usageType, setUsageType] = useState<'daily' | 'touring'>('daily');
  const [logoUrl, setLogoUrl] = useState('');
  const [affUrl, setAffUrl] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fetchOils = async () => {
    setLoading(true);
    const { data } = await supabase.from('oil_brands').select('*').order('usage_type').order('name');
    if (data) setOils(data as OilBrand[]);
    setLoading(false);
  };

  useEffect(() => { fetchOils(); }, []);

  const handleDelete = async (oilId: string, oilName: string) => {
    if (!window.confirm(`Hapus "${oilName}"?`)) return;
    const { error } = await supabase.from('oil_brands').delete().eq('id', oilId);
    if (error) alert(error.message);
    else await fetchOils();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setId(''); setName(''); setBaseType(''); setViscosity(''); setCertification(''); setLogoUrl(''); setAffUrl('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let cdnUrl: string | null = null;
      if (logoUrl && !logoUrl.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(logoUrl, 'pakpos-rides/oils');
      }
      const { error } = await supabase.from('oil_brands').insert({
        id: id || 'ob_' + Math.random().toString(36).substr(2, 6),
        name, base_type: baseType, viscosity, certification, usage_type: usageType,
        logo_url: logoUrl || null, cdn_url: cdnUrl, affiliate_url: affUrl || null,
      });
      if (error) throw error;
      resetForm();
      await fetchOils();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan oli');
    } finally { setIsSubmitting(false); }
  };

  const startEdit = (oil: OilBrand) => {
    setEditingId(oil.id);
    setEditForm({
      name: oil.name,
      base_type: oil.base_type,
      viscosity: oil.viscosity,
      certification: oil.certification,
      usage_type: oil.usage_type,
      logo_url: oil.logo_url || '',
      affiliate_url: oil.affiliate_url || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(emptyEdit); };

  const handleEditSave = async (oilId: string) => {
    setSavingId(oilId);
    try {
      let cdnUrl: string | null = null;
      if (editForm.logo_url && !editForm.logo_url.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(editForm.logo_url, 'pakpos-rides/oils');
      }
      const payload: any = {
        name: editForm.name,
        base_type: editForm.base_type,
        viscosity: editForm.viscosity,
        certification: editForm.certification,
        usage_type: editForm.usage_type,
        logo_url: editForm.logo_url || null,
        affiliate_url: editForm.affiliate_url || null,
      };
      if (cdnUrl) payload.cdn_url = cdnUrl;
      const { error } = await supabase.from('oil_brands').update(payload).eq('id', oilId);
      if (error) throw error;
      setSavedId(oilId);
      setTimeout(() => setSavedId(null), 2000);
      cancelEdit();
      await fetchOils();
    } catch (err: any) {
      alert(err.message || 'Gagal update');
    } finally { setSavingId(null); }
  };

  const usageColors: Record<string, string> = {
    daily: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    touring: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const columns: Column<OilBrand>[] = [
    {
      key: 'logo_url', header: 'Logo', sortable: false,
      render: (o) => <LogoImage src={o.logo_url} cdnSrc={o.cdn_url} alt={o.name} fallbackText={o.name} size={36} bgColor="bg-gradient-to-br from-amber-500 to-orange-700" />,
    },
    { key: 'name', header: 'Nama Oli', render: (o) => <span className="font-semibold text-gray-900 dark:text-white">{o.name}</span> },
    { key: 'viscosity', header: 'Viskositas' },
    { key: 'base_type', header: 'Base Type' },
    { key: 'certification', header: 'Sertifikasi' },
    {
      key: 'usage_type', header: 'Penggunaan',
      render: (o) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${usageColors[o.usage_type] || ''}`}>
          {o.usage_type === 'daily' ? 'Harian' : 'Touring'}
        </span>
      ),
    },
  ];

  if (loading && oils.length === 0) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Oil Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola merk oli & link affiliate</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          {showAddForm ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Oli Baru</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Tambah Oli Baru</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama *</label><input type="text" required value={name} onChange={e => { setName(e.target.value); if (!id) setId('ob_' + Math.random().toString(36).substr(2, 6)); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID (Auto)</label><input type="text" value={id} onChange={e => setId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Base Type *</label><input type="text" required value={baseType} onChange={e => setBaseType(e.target.value)} placeholder="Full Synthetic" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Viskositas *</label><input type="text" required value={viscosity} onChange={e => setViscosity(e.target.value)} placeholder="10W-40" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sertifikasi *</label><input type="text" required value={certification} onChange={e => setCertification(e.target.value)} placeholder="JASO MA2" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Penggunaan *</label><select value={usageType} onChange={e => setUsageType(e.target.value as 'daily' | 'touring')} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"><option value="daily">Daily</option><option value="touring">Touring</option></select></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Logo</label><input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link Affiliate</label><input type="url" value={affUrl} onChange={e => setAffUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-70">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-xl flex items-center gap-1.5"><X className="w-4 h-4" /> Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Inline Edit Table */}
      {editingId ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Edit Oli</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama</label><input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Base Type</label><input type="text" value={editForm.base_type} onChange={e => setEditForm({ ...editForm, base_type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Viskositas</label><input type="text" value={editForm.viscosity} onChange={e => setEditForm({ ...editForm, viscosity: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sertifikasi</label><input type="text" value={editForm.certification} onChange={e => setEditForm({ ...editForm, certification: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Penggunaan</label><select value={editForm.usage_type} onChange={e => setEditForm({ ...editForm, usage_type: e.target.value as 'daily' | 'touring' })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"><option value="daily">Daily</option><option value="touring">Touring</option></select></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Logo</label><input type="url" value={editForm.logo_url} onChange={e => setEditForm({ ...editForm, logo_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link Affiliate</label><input type="url" value={editForm.affiliate_url} onChange={e => setEditForm({ ...editForm, affiliate_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleEditSave(editingId)} disabled={savingId === editingId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-70">
              {savingId === editingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-xl flex items-center gap-1.5"><X className="w-4 h-4" /> Batal</button>
          </div>
        </div>
      ) : null}

      <DataTable columns={columns} data={oils} keyField="id" searchFields={['name', 'viscosity', 'base_type', 'certification', 'usage_type']} searchPlaceholder="Cari oli..." actions={(oil) => (
        <div className="flex items-center gap-1">
          {editingId !== oil.id && (
            <button onClick={() => startEdit(oil)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"><Edit2 className="w-4 h-4" /></button>
          )}
          {savedId === oil.id && <span className="p-1.5 text-green-600"><Check className="w-4 h-4" /></span>}
          <button onClick={() => handleDelete(oil.id, oil.name)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4" /></button>
        </div>
      )} />
    </div>
  );
}

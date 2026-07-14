'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TouringGear } from '@/lib/types';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { uploadToCdn } from '@/lib/cdn-upload';

export default function AdminGearsPage() {
  const [gears, setGears] = useState<TouringGear[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    category: 'Helm',
    name: '',
    description: '',
    price_estimation: '',
    affiliate_url: '',
    image_url: '',
    cdn_url: '',
    admin_review: ''
  });

  const fetchGears = async () => {
    setLoading(true);
    const { data } = await supabase.from('touring_gears').select('*').order('created_at', { ascending: false });
    if (data) setGears(data as TouringGear[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchGears();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let cdnUrl = formData.cdn_url || null;
      if (formData.image_url && !formData.image_url.includes('imagekit.io')) {
        cdnUrl = await uploadToCdn(formData.image_url, 'pakpos-rides/gears');
      }

      if (formData.id) {
        // Update
        const { error } = await supabase.from('touring_gears').update({
          category: formData.category,
          name: formData.name,
          description: formData.description,
          price_estimation: formData.price_estimation,
          affiliate_url: formData.affiliate_url,
          image_url: formData.image_url,
          cdn_url: cdnUrl,
          admin_review: formData.admin_review
        }).eq('id', formData.id);
        if (error) throw error;
      } else {
        // Insert
        const insertData = { ...formData, id: `gear_${Math.random().toString(36).substr(2, 6)}`, cdn_url: cdnUrl };
        const { error } = await supabase.from('touring_gears').insert(insertData);
        if (error) throw error;
      }
      await fetchGears();
      setShowForm(false);
      setFormData({ id: '', category: 'Helm', name: '', description: '', price_estimation: '', affiliate_url: '', image_url: '', cdn_url: '', admin_review: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gear: TouringGear) => {
    setFormData({
      id: gear.id,
      category: gear.category,
      name: gear.name,
      description: gear.description || '',
      price_estimation: gear.price_estimation || '',
      affiliate_url: gear.affiliate_url || '',
      image_url: gear.image_url || '',
      cdn_url: gear.cdn_url || '',
      admin_review: gear.admin_review || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus gear "${name}"?`)) {
      await supabase.from('touring_gears').delete().eq('id', id);
      fetchGears();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Gear Rekomendasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola daftar gear touring untuk link afiliasi</p>
        </div>
        <button
          onClick={() => {
            setFormData({ id: '', category: 'Helm', name: '', description: '', price_estimation: '', affiliate_url: '', image_url: '', cdn_url: '', admin_review: '' });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Gear
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{formData.id ? 'Edit Gear' : 'Tambah Gear Baru'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama Produk</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent">
                <option value="Helm">Helm</option>
                <option value="Jaket">Jaket</option>
                <option value="Sarung Tangan">Sarung Tangan</option>
                <option value="Sepatu">Sepatu</option>
                <option value="Jas Hujan">Jas Hujan</option>
                <option value="Intercom">Intercom</option>
                <option value="Tas">Tank/Tail/Side Bag</option>
                <option value="Box">Top/Side Box</option>
                <option value="Aksesoris Lain">Aksesoris Lain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Estimasi Harga</label>
              <input type="text" placeholder="Rp 500.000" value={formData.price_estimation} onChange={e => setFormData({ ...formData, price_estimation: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Image URL</label>
              <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Affiliate URL (Tokopedia/Shopee/Tiktok)</label>
              <input type="text" value={formData.affiliate_url} onChange={e => setFormData({ ...formData, affiliate_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Deskripsi Produk (Bisa Bullet List)</label>
              <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Review Admin / Alasan Rekomendasi</label>
              <textarea rows={3} placeholder="Tuliskan pengalaman jujur kenapa gear ini layak direkomendasikan..." value={formData.admin_review} onChange={e => setFormData({ ...formData, admin_review: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gears.map(gear => (
            <div key={gear.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 p-2">
                {(gear.cdn_url || gear.image_url) && <img src={gear.cdn_url || gear.image_url!} alt={gear.name} className="w-full h-full object-contain" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-bold mb-1">{gear.category}</p>
                <h3 className="font-bold text-sm mb-1">{gear.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{gear.price_estimation}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(gear)} className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(gear.id, gear.name)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

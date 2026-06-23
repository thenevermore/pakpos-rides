'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FuelBrand, FuelPrice } from '@/lib/types';
import { Plus, Save, Trash2, Check, Loader2, X, Edit2 } from 'lucide-react';

export default function AdminFuelPricesPage() {
  const [prices, setPrices] = useState<(FuelPrice & { fuel_brand?: FuelBrand })[]>([]);
  const [fuelBrands, setFuelBrands] = useState<FuelBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Add/Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fuel_brand_id: '', price_per_liter: '', region: 'Jawa' });

  const fetchData = async () => {
    setLoading(true);
    const { data: fb } = await supabase.from('fuel_brands').select('*').order('name');
    if (fb) setFuelBrands(fb as FuelBrand[]);

    const { data: fp } = await supabase
      .from('fuel_prices')
      .select('*, fuel_brand:fuel_brands(*)')
      .order('price_per_liter');
    if (fp) setPrices(fp as (FuelPrice & { fuel_brand?: FuelBrand })[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (id?: string) => {
    if (!form.fuel_brand_id || !form.price_per_liter) return;
    const targetId = id || `fp_${Date.now()}`;
    setSaving(targetId);

    const payload = {
      id: targetId,
      fuel_brand_id: form.fuel_brand_id,
      price_per_liter: parseInt(form.price_per_liter),
      region: form.region || 'Jawa',
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase.from('fuel_prices').upsert(payload);
    if (!error) {
      setSaved(targetId);
      setTimeout(() => setSaved(null), 2000);
      setShowAdd(false);
      setEditingId(null);
      setForm({ fuel_brand_id: '', price_per_liter: '', region: 'Jawa' });
      await fetchData();
    } else {
      alert('Error: ' + error.message);
    }
    setSaving(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus harga untuk "${name}"?`)) return;
    const { error } = await supabase.from('fuel_prices').delete().eq('id', id);
    if (!error) await fetchData();
    else alert('Error: ' + error.message);
  };

  const startEdit = (price: FuelPrice & { fuel_brand?: FuelBrand }) => {
    setEditingId(price.id);
    setForm({
      fuel_brand_id: price.fuel_brand_id,
      price_per_liter: price.price_per_liter.toString(),
      region: price.region,
    });
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Fuel Prices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola harga bensin per liter untuk setiap merk & varian</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setForm({ fuel_brand_id: '', price_per_liter: '', region: 'Jawa' }); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Harga
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Tambah Harga Bensin Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Merk Bensin *</label>
              <select value={form.fuel_brand_id} onChange={e => setForm({ ...form, fuel_brand_id: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                <option value="">Pilih...</option>
                {fuelBrands.map(fb => <option key={fb.id} value={fb.id}>{fb.name} ({fb.producer})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Harga per Liter (Rp) *</label>
              <input type="number" value={form.price_per_liter} onChange={e => setForm({ ...form, price_per_liter: e.target.value })} placeholder="13400" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wilayah</label>
              <input type="text" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Jawa" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave()} disabled={saving !== null} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium rounded-xl flex items-center gap-1.5">
              <X className="w-4 h-4" /> Batal
            </button>
          </div>
        </div>
      )}

      {/* Prices Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Merk Bensin</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producer</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Oktan</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga/Liter</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wilayah</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {prices.map(price => (
              <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {editingId === price.id ? (
                  <>
                    <td className="px-5 py-3" colSpan={4}>
                      <div className="flex items-center gap-3">
                        <select value={form.fuel_brand_id} onChange={e => setForm({ ...form, fuel_brand_id: e.target.value })} className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                          {fuelBrands.map(fb => <option key={fb.id} value={fb.id}>{fb.name}</option>)}
                        </select>
                        <input type="number" value={form.price_per_liter} onChange={e => setForm({ ...form, price_per_liter: e.target.value })} className="w-28 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <input type="text" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{price.last_updated ? new Date(price.last_updated).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleSave(price.id)} disabled={saving === price.id} className={`p-1.5 rounded-lg ${saved === price.id ? 'text-green-600' : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
                          {saving === price.id ? <Loader2 className="w-4 h-4 animate-spin" /> : saved === price.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white">{price.fuel_brand?.name || 'Unknown'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{price.fuel_brand?.producer || '-'}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-900 dark:text-white">{price.fuel_brand?.octane || '-'}</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-gray-900 dark:text-white">Rp {price.price_per_liter.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{price.region}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{price.last_updated ? new Date(price.last_updated).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(price)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(price.id, price.fuel_brand?.name || '')} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {prices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Belum ada data harga bensin. Klik "Tambah Harga" untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

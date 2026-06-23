'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Motorcycle, Brand } from '@/lib/types';
import { Save, Check, Loader2, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '@/components/DataTable';

export default function AdminMotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState<(Motorcycle & { brand?: Brand })[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [editingAff, setEditingAff] = useState<string | null>(null);
  const [affValue, setAffValue] = useState('');

  const fetchMotorcycles = async () => {
    setLoading(true);
    const { data: brs } = await supabase.from('brands').select('*');
    if (brs) setBrands(brs as Brand[]);

    const { data } = await supabase
      .from('motorcycles')
      .select('*')
      .order('name');
    if (data) {
      setMotorcycles((data as Motorcycle[]).map(m => ({
        ...m,
        brand: brs?.find(b => b.id === m.brand_id) as Brand | undefined,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchMotorcycles(); }, []);

  const startEditAff = (motor: Motorcycle) => {
    setEditingAff(motor.id);
    setAffValue(motor.affiliate_url || '');
  };

  const saveAff = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from('motorcycles')
      .update({ affiliate_url: affValue || null })
      .eq('id', id);
    if (!error) {
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
      setMotorcycles(prev => prev.map(m => m.id === id ? { ...m, affiliate_url: affValue || null } : m));
      setEditingAff(null);
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus "${name}"?`)) {
      const { error } = await supabase.from('motorcycles').delete().eq('id', id);
      if (!error) await fetchMotorcycles();
      else alert(error.message);
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const categoryColors: Record<string, string> = {
    sport: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    matic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    bebek: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    naked: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    trail: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const columns: Column<Motorcycle & { brand?: Brand }>[] = [
    {
      key: 'name',
      header: 'Nama Motor',
      render: (m) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{m.brand?.name || ''} &middot; {m.model_code}</p>
        </div>
      ),
    },
    {
      key: 'latest_price',
      header: 'Harga',
      render: (m) => <span className="font-medium">{formatPrice(m.latest_price)}</span>,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (m) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[m.category] || 'bg-gray-100 text-gray-700'}`}>
          {m.category?.charAt(0).toUpperCase() + m.category?.slice(1)}
        </span>
      ),
    },
    {
      key: 'compression_ratio',
      header: 'Kompresi',
      render: (m) => <span className="text-sm">{m.compression_ratio}</span>,
    },
    {
      key: 'affiliate_url',
      header: 'Affiliate',
      sortable: false,
      render: (m) => editingAff === m.id ? (
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={affValue}
            onChange={e => setAffValue(e.target.value)}
            placeholder="https://..."
            className="w-40 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
            autoFocus
          />
          <button onClick={() => saveAff(m.id)} disabled={savingId === m.id} className={`p-1 rounded ${savedId === m.id ? 'text-green-600' : 'text-blue-600'}`}>
            {savingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <button onClick={() => startEditAff(m)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[120px]">
          {m.affiliate_url ? 'Edit Link' : 'Tambah Link'}
        </button>
      ),
    },
  ];

  if (loading && motorcycles.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Motorcycles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola data sepeda motor & link affiliate</p>
        </div>
        <Link
          href="/admin/motorcycles/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Tambah Motor Baru
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={motorcycles}
        keyField="id"
        searchFields={['name', 'model_code', 'category', 'compression_ratio']}
        searchPlaceholder="Cari motor, kode model, kategori..."
        pageSize={15}
        actions={(motor) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/motorcycles/${motor.id}/edit`}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDelete(motor.id, motor.name)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}

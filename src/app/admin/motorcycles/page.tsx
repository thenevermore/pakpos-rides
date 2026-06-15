'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Motorcycle } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminMotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fetchMotorcycles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('motorcycles')
      .select('*, brand:brands(name)')
      .order('name');
    if (data) setMotorcycles(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const updateAffiliateUrl = (id: string, url: string) => {
    setMotorcycles(prev => prev.map(m => m.id === id ? { ...m, affiliate_url: url } : m));
  };

  const save = async (motorcycle: Motorcycle) => {
    setSavingId(motorcycle.id);
    const { error } = await supabase
      .from('motorcycles')
      .update({ affiliate_url: motorcycle.affiliate_url || null })
      .eq('id', motorcycle.id);

    if (!error) {
      setSavedId(motorcycle.id);
      setTimeout(() => setSavedId(null), 2000);
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus sepeda motor "${name}"? Data rekomendasi (Knowledge Base) untuk motor ini juga akan terhapus otomatis.`)) {
      try {
        const { error } = await supabase.from('motorcycles').delete().eq('id', id);
        if (error) throw error;
        await fetchMotorcycles();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus sepeda motor');
      }
    }
  };

  if (loading && motorcycles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group by category for better UI organization
  const groupedMotorcycles = motorcycles.reduce((acc, motor) => {
    const category = motor.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(motor);
    return acc;
  }, {} as Record<string, Motorcycle[]>);

  const categories = Object.keys(groupedMotorcycles).sort();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Motorcycles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate links and add new motorcycles</p>
        </div>
        <Link
          href="/admin/motorcycles/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Tambah Motor Baru
        </Link>
      </div>

      {categories.map((category, index) => (
        <div key={category}>
          <MotorcycleSection
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            motorcycles={groupedMotorcycles[category]}
            savingId={savingId}
            savedId={savedId}
            onUpdate={updateAffiliateUrl}
            onSave={save}
            onDelete={handleDelete}
          />
          {index < categories.length - 1 && (
            <div className="my-8 border-t border-gray-200 dark:border-gray-800" />
          )}
        </div>
      ))}
      
      {categories.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500">
          Belum ada data sepeda motor.
        </div>
      )}
    </div>
  );
}

function MotorcycleSection({ title, motorcycles, savingId, savedId, onUpdate, onSave, onDelete }: {
  title: string;
  motorcycles: Motorcycle[];
  savingId: string | null;
  savedId: string | null;
  onUpdate: (id: string, url: string) => void;
  onSave: (motor: Motorcycle) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {motorcycles.map(motor => (
          <div key={motor.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{motor.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {motor.brand?.name || ''} &middot; {motor.model_code} &middot; Rp {motor.latest_price.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="url"
                  value={motor.affiliate_url || ''}
                  onChange={e => onUpdate(motor.id, e.target.value)}
                  placeholder="Link Affiliate (https://...)"
                  className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => onSave(motor)}
                  disabled={savingId === motor.id}
                  className={`px-3 py-2 h-[38px] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    savedId === motor.id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title="Simpan Affiliate Link"
                >
                  {savingId === motor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedId === motor.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </button>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                
                <Link
                  href={`/admin/motorcycles/${motor.id}/edit`}
                  className="p-2 h-[38px] w-[38px] flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Edit Motor"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => onDelete(motor.id, motor.name)}
                  className="p-2 h-[38px] w-[38px] flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Hapus Motor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

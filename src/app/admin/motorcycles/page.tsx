'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Motorcycle } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink } from 'lucide-react';

export default function AdminMotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMotorcycles = async () => {
      const { data } = await supabase
        .from('motorcycles')
        .select('*, brand:brands(name)')
        .order('name');
      if (data) setMotorcycles(data as any[]);
      setLoading(false);
    };
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

  if (loading) {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Motorcycles</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage affiliate links for motorcycle products</p>

      {categories.map((category, index) => (
        <div key={category}>
          <MotorcycleSection
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            motorcycles={groupedMotorcycles[category]}
            savingId={savingId}
            savedId={savedId}
            onUpdate={updateAffiliateUrl}
            onSave={save}
          />
          {index < categories.length - 1 && (
            <div className="my-8 border-t border-gray-200 dark:border-gray-800" />
          )}
        </div>
      ))}
    </div>
  );
}

function MotorcycleSection({ title, motorcycles, savingId, savedId, onUpdate, onSave }: {
  title: string;
  motorcycles: Motorcycle[];
  savingId: string | null;
  savedId: string | null;
  onUpdate: (id: string, url: string) => void;
  onSave: (motor: Motorcycle) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {motorcycles.map(motor => (
          <div key={motor.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{motor.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {motor.brand?.name || ''} &middot; {motor.model_code} &middot; Rp {motor.latest_price.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="url"
                  value={motor.affiliate_url || ''}
                  onChange={e => onUpdate(motor.id, e.target.value)}
                  placeholder="https://affiliate-link.com/..."
                  className="w-full sm:w-80 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => onSave(motor)}
                  disabled={savingId === motor.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    savedId === motor.id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {savingId === motor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedId === motor.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savedId === motor.id ? 'Saved' : 'Save'}
                </button>
                {motor.affiliate_url && (
                  <a
                    href={motor.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

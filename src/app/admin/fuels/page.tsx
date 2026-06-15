'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FuelBrand } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink } from 'lucide-react';

export default function AdminFuelsPage() {
  const [fuels, setFuels] = useState<FuelBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFuels = async () => {
      const { data } = await supabase
        .from('fuel_brands')
        .select('*')
        .order('octane')
        .order('name');
      if (data) setFuels(data as FuelBrand[]);
      setLoading(false);
    };
    fetchFuels();
  }, []);

  const updateAffiliateUrl = (id: string, url: string) => {
    setFuels(prev => prev.map(f => f.id === id ? { ...f, affiliate_url: url } : f));
  };

  const save = async (fuel: FuelBrand) => {
    setSavingId(fuel.id);
    const { error } = await supabase
      .from('fuel_brands')
      .update({ affiliate_url: fuel.affiliate_url || null })
      .eq('id', fuel.id);

    if (!error) {
      setSavedId(fuel.id);
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Fuel Brands</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage affiliate links for fuel products</p>

      <div className="space-y-3">
        {fuels.map(fuel => (
          <div key={fuel.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{fuel.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    RON {fuel.octane}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{fuel.producer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="url"
                  value={fuel.affiliate_url || ''}
                  onChange={e => updateAffiliateUrl(fuel.id, e.target.value)}
                  placeholder="https://affiliate-link.com/..."
                  className="w-full sm:w-80 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => save(fuel)}
                  disabled={savingId === fuel.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
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
                {fuel.affiliate_url && (
                  <a
                    href={fuel.affiliate_url}
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

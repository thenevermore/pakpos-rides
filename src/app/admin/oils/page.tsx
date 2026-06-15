'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OilBrand } from '@/lib/types';
import { Save, Check, Loader2, ExternalLink } from 'lucide-react';

export default function AdminOilsPage() {
  const [oils, setOils] = useState<OilBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOils = async () => {
      const { data } = await supabase
        .from('oil_brands')
        .select('*')
        .order('usage_type')
        .order('name');
      if (data) setOils(data as OilBrand[]);
      setLoading(false);
    };
    fetchOils();
  }, []);

  const updateAffiliateUrl = (id: string, url: string) => {
    setOils(prev => prev.map(o => o.id === id ? { ...o, affiliate_url: url } : o));
  };

  const save = async (oil: OilBrand) => {
    setSavingId(oil.id);
    const { error } = await supabase
      .from('oil_brands')
      .update({ affiliate_url: oil.affiliate_url || null })
      .eq('id', oil.id);

    if (!error) {
      setSavedId(oil.id);
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

  const dailyOils = oils.filter(o => o.usage_type === 'daily');
  const touringOils = oils.filter(o => o.usage_type === 'touring');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Oil Brands</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage affiliate links for oil products</p>

      <OilSection title="Daily / Commuting" oils={dailyOils} savingId={savingId} savedId={savedId} onUpdate={updateAffiliateUrl} onSave={save} />
      <div className="my-8 border-t border-gray-200 dark:border-gray-800" />
      <OilSection title="Touring / Long Distance" oils={touringOils} savingId={savingId} savedId={savedId} onUpdate={updateAffiliateUrl} onSave={save} />
    </div>
  );
}

function OilSection({ title, oils, savingId, savedId, onUpdate, onSave }: {
  title: string;
  oils: OilBrand[];
  savingId: string | null;
  savedId: string | null;
  onUpdate: (id: string, url: string) => void;
  onSave: (oil: OilBrand) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {oils.map(oil => (
          <div key={oil.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{oil.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {oil.base_type} &middot; {oil.viscosity} &middot; {oil.certification}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="url"
                  value={oil.affiliate_url || ''}
                  onChange={e => onUpdate(oil.id, e.target.value)}
                  placeholder="https://affiliate-link.com/..."
                  className="w-full sm:w-80 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => onSave(oil)}
                  disabled={savingId === oil.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
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
                {oil.affiliate_url && (
                  <a
                    href={oil.affiliate_url}
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

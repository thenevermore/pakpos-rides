import { supabase } from '@/lib/supabase';
import { TouringGear } from '@/lib/types';
import { Shield, ShoppingBag, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Rekomendasi Gear Touring - PakPOS Rides',
  description: 'Temukan rekomendasi helm, jaket, dan perlengkapan touring terbaik untuk perjalanan Kamu.',
};

export default async function GearsPage() {
  const { data: gears } = await supabase
    .from('touring_gears')
    .select('*')
    .order('category', { ascending: true });

  const touringGears = (gears || []) as TouringGear[];

  // Group by category
  const gearsByCategory = touringGears.reduce((acc, gear) => {
    if (!acc[gear.category]) acc[gear.category] = [];
    acc[gear.category].push(gear);
    return acc;
  }, {} as Record<string, TouringGear[]>);

  const formatRupiah = (price: string | null) => {
    if (!price) return price;
    const num = parseInt(price.replace(/\D/g, ''), 10);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Gear Touring Pilihan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Keselamatan dan kenyamanan adalah nomor satu saat <b>Riding</b>. Berikut adalah perlengkapan yang direkomendasikan oleh tim PakPOS.
        </p>
      </div>

      {Object.keys(gearsByCategory).length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada gear yang ditambahkan.</div>
      ) : (
        <div className="space-y-16">
          {Object.entries(gearsByCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(gear => (
                  <div key={gear.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-4 p-4 flex items-center justify-center relative overflow-hidden">
                      {(gear.cdn_url || gear.image_url) ? (
                        <img src={gear.cdn_url || gear.image_url!} alt={gear.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{gear.name}</h3>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {formatRupiah(gear.price_estimation)}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 relative overflow-hidden">
                        <div className="line-clamp-4 whitespace-pre-line">
                          {gear.description}
                        </div>
                      </div>
                      
                      {gear.admin_review && (
                        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded-r-xl">
                          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">💡 Review PakPOS:</p>
                          <p className="text-sm text-blue-900/80 dark:text-blue-200/80 italic leading-snug whitespace-pre-line">
                            "{gear.admin_review}"
                          </p>
                        </div>
                      )}

                      <a
                        href={gear.affiliate_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        Lihat Detail <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { supabase } from '@/lib/supabase';
import { TouringRoute, TouringGear } from '@/lib/types';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Navigation, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import RouteReportForm from '@/components/RouteReportForm';

export const revalidate = 0; // Disable cache so new routes appear instantly

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase.from('touring_routes').select('title, origin, destination').eq('slug', params.slug).single();
  if (!data) return { title: 'Rute Tidak Ditemukan' };
  return {
    title: `${data.title} - Rute Touring PakPOS`,
    description: `Panduan touring lengkap dari ${data.origin} menuju ${data.destination}.`,
  };
}

export default async function RouteDetailPage({ params }: { params: { slug: string } }) {
  const { data: routeData, error } = await supabase
    .from('touring_routes')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error) {
    return <div className="p-20 text-center text-red-500 font-bold">Database Error: {error.message} (Code: {error.code})</div>;
  }

  if (!routeData) {
    notFound();
  }

  const route = routeData as TouringRoute;

  // Check if article has shortcodes
  const shortcodeRegex = /\[GEARS:(.*?)\]/g;
  const matches = [...route.article_content.matchAll(shortcodeRegex)];
  let specificGearIds: string[] = [];
  
  if (matches.length > 0) {
    specificGearIds = matches.map(m => m[1].split(',')).flat();
  }

  // Fetch gears
  let gears: TouringGear[] = [];
  if (specificGearIds.length > 0) {
    const { data } = await supabase.from('touring_gears').select('*').in('id', specificGearIds);
    gears = (data || []) as TouringGear[];
  } else {
    // Fallback to random 3 gears if no shortcode is used
    const { data } = await supabase.from('touring_gears').select('*').limit(3);
    gears = (data || []) as TouringGear[];
  }

  // Split article content by the shortcode for rendering
  const articleParts = route.article_content.split(shortcodeRegex);
  // articleParts format: [ "html before", "id1,id2", "html after", "id3", "html end" ]
  // Even indexes (0, 2, 4) are HTML strings. Odd indexes (1, 3) are comma-separated IDs.

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link href="/routes" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Semua Rute
      </Link>

      {/* Header Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
          <Navigation className="w-4 h-4" /> Rute {route.difficulty}
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
          {route.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-6">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>{route.distance_text}</span>
            </div>
            <span className="text-gray-500">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{route.duration_text}</span>
            </div>
            {route.created_at && (
              <>
                <span className="text-gray-500">&bull;</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Update: {new Date(route.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </>
            )}
          </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Jarak Tempuh</p>
              <p className="font-bold text-gray-900 dark:text-white">{route.distance_text}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Estimasi Waktu</p>
              <p className="font-bold text-gray-900 dark:text-white">{route.duration_text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image or Map Embed Placeholder */}
      <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden mb-12 shadow-md relative">
        {route.cover_image_url ? (
          <img src={route.cover_image_url} alt={route.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-gray-800 to-gray-900 text-white p-8 text-center">
            <div>
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg text-gray-400">Dari <strong className="text-white">{route.origin}</strong> menuju <strong className="text-white">{route.destination}</strong></p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Article */}
        <div className="lg:col-span-2 prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl">
          {articleParts.map((part, index) => {
            // If it's an even index, it's normal HTML content
            if (index % 2 === 0) {
              return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            }
            
            // If it's an odd index, it's a list of Gear IDs (from our shortcode)
            const ids = part.split(',');
            const renderedGears = gears.filter(g => ids.includes(g.id));
            
            if (renderedGears.length === 0) return null;

            return (
              <div key={index} className="not-prose my-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
                <h3 className="font-bold mb-6 text-xl flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" /> Rekomendasi Gear Pilihan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderedGears.map(gear => (
                    <a key={gear.id} href={gear.affiliate_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all hover:scale-[1.02]">
                      {gear.image_url ? (
                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0">
                          <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-blue-200 font-medium mb-1">{gear.category}</p>
                        <p className="text-base font-bold line-clamp-2 leading-tight">{gear.name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Checkpoints Box */}
          {route.checkpoints && route.checkpoints.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" /> Titik Istirahat (Google Maps)
              </h3>
              <div className="space-y-4">
                {route.checkpoints.map((cp, idx) => (
                  <div key={idx} className="flex gap-3 items-start border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{cp.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{cp.vicinity}</p>
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" /> {cp.rating} ({cp.user_ratings_total} ulasan)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Gears (Fallback Sidebar) */}
          {gears.length > 0 && matches.length === 0 && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-4 text-lg">Rekomendasi Gear</h3>
              <div className="space-y-3">
                {gears.map(gear => (
                  <a key={gear.id} href={gear.affiliate_url || '#'} target="_blank" rel="noopener noreferrer" className="block bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                      {gear.image_url ? (
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0">
                          <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-blue-200">{gear.category}</p>
                        <p className="text-sm font-bold line-clamp-1">{gear.name}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <Link href="/gears" className="block text-center text-sm font-medium text-white/80 hover:text-white mt-4 transition-colors">
                Lihat Semua Gear &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Report Form */}
      <RouteReportForm routeName={route.title} />
    </div>
  );
}

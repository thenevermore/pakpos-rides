import { supabase } from '@/lib/supabase';
import { TouringRoute, TouringGear } from '@/lib/types';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Navigation, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import RouteReportForm from '@/components/RouteReportForm';
import { marked } from 'marked';

export const revalidate = 0; // Disable cache so new routes appear instantly

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { data } = await supabase.from('touring_routes').select('title, origin, destination').eq('slug', resolvedParams.slug).single();
  if (!data) return { title: 'Rute Tidak Ditemukan' };
  return {
    title: `${data.title} - Rute Touring PakPOS`,
    description: `Panduan touring lengkap dari ${data.origin} menuju ${data.destination}.`,
  };
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { data: routeData, error } = await supabase
    .from('touring_routes')
    .select('*')
    .eq('slug', resolvedParams.slug)
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
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-20">
      {/* Premium Hero Section */}
      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end pb-16 md:pb-24 pt-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {route.cover_image_url ? (
            <img src={route.cover_image_url} alt={route.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black"></div>
          )}
          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full">
          <Link href="/routes" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors mb-6 backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Eksplorasi
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-black uppercase tracking-widest shadow-lg">
              {route.origin} &rarr; {route.destination}
            </div>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-md text-xs font-bold uppercase tracking-widest">
              <Navigation className="w-3.5 h-3.5 text-blue-400" /> {route.difficulty.split('•')[0]}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white mb-6 leading-tight drop-shadow-xl">
            {route.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <MapPin className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Jarak</p>
                <p className="font-bold text-sm">{route.distance_text}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Waktu</p>
                <p className="font-bold text-sm">{route.duration_text}</p>
              </div>
            </div>
          </div>

          {/* Floating CTA */}
          <div className="absolute right-4 -bottom-8 md:right-8 lg:right-0 md:-bottom-10">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&travelmode=driving`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-10 py-4 md:py-6 rounded-3xl font-black text-lg md:text-xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.7)] transition-all hover:-translate-y-2 hover:shadow-[0_30px_50px_-15px_rgba(37,99,235,0.8)] border border-blue-400/30"
            >
              <Navigation className="w-6 h-6 md:w-8 md:h-8" />
              Mulai Navigasi
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-16 md:mt-24">
        {/* Interactive Google Map Embed */}
        <div className="w-full h-80 md:h-[450px] bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden mb-16 shadow-2xl border-4 border-white dark:border-gray-900">
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            loading="lazy" 
            allowFullScreen 
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&mode=driving`}
          ></iframe>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Article */}
          <div className="lg:col-span-2 prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-3xl prose-img:shadow-lg prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white">
            {articleParts.map((part, index) => {
              if (index % 2 === 0) {
                const htmlContent = marked.parse(part) as string;
                return <div key={index} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
              }
              
              const ids = part.split(',');
              const renderedGears = gears.filter(g => ids.includes(g.id));
              if (renderedGears.length === 0) return null;

              return (
                <div key={index} className="not-prose my-12 bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl border border-gray-800 dark:border-gray-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  
                  <h3 className="font-black mb-8 text-2xl flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    Gear Pilihan Editor
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                    {renderedGears.map(gear => (
                      <a key={gear.id} href={gear.affiliate_url || '#'} target="_blank" rel="noopener noreferrer" className="group flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-3xl transition-all hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4">
                          {gear.image_url ? (
                            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-inner flex-shrink-0">
                              <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-[10px] text-blue-300 font-bold tracking-widest uppercase mb-1">{gear.category}</p>
                            <p className="text-base font-bold line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{gear.name}</p>
                          </div>
                        </div>
                        <div className="mt-auto w-full py-2 bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white rounded-xl text-xs font-bold text-center transition-colors">
                          Cek Harga Promo
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Premium Checkpoints */}
            {route.checkpoints && route.checkpoints.length > 0 && (
              <div>
                <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" /> 
                  </div>
                  Pit Stop Wajib
                </h3>
                <div className="space-y-4">
                  {route.checkpoints.map((cp, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xl font-black text-gray-400">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{cp.name}</p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{cp.vicinity}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs font-black text-amber-600 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" /> {cp.rating} <span className="opacity-70 font-medium">({cp.user_ratings_total})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback Gears Sidebar */}
            {gears.length > 0 && matches.length === 0 && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="font-black mb-6 text-xl relative z-10">Rekomendasi Gear</h3>
                <div className="space-y-4 relative z-10">
                  {gears.map(gear => (
                    <a key={gear.id} href={gear.affiliate_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-black/20 hover:bg-black/40 p-4 rounded-2xl transition-colors">
                      {gear.image_url ? (
                        <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex-shrink-0">
                          <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold mb-0.5">{gear.category}</p>
                        <p className="text-sm font-bold line-clamp-2 leading-tight">{gear.name}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <Link href="/gears" className="inline-block w-full text-center py-3 bg-white text-blue-700 font-bold rounded-xl mt-6 hover:bg-gray-50 transition-colors relative z-10 shadow-lg">
                  Lihat Semua Gear
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Report Form */}
        <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
          <RouteReportForm routeName={route.title} />
        </div>
      </div>
    </div>
  );
}

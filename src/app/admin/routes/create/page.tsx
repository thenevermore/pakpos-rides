'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, MapPin, Wand2, ArrowLeft, Search, Navigation, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import MapPreview dynamically to avoid SSR window is not defined error
const MapPreview = dynamic(() => import('@/components/MapPreview'), { ssr: false, loading: () => <div className="h-64 sm:h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm">Memuat Peta...</div> });

export default function RouteGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Input State (Step 1)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // Routes State (Step 2)
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  // AI Options State (Step 2)
  const [theme, setTheme] = useState('Santai');
  const [category, setCategory] = useState('Umum');
  const [routeWarning, setRouteWarning] = useState('');
  const [motorcycleType, setMotorcycleType] = useState('Semua Motor');
  const [isOvernight, setIsOvernight] = useState(false);

  // Result State (Step 3)
  const [generatedData, setGeneratedData] = useState<{
    distanceText: string;
    durationText: string;
    checkpoints: any[];
    articleContent: string;
    coverImageUrl?: string | null;
  } | null>(null);
  
  // Edited state (Step 3)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [articleContent, setArticleContent] = useState('');

  // Auto-set overnight if category is Motocamping
  useEffect(() => {
    if (category === 'Motocamping') {
      setIsOvernight(true);
    }
  }, [category]);

  const handleCheckRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/check-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to check routes');
      }

      const data = await res.json();
      setRouteOptions(data.routes);
      setSelectedRouteIndex(0); // Reset selection
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mencari rute. Pastikan titik awal dan tujuan valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          origin, 
          destination, 
          theme, 
          motorcycleType, 
          isOvernight,
          routeIndex: selectedRouteIndex,
          category,
          routeWarning
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate route');
      }

      const data = await res.json();
      setGeneratedData(data);
      setArticleContent(data.articleContent);
      
      const routeName = routeOptions[selectedRouteIndex]?.summary || `via Rute ${selectedRouteIndex + 1}`;
      const defaultTitle = `Rute Touring ${category} ${isOvernight ? '(Menginap)' : '(PP)'}: ${origin} ke ${destination} ${routeName}`;
      setTitle(defaultTitle);
      setSlug(defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      setStep(3);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal melakukan generate artikel dengan AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData || !title || !slug || !articleContent) return;
    setSaving(true);
    try {
      const difficultyString = `${category} • ${theme} • ${isOvernight ? 'Menginap' : 'Pulang Pergi'}`;
      
      const { error: dbError } = await supabase.from('touring_routes').insert({
        id: `rt_${Math.random().toString(36).substr(2, 6)}`,
        title,
        slug,
        origin,
        destination,
        distance_text: generatedData.distanceText,
        duration_text: generatedData.durationText,
        difficulty: difficultyString,
        recommended_motorcycles: [motorcycleType],
        article_content: articleContent,
        checkpoints: generatedData.checkpoints,
        cover_image_url: generatedData.coverImageUrl || null,
        map_embed_url: null,
      });

      if (dbError) throw dbError;
      router.push('/admin/routes');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan rute');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <Link href="/admin/routes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Rute
        </Link>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">AI Route Generator</h1>
        
        {/* Visual Stepper */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 relative">
          <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10 -translate-y-1/2"></div>
          
          <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 sm:bg-transparent pr-4 rounded-full sm:rounded-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className={`text-sm font-bold ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Cari Jalur</span>
          </div>
          
          <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 sm:bg-transparent pr-4 rounded-full sm:rounded-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
              {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Pilih & Generate</span>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 sm:bg-transparent pr-4 rounded-full sm:rounded-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
              3
            </div>
            <span className={`text-sm font-bold ${step >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Review & Publish</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100 shadow-sm">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleCheckRoutes} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Titik Awal *</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input type="text" required placeholder="Cth: Bandung" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Titik Tujuan *</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-red-400" />
                <input type="text" required placeholder="Cth: Gunung Bromo" value={destination} onChange={e => setDestination(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? 'Mencari Rute Alternatif...' : 'Cari Alternatif Rute'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div>
            <label className="block text-base font-black text-gray-900 dark:text-white mb-4">1. Pilih Jalur Alternatif Peta</label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Route Options List */}
              <div className="flex flex-col gap-3">
                {routeOptions.map((route) => (
                  <div 
                    key={route.index}
                    onClick={() => setSelectedRouteIndex(route.index)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRouteIndex === route.index ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md scale-[1.01]' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-sm font-bold line-clamp-1 ${selectedRouteIndex === route.index ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>{route.summary}</span>
                      {selectedRouteIndex === route.index ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs font-medium text-gray-500">Jarak: <span className="text-gray-900 dark:text-gray-300">{route.distance}</span></p>
                      <p className="text-xs font-medium text-gray-500">Waktu: <span className="text-gray-900 dark:text-gray-300">{route.duration}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Preview Area */}
              <div className="w-full">
                {routeOptions[selectedRouteIndex]?.polyline ? (
                  <MapPreview polylineString={routeOptions[selectedRouteIndex].polyline} />
                ) : (
                  <div className="h-64 sm:h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-sm border border-gray-200 dark:border-gray-700">Peta Tidak Tersedia</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <label className="block text-base font-black text-gray-900 dark:text-white mb-5">2. Pengaturan Parameter AI</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Kategori Destinasi</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Umum">Umum</option>
                  <option value="Motocamping">Motocamping</option>
                  <option value="Lintas Provinsi">Lintas Provinsi (Jarak Jauh)</option>
                  <option value="Sunmori">Sunmori (Short Ride)</option>
                  <option value="Wisata Alam">Wisata Alam / Pegunungan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Tema Penulisan</label>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Santai">Santai / Menikmati Perjalanan</option>
                  <option value="Adventure">Adventure / Menantang</option>
                  <option value="Night Ride">Night Ride</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Cocok Untuk Motor</label>
                <select value={motorcycleType} onChange={e => setMotorcycleType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Semua Motor">Semua Motor</option>
                  <option value="Matic (110-160cc)">Matic (110-160cc)</option>
                  <option value="Maxi Scooter (150-250cc)">Maxi Scooter (150-250cc)</option>
                  <option value="Sport (150-250cc)">Sport (150-250cc)</option>
                  <option value="Trail / Cross">Trail / Cross</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Peringatan Medan Khusus (Opsional)</label>
                <input type="text" placeholder="Contoh: Awas rem blong di turunan setelah Cangar, pastikan engine brake." value={routeWarning} onChange={e => setRouteWarning(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-500 mt-1.5">Info ini akan diprioritaskan (di-highlight) oleh AI dalam artikel.</p>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 mt-2">
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-gray-300 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={isOvernight} onChange={e => setIsOvernight(e.target.checked)} className="peer w-6 h-6 appearance-none border-2 border-gray-300 dark:border-gray-600 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer" />
                    <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">Rute ini membutuhkan Menginap</span>
                    <span className="block text-xs text-gray-500">AI akan otomatis merekomendasikan perlengkapan menginap (termasuk alat camping jika kategori Motocamping).</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              &larr; Ganti Tujuan Awal
            </button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:hover:scale-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'AI & Maps Sedang Memproses...' : 'Generate Artikel AI'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && generatedData && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-bold border border-green-200 dark:border-green-800/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              Berhasil mendapatkan data rute ({generatedData.distanceText}, {generatedData.durationText}) dan merekomendasikan tempat istirahat!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Judul Rute</label>
              <input type="text" value={title} onChange={e => {
                setTitle(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">URL Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Konten Artikel (HTML)</label>
            <textarea 
              rows={15} 
              value={articleContent} 
              onChange={e => setArticleContent(e.target.value)}
              className="w-full px-4 py-4 font-mono text-sm leading-relaxed rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button type="button" onClick={() => setStep(2)} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              &larr; Kembali Edit Parameter
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Simpan & Publish Rute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

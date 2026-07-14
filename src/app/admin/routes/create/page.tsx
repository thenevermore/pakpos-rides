'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, MapPin, Wand2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RouteGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Input State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [theme, setTheme] = useState('Santai');
  const [motorcycleType, setMotorcycleType] = useState('Matic');
  const [isOvernight, setIsOvernight] = useState(false);

  // Result State
  const [generatedData, setGeneratedData] = useState<{
    distanceText: string;
    durationText: string;
    checkpoints: any[];
    articleContent: string;
  } | null>(null);
  
  // Edited state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [articleContent, setArticleContent] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, theme, motorcycleType, isOvernight }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate route');
      }

      const data = await res.json();
      setGeneratedData(data);
      setArticleContent(data.articleContent);
      
      const defaultTitle = `Rute Touring ${theme} ${isOvernight ? '(Menginap)' : '(PP)'}: ${origin} ke ${destination}`;
      setTitle(defaultTitle);
      setSlug(defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal melakukan generate. Pastikan API key sudah diset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData || !title || !slug || !articleContent) return;
    setSaving(true);
    try {
      const { error: dbError } = await supabase.from('touring_routes').insert({
        id: `rt_${Math.random().toString(36).substr(2, 6)}`,
        title,
        slug,
        origin,
        destination,
        distance_text: generatedData.distanceText,
        duration_text: generatedData.durationText,
        difficulty: `${theme} • ${isOvernight ? 'Menginap' : 'Pulang Pergi'}`,
        recommended_motorcycles: [motorcycleType],
        article_content: articleContent,
        checkpoints: generatedData.checkpoints,
        cover_image_url: null, // Let user edit later or add logic
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/routes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Rute
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Route Generator</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Masukkan titik asal dan tujuan. Sistem akan memanggil Google Maps API untuk menarik data presisi, lalu menyuruh Gemini AI menulis artikel *touring*.
      </p>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {!generatedData ? (
        <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titik Awal *</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input type="text" required placeholder="Cth: Jakarta Selatan" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titik Tujuan *</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-red-400" />
                <input type="text" required placeholder="Cth: Lembang, Bandung" value={destination} onChange={e => setDestination(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tema Touring</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Santai">Santai / Jalan-jalan</option>
                <option value="Sunmori">Sunmori (Cepat/Pagi Hari)</option>
                <option value="Adventure">Adventure / Offroad</option>
                <option value="Night Ride">Night Ride / Malam Hari</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cocok Untuk Motor</label>
              <select value={motorcycleType} onChange={e => setMotorcycleType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Semua Motor">Semua Motor</option>
                <option value="Matic (110-160cc)">Matic (110-160cc)</option>
                <option value="Maxi Scooter (150-250cc)">Maxi Scooter (150-250cc)</option>
                <option value="Sport (150-250cc)">Sport (150-250cc)</option>
                <option value="Trail / Cross">Trail / Cross</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <input type="checkbox" id="overnight" checked={isOvernight} onChange={e => setIsOvernight(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
              <label htmlFor="overnight" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rute ini membutuhkan Menginap (Sertakan rekomendasi jenis penginapan)</label>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {loading ? 'AI & Maps Sedang Bekerja...' : 'Generate dengan AI'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800/50">
            ✓ Berhasil mendapatkan data rute ({generatedData.distanceText}, {generatedData.durationText}) dan menemukan {generatedData.checkpoints.length} tempat istirahat!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Judul Rute</label>
              <input type="text" value={title} onChange={e => {
                setTitle(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Konten Artikel (HTML)</label>
            <textarea 
              rows={15} 
              value={articleContent} 
              onChange={e => setArticleContent(e.target.value)}
              className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">Anda bisa merevisi HTML yang dihasilkan AI di atas sebelum menyimpannya ke database.</p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <button type="button" onClick={() => setGeneratedData(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              Ulangi Generate
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan & Publish Rute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

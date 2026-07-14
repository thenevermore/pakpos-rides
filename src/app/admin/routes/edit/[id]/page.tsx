'use client';

import { useState, useEffect, useRef, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Wrench, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import { TouringRoute, TouringGear } from '@/lib/types';

export default function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [route, setRoute] = useState<TouringRoute | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [articleContent, setArticleContent] = useState('');
  
  // Gear Inserter States
  const [availableGears, setAvailableGears] = useState<TouringGear[]>([]);
  const [selectedGears, setSelectedGears] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Route
      const { data: routeData, error: routeError } = await supabase
        .from('touring_routes')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
        
      if (routeError) {
        setError(`Supabase Error: ${routeError.message} (Code: ${routeError.code})`);
      } else if (!routeData) {
        setError('Rute tidak ditemukan di database.');
      } else {
        setRoute(routeData);
        setTitle(routeData.title);
        setSlug(routeData.slug);
        setCoverImageUrl(routeData.cover_image_url || '');
        setArticleContent(routeData.article_content);
      }

      // Fetch Gears
      const { data: gearsData } = await supabase
        .from('touring_gears')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (gearsData) {
        setAvailableGears(gearsData);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [resolvedParams.id]);

  const toggleGear = (id: string) => {
    setSelectedGears(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const insertGears = () => {
    if (selectedGears.length === 0) return;
    const shortcode = `[GEARS:${selectedGears.join(',')}]`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = articleContent.substring(0, start) + shortcode + articleContent.substring(end);
      setArticleContent(newContent);
      
      // Reset selection after state updates (need timeout to allow react to render)
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + shortcode.length, start + shortcode.length);
      }, 0);
    } else {
      setArticleContent(prev => prev + '\n\n' + shortcode);
    }
    
    // Clear selection
    setSelectedGears([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from('touring_routes')
        .update({
          title,
          slug,
          cover_image_url: coverImageUrl || null,
          article_content: articleContent,
        })
        .eq('id', resolvedParams.id);

      if (dbError) throw dbError;
      alert('Perubahan berhasil disimpan!');
      router.push('/admin/routes');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="max-w-5xl mx-auto px-4 text-center py-20 text-red-600 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <Link href="/admin/routes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Rute
        </Link>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Edit Rute: {route.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{route.origin} &rarr; {route.destination}</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Edit */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Judul Rute</label>
              <input type="text" value={title} onChange={e => {
                setTitle(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">URL Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">URL Cover Image</label>
              <input type="url" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Konten Artikel (HTML)</label>
              </div>
              <textarea 
                ref={textareaRef}
                rows={25} 
                value={articleContent} 
                onChange={e => setArticleContent(e.target.value)}
                className="w-full px-4 py-4 font-mono text-sm leading-relaxed rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Right Column: Gear Inserter Tools */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-blue-200 dark:border-blue-900/50 p-6 shadow-sm sticky top-6">
            <h3 className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" /> Injeksi Gear (Shortcode)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Pilih gear di bawah, letakkan kursor Anda di dalam kotak artikel di paragraf yang diinginkan, lalu klik tombol Sisipkan.
            </p>

            <div className="max-h-[400px] overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {availableGears.map(gear => (
                <div 
                  key={gear.id} 
                  onClick={() => toggleGear(gear.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedGears.includes(gear.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                >
                  <div className="mt-0.5 text-blue-600">
                    {selectedGears.includes(gear.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{gear.name}</p>
                    <p className="text-[10px] text-gray-500">{gear.category}</p>
                  </div>
                </div>
              ))}
              {availableGears.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">Belum ada gear di database.</p>
              )}
            </div>

            <button 
              type="button" 
              onClick={insertGears}
              disabled={selectedGears.length === 0}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-all hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sisipkan {selectedGears.length > 0 ? `(${selectedGears.length}) Gear` : 'Gear'} ke Kursor
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

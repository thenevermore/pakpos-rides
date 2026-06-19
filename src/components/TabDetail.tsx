'use client';

import { useState } from 'react';
import { MotorcycleDetail } from '@/lib/types';
import { formatPrice, getCategoryLabel, getCategoryColor, getCompressionLevel, getOctaneColor } from '@/lib/data';
import LogoImage from './LogoImage';
import {
  Info, Zap, Fuel, Droplets, Tag, Cog, Settings,
  Calendar, Gauge, Sun, Route, ShoppingBag, ExternalLink, AlertTriangle, Send, Loader2, Check, GaugeCircle
} from 'lucide-react';

interface TabDetailProps {
  motorcycle: MotorcycleDetail;
}

export default function TabDetail({ motorcycle }: TabDetailProps) {
  const [activeTab, setActiveTab] = useState<'detail' | 'recommendation'>('detail');
  const compressionInfo = getCompressionLevel(motorcycle.compression_ratio);
  const { recommendations } = motorcycle;
  const jasoCert = motorcycle.category === 'matic' ? 'JASO MB' : 'JASO MA2';

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'detail'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Info className="w-4 h-4" />
          Detail Kendaraan
        </button>
        <button
          onClick={() => setActiveTab('recommendation')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'recommendation'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Rasio & Rekomendasi
        </button>
      </div>

      {/* Tab 1: Detail */}
      {activeTab === 'detail' && (
        <div className="space-y-6">
          {/* Price card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-80">Estimasi Harga OTR Jakarta</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(motorcycle.latest_price)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <Calendar className="w-3 h-3" />
              Diperbarui: {new Date(motorcycle.last_updated).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {motorcycle.affiliate_url && (
              <a 
                href={motorcycle.affiliate_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                Cek Promo & Beli <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SpecCard icon={<Tag className="w-5 h-5" />} label="Kode Model" value={motorcycle.model_code} />
            <SpecCard icon={<Settings className="w-5 h-5" />} label="Kategori" value={getCategoryLabel(motorcycle.category)} badge={getCategoryColor(motorcycle.category)} />
            <SpecCard icon={<Cog className="w-5 h-5" />} label="Tipe Mesin" value={motorcycle.engine_type} />
            <SpecCard icon={<Gauge className="w-5 h-5" />} label="Transmisi" value={motorcycle.transmission_type} />
            {motorcycle.fuel_efficiency && (
              <SpecCard icon={<Fuel className="w-5 h-5" />} label="Efisiensi BBM" value={`${motorcycle.fuel_efficiency} km/L`} badge="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
            )}
          </div>

          <FeedbackForm motorcycleName={motorcycle.name} />

          {/* JASO Badge */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Sertifikasi Oli: {jasoCert}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {motorcycle.category === 'matic'
                  ? 'JASO MB untuk motor matik (kopling kering/CVT)'
                  : 'JASO MA/MA2 untuk motor sport/bebek (kopling basah)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recommendation */}
      {activeTab === 'recommendation' && (
        <div className="space-y-8">
          {/* Compression Ratio */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rasio Kompresi</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-gray-900 dark:text-white">
                {motorcycle.compression_ratio}
              </div>
              <div>
                <span className={`text-sm font-bold ${compressionInfo.color}`}>{compressionInfo.level}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{compressionInfo.description}</p>
              </div>
            </div>
            {/* Visual bar - scale from 8:1 to 14:1 */}
            <div className="mt-4 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(Math.max(((parseFloat(motorcycle.compression_ratio) - 8) / 6) * 100, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>8:1</span>
              <span>10:1</span>
              <span>12:1</span>
              <span>14:1</span>
            </div>
          </div>

          {/* Fuel Recommendation */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Fuel className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rekomendasi Bensin</h3>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getOctaneColor(recommendations.ideal_octane)} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                  {recommendations.ideal_octane}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">Oktan Ideal: {recommendations.ideal_octane}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Minimum: Oktan {recommendations.min_octane}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.fuel_brands.map(fuel => {
                const content = (
                  <div key={fuel.id} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 transition-shadow ${fuel.affiliate_url ? 'hover:shadow-lg cursor-pointer ring-1 ring-transparent hover:ring-green-300 dark:hover:ring-green-700' : 'hover:shadow-md'}`}>
                    <LogoImage
                      src={fuel.logo_url}
                      cdnSrc={fuel.cdn_url}
                      alt={fuel.name}
                      fallbackText={fuel.name}
                      size={44}
                      bgColor="bg-gradient-to-br from-green-500 to-emerald-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fuel.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fuel.producer} &middot; Oktan {fuel.octane}
                      </p>
                    </div>
                    {fuel.affiliate_url && (
                      <ShoppingBag className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                );
                return fuel.affiliate_url ? (
                  <a key={fuel.id} href={fuel.affiliate_url} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : content;
              })}
            </div>
          </div>

          {/* Oil Recommendation */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rekomendasi Oli</h3>
            </div>

            {/* JASO badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4">
              <Settings className="w-3.5 h-3.5" />
              Sertifikasi: {jasoCert}
            </div>

            {/* Daily use */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-yellow-500" />
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Harian / Commuting</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.oil_daily.map(oil => {
                  const content = (
                    <div key={oil.id} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 transition-shadow ${oil.affiliate_url ? 'hover:shadow-lg cursor-pointer ring-1 ring-transparent hover:ring-amber-300 dark:hover:ring-amber-700' : 'hover:shadow-md'}`}>
                      <LogoImage
                        src={oil.logo_url}
                        cdnSrc={oil.cdn_url}
                        alt={oil.name}
                        fallbackText={oil.name}
                        size={44}
                        bgColor="bg-gradient-to-br from-amber-500 to-orange-700"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{oil.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {oil.base_type} &middot; {oil.viscosity}
                        </p>
                      </div>
                      {oil.affiliate_url && (
                        <ShoppingBag className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                  return oil.affiliate_url ? (
                    <a key={oil.id} href={oil.affiliate_url} target="_blank" rel="noopener noreferrer">{content}</a>
                  ) : content;
                })}
              </div>
            </div>

            {/* Touring use */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Route className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Touring / Jarak Jauh</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.oil_touring.map(oil => {
                  const content = (
                    <div key={oil.id} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 transition-shadow ${oil.affiliate_url ? 'hover:shadow-lg cursor-pointer ring-1 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-700' : 'hover:shadow-md'}`}>
                      <LogoImage
                        src={oil.logo_url}
                        cdnSrc={oil.cdn_url}
                        alt={oil.name}
                        fallbackText={oil.name}
                        size={44}
                        bgColor="bg-gradient-to-br from-blue-500 to-indigo-700"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{oil.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {oil.base_type} &middot; {oil.viscosity}
                        </p>
                      </div>
                      {oil.affiliate_url && (
                        <ShoppingBag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                  return oil.affiliate_url ? (
                    <a key={oil.id} href={oil.affiliate_url} target="_blank" rel="noopener noreferrer">{content}</a>
                  ) : content;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecCard({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {badge ? (
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{value}</span>
        ) : (
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

function FeedbackForm({ motorcycleName }: { motorcycleName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      motorcycleName,
      errorType: formData.get('errorType'),
      correctValue: formData.get('correctValue'),
      senderContact: formData.get('senderContact')
    };

    try {
      // Endpoint requires NEXT_PUBLIC_FEEDBACK_SCRIPT_URL to be set in .env.local
      const url = process.env.NEXT_PUBLIC_FEEDBACK_SCRIPT_URL;
      if (!url) throw new Error('Feedback endpoint not configured');

      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="flex justify-end">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Info ini salah? Laporkan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Laporkan Kesalahan Data
        </h4>
        <button onClick={() => setIsOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Batal
        </button>
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> Laporan berhasil dikirim! Terima kasih.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bagian yang salah</label>
            <select name="errorType" required className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih bagian...</option>
              <option value="Harga">Estimasi Harga OTR</option>
              <option value="Spesifikasi">Tipe Mesin / Transmisi</option>
              <option value="Gambar">Gambar Kendaraan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Informasi yang benar</label>
            <textarea name="correctValue" required rows={2} placeholder="Mohon tuliskan informasi yang seharusnya..." className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kontak Anda (Opsional)</label>
            <input name="senderContact" type="text" placeholder="Email / IG untuk konfirmasi" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          {status === 'error' && (
            <p className="text-xs text-red-600">Gagal mengirim laporan. Pastikan URL endpoint valid.</p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Kirim Laporan
          </button>
        </form>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function RouteReportForm({ routeName }: { routeName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    const errorType = formData.get('errorType') as string;
    const correctValue = formData.get('correctValue') as string;
    const senderContact = formData.get('senderContact') as string;

    const data = {
      motorcycleName: `Route: ${routeName}`,
      errorType,
      correctValue,
      senderContact
    };

    try {
      const url = process.env.NEXT_PUBLIC_FEEDBACK_SCRIPT_URL;
      if (!url) throw new Error('Feedback endpoint not configured');

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Rute atau tips ini kurang akurat? Laporkan
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-lg mx-auto bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Laporkan Kesalahan Rute
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
            <select name="errorType" required className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih bagian...</option>
              <option value="Kondisi Jalan Rute">Kondisi Jalan / Rute Ditutup</option>
              <option value="Titik Istirahat Rute">Titik Istirahat Salah/Tutup</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Informasi yang benar</label>
            <textarea name="correctValue" required rows={3} placeholder="Mohon tuliskan perbaikannya..." className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kontak Anda (Opsional)</label>
            <input name="senderContact" type="text" placeholder="Email / IG untuk konfirmasi" className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          {status === 'error' && (
            <p className="text-xs text-red-600">Gagal mengirim laporan. Coba lagi nanti.</p>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-70 mt-2"
          >
            {status === 'loading' ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
      )}
    </div>
  );
}

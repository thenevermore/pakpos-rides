'use client';

import { useState } from 'react';
import { Send, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // capture form reference synchronously
    setLoading(true);
    setStatus('idle');
    
    const formData = new FormData(form);
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const note = formData.get('note') as string;
    const contact = formData.get('contact') as string;

    const data = {
      motorcycleName: 'Request Model Baru',
      errorType: 'Request Motor',
      correctValue: `Brand: ${brand}\nModel: ${model}\nCatatan Tambahan: ${note}`,
      senderContact: contact
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
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Berhasil Dikirim!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Terima kasih. Kami akan segera menambahkan informasi motor tersebut ke database.
        </p>
        <button onClick={() => setStatus('idle')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline mr-4">
          Request Lagi
        </button>
        <Link href="/" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors inline-block">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Merek (Brand) *</label>
        <input 
          name="brand" 
          type="text" 
          required 
          placeholder="Cth: Kawasaki, KTM, dsb" 
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Model Kendaraan *</label>
        <input 
          name="model" 
          type="text" 
          required 
          placeholder="Cth: ZX-25R, Ninja E-1" 
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Catatan Tambahan (Opsional)</label>
        <textarea 
          name="note" 
          rows={2} 
          placeholder="Tahun rilis, atau detail lain yang membedakan..." 
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Kontak Anda (Opsional)</label>
        <input 
          name="contact" 
          type="text" 
          placeholder="Email atau IG untuk pemberitahuan jika sudah update" 
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      
      {status === 'error' && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
          Gagal mengirim request. Silakan coba beberapa saat lagi.
        </div>
      )}

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:hover:shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Kirim Request
        </button>
      </div>
    </form>
  );
}

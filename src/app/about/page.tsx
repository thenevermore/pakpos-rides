import { Bike } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Tentang - PakPOS Rides',
  description: 'Informasi tentang proyek PakPOS Rides',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Bike className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Tentang PakPOS<span className="text-blue-600 dark:text-blue-400">Rides</span>
        </h1>
        
        <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
          <p>
            Halo! Selamat datang di <strong>PakPOS Rides</strong>. 
          </p>
          
          <p>
            Proyek ini sebenarnya berangkat dari masalah simpel: sering banget kita bingung nyari spesifikasi motor yang bener. Misalnya pengen tahu rasio kompresinya berapa biar nggak salah isi bensin, atau nyari rekomendasi oli yang pas buat harian atau touring. Kalau nyari di Google satu-satu lumayan makan waktu, makanya akhirnya dibikinlah aplikasi web ini buat ngumpulin semua data itu di satu tempat.
          </p>
          
          <p>
            Konsepnya sederhana aja. Kita kumpulin data spek dari situs resmi masing-masing pabrikan. Dari data itu, sistem bakal ngasih rekomendasi secara otomatis. Rasio kompresi tinggi? Langsung direkomendasiin Pertamax atau V-Power. Motor matik? Otomatis dikasih oli khusus matik (JASO MB). Semuanya otomatis tanpa perlu pusing mikir lagi.
          </p>
          
          <p>
            Karena data di sini dikumpulkan pakai *script* secara berkala, kadang mungkin ada data spesifikasi atau harga yang meleset sedikit atau telat *update*. Kalau kamu nemu data yang kurang pas, kamu bisa langsung lapor lewat tombol <strong>"Info ini salah? Laporkan"</strong> di halaman spesifikasi motor. Bantuan sekecil apa pun dari kamu sangat berarti buat bikin data di sini makin akurat.
          </p>
          
          <p>
            Oh ya, kalau kamu butuh beli oli atau barang-barang lain, ada tombol link ke marketplace juga. Itu link afiliasi ya, lumayan buat bantu-bantu bayar kopi sambil *coding*.
          </p>

          <p>
            Intinya, semoga PakPOS Rides ini bisa bantu kamu merawat motor kesayangan biar makin awet dan nggak salah isi 'makanan'. Kalau ada saran atau ide fitur baru, silakan kontak aja!
          </p>

          <div className="pt-8 flex justify-center">
            <Link 
              href="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

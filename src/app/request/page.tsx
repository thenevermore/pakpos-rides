import RequestForm from './RequestForm';
import { Bike } from 'lucide-react';

export const metadata = {
  title: 'Request Motor Baru - PakPOS Rides',
  description: 'Request penambahan spesifikasi motor baru ke database PakPOS Rides.',
};

export default function RequestPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
            <Bike className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
          Request Tambah Motor
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-sm">
          Nggak nemu motor yang kamu cari? Tenang, kamu bisa request untuk ditambahkan ke database kami. Tim PakPOS akan segera mencari datanya dan memasukkannya.
        </p>

        <RequestForm />
      </div>
    </div>
  );
}

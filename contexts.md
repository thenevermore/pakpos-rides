# Artifact Proyek: Sistem Rekomendasi Utilitas Sepeda Motor (Responsive SPA)

Dokumen ini berisi rangkuman diskusi arsitektur sistem, kebutuhan data, tantangan teknis, dan strategi implementasi untuk aplikasi pencarian spesifikasi motor, rekomendasi bahan bakar, dan oli di Indonesia. Dokumen ini ditujukan sebagai konteks/artefak teknis untuk integrasi atau pengembangan lebih lanjut di platform eksternal (Antigravity).

---

## 1. Ringkasan Kebutuhan & Fitur Utama

Aplikasi dirancang sebagai Web Responsive / Single Page Application (SPA) dengan fokus utama pada efisiensi biaya (*Zero-Cost Deployment*) dan kemudahan pemeliharaan data.

### Fitur Utama:
1. **Mesin Rekomendasi Otomatis:**
   - Menampilkan rasio kompresi mesin dari setiap tipe sepeda motor di Indonesia (contoh: Yamaha MT-15).
   - Menentukan rekomendasi oktan bensin ideal (90, 92, 95, 98) berserta contoh merek komersial di Indonesia (Pertamax, Shell Super, BP 92, dll).
   - Menentukan rekomendasi jenis oli (Full Synthetic, Semi Synthetic, Mineral), tingkat kekentalan (SAE), serta klasifikasi penggunaan (Harian vs Touring) beserta mereknya (Motul 5100/7100, dll).
2. **Penyimpanan Data Dinamis:**
   - Seluruh data *knowledge base* (Brand, Model, Spesifikasi, Aturan Rekomendasi) disimpan di cloud database (Firebase/Supabase) agar dapat diperbarui secara berkala tanpa *re-deploy* aplikasi.
   - Menggunakan kecerdasan buatan (AI) untuk melakukan *data seeding* awal.
3. **Kaya Aset Visual:**
   - Dilengkapi visualisasi pendukung seperti logo brand kendaraan, logo model, logo produsen bensin, dan logo produsen oli untuk meningkatkan UI/UX.
4. **Alur Navigasi Pengguna (User Flow):**
   - **Langkah 1:** Pengguna memilih *Brand* kendaraan (Honda, Yamaha, Suzuki, Kawasaki, dll).
   - **Langkah 2:** Pengguna memilih *Model/Merk* spesifik lengkap dengan kode pabrikan (contoh: Honda BeAT K1A).
   - **Langkah 3:** Sistem menampilkan antarmuka berbasis Tab:
     - *Tab 1 (Detail Kendaraan):* Spesifikasi dasar fisik, tipe mesin, dan estimasi harga terbaru (OTR).
     - *Tab 2 (Rasio & Rekomendasi):* Rasio kompresi, rekomendasi bensin (merek & oktan), serta rekomendasi oli berdasarkan tipe berkendara.

---

## 2. Arsitektur Teknologi & Strategi *Zero-Cost*

Untuk mencapai target *deployment* 100% gratis dengan performa tinggi, arsitektur berikut direkomendasikan:

| Komponen | Teknologi | Alasan & Batasan Free Tier |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (React) + TailwindCSS | Mendukung *Static Site Generation* (SSG). Halaman di-generate statis di awal karena data motor jarang berubah, menghemat kuota database secara ekstrem. |
| **Hosting** | Vercel / Cloudflare Pages | Integrasi *continuous deployment* gratis dari GitHub dengan *bandwidth* global yang besar dan andal. |
| **Database** | Supabase (PostgreSQL) | Lebih disarankan dibanding NoSQL untuk data relasional (Brand -> Model -> Oli/Bensin). *Free Tier* menyediakan database 500MB (sangat cukup untuk ribuan tipe motor). |
| **Asset Storage** | Cloudinary / Supabase Storage | Mengurangi beban bandwidth hosting utama dengan fitur optimasi gambar otomatis otomatis ke format ringan (`.webp` atau `.svg`). |

---

## 3. Desain Struktur Data (Skema JSON Terrelasi)

Berikut adalah cetak biru struktur data relasional yang efisien untuk diimplementasikan pada Supabase atau Firebase Firestore:

```json
// Tabel/Koleksi: Brands
{
  "id": "br_001",
  "name": "Yamaha",
  "logo_url": "[https://cdn.url/logos/yamaha.svg](https://cdn.url/logos/yamaha.svg)"
}

// Tabel/Koleksi: Motorcycles
{
  "id": "mt_001",
  "brand_id": "br_001",
  "model_code": "MT-15 VVA",
  "name": "Yamaha MT-15",
  "latest_price": 38500000,
  "compression_ratio": "11.6:1",
  "engine_type": "155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves",
  "transmission_type": "Manual (JASO MA2)",
  "image_url": "[https://cdn.url/bikes/mt15.webp](https://cdn.url/bikes/mt15.webp)"
}

// Tabel/Koleksi: Knowledge_Base (Mapping Aturan)
{
  "id": "kb_001",
  "motorcycle_id": "mt_001",
  "fuel_recommendation": {
    "min_octane": 92,
    "ideal_octane": 95,
    "suggested_brands": ["Pertamax Turbo", "Shell V-Power", "BP Ultimate"],
    "brand_logos": ["url_pertamax", "url_shell", "url_bp"]
  },
  "oil_recommendation": {
    "base_type": "Full Synthetic",
    "viscosity": "10W-40",
    "daily_use": {
      "brands": ["Motul 5100 10W-40", "Yamalube Super Sport"],
      "logos": ["url_motul", "url_yamalube"]
    },
    "touring_use": {
      "brands": ["Motul 7100 10W-40", "Liqui Moly Street 10W-40"],
      "logos": ["url_motul", "url_liquimoly"]
    }
  }
}
```

---

## 4. Pipeline Data & Aturan Logika (Ingestion Strategy)

### Strategi Penarikan Data (Data Ingestion):
Karena ketiadaan Public API gratis untuk data otomotif Indonesia, disarankan membangun *Zero-Cost ETL Pipeline*:
1. **Scraping Data Kasar:** Menggunakan Python (`BeautifulSoup`/`Playwright`) dijalankan di lokal atau via *GitHub Actions* untuk mengambil spesifikasi dari agregator (Oto.com, CarMudi) dan web resmi ATPM.
2. **AI-Parsing (Anti-Halusinasi):** Menggunakan Gemini API (Free Tier) untuk membaca teks hasil scraping berantakan lalu mengubahnya menjadi format JSON terstruktur sesuai skema di atas.

### Aturan Logika Rekomendasi (Hardcoded Rules):
Untuk efisiensi, logika penentuan bensin dan oli didasarkan pada parameter teknis berikut:

* **Oktan Bensin vs Rasio Kompresi:**
  - < 9.0 : 1 -> Oktan 88/90 (Pertalite)
  - 9.0 : 1 s/d 10.0 : 1 -> Oktan 90 (Pertalite / Shell Regular)
  - 10.0 : 1 s/d 11.0 : 1 -> Oktan 92 (Pertamax / Shell Super / BP 92)
  - 11.0 : 1 s/d 12.0 : 1 -> Oktan 95/98 (Pertamax Turbo / Shell V-Power / BP Ultimate)

* **Sertifikasi Oli vs Transmisi:**
  - Motor Matik (Scooter) -> **JASO MB** (Kopling Kering)
  - Motor Sport / Bebek -> **JASO MA / MA2** (Kopling Basah)

---

## 5. Tantangan Teknis & Solusi Mitigasi

1. **Validasi Data AI:** AI dilarang menebak data mandiri guna menghindari halusinasi rasio kompresi. AI hanya bertindak sebagai *parser* dari data yang ditarik dari web resmi ATPM/buku manual PDF.
2. **Lokalisasi Harga:** Harga menggunakan standar OTR Jakarta dengan label penjelas *(Estimasi OTR Jakarta)* dan kolom tambahan `last_updated` di database untuk menjaga ekspektasi pengguna.
3. **Optimasi Bandwidth:** Seluruh logo dan aset gambar wajib diubah ke format vektor (`.svg`) atau kompresi modern (`.webp`) guna mencegah terlampauinya batas kuota transfer data bulanan pada akun gratisan.
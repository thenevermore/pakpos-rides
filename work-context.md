# Work Context — PakposRides Master Data Sync & Admin Enhancements

> Last updated: 2025-06-15
> Project: https://pakpos-rides.vercel.app
> GitHub: thenevermore/pakpos-rides

---

## 1. Overview

PakposRides is a Next.js + Supabase SPA for Indonesian motorcycle recommendations (compression ratio → fuel & oil recommendations). The current work session focuses on:

1. **Syncing scraped product data** (images, specs, pricing) from official manufacturer websites into Supabase
2. **Adding motorcycle affiliate links** in the admin panel (marketplace links per motorcycle)
3. **Creating a correction/feedback form** on the motorcycle detail page that submits to a Google Spreadsheet

---

## 2. Completed Work

### 2.1 Product Scraper (`scrape-products.cjs`)

- Scrapes **28 Yamaha models** from `yamaha-motor.co.id` (fetch + cheerio)
- Scrapes **29 Honda models** from `wahanahonda.com` (puppeteer + stealth plugin, non-headless to bypass Cloudflare)
- Output: `scraped-products.json` (57 models with images, prices, specs, compression ratios)
- Data quality: 100% images, 100% prices, 88% compression ratios, 72% engine CC
- **Only failure**: `honda-cuv-e` (404 — product doesn't exist on wahanahonda.com)
- Dependencies: `cheerio`, `puppeteer`, `puppeteer-extra`, `puppeteer-extra-plugin-stealth`

### 2.2 Supabase Master Data Sync (`sync-master-data.cjs`)

Successfully ran sync with these results:
- **6 brand logos** updated (non-Wikimedia sources: wahanahonda.com, yamaha-motor.co.id, suzukicdn.com, etc.)
- **21 existing motorcycles** updated (image_url, price, specs from scraped data)
- **27 new motorcycles** inserted (Honda: 16 new, Yamaha: 11 new)
- **Total motorcycles in DB: 63** (was 36)

**URL mapping** is defined in `HONDA_MAP` and `YAMAHA_MAP` objects mapping URL slugs to `{id, name, category, model_code}`.

### 2.3 Failed Inserts Fix (`fix-failed-inserts.cjs`) — NOT YET RUN

9 models failed during sync due to NOT NULL constraints on `compression_ratio` or `transmission_type`. Fix script created but **not yet executed** due to terminal hanging issues.

Failed models with fallback values:

| ID | Name | Issue | Fallback |
|---|---|---|---|
| `mt_029` | Honda EM1 e: | No compression_ratio (electric) | `'N/A'`, Electric Hub Motor |
| `mt_030` | Honda Icon e: | No compression_ratio (electric) | `'N/A'`, Electric Hub Motor |
| `mt_115` | Yamaha TMAX Tech MAX | No transmission_type | `'Automatic (CVT)'` |
| `mt_117` | Yamaha Gear Ultima | No compression_ratio | `'9.5:1'` |
| `mt_120` | Yamaha X-Ride 125 | No transmission_type | `'Automatic (CVT)'` |
| `mt_122` | Yamaha Vixion R | No compression_ratio | `'10.4:1'` |
| `mt_123` | Yamaha YZ125X | No compression_ratio (race bike) | `'N/A'`, 2-Stroke |
| `mt_124` | Yamaha YZ250X | No compression_ratio (race bike) | `'N/A'`, 2-Stroke |
| `mt_125` | Yamaha YZ250FX | No compression_ratio (race bike) | `'N/A'`, 4-Stroke |

Run with:
```bash
SUPABASE_SERVICE_ROLE_KEY=<key> node fix-failed-inserts.cjs
```

This script also generates `knowledge_base` entries for any motorcycles missing them.

---

## 3. Pending Work

### 3.1 Motorcycle Affiliate Links (Admin Panel)

**User request**: Add affiliate link management for each motorcycle in the admin panel, for marketplace links.

**What's needed:**

1. **Database**: Add `affiliate_url TEXT` column to `motorcycles` table:
   ```sql
   ALTER TABLE motorcycles ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
   ```

2. **TypeScript type**: Add `affiliate_url` to `Motorcycle` interface in `src/lib/types.ts`

3. **Admin page**: Create `src/app/admin/motorcycles/page.tsx` — lists all motorcycles with editable affiliate URL input (similar to oils/fuels pages)

4. **Admin nav**: Add `Motorcycles` nav item to `AdminLayout.tsx` `navItems` array

5. **Frontend display**: Show affiliate link button on motorcycle detail page (`src/app/motorcycle/[id]/page.tsx`) or in `TabDetail.tsx`

**Reference pattern**: See `src/app/admin/oils/page.tsx` and `src/app/admin/fuels/page.tsx` for the existing affiliate URL management pattern.

### 3.2 Correction/Feedback Form

**User request**: "Jika info ini salah, silakan isi sebuah form yang datanya akan masuk ke spreadsheet."

Add a "Report incorrect data" / "Laporkan data yang salah" form on the motorcycle detail page. When submitted, data goes to a **Google Spreadsheet** via Google Apps Script.

**What's needed:**

1. **Google Apps Script endpoint**: User needs to create a Google Sheet and deploy an Apps Script web app that receives POST data and writes rows to the sheet.

2. **Form component**: A modal or collapsible form on the motorcycle detail page with fields like:
   - What data is incorrect? (dropdown: price, compression ratio, engine type, image, other)
   - Correct value (text input)
   - Your name/email (optional)

3. **Submission**: POST to the Google Apps Script web app URL.

4. **UI placement**: A small "Info ini salah?" link/button near the specs area in `TabDetail.tsx`.

### 3.3 Update `seed-data.ts`

The local fallback seed data (`src/lib/seed-data.ts`) still has only 36 motorcycles. It needs to be updated with all 63+ models to match the Supabase database state, so the app works without Supabase (local development fallback).

### 3.4 Build, Test & Deploy

After all changes are implemented:
- Run `npm run build` to verify no TypeScript/build errors
- Commit and push to GitHub (auto-deploys to Vercel)
- Verify the deployed site works correctly

---

## 4. Current File State

### Key Files

| File | Purpose | Status |
|---|---|---|
| `scrape-products.cjs` | Product scraper | ✅ Complete |
| `scraped-products.json` | Scraped output (57 models) | ✅ Generated |
| `sync-master-data.cjs` | Supabase sync script | ✅ Ran successfully |
| `fix-failed-inserts.cjs` | Fix 9 failed inserts + KB generation | ⚠️ Created, not yet run |
| `seed-supabase.cjs` | Initial Supabase seeding | ✅ Complete (36 models) |
| `src/lib/types.ts` | TypeScript interfaces | Needs `affiliate_url` on Motorcycle |
| `src/lib/seed-data.ts` | Local fallback data | Needs update (63+ models) |
| `src/lib/data.ts` | Supabase query layer | ✅ OK |
| `src/lib/supabase.ts` | Supabase client | ✅ OK |
| `src/lib/auth.ts` | Supabase Auth helpers | ✅ OK |
| `src/components/AdminLayout.tsx` | Admin shell with sidebar | Needs Motorcycles nav item |
| `src/components/TabDetail.tsx` | Motorcycle detail tabs | Needs affiliate link display + correction form trigger |
| `src/app/admin/layout.tsx` | Admin root layout | ✅ OK |
| `src/app/admin/login/page.tsx` | Admin login | ✅ OK |
| `src/app/admin/page.tsx` | Admin dashboard | ✅ OK |
| `src/app/admin/oils/page.tsx` | Oil affiliate management | ✅ Complete |
| `src/app/admin/fuels/page.tsx` | Fuel affiliate management | ✅ Complete |
| `src/app/admin/motorcycles/page.tsx` | Motorcycle affiliate management | ❌ Not yet created |
| `src/app/motorcycle/[id]/page.tsx` | Motorcycle detail page | Needs affiliate link + correction form |
| `admin-schema.sql` | SQL for affiliate_url columns + RLS | ✅ Ran (needs motorcycles.affiliate_url) |

### Supabase Tables

| Table | Rows | Notes |
|---|---|---|
| `brands` | 6 | Honda, Yamaha, Suzuki, Kawasaki, TVS, Vespa |
| `motorcycles` | 63 (54 synced + 9 pending fix) | Real images, prices, specs from scraped data |
| `fuel_brands` | 8 | Pertalite, Pertamax, Shell, BP variants |
| `oil_brands` | 14 | 8 daily + 6 touring |
| `knowledge_base` | ~54 | Auto-generated from compression ratios |

### Supabase Credentials

- **URL**: `https://xrxygfczqqvyufmtuosw.supabase.co`
- **Anon key**: in `.env.local` (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **Service role key**: provided by user for running scripts (not stored in .env)

---

## 5. Technical Notes

### Image Sources

- **Honda**: `https://www.wahanahonda.com/assets/upload/produk/gambar/PRODUK_GAMBAR_*` (`.webp` format)
- **Yamaha**: `https://www.yamaha-motor.co.id/uploads/products/featured_image/*.png`
- **Brand logos**: Non-Wikimedia sources (wahanahonda.com, yamaha-motor.co.id, suzukicdn.com, tvsmotor.com, vespa.co.id, cookielaw.org/Kawasaki)

### WebSocket Requirement

Supabase JS client needs `ws` package for Node.js 20+ compatibility when using realtime features. For scripts that don't need realtime, omit the WebSocket transport to avoid process hanging:
```js
// GOOD for scripts:
const sb = createClient(URL, KEY);

// NEEDED for realtime:
const sb = createClient(URL, KEY, { realtime: { transport: WebSocket } });
```

### Cloudflare Bypass (Honda Scraping)

`wahanahonda.com` has aggressive Cloudflare protection. The scraper uses:
- `puppeteer` (bundled Chromium)
- `puppeteer-extra-plugin-stealth`
- **Non-headless mode** (headless: false) — critical for bypassing CF
- Long delays between pages (6-10s random)
- Session reuse from homepage visit

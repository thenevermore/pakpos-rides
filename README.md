# PakposRides

A fuel-and-oil recommendation guide for Indonesian motorcycle owners, driven by compression-ratio data.

PakposRides tells a rider which fuel octane (RON) and engine oil suit their specific motorcycle model. It maps each bike's compression ratio to an ideal octane rating, recommends suitable fuel and oil brands for daily versus touring use, and estimates full-tank refuel cost from current per-litre prices.

**Live:** https://pakpos-rides.vercel.app

## What it does

- **Motorcycle catalog** — browse models by brand, with specs (compression ratio, engine type, transmission, fuel tank capacity, fuel efficiency) and current price.
- **Compression-driven recommendations** — each model's compression ratio maps to a minimum and ideal octane, then to concrete fuel brands and oil grades (daily vs touring).
- **Refuel cost calculator** — pick a fuel variant on a model's detail page and see the full-tank cost, computed from live per-litre prices and tank capacity.
- **Homepage filters** — group all motorcycles by compression level (low / medium / high / very high) and by fuel type (RON 90 / 92 / 95 / 98).
- **Fuel price management** — per-litre prices with an active/inactive status and last-verified date, so discontinued brands (e.g. SPBU closures) can be hidden from the calculator.
- **Touring routes & gears** — AI-assisted route generation with Google Maps directions, plus a gear catalog.
- **Admin panel** — full CRUD for brands, motorcycles, fuel brands, oil brands, fuel prices, routes and gears, protected by a Supabase Auth session.
- **Share** — native Web Share on mobile, plus WhatsApp / Telegram / X / Facebook / copy-link on desktop.
- **Dark mode** — light / dark / system theme.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (class-based dark mode) |
| Database & Auth | Supabase (PostgreSQL + RLS + Auth) |
| CDN | ImageKit |
| Maps & AI | Google Maps Services, Google Generative AI |
| UI | Lucide React, Framer Motion |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project
- (Optional) ImageKit, Google Maps and Gemini accounts for CDN / maps / AI features

### Setup

```bash
git clone https://github.com/thenevermore/pakpos-rides.git
cd pakpos-rides
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Open http://localhost:3000.

### Database

Run the SQL migrations in the Supabase SQL Editor, in order:

1. `supabase-schema.sql` — core tables + RLS
2. `admin-schema.sql` — affiliate columns + admin write policies
3. `cdn-schema.sql`, `add-cdn-columns.cjs` — CDN URL columns
4. `knowledge-base-rls.sql` — knowledge_base policies
5. `fuel-efficiency-schema.sql`, `fuel-tank-schema.sql`
6. `fuel-prices-schema.sql`, `fuel-prices-status.sql`

Then seed data:

```bash
SUPABASE_SERVICE_ROLE_KEY=<your-key> node seed-supabase.cjs
```

### Environment variables

See [.env.example](.env.example). `NEXT_PUBLIC_*` values are bundled into the browser and must never hold privileged secrets. Server-only keys (`IMAGEKIT_PRIVATE_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) stay out of the client.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

Maintenance scripts (`*.cjs`) require `SUPABASE_SERVICE_ROLE_KEY` in the environment; they read it at runtime and never hardcode it.

## Deployment

Deployed on Vercel via GitHub integration. Pushing to `main` triggers a production build. Set the same environment variables in the Vercel project settings.

## Security notes

- Admin write access is enforced by Supabase RLS (`TO authenticated`), with public sign-up disabled.
- The three server API routes (`upload-image`, `generate-route`, `check-routes`) verify a Supabase Auth bearer token and apply a per-IP rate limit.
- Secrets live only in `.env.local` / Vercel env vars, both gitignored.

## License

MIT — see [LICENSE](LICENSE).

/**
 * Sync scraped product data to Supabase master database
 * - Updates existing motorcycles (image_url, price, specs)
 * - Inserts new motorcycle models
 * - Updates brand logos from working sources
 * 
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node sync-master-data.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const { WebSocket } = require('ws');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY env variable is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});

// Load scraped data
const scraped = JSON.parse(fs.readFileSync('scraped-products.json', 'utf8'));

// ────────────────────────────────────────────
// MAPPING: URL slug → { existing_id, name, category, model_code }
// ────────────────────────────────────────────

// Honda URL slug → master data mapping
const HONDA_MAP = {
  'honda-beat':             { id: 'mt_001', name: 'Honda BeAT',             category: 'matic',  model_code: 'K1A' },
  'honda-beat-street':      { id: 'mt_013', name: 'Honda BeAT Street',      category: 'matic',  model_code: 'K1B' },
  'honda-genio':            { id: 'mt_014', name: 'Honda Genio',            category: 'matic',  model_code: 'K1C' },
  'honda-scoopy':           { id: 'mt_003', name: 'Honda Scoopy',           category: 'matic',  model_code: 'K4R' },
  'honda-vario-125':        { id: 'mt_015', name: 'Honda Vario 125',        category: 'matic',  model_code: 'K5N' },
  'honda-vario-125-street': { id: 'mt_016', name: 'Honda Vario 125 Street', category: 'matic',  model_code: 'K5NS' },
  'honda-vario-160':        { id: 'mt_002', name: 'Honda Vario 160',        category: 'matic',  model_code: 'K5M' },
  'honda-stylo-160':        { id: 'mt_017', name: 'Honda Stylo 160',        category: 'matic',  model_code: 'K5T' },
  'honda-pcx-160':          { id: 'mt_004', name: 'Honda PCX 160',          category: 'matic',  model_code: 'K45R' },
  'honda-adv-160':          { id: 'mt_005', name: 'Honda ADV 160',          category: 'matic',  model_code: 'K45S' },
  'honda-forza':            { id: 'mt_018', name: 'Honda Forza',            category: 'matic',  model_code: 'K45F' },
  'honda-revo':             { id: 'mt_009', name: 'Honda Revo',             category: 'bebek',  model_code: 'K15' },
  'honda-supra-x-125-fi':   { id: 'mt_008', name: 'Honda Supra X 125 FI',   category: 'bebek',  model_code: 'K56' },
  'honda-supra-gtr-150':    { id: 'mt_019', name: 'Honda Supra GTR 150',    category: 'bebek',  model_code: 'K59' },
  'honda-super-cub-c125':   { id: 'mt_020', name: 'Honda Super Cub C125',   category: 'bebek',  model_code: 'C125' },
  'honda-ct125':            { id: 'mt_021', name: 'Honda CT125',            category: 'bebek',  model_code: 'CT125' },
  'honda-cb150-verza':      { id: 'mt_022', name: 'Honda CB150 Verza',      category: 'naked',  model_code: 'CB150V' },
  'honda-cb150r-streetfire':{ id: 'mt_010', name: 'Honda CB150R Streetfire', category: 'naked', model_code: 'CB150' },
  'honda-cb150x':           { id: 'mt_023', name: 'Honda CB150X',           category: 'naked',  model_code: 'CB150X' },
  'honda-sonic-150r':       { id: 'mt_024', name: 'Honda Sonic 150R',       category: 'bebek',  model_code: 'SN150' },
  'honda-cbr150r':          { id: 'mt_006', name: 'Honda CBR150R',          category: 'sport',  model_code: 'GL5' },
  'honda-crf150l':          { id: 'mt_012', name: 'Honda CRF150L',          category: 'trail',  model_code: 'CRF150' },
  'honda-cbr250rr':         { id: 'mt_007', name: 'Honda CBR250RR',         category: 'sport',  model_code: 'GL6' },
  'honda-crf250l':          { id: 'mt_025', name: 'Honda CRF250L',          category: 'trail',  model_code: 'CRF250L' },
  'honda-st125-dax':        { id: 'mt_026', name: 'Honda ST125 Dax',        category: 'bebek',  model_code: 'ST125' },
  'honda-monkey':           { id: 'mt_027', name: 'Honda Monkey',           category: 'bebek',  model_code: 'MNK125' },
  'honda-crf250-rally':     { id: 'mt_028', name: 'Honda CRF250 Rally',     category: 'trail',  model_code: 'CRF250R' },
  'honda-em1-e':            { id: 'mt_029', name: 'Honda EM1 e:',           category: 'matic',  model_code: 'EM1E' },
  'honda-icon-e':           { id: 'mt_030', name: 'Honda Icon e:',          category: 'matic',  model_code: 'ICNE' },
};

// Yamaha URL slug → master data mapping
const YAMAHA_MAP = {
  'aerox-alpha':                  { id: 'mt_111', name: 'Yamaha Aerox Alpha',       category: 'matic',  model_code: 'SXA' },
  'lexi-lx-155':                  { id: 'mt_112', name: 'Yamaha LEXi LX 155',       category: 'matic',  model_code: 'LX155' },
  'all-new-nmax155-connected':    { id: 'mt_103', name: 'Yamaha NMAX 155',          category: 'matic',  model_code: 'SG155' },
  'all-new-aerox155-connected':   { id: 'mt_104', name: 'Yamaha Aerox 155',         category: 'matic',  model_code: 'SG125' },
  'nmax-turbo':                   { id: 'mt_113', name: 'Yamaha NMAX Turbo',        category: 'matic',  model_code: 'SNT' },
  'xmax-connected':               { id: 'mt_114', name: 'Yamaha XMAX Connected',    category: 'matic',  model_code: 'XMAX' },
  'tmax-tech-max':                { id: 'mt_115', name: 'Yamaha TMAX Tech MAX',     category: 'matic',  model_code: 'TMAX' },
  'grand-filano':                 { id: 'mt_116', name: 'Yamaha Grand Filano',      category: 'matic',  model_code: 'GF125' },
  'fazzio':                       { id: 'mt_106', name: 'Yamaha Fazzio 125',        category: 'matic',  model_code: 'B15' },
  'gear-ultima':                  { id: 'mt_117', name: 'Yamaha Gear Ultima',       category: 'matic',  model_code: 'GU125' },
  'gear-125':                     { id: 'mt_118', name: 'Yamaha Gear 125',          category: 'matic',  model_code: 'GR125' },
  'freego-125':                   { id: 'mt_119', name: 'Yamaha FreeGo 125',        category: 'matic',  model_code: 'FG125' },
  'x-ride':                       { id: 'mt_120', name: 'Yamaha X-Ride 125',        category: 'matic',  model_code: 'XR125' },
  'mio-m3':                       { id: 'mt_105', name: 'Yamaha Mio M3 125',        category: 'matic',  model_code: 'KA2' },
  'fino':                         { id: 'mt_121', name: 'Yamaha Fino 125',          category: 'matic',  model_code: 'FN125' },
  'xsr-155':                      { id: 'mt_107', name: 'Yamaha XSR 155',           category: 'naked',  model_code: 'XSR155' },
  'all-new-R15-connected':        { id: 'mt_102', name: 'Yamaha R15 V4',            category: 'sport',  model_code: 'RG150R' },
  'mt25':                         { id: 'mt_109', name: 'Yamaha MT-25',             category: 'naked',  model_code: 'MT250' },
  'r25':                          { id: 'mt_110', name: 'Yamaha R25',               category: 'sport',  model_code: 'R250' },
  'mt15':                         { id: 'mt_101', name: 'Yamaha MT-15 VVA',         category: 'naked',  model_code: 'RG150' },
  'vixion':                       { id: 'mt_122', name: 'Yamaha Vixion R',          category: 'naked',  model_code: 'VX155' },
  'wr155r':                       { id: 'mt_108', name: 'Yamaha WR 155R',           category: 'trail',  model_code: 'WR155' },
  'yz125x':                       { id: 'mt_123', name: 'Yamaha YZ125X',            category: 'trail',  model_code: 'YZ125X' },
  'yz250x':                       { id: 'mt_124', name: 'Yamaha YZ250X',            category: 'trail',  model_code: 'YZ250X' },
  'yz250fx':                      { id: 'mt_125', name: 'Yamaha YZ250FX',           category: 'trail',  model_code: 'YZ250FX' },
  'mx-king-150':                  { id: 'mt_126', name: 'Yamaha MX King 150',       category: 'bebek',  model_code: 'MXK150' },
  'jupiter-z1':                   { id: 'mt_127', name: 'Yamaha Jupiter Z1',        category: 'bebek',  model_code: 'JPZ1' },
  'vega-force':                   { id: 'mt_128', name: 'Yamaha Vega Force',        category: 'bebek',  model_code: 'VGF' },
};

// Brand logos from working sources
const BRAND_LOGOS = {
  br_001: 'https://www.wahanahonda.com/assets/frontend/img/logo.png',
  br_002: 'https://www.yamaha-motor.co.id/web_new/shared/image/logo-sepeda-motor-yamaha-indonesia.png',
  br_003: 'https://suzukicdn.com/themes/default2019/img/logo-suzuki-color.webp',
  br_004: 'https://cdn.cookielaw.org/logos/045ffde2-647c-41d8-8fd2-848407f04871/abe1f270-c6d1-4b28-a961-e9ef03d466cd/e5ca68d0-ce18-4384-a805-edc457944b2c/Corporate_Brand_Logotype_Red_RGB.png',
  br_005: 'https://indonesia.tvsmotor.com/-/media/Feature/IB/TVS-Logo/tvs-logo.png',
  br_006: 'https://vespa.co.id/assets/img/footer/fab/logo-vespa.png',
};

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────

function normalizeCompressionRatio(raw) {
  if (!raw) return null;
  // "10.0 : 1" → "10.0:1", "11.6 : 1" → "11.6:1"
  return raw.replace(/\s*:\s*/g, ':').trim();
}

function extractCC(raw) {
  if (!raw) return null;
  const m = raw.match(/([\d.,]+)\s*cc/i);
  return m ? m[1].replace(',', '.') + 'cc' : raw.trim();
}

function buildEngineDescription(specs) {
  const parts = [];
  const cc = specs['Volume Langkah'] || specs['Volume Silinder'] || specs['Kapasitas Mesin'];
  if (cc) parts.push(extractCC(cc));
  
  const cooling = specs['Sistem Pendingin Mesin'] || '';
  if (cooling.toLowerCase().includes('udara') || cooling.toLowerCase().includes('air cool')) parts.push('Air Cooled');
  else if (cooling.toLowerCase().includes('liquid') || cooling.toLowerCase().includes('cair')) parts.push('Liquid Cooled');
  
  const engineType = specs['Tipe Mesin'] || '';
  if (engineType.match(/4.?langkah|4.?stroke/i)) parts.push('4-Stroke');
  if (engineType.match(/SOHC/i)) parts.push('SOHC');
  else if (engineType.match(/DOHC/i)) parts.push('DOHC');
  if (engineType.match(/VVA/i)) parts.push('VVA');
  if (engineType.match(/eSP/i)) parts.push('eSP');
  if (engineType.match(/Blue Core/i)) parts.push('Blue Core');
  if (engineType.match(/Hybrid/i)) parts.push('Hybrid');
  
  return parts.join(', ');
}

function mapTransmission(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('otomatis') || lower.includes('automatic') || lower.includes('v-matic') || lower.includes('cvt')) return 'Automatic (CVT)';
  const speedMatch = raw.match(/(\d)\s*speed/i);
  if (speedMatch) return `Manual ${speedMatch[0]}`;
  if (lower.includes('manual')) return 'Manual';
  return raw;
}

// ────────────────────────────────────────────
// MAIN SYNC
// ────────────────────────────────────────────

async function sync() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  PakposRides Master Data Sync            ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const updates = [];
  const inserts = [];

  // Process Honda
  for (const item of scraped.honda) {
    if (item.error) continue;
    const slug = item.url.split('/').pop();
    const mapping = HONDA_MAP[slug];
    if (!mapping) { console.log(`⚠️  No mapping for Honda: ${slug}`); continue; }

    const record = {
      id: mapping.id,
      brand_id: 'br_001',
      name: mapping.name,
      model_code: mapping.model_code,
      category: mapping.category,
      image_url: item.image_url,
      latest_price: item.price,
      compression_ratio: normalizeCompressionRatio(item.compression_ratio),
      engine_type: buildEngineDescription(item.specs || {}),
      transmission_type: mapTransmission(item.transmission),
      last_updated: new Date().toISOString().split('T')[0],
    };

    // Check if it's an existing model
    const existingIds = Object.values(HONDA_MAP).filter(m => ['mt_001','mt_002','mt_003','mt_004','mt_005','mt_006','mt_007','mt_008','mt_009','mt_010','mt_011','mt_012'].includes(m.id)).map(m => m.id);
    if (existingIds.includes(mapping.id)) {
      updates.push(record);
    } else {
      inserts.push(record);
    }
  }

  // Process Yamaha
  for (const item of scraped.yamaha) {
    if (item.error) continue;
    const slug = item.url.split('/').pop();
    const mapping = YAMAHA_MAP[slug];
    if (!mapping) { console.log(`⚠️  No mapping for Yamaha: ${slug}`); continue; }

    const record = {
      id: mapping.id,
      brand_id: 'br_002',
      name: mapping.name,
      model_code: mapping.model_code,
      category: mapping.category,
      image_url: item.image_url,
      latest_price: item.price,
      compression_ratio: normalizeCompressionRatio(item.compression_ratio),
      engine_type: buildEngineDescription(item.specs || {}),
      transmission_type: mapTransmission(item.transmission),
      last_updated: new Date().toISOString().split('T')[0],
    };

    const existingIds = ['mt_101','mt_102','mt_103','mt_104','mt_105','mt_106','mt_107','mt_108','mt_109','mt_110'];
    if (existingIds.includes(mapping.id)) {
      updates.push(record);
    } else {
      inserts.push(record);
    }
  }

  // 1. Update brand logos
  console.log('━━━ Updating brand logos ━━━\n');
  for (const [id, logo_url] of Object.entries(BRAND_LOGOS)) {
    const { error } = await supabase.from('brands').update({ logo_url }).eq('id', id);
    console.log(`  ${error ? '❌' : '✅'} Brand ${id}`);
  }

  // 2. Update existing motorcycles
  console.log(`\n━━━ Updating ${updates.length} existing motorcycles ━━━\n`);
  for (const record of updates) {
    const { error } = await supabase.from('motorcycles').update(record).eq('id', record.id);
    console.log(`  ${error ? '❌' : '✅'} ${record.name} (${record.id})`);
    if (error) console.log(`     Error: ${error.message}`);
  }

  // 3. Insert new motorcycles
  console.log(`\n━━━ Inserting ${inserts.length} new motorcycles ━━━\n`);
  for (const record of inserts) {
    // Use upsert to avoid conflicts
    const { error } = await supabase.from('motorcycles').upsert(record, { onConflict: 'id' });
    console.log(`  ${error ? '❌' : '✅'} ${record.name} (${record.id})`);
    if (error) console.log(`     Error: ${error.message}`);
  }

  // 4. Summary
  const { count } = await supabase.from('motorcycles').select('*', { count: 'exact', head: true });
  const { count: brandCount } = await supabase.from('brands').select('*', { count: 'exact', head: true });
  
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  SYNC COMPLETE                           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Updated: ${updates.length} motorcycles              ║`);
  console.log(`║  Inserted: ${inserts.length} motorcycles             ║`);
  console.log(`║  Total motorcycles in DB: ${count}            ║`);
  console.log(`║  Total brands in DB: ${brandCount}                 ║`);
  console.log('╚══════════════════════════════════════════╝');
}

sync().catch(console.error);

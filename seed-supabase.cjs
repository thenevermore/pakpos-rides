#!/usr/bin/env node
/**
 * Supabase Seed Script for PakposRides
 * Run with: SUPABASE_SERVICE_ROLE_KEY=<key> node seed-supabase.cjs
 * 
 * Get the service_role key from: Supabase Dashboard > Settings > API > Project API keys > service_role
 */
const { createClient } = require('@supabase/supabase-js');
const { WebSocket } = require('ws');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  console.error('Get it from: Supabase Dashboard > Settings > API > Project API keys > service_role');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-key> node seed-supabase.cjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});

// ============ SEED DATA ============

const brands = [
  { id: 'br_001', name: 'Honda', slug: 'honda', logo_url: null, country: 'Japan' },
  { id: 'br_002', name: 'Yamaha', slug: 'yamaha', logo_url: null, country: 'Japan' },
  { id: 'br_003', name: 'Suzuki', slug: 'suzuki', logo_url: null, country: 'Japan' },
  { id: 'br_004', name: 'Kawasaki', slug: 'kawasaki', logo_url: null, country: 'Japan' },
  { id: 'br_005', name: 'TVS', slug: 'tvs', logo_url: null, country: 'India' },
  { id: 'br_006', name: 'Vespa', slug: 'vespa', logo_url: null, country: 'Italy' },
];

const fuelBrands = [
  { id: 'fb_001', name: 'Pertalite', octane: 90, logo_url: null, producer: 'Pertamina' },
  { id: 'fb_002', name: 'Pertamax', octane: 92, logo_url: null, producer: 'Pertamina' },
  { id: 'fb_003', name: 'Pertamax Turbo', octane: 98, logo_url: null, producer: 'Pertamina' },
  { id: 'fb_004', name: 'Shell Super', octane: 92, logo_url: null, producer: 'Shell' },
  { id: 'fb_005', name: 'Shell V-Power', octane: 95, logo_url: null, producer: 'Shell' },
  { id: 'fb_006', name: 'BP 92', octane: 92, logo_url: null, producer: 'BP' },
  { id: 'fb_007', name: 'BP 95', octane: 95, logo_url: null, producer: 'BP' },
  { id: 'fb_008', name: 'Shell Regular', octane: 90, logo_url: null, producer: 'Shell' },
];

const oilBrands = [
  { id: 'ob_001', name: 'Motul 5100 10W-40', base_type: 'Semi Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_002', name: 'Shell Advance Ultra 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_003', name: 'Castrol Power1 Racing 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_004', name: 'Yamalube Super Sport 10W-40', base_type: 'Semi Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_005', name: 'AHM Oil MPX2 10W-30', base_type: 'Semi Synthetic', viscosity: '10W-30', certification: 'JASO MA', usage_type: 'daily', logo_url: null },
  { id: 'ob_006', name: 'Motul Scooter LE 10W-30', base_type: 'Semi Synthetic', viscosity: '10W-30', certification: 'JASO MB', usage_type: 'daily', logo_url: null },
  { id: 'ob_007', name: 'Shell Advance 4T AX7 10W-40', base_type: 'Semi Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_008', name: 'Liqui Moly Street Race 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'daily', logo_url: null },
  { id: 'ob_101', name: 'Motul 7100 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
  { id: 'ob_102', name: 'Liqui Moly Street 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
  { id: 'ob_103', name: 'Castrol Power1 4T 10W-50', base_type: 'Full Synthetic', viscosity: '10W-50', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
  { id: 'ob_104', name: 'Motul 300V Factory Line 5W-40', base_type: 'Full Synthetic (Ester)', viscosity: '5W-40', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
  { id: 'ob_105', name: 'Shell Advance Ultra 4T 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
  { id: 'ob_106', name: 'Amsoil Metric 10W-40', base_type: 'Full Synthetic', viscosity: '10W-40', certification: 'JASO MA2', usage_type: 'touring', logo_url: null },
];

const motorcycles = [
  // HONDA
  { id: 'mt_001', brand_id: 'br_001', model_code: 'K1A', name: 'Honda BeAT', latest_price: 18500000, compression_ratio: '10.0:1', engine_type: '110cc, Air Cooled, 4-Stroke, SOHC, eSP', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_002', brand_id: 'br_001', model_code: 'K5M', name: 'Honda Vario 160', latest_price: 27350000, compression_ratio: '12.0:1', engine_type: '157cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, eSP+', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_003', brand_id: 'br_001', model_code: 'K4R', name: 'Honda Scoopy', latest_price: 22600000, compression_ratio: '10.0:1', engine_type: '110cc, Air Cooled, 4-Stroke, SOHC, eSP', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_004', brand_id: 'br_001', model_code: 'K45R', name: 'Honda PCX 160', latest_price: 35600000, compression_ratio: '12.0:1', engine_type: '157cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, eSP+', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_005', brand_id: 'br_001', model_code: 'K45S', name: 'Honda ADV 160', latest_price: 39300000, compression_ratio: '12.0:1', engine_type: '157cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, eSP+', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_006', brand_id: 'br_001', model_code: 'GL5', name: 'Honda CBR150R', latest_price: 37680000, compression_ratio: '11.3:1', engine_type: '150cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_007', brand_id: 'br_001', model_code: 'GL6', name: 'Honda CBR250RR', latest_price: 67300000, compression_ratio: '11.5:1', engine_type: '249cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_008', brand_id: 'br_001', model_code: 'K56', name: 'Honda Supra X 125', latest_price: 19980000, compression_ratio: '9.3:1', engine_type: '125cc, Air Cooled, 4-Stroke, SOHC', transmission_type: 'Manual 4-Speed', category: 'bebek', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_009', brand_id: 'br_001', model_code: 'K15', name: 'Honda Revo', latest_price: 17200000, compression_ratio: '9.3:1', engine_type: '110cc, Air Cooled, 4-Stroke, SOHC', transmission_type: 'Manual 4-Speed', category: 'bebek', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_010', brand_id: 'br_001', model_code: 'CB150', name: 'Honda CB150R Streetfire', latest_price: 30660000, compression_ratio: '11.3:1', engine_type: '150cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_011', brand_id: 'br_001', model_code: 'CB650', name: 'Honda CB650R', latest_price: 169000000, compression_ratio: '11.6:1', engine_type: '649cc, Liquid Cooled, 4-Stroke, DOHC, 16-Valves, Inline 4', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_012', brand_id: 'br_001', model_code: 'CRF150', name: 'Honda CRF150L', latest_price: 35350000, compression_ratio: '9.5:1', engine_type: '150cc, Air Cooled, 4-Stroke, SOHC, 2-Valves', transmission_type: 'Manual 5-Speed', category: 'trail', image_url: null, last_updated: '2025-01-01' },
  // YAMAHA
  { id: 'mt_101', brand_id: 'br_002', model_code: 'RG150', name: 'Yamaha MT-15 VVA', latest_price: 38500000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_102', brand_id: 'br_002', model_code: 'RG150R', name: 'Yamaha R15 V4', latest_price: 44500000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_103', brand_id: 'br_002', model_code: 'SG155', name: 'Yamaha NMAX 155', latest_price: 32175000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA, Blue Core', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_104', brand_id: 'br_002', model_code: 'SG125', name: 'Yamaha Aerox 155', latest_price: 27425000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA, Blue Core', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_105', brand_id: 'br_002', model_code: 'KA2', name: 'Yamaha Mio M3 125', latest_price: 17750000, compression_ratio: '9.5:1', engine_type: '125cc, Air Cooled, 4-Stroke, SOHC, 2-Valves, Blue Core', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_106', brand_id: 'br_002', model_code: 'B15', name: 'Yamaha Fazzio 125', latest_price: 22500000, compression_ratio: '10.5:1', engine_type: '125cc, Air Cooled, 4-Stroke, SOHC, 2-Valves, Blue Core, Hybrid', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_107', brand_id: 'br_002', model_code: 'XSR155', name: 'Yamaha XSR 155', latest_price: 39800000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_108', brand_id: 'br_002', model_code: 'WR155', name: 'Yamaha WR 155R', latest_price: 39600000, compression_ratio: '11.6:1', engine_type: '155cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, VVA', transmission_type: 'Manual 6-Speed', category: 'trail', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_109', brand_id: 'br_002', model_code: 'MT250', name: 'Yamaha MT-25', latest_price: 58500000, compression_ratio: '11.6:1', engine_type: '249cc, Liquid Cooled, 4-Stroke, DOHC, 8-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_110', brand_id: 'br_002', model_code: 'R250', name: 'Yamaha R25', latest_price: 62500000, compression_ratio: '11.6:1', engine_type: '249cc, Liquid Cooled, 4-Stroke, DOHC, 8-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  // SUZUKI
  { id: 'mt_201', brand_id: 'br_003', model_code: 'FU150', name: 'Suzuki Satria F150', latest_price: 29600000, compression_ratio: '11.5:1', engine_type: '147cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves', transmission_type: 'Manual 6-Speed', category: 'bebek', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_202', brand_id: 'br_003', model_code: 'GSX150R', name: 'Suzuki GSX-R150', latest_price: 36500000, compression_ratio: '11.5:1', engine_type: '147cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_203', brand_id: 'br_003', model_code: 'GSX150S', name: 'Suzuki GSX-S150', latest_price: 31500000, compression_ratio: '11.5:1', engine_type: '147cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_204', brand_id: 'br_003', model_code: 'AD110', name: 'Suzuki Address 110', latest_price: 18500000, compression_ratio: '9.6:1', engine_type: '113cc, Air Cooled, 4-Stroke, SOHC', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_205', brand_id: 'br_003', model_code: 'GSX250R', name: 'Suzuki GSX-250R', latest_price: 52500000, compression_ratio: '11.5:1', engine_type: '248cc, Liquid Cooled, 4-Stroke, DOHC, 4-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  // KAWASAKI
  { id: 'mt_301', brand_id: 'br_004', model_code: 'NINJA250', name: 'Kawasaki Ninja 250', latest_price: 66800000, compression_ratio: '11.3:1', engine_type: '249cc, Liquid Cooled, 4-Stroke, DOHC, 8-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_302', brand_id: 'br_004', model_code: 'NINJA400', name: 'Kawasaki Ninja 400', latest_price: 98600000, compression_ratio: '11.3:1', engine_type: '399cc, Liquid Cooled, 4-Stroke, DOHC, 8-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'sport', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_303', brand_id: 'br_004', model_code: 'W175', name: 'Kawasaki W175', latest_price: 34800000, compression_ratio: '9.5:1', engine_type: '177cc, Air Cooled, 4-Stroke, SOHC, 2-Valves', transmission_type: 'Manual 5-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_304', brand_id: 'br_004', model_code: 'KLX150', name: 'Kawasaki KLX 150', latest_price: 37900000, compression_ratio: '9.5:1', engine_type: '144cc, Air Cooled, 4-Stroke, SOHC, 2-Valves', transmission_type: 'Manual 5-Speed', category: 'trail', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_305', brand_id: 'br_004', model_code: 'Z250', name: 'Kawasaki Z250', latest_price: 57900000, compression_ratio: '11.3:1', engine_type: '249cc, Liquid Cooled, 4-Stroke, DOHC, 8-Valves, Parallel Twin', transmission_type: 'Manual 6-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  // TVS
  { id: 'mt_401', brand_id: 'br_005', model_code: 'APACHE160', name: 'TVS Apache RTR 160', latest_price: 28900000, compression_ratio: '10.1:1', engine_type: '159cc, Air Cooled, 4-Stroke, SOHC, 2-Valves', transmission_type: 'Manual 5-Speed', category: 'naked', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_402', brand_id: 'br_005', model_code: 'NTORQ125', name: 'TVS Ntorq 125', latest_price: 23500000, compression_ratio: '10.5:1', engine_type: '124cc, Air Cooled, 4-Stroke, SOHC, 3-Valves', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  // VESPA
  { id: 'mt_501', brand_id: 'br_006', model_code: 'SPRINT150', name: 'Vespa Sprint 150', latest_price: 53500000, compression_ratio: '10.5:1', engine_type: '155cc, Air Cooled, 4-Stroke, SOHC, 3-Valves, i-get', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
  { id: 'mt_502', brand_id: 'br_006', model_code: 'GTS300', name: 'Vespa GTS 300', latest_price: 139000000, compression_ratio: '10.5:1', engine_type: '278cc, Liquid Cooled, 4-Stroke, SOHC, 4-Valves, i-get', transmission_type: 'Automatic (CVT)', category: 'matic', image_url: null, last_updated: '2025-01-01' },
];

// Compression ratio -> octane mapping
function getOctaneRecommendation(compressionRatio) {
  const ratio = parseFloat(compressionRatio);
  if (ratio < 9.0) return { min: 88, ideal: 90, fuelIds: ['fb_001', 'fb_008'] };
  if (ratio < 10.0) return { min: 90, ideal: 90, fuelIds: ['fb_001', 'fb_008'] };
  if (ratio < 11.0) return { min: 90, ideal: 92, fuelIds: ['fb_002', 'fb_004', 'fb_006'] };
  if (ratio < 12.0) return { min: 92, ideal: 95, fuelIds: ['fb_003', 'fb_005', 'fb_007'] };
  return { min: 95, ideal: 98, fuelIds: ['fb_003', 'fb_005', 'fb_007'] };
}

function getOilRecommendation(category) {
  if (category === 'matic') {
    return { dailyIds: ['ob_006', 'ob_002', 'ob_003'], touringIds: ['ob_102', 'ob_103', 'ob_105'] };
  }
  return { dailyIds: ['ob_001', 'ob_002', 'ob_004', 'ob_007'], touringIds: ['ob_101', 'ob_102', 'ob_104', 'ob_105'] };
}

async function upsertBatch(table, data) {
  const { error } = await supabase.from(table).upsert(data, { onConflict: 'id' });
  if (error) {
    console.error(`  ERROR inserting ${table}:`, error.message);
    return false;
  }
  console.log(`  Inserted ${data.length} rows into ${table}`);
  return true;
}

async function main() {
  console.log('========================================');
  console.log('PakposRides - Supabase Seed Script');
  console.log('========================================');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('');

  // 1. Brands
  console.log('Seeding brands...');
  await upsertBatch('brands', brands);

  // 2. Fuel brands
  console.log('Seeding fuel brands...');
  await upsertBatch('fuel_brands', fuelBrands);

  // 3. Oil brands
  console.log('Seeding oil brands...');
  await upsertBatch('oil_brands', oilBrands);

  // 4. Motorcycles
  console.log('Seeding motorcycles...');
  await upsertBatch('motorcycles', motorcycles);

  // 5. Knowledge base (auto-generated from compression ratios)
  console.log('Generating knowledge base...');
  const knowledgeBase = motorcycles.map(m => {
    const octane = getOctaneRecommendation(m.compression_ratio);
    const oil = getOilRecommendation(m.category);
    return {
      id: `kb_${m.id}`,
      motorcycle_id: m.id,
      min_octane: octane.min,
      ideal_octane: octane.ideal,
      fuel_brand_ids: octane.fuelIds,
      oil_daily_ids: oil.dailyIds,
      oil_touring_ids: oil.touringIds,
    };
  });
  await upsertBatch('knowledge_base', knowledgeBase);

  console.log('');
  console.log('========================================');
  console.log('Seeding complete!');
  console.log('========================================');
  console.log(`  ${brands.length} brands`);
  console.log(`  ${fuelBrands.length} fuel brands`);
  console.log(`  ${oilBrands.length} oil brands`);
  console.log(`  ${motorcycles.length} motorcycles`);
  console.log(`  ${knowledgeBase.length} knowledge base entries`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

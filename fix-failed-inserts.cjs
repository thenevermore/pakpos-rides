/**
 * Fix failed inserts and generate knowledge_base entries
 */
const { createClient } = require('@supabase/supabase-js');
const { WebSocket } = require('ws');

const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
global.WebSocket = WebSocket;
const sb = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });
// Full records for failed inserts (need brand_id, name, model_code, etc.)
const failedInserts = [
  { id:'mt_029', brand_id:'br_001', model_code:'EM1E', name:'Honda EM1 e:', compression_ratio:'N/A', engine_type:'Electric Hub Motor', transmission_type:'Single Speed', category:'matic', latest_price:40000000, image_url:'https://www.wahanahonda.com/assets/upload/produk/gambar/PRODUK_GAMBAR_45_2023-12-21.webp', last_updated:'2025-06-15' },
  { id:'mt_030', brand_id:'br_001', model_code:'ICNE', name:'Honda Icon e:', compression_ratio:'N/A', engine_type:'Electric Hub Motor', transmission_type:'Single Speed', category:'matic', latest_price:28000000, image_url:'https://www.wahanahonda.com/assets/upload/produk/gambar/PRODUK_GAMBAR_47_2024-10-09.webp', last_updated:'2025-06-15' },
  { id:'mt_115', brand_id:'br_002', model_code:'TMAX', name:'Yamaha TMAX Tech MAX', compression_ratio:'10.9:1', engine_type:'561.88cc, Liquid Cooled, 4-Stroke, 4-Valves, 2-Cylinder', transmission_type:'Automatic (CVT)', category:'matic', latest_price:475000000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/2026012112000740123E5134.png', last_updated:'2025-06-15' },
  { id:'mt_117', brand_id:'br_002', model_code:'GU125', name:'Yamaha Gear Ultima', compression_ratio:'9.5:1', engine_type:'124.86cc, Air Cooled, 4-Stroke, SOHC', transmission_type:'Automatic (CVT)', category:'matic', latest_price:22685000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/202604021124218894J.png', last_updated:'2025-06-15' },
  { id:'mt_120', brand_id:'br_002', model_code:'XR125', name:'Yamaha X-Ride 125', compression_ratio:'9.5:1', engine_type:'125cc, Air Cooled, 4-Stroke, SOHC, Blue Core', transmission_type:'Automatic (CVT)', category:'matic', latest_price:21135000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/2025070409402252373C51406.png', last_updated:'2025-06-15' },
  { id:'mt_122', brand_id:'br_002', model_code:'VX155', name:'Yamaha Vixion R', compression_ratio:'10.4:1', engine_type:'155cc, Liquid Cooled, 4-Stroke, SOHC', transmission_type:'Manual 6-Speed', category:'naked', latest_price:34020000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/2023022109421344125G78257.png', last_updated:'2025-06-15' },
  { id:'mt_123', brand_id:'br_002', model_code:'YZ125X', name:'Yamaha YZ125X', compression_ratio:'N/A', engine_type:'125cc, 2-Stroke, Liquid Cooled', transmission_type:'Manual 6-Speed', category:'trail', latest_price:99800000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/202606031052219193A.png', last_updated:'2025-06-15' },
  { id:'mt_124', brand_id:'br_002', model_code:'YZ250X', name:'Yamaha YZ250X', compression_ratio:'N/A', engine_type:'250cc, 2-Stroke, Liquid Cooled', transmission_type:'Manual 5-Speed', category:'trail', latest_price:132000000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/202606031053343044T.png', last_updated:'2025-06-15' },
  { id:'mt_125', brand_id:'br_002', model_code:'YZ250FX', name:'Yamaha YZ250FX', compression_ratio:'N/A', engine_type:'250cc, 4-Stroke, Liquid Cooled', transmission_type:'Manual 5-Speed', category:'trail', latest_price:140000000, image_url:'https://www.yamaha-motor.co.id/uploads/products/featured_image/202606031050479381F.png', last_updated:'2025-06-15' },
];

async function main() {
  console.log('Upserting failed inserts...');
  for (const f of failedInserts) {
    const { error } = await sb.from('motorcycles').upsert(f, { onConflict: 'id' });
    console.log(`  ${error ? 'FAIL' : 'OK'} ${f.id} (${f.name})`, error?.message || '');
  }

  const { count } = await sb.from('motorcycles').select('*', { count: 'exact', head: true });
  console.log(`\nTotal motorcycles: ${count}`);

  // Generate knowledge_base for new entries
  const { data: allM } = await sb.from('motorcycles').select('id, compression_ratio, category');
  const { data: existingKb } = await sb.from('knowledge_base').select('motorcycle_id');
  const existIds = new Set((existingKb || []).map(e => e.motorcycle_id));

  const newKb = [];
  for (const m of allM) {
    if (existIds.has(m.id)) continue;
    const r = parseFloat(m.compression_ratio) || 10;
    let min = 90, ideal = 92, fids = ['fb_002', 'fb_004', 'fb_006'];
    if (r < 9) { min = 88; ideal = 90; fids = ['fb_001', 'fb_008']; }
    else if (r < 10) { min = 90; ideal = 90; fids = ['fb_001', 'fb_008']; }
    else if (r < 11) { min = 90; ideal = 92; fids = ['fb_002', 'fb_004', 'fb_006']; }
    else if (r < 12) { min = 92; ideal = 95; fids = ['fb_003', 'fb_005', 'fb_007']; }
    else { min = 95; ideal = 98; fids = ['fb_003', 'fb_005', 'fb_007']; }
    const isMatic = m.category === 'matic';
    const dIds = isMatic ? ['ob_006', 'ob_002', 'ob_003'] : ['ob_001', 'ob_002', 'ob_004', 'ob_007'];
    const tIds = isMatic ? ['ob_102', 'ob_103', 'ob_105'] : ['ob_101', 'ob_102', 'ob_104', 'ob_105'];
    newKb.push({ id: 'kb_' + m.id, motorcycle_id: m.id, min_octane: min, ideal_octane: ideal, fuel_brand_ids: fids, oil_daily_ids: dIds, oil_touring_ids: tIds });
  }

  if (newKb.length > 0) {
    const { error: e2 } = await sb.from('knowledge_base').upsert(newKb, { onConflict: 'id' });
    console.log(`KB insert: ${newKb.length} rows`, e2?.message || 'OK');
  } else {
    console.log('No new KB entries needed');
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

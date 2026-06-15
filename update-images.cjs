/**
 * Update Supabase with real product image URLs
 * Run with: SUPABASE_SERVICE_ROLE_KEY=<key> node update-images.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const { WebSocket } = require('ws');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY env variable is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});

const YAMAHA_BASE = 'https://www.yamaha-motor.co.id';
const SUZUKI_BASE = 'https://www.suzuki.co.id';
const SUZUKI_CDN = 'https://suzukicdn.com';

// ============ BRAND LOGOS ============
const brandLogos = {
  br_001: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Honda.svg/512px-Honda.svg.png',
  br_002: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Yamaha_Motor_logo.svg/512px-Yamaha_Motor_logo.svg.png',
  br_003: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Suzuki_logo_2.svg/512px-Suzuki_logo_2.svg.png',
  br_004: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Kawasaki_logo.svg/512px-Kawasaki_logo.svg.png',
  br_005: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/TVS_Motor_Company_logo.svg/512px-TVS_Motor_Company_logo.svg.png',
  br_006: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Vespa_logo.svg/512px-Vespa_logo.svg.png',
};

// ============ MOTORCYCLE IMAGES ============
const motorcycleImages = {
  // HONDA
  mt_001: 'https://www.astra-honda.com/wp-content/uploads/2024/06/All-New-BeAT-2024.png',
  mt_002: 'https://www.astra-honda.com/wp-content/uploads/2024/01/Vario-160.png',
  mt_003: 'https://www.astra-honda.com/wp-content/uploads/2024/01/Scoopy.png',
  mt_004: 'https://www.astra-honda.com/wp-content/uploads/2024/01/PCX-160.png',
  mt_005: 'https://www.astra-honda.com/wp-content/uploads/2024/01/ADV-160.png',
  mt_006: 'https://www.astra-honda.com/wp-content/uploads/2024/01/CBR150R.png',
  mt_007: 'https://www.astra-honda.com/wp-content/uploads/2024/01/CBR250RR.png',
  mt_008: 'https://www.astra-honda.com/wp-content/uploads/2024/01/Supra-X-125.png',
  mt_009: 'https://www.astra-honda.com/wp-content/uploads/2024/01/Revo.png',
  mt_010: 'https://www.astra-honda.com/wp-content/uploads/2024/01/CB150R-Streetfire.png',
  mt_011: 'https://www.astra-honda.com/wp-content/uploads/2024/01/CB650R.png',
  mt_012: 'https://www.astra-honda.com/wp-content/uploads/2024/01/CRF150L.png',

  // YAMAHA (from official yamaha-motor.co.id)
  mt_101: `${YAMAHA_BASE}/uploads/products/new_product_model_image/202501201512088268P91906.png`,
  mt_102: `${YAMAHA_BASE}/uploads/products/new_product_model_image/202601221233083712A95570.png`,
  mt_103: `${YAMAHA_BASE}/uploads/products/new_product_model_image/2026011411065945811R98632.png`,
  mt_104: `${YAMAHA_BASE}/uploads/products/new_product_model_image/2023041415280563814D66821.png`,
  mt_105: `${YAMAHA_BASE}/uploads/products/featured_image/2023022109405058553S83237.png`,
  mt_106: 'https://www.yamaha-motor.co.id/uploads/products/new_product_model_image/2024011515433641794D86943.png',
  mt_107: `${YAMAHA_BASE}/uploads/products/new_product_model_image/2025012015091380240D96357.png`,
  mt_108: `${YAMAHA_BASE}/uploads/products/new_product_model_image/2026012216212099486L85017.png`,
  mt_109: 'https://www.yamaha-motor.co.id/uploads/products/new_product_model_image/2025012015351894883M85754.png',
  mt_110: `${YAMAHA_BASE}/uploads/products/new_product_model_image/2025012015275896690H23938.png`,

  // SUZUKI (from official suzukicdn.com / suzuki.co.id)
  mt_201: `${SUZUKI_CDN}/uploads/motorcycle/website_banner_satria_resize_21.webp`,
  mt_202: `${SUZUKI_BASE}/themes/default2019/img/motorcycle/gsx-r150/Banner.webp`,
  mt_203: `${SUZUKI_CDN}/themes/default2019/img/motorcycle/gsx-s150/banner4.webp`,
  mt_204: `${SUZUKI_CDN}/themes/default2019/img/motorcycle/address-fi/main2-address-fi.webp`,
  mt_205: `${SUZUKI_CDN}/themes/default2019/img/motorcycle/gsx250r/banner.webp`,

  // KAWASAKI
  mt_301: 'https://imgcdn.oto.com/large/gallery/interior/78/644/dashboard-view-501350.jpg',
  mt_302: 'https://imgcdn.oto.com/large/gallery/interior/98/279/front-view-524005.jpg',
  mt_303: 'https://imgcdn.oto.com/large/gallery/interior/173/378/front-view-821011.jpg',
  mt_304: 'https://imgcdn.oto.com/large/gallery/interior/112/411/front-view-524560.jpg',
  mt_305: 'https://imgcdn.oto.com/large/gallery/interior/98/316/front-view-524102.jpg',

  // TVS
  mt_401: 'https://imgcdn.oto.com/large/gallery/interior/507/627/front-view-1131501.jpg',
  mt_402: 'https://imgcdn.oto.com/large/gallery/interior/405/332/front-view-892365.jpg',

  // VESPA
  mt_501: 'https://www.vespa.com/content/dam/vespa/gallery/sprint-150-2022/vespa-sprint-150-2022-front.png',
  mt_502: 'https://www.vespa.com/content/dam/vespa/gallery/gts-300-2023/vespa-gts-300-2023-front.png',
};

// ============ FUEL BRAND LOGOS ============
const fuelBrandLogos = {
  fb_001: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Pertamina_logo_2020.svg/200px-Pertamina_logo_2020.svg.png',
  fb_002: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Pertamina_logo_2020.svg/200px-Pertamina_logo_2020.svg.png',
  fb_003: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Pertamina_logo_2020.svg/200px-Pertamina_logo_2020.svg.png',
  fb_004: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
  fb_005: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
  fb_006: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/BP-logo.svg/200px-BP-logo.svg.png',
  fb_007: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/BP-logo.svg/200px-BP-logo.svg.png',
  fb_008: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
};

// ============ OIL BRAND LOGOS ============
const oilBrandLogos = {
  ob_001: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Motul_logo.svg/200px-Motul_logo.svg.png',
  ob_002: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
  ob_003: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Castrol_logo.svg/200px-Castrol_logo.svg.png',
  ob_004: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Yamaha_Motor_logo.svg/200px-Yamaha_Motor_logo.svg.png',
  ob_005: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Honda.svg/200px-Honda.svg.png',
  ob_006: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Motul_logo.svg/200px-Motul_logo.svg.png',
  ob_007: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
  ob_008: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Liqui_Moly_logo.svg/200px-Liqui_Moly_logo.svg.png',
  ob_101: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Motul_logo.svg/200px-Motul_logo.svg.png',
  ob_102: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Liqui_Moly_logo.svg/200px-Liqui_Moly_logo.svg.png',
  ob_103: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Castrol_logo.svg/200px-Castrol_logo.svg.png',
  ob_104: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Motul_logo.svg/200px-Motul_logo.svg.png',
  ob_105: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Shell_logo.svg/200px-Shell_logo.svg.png',
  ob_106: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Amsoil_logo.svg/200px-Amsoil_logo.svg.png',
};

async function updateImages() {
  console.log('========================================');
  console.log('PakposRides - Image URL Update Script');
  console.log('========================================\n');

  // Update brand logos
  console.log('Updating brand logos...');
  for (const [id, logo_url] of Object.entries(brandLogos)) {
    const { error } = await supabase.from('brands').update({ logo_url }).eq('id', id);
    if (error) console.error(`  Error updating brand ${id}:`, error.message);
    else console.log(`  Updated brand ${id}`);
  }

  // Update motorcycle images
  console.log('\nUpdating motorcycle images...');
  for (const [id, image_url] of Object.entries(motorcycleImages)) {
    const { error } = await supabase.from('motorcycles').update({ image_url }).eq('id', id);
    if (error) console.error(`  Error updating motorcycle ${id}:`, error.message);
    else console.log(`  Updated motorcycle ${id}`);
  }

  // Update fuel brand logos
  console.log('\nUpdating fuel brand logos...');
  for (const [id, logo_url] of Object.entries(fuelBrandLogos)) {
    const { error } = await supabase.from('fuel_brands').update({ logo_url }).eq('id', id);
    if (error) console.error(`  Error updating fuel brand ${id}:`, error.message);
    else console.log(`  Updated fuel brand ${id}`);
  }

  // Update oil brand logos
  console.log('\nUpdating oil brand logos...');
  for (const [id, logo_url] of Object.entries(oilBrandLogos)) {
    const { error } = await supabase.from('oil_brands').update({ logo_url }).eq('id', id);
    if (error) console.error(`  Error updating oil brand ${id}:`, error.message);
    else console.log(`  Updated oil brand ${id}`);
  }

  console.log('\n========================================');
  console.log('Image URL update complete!');
  console.log('========================================');
}

updateImages().catch(console.error);

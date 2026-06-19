/**
 * update-fuel-efficiency.cjs
 * Populate fuel_efficiency (km/L) for existing motorcycles
 * Run: node update-fuel-efficiency.cjs
 * 
 * NOTE: Run fuel-efficiency-schema.sql first to add the column!
 */

const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHlnZmN6cXF2eXVmbXR1b3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUwMjEzOSwiZXhwIjoyMDk3MDc4MTM5fQ.ICF8xcaOcIsz2VdM9xCFXkLl9L8ytv7qSG5Yx93EaEk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});

// Fuel efficiency data (km/L) based on manufacturer claims and real-world tests
// Sources: Astra Honda Motor, Yamaha Indonesia, various automotive reviews
const FUEL_EFFICIENCY = {
  // Honda Matic
  'mt_001': 59.0,  // Honda Beat
  'mt_002': 52.3,  // Honda Vario 160
  'mt_003': 48.7,  // Honda PCX 160
  'mt_004': 58.1,  // Honda Scoopy
  'mt_005': 45.0,  // Honda ADV 160
  'mt_006': 42.0,  // Honda Forza 250
  'mt_007': 38.0,  // Honda X-ADV
  'mt_008': 59.5,  // Honda Genio
  'mt_009': 31.0,  // Honda EM1 e: (electric, equivalent)
  'mt_010': 33.0,  // Honda Icon e: (electric, equivalent)

  // Honda Sport
  'mt_011': 39.7,  // Honda CBR 150R
  'mt_012': 33.0,  // Honda CBR 250RR
  'mt_013': 35.0,  // Honda CB 150R
  'mt_014': 30.0,  // Honda CB 250R
  'mt_015': 28.0,  // Honda CBR 600RR (est)

  // Honda Bebek
  'mt_016': 60.5,  // Honda Supra X 125
  'mt_017': 58.0,  // Honda Revo
  'mt_018': 55.0,  // Honda Blade (est)

  // Honda Naked/Trail
  'mt_019': 33.0,  // Honda CRF 150L
  'mt_020': 28.0,  // Honda CRF 250 Rally
  'mt_021': 32.0,  // Honda CB 150 Verza
  'mt_022': 27.0,  // Honda Rebel 500 (est)
  'mt_023': 35.0,  // Honda CB 150X

  // Yamaha Matic
  'mt_101': 47.0,  // Yamaha NMAX 155
  'mt_102': 47.5,  // Yamaha Aerox 155
  'mt_103': 58.0,  // Yamaha Mio M3
  'mt_104': 56.0,  // Yamaha Fazzio
  'mt_105': 54.0,  // Yamaha FreeGo
  'mt_106': 40.0,  // Yamaha XMAX 250
  'mt_107': 36.0,  // Yamaha TMAX
  'mt_108': 52.0,  // Yamaha Gear Ultima
  'mt_109': 45.0,  // Yamaha Lexi 155
  'mt_110': 50.0,  // Yamaha X-Ride

  // Yamaha Sport
  'mt_111': 38.0,  // Yamaha R15
  'mt_112': 33.0,  // Yamaha R25
  'mt_113': 28.0,  // Yamaha R3 (est)
  'mt_114': 35.0,  // Yamaha MT-15
  'mt_115': 30.0,  // Yamaha MT-25 (est)
  'mt_116': 37.0,  // Yamaha Vixion R
  'mt_117': 34.0,  // Yamaha Xabre

  // Yamaha Bebek
  'mt_118': 60.0,  // Yamaha Jupiter Z1
  'mt_119': 58.0,  // Yamaha Jupiter MX King

  // Yamaha Naked/Trail
  'mt_120': 32.0,  // Yamaha XSR 155
  'mt_121': 28.0,  // Yamaha WR 155R
  'mt_122': 26.0,  // Yamaha YZ125X (off-road)
  'mt_123': 24.0,  // Yamaha YZ250X (off-road)
  'mt_124': 25.0,  // Yamaha YZ250FX (off-road)

  // Suzuki
  'mt_201': 45.0,  // Suzuki Address
  'mt_202': 40.0,  // Suzuki GSX-S150
  'mt_203': 35.0,  // Suzuki GSX-R150
  'mt_204': 42.0,  // Suzuki Ertiga (est)
  'mt_205': 33.0,  // Suzuki GSX 250R

  // Kawasaki
  'mt_301': 38.0,  // Kawasaki Ninja 250
  'mt_302': 40.0,  // Kawasaki Ninja 150 (est)
  'mt_303': 35.0,  // Kawasaki W175
  'mt_304': 32.0,  // Kawasaki KLX 150
  'mt_305': 30.0,  // Kawasaki Versys-X 250 (est)

  // TVS
  'mt_401': 55.0,  // TVS NTorq 125
  'mt_402': 50.0,  // TVS Apache RTR 160

  // Vespa
  'mt_501': 38.0,  // Vespa Sprint 150
  'mt_502': 35.0,  // Vespa GTS 300
};

async function main() {
  console.log('Fuel Efficiency Update Script');
  console.log('='.repeat(50));

  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('id, name, fuel_efficiency');

  if (error) {
    console.error('Error fetching motorcycles:', error.message);
    return;
  }

  let updated = 0;
  let skipped = 0;
  let noData = 0;

  for (const motor of motorcycles) {
    const efficiency = FUEL_EFFICIENCY[motor.id];
    
    if (!efficiency) {
      console.log(`  No data for: ${motor.id} (${motor.name})`);
      noData++;
      continue;
    }

    if (motor.fuel_efficiency) {
      console.log(`  Skip (already set): ${motor.id} = ${motor.fuel_efficiency} km/L`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('motorcycles')
      .update({ fuel_efficiency: efficiency })
      .eq('id', motor.id);

    if (updateError) {
      console.error(`  Error updating ${motor.id}:`, updateError.message);
    } else {
      console.log(`  Updated: ${motor.id} (${motor.name}) = ${efficiency} km/L`);
      updated++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`SUMMARY: ${updated} updated, ${skipped} skipped (already set), ${noData} no data`);
}

main()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

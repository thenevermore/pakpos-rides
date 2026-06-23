/**
 * update-fuel-tank.cjs
 * Populate fuel_tank_capacity (liters) for existing motorcycles
 * Run: node update-fuel-tank.cjs
 * 
 * NOTE: Run fuel-tank-schema.sql first to add the column!
 */

const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHlnZmN6cXF2eXVmbXR1b3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUwMjEzOSwiZXhwIjoyMDk3MDc4MTM5fQ.ICF8xcaOcIsz2VdM9xCFXkLl9L8ytv7qSG5Yx93EaEk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});

// Fuel tank capacity (liters) based on manufacturer specifications
const FUEL_TANK = {
  // Honda Matic
  'mt_001': 4.2,   // Honda Beat
  'mt_002': 5.5,   // Honda Vario 160
  'mt_003': 8.1,   // Honda PCX 160
  'mt_004': 4.2,   // Honda Scoopy
  'mt_005': 12.0,  // Honda ADV 160
  'mt_006': 11.5,  // Honda Forza 250
  'mt_007': 13.1,  // Honda X-ADV
  'mt_008': 4.2,   // Honda Genio
  // mt_009: EM1 e: (electric, no fuel tank)
  // mt_010: Icon e: (electric, no fuel tank)

  // Honda Sport
  'mt_011': 12.0,  // Honda CBR 150R
  'mt_012': 14.5,  // Honda CBR 250RR
  'mt_013': 12.0,  // Honda CB 150R Streetfire
  'mt_014': 12.5,  // Honda CB 250R
  'mt_015': 18.1,  // Honda CBR 600RR

  // Honda Bebek
  'mt_016': 5.6,   // Honda Supra X 125
  'mt_017': 4.2,   // Honda Revo
  'mt_018': 4.2,   // Honda Blade

  // Honda Naked/Trail
  'mt_019': 7.9,   // Honda CRF 150L
  'mt_020': 10.1,  // Honda CRF 250 Rally
  'mt_021': 12.0,  // Honda CB 150 Verza
  'mt_022': 11.2,  // Honda Rebel 500
  'mt_023': 12.0,  // Honda CB 150X

  // Yamaha Matic
  'mt_101': 7.1,   // Yamaha NMAX 155
  'mt_102': 5.5,   // Yamaha Aerox 155
  'mt_103': 4.2,   // Yamaha Mio M3
  'mt_104': 5.1,   // Yamaha Fazzio
  'mt_105': 4.2,   // Yamaha FreeGo
  'mt_106': 13.0,  // Yamaha XMAX 250
  'mt_107': 15.0,  // Yamaha TMAX
  'mt_108': 4.2,   // Yamaha Gear Ultima
  'mt_109': 7.1,   // Yamaha Lexi 155
  'mt_110': 4.2,   // Yamaha X-Ride

  // Yamaha Sport
  'mt_111': 10.4,  // Yamaha R15
  'mt_112': 14.0,  // Yamaha R25
  'mt_113': 14.0,  // Yamaha R3
  'mt_114': 11.0,  // Yamaha MT-15
  'mt_115': 14.0,  // Yamaha MT-25
  'mt_116': 12.0,  // Yamaha Vixion R
  'mt_117': 10.2,  // Yamaha Xabre

  // Yamaha Bebek
  'mt_118': 4.2,   // Yamaha Jupiter Z1
  'mt_119': 4.2,   // Yamaha Jupiter MX King

  // Yamaha Naked/Trail
  'mt_120': 10.0,  // Yamaha XSR 155
  'mt_121': 8.1,   // Yamaha WR 155R
  'mt_122': 7.5,   // Yamaha YZ125X
  'mt_123': 7.5,   // Yamaha YZ250X
  'mt_124': 7.5,   // Yamaha YZ250FX

  // Suzuki
  'mt_201': 5.0,   // Suzuki Address
  'mt_202': 12.0,  // Suzuki GSX-S150
  'mt_203': 12.0,  // Suzuki GSX-R150
  'mt_204': 12.0,  // Suzuki Bandit 150
  'mt_205': 14.0,  // Suzuki GSX 250R

  // Kawasaki
  'mt_301': 14.0,  // Kawasaki Ninja 250
  'mt_302': 12.0,  // Kawasaki Ninja 150
  'mt_303': 10.5,  // Kawasaki W175
  'mt_304': 6.9,   // Kawasaki KLX 150
  'mt_305': 17.0,  // Kawasaki Versys-X 250

  // TVS
  'mt_401': 5.8,   // TVS NTorq 125
  'mt_402': 12.0,  // TVS Apache RTR 160

  // Vespa
  'mt_501': 8.2,   // Vespa Sprint 150
  'mt_502': 11.5,  // Vespa GTS 300
};

async function main() {
  console.log('Fuel Tank Capacity Update Script');
  console.log('='.repeat(50));

  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('id, name, fuel_tank_capacity');

  if (error) {
    console.error('Error fetching motorcycles:', error.message);
    return;
  }

  let updated = 0;
  let skipped = 0;
  let noData = 0;

  for (const motor of motorcycles) {
    const capacity = FUEL_TANK[motor.id];
    
    if (capacity === undefined) {
      console.log(`  No data for: ${motor.id} (${motor.name})`);
      noData++;
      continue;
    }

    if (motor.fuel_tank_capacity) {
      console.log(`  Skip (already set): ${motor.id} = ${motor.fuel_tank_capacity} L`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('motorcycles')
      .update({ fuel_tank_capacity: capacity })
      .eq('id', motor.id);

    if (updateError) {
      console.error(`  Error updating ${motor.id}:`, updateError.message);
    } else {
      console.log(`  Updated: ${motor.id} (${motor.name}) = ${capacity} L`);
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

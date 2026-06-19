/**
 * add-cdn-columns.cjs
 * Adds cdn_url columns to all relevant tables via Supabase REST API
 * Run: node add-cdn-columns.cjs
 */

const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHlnZmN6cXF2eXVmbXR1b3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUwMjEzOSwiZXhwIjoyMDk3MDc4MTM5fQ.ICF8xcaOcIsz2VdM9xCFXkLl9L8ytv7qSG5Yx93EaEk';

const tables = ['brands', 'motorcycles', 'oil_brands', 'fuel_brands'];

async function addCdnColumns() {
  console.log('Adding cdn_url columns to Supabase tables...');
  console.log('='.repeat(50));

  for (const table of tables) {
    console.log(`\nProcessing: ${table}`);
    
    // Use RPC or direct SQL via Supabase REST API
    // We'll try to add the column via the SQL endpoint
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS cdn_url TEXT`
        }),
      });

      if (response.ok) {
        console.log(`  ✓ Added cdn_url column to ${table}`);
      } else {
        const errorText = await response.text();
        console.error(`  ✗ Failed to add column to ${table}:`, errorText);
        console.log('  Note: You may need to run the SQL manually in Supabase Dashboard');
      }
    } catch (err) {
      console.error(`  ✗ Error for ${table}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Done!');
  console.log('\nIf columns were not added, run this SQL in Supabase Dashboard:');
  console.log('  ALTER TABLE brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;');
  console.log('  ALTER TABLE motorcycles ADD COLUMN IF NOT EXISTS cdn_url TEXT;');
  console.log('  ALTER TABLE oil_brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;');
  console.log('  ALTER TABLE fuel_brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;');
}

addCdnColumns()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

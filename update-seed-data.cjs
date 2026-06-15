const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

global.WebSocket = require('ws');
const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

async function main() {
  const { data: motorcycles, error } = await sb.from('motorcycles').select('*').order('id');
  
  if (error) {
    console.error('Error fetching motorcycles:', error);
    process.exit(1);
  }

  let content = fs.readFileSync('src/lib/seed-data.ts', 'utf-8');
  
  const regex = /export const motorcycles: Motorcycle\[\] = \[[\s\S]*?\];/;
  
  // clean up the JSON so it looks nice
  const serialized = JSON.stringify(motorcycles, null, 2);
  const newCode = `export const motorcycles: Motorcycle[] = ${serialized};`;
  
  content = content.replace(regex, newCode);
  fs.writeFileSync('src/lib/seed-data.ts', content);
  
  console.log(`Updated seed-data.ts with ${motorcycles.length} motorcycles`);
  process.exit(0);
}

main();

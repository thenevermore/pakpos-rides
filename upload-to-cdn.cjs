/**
 * upload-to-cdn.cjs
 * Bulk upload existing image URLs from Supabase to ImageKit CDN
 * Run: node upload-to-cdn.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://xrxygfczqqvyufmtuosw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHlnZmN6cXF2eXVmbXR1b3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUwMjEzOSwiZXhwIjoyMDk3MDc4MTM5fQ.ICF8xcaOcIsz2VdM9xCFXkLl9L8ytv7qSG5Yx93EaEk';
const IMAGEKIT_PRIVATE_KEY = 'private_ej7ulKeKphLiqvd8BI+8TXuU3zI=';
const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const FOLDER = 'pakpos-rides';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket }
});
/* response example
{
  "fileId": "6a34b35e5c7cd75eb8759f7a",
  "name": "Honda_BeAT_Uq1lqvES1.webp",
  "size": 57660,
  "versionInfo": {
    "id": "6a34b35e5c7cd75eb8759f7a",
    "name": "Version 1"
  },
  "filePath": "/Honda_BeAT_Uq1lqvES1.webp",
  "url": "https://ik.imagekit.io/pakpos/Honda_BeAT_Uq1lqvES1.webp",
  "fileType": "image",
  "height": 600,
  "width": 800,
  "thumbnailUrl": "https://ik.imagekit.io/pakpos/tr:n-ik_ml_thumbnail/Honda_BeAT_Uq1lqvES1.webp",
  "AITags": null,
  "description": null
}
*/ 
async function uploadToImageKit(imageUrl, fileName) {
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('fileName', fileName);
  formData.append('folder', FOLDER);

  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
  
  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.url; // CDN URL
}

function generateFileName(url, prefix) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const originalName = pathname.split('/').pop() || 'image.jpg';
    const ext = originalName.split('.').pop() || 'jpg';
    return `${prefix}-${Date.now()}.${ext}`;
  } catch {
    return `${prefix}-${Date.now()}.jpg`;
  }
}

async function processTable(tableName, urlColumn, idColumn, namePrefix) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processing: ${tableName}`);
  console.log(`${'='.repeat(50)}`);

  const { data: rows, error } = await supabase
    .from(tableName)
    .select(`${idColumn}, ${urlColumn}, cdn_url`);

  if (error) {
    console.error(`  Error fetching ${tableName}:`, error.message);
    return { success: 0, failed: 0, skipped: 0 };
  }

  // Filter rows that have an image URL but no CDN URL yet
  const needsUpload = rows.filter(r => r[urlColumn] && !r.cdn_url);
  const alreadyDone = rows.filter(r => r.cdn_url);
  
  console.log(`  Total rows: ${rows.length}`);
  console.log(`  Already have CDN URL: ${alreadyDone.length}`);
  console.log(`  Need upload: ${needsUpload.length}`);

  let success = 0;
  let failed = 0;

  for (const row of needsUpload) {
    const imageUrl = row[urlColumn];
    const id = row[idColumn];
    const fileName = generateFileName(imageUrl, `${namePrefix}-${id}`);

    try {
      console.log(`  Uploading: ${id} -> ${fileName}`);
      const cdnUrl = await uploadToImageKit(imageUrl, fileName);
      
      // Update database with CDN URL
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ cdn_url: cdnUrl })
        .eq(idColumn, id);

      if (updateError) {
        console.error(`    DB update failed for ${id}:`, updateError.message);
        failed++;
      } else {
        console.log(`    OK: ${cdnUrl}`);
        success++;
      }
    } catch (err) {
      console.error(`    Upload failed for ${id}:`, err.message);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`  Done: ${success} success, ${failed} failed, ${alreadyDone.length} skipped`);
  return { success, failed, skipped: alreadyDone.length };
}

async function main() {
  console.log('ImageKit CDN Bulk Upload Script');
  console.log('================================');

  const results = {};

  // Process each table
  results.brands = await processTable('brands', 'logo_url', 'id', 'brand');
  results.motorcycles = await processTable('motorcycles', 'image_url', 'id', 'motor');
  results.oil_brands = await processTable('oil_brands', 'logo_url', 'id', 'oil');
  results.fuel_brands = await processTable('fuel_brands', 'logo_url', 'id', 'fuel');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  
  let totalSuccess = 0, totalFailed = 0, totalSkipped = 0;
  for (const [table, r] of Object.entries(results)) {
    console.log(`  ${table}: ${r.success} uploaded, ${r.failed} failed, ${r.skipped} skipped`);
    totalSuccess += r.success;
    totalFailed += r.failed;
    totalSkipped += r.skipped;
  }
  console.log(`\n  TOTAL: ${totalSuccess} uploaded, ${totalFailed} failed, ${totalSkipped} already done`);
}

main()
  .then(() => {
    console.log('\nAll done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

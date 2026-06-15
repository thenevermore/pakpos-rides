/**
 * Product Scraper for Yamaha & Honda motorcycles
 * - Yamaha: uses native fetch + cheerio (no Cloudflare issues)
 * - Honda: uses Puppeteer + Stealth plugin (wahanahonda.com has Cloudflare)
 * 
 * Usage: node scrape-products.cjs
 * Output: scraped-products.json
 */
const cheerio = require('cheerio');
const fs = require('fs');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
};

const YAMAHA_URLS = [
  'https://www.yamaha-motor.co.id/product/aerox-alpha',
  'https://www.yamaha-motor.co.id/product/lexi-lx-155',
  'https://www.yamaha-motor.co.id/product/all-new-nmax155-connected',
  'https://www.yamaha-motor.co.id/product/all-new-aerox155-connected',
  'https://www.yamaha-motor.co.id/product/nmax-turbo',
  'https://www.yamaha-motor.co.id/product/xmax-connected',
  'https://www.yamaha-motor.co.id/product/tmax-tech-max',
  'https://www.yamaha-motor.co.id/product/grand-filano',
  'https://www.yamaha-motor.co.id/product/fazzio',
  'https://www.yamaha-motor.co.id/product/gear-ultima',
  'https://www.yamaha-motor.co.id/product/gear-125',
  'https://www.yamaha-motor.co.id/product/freego-125',
  'https://www.yamaha-motor.co.id/product/x-ride',
  'https://www.yamaha-motor.co.id/product/mio-m3',
  'https://www.yamaha-motor.co.id/product/fino',
  'https://www.yamaha-motor.co.id/product/xsr-155',
  'https://www.yamaha-motor.co.id/product/all-new-R15-connected',
  'https://www.yamaha-motor.co.id/product/mt25',
  'https://www.yamaha-motor.co.id/product/r25',
  'https://www.yamaha-motor.co.id/product/mt15',
  'https://www.yamaha-motor.co.id/product/vixion',
  'https://www.yamaha-motor.co.id/product/wr155r',
  'https://www.yamaha-motor.co.id/product/yz125x',
  'https://www.yamaha-motor.co.id/product/yz250x',
  'https://www.yamaha-motor.co.id/product/yz250fx',
  'https://www.yamaha-motor.co.id/product/mx-king-150',
  'https://www.yamaha-motor.co.id/product/jupiter-z1',
  'https://www.yamaha-motor.co.id/product/vega-force',
];

const HONDA_URLS = [
  'https://www.wahanahonda.com/produk/honda-beat',
  'https://www.wahanahonda.com/produk/honda-beat-street',
  'https://www.wahanahonda.com/produk/honda-genio',
  'https://www.wahanahonda.com/produk/honda-scoopy',
  'https://www.wahanahonda.com/produk/honda-vario-125',
  'https://www.wahanahonda.com/produk/honda-vario-125-street',
  'https://www.wahanahonda.com/produk/honda-vario-160',
  'https://www.wahanahonda.com/produk/honda-stylo-160',
  'https://www.wahanahonda.com/produk/honda-pcx-160',
  'https://www.wahanahonda.com/produk/honda-adv-160',
  'https://www.wahanahonda.com/produk/honda-forza',
  'https://www.wahanahonda.com/produk/honda-revo',
  'https://www.wahanahonda.com/produk/honda-supra-x-125-fi',
  'https://www.wahanahonda.com/produk/honda-supra-gtr-150',
  'https://www.wahanahonda.com/produk/honda-super-cub-c125',
  'https://www.wahanahonda.com/produk/honda-ct125',
  'https://www.wahanahonda.com/produk/honda-cb150-verza',
  'https://www.wahanahonda.com/produk/honda-cb150r-streetfire',
  'https://www.wahanahonda.com/produk/honda-cb150x',
  'https://www.wahanahonda.com/produk/honda-sonic-150r',
  'https://www.wahanahonda.com/produk/honda-cbr150r',
  'https://www.wahanahonda.com/produk/honda-crf150l',
  'https://www.wahanahonda.com/produk/honda-cbr250rr',
  'https://www.wahanahonda.com/produk/honda-crf250l',
  'https://www.wahanahonda.com/produk/honda-st125-dax',
  'https://www.wahanahonda.com/produk/honda-monkey',
  'https://www.wahanahonda.com/produk/honda-crf250-rally',
  'https://www.wahanahonda.com/produk/honda-em1-e',
  'https://www.wahanahonda.com/produk/honda-icon-e',
  'https://www.wahanahonda.com/produk/honda-cuv-e',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parsePrice(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^\d]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

// ────────────────────────────────────────────
// HONDA PARSER (works on HTML string)
// ────────────────────────────────────────────
function parseHondaPage(html, url) {
  const $ = cheerio.load(html);
  const result = { url, brand: 'Honda' };

  const titleTag = $('title').text().trim();
  const h1 = $('h1').first().text().trim();
  result.name = h1 || titleTag.replace(/ - .*$/, '').trim();

  const mainImg = $('img[src*="PRODUK_GAMBAR"]').first().attr('src');
  result.image_url = mainImg || null;

  const allImages = [];
  $('img[src*="PRODUK_GAMBAR"]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) allImages.push(src);
  });
  result.all_images = [...new Set(allImages)];

  // Specs: col-pc pattern
  const specs = {};
  const allText = $('[class*="col-pc"]').toArray().map(el => $(el).text().trim());
  for (let i = 0; i < allText.length - 2; i++) {
    if (allText[i + 1] === ':' && allText[i] && allText[i + 2] && allText[i].length < 80) {
      specs[allText[i]] = allText[i + 2];
    }
  }
  result.specs = specs;

  result.engine_cc = specs['Volume Langkah'] || specs['Kapasitas Mesin'] || null;
  result.compression_ratio = specs['Perbandingan Kompresi'] || null;
  result.power = specs['Daya Maksimum'] || null;
  result.torque = specs['Torsi Maksimum'] || null;
  result.transmission = specs['Tipe Transmisi'] || specs['Transmisi'] || null;
  result.engine_type = specs['Tipe Mesin'] || null;
  result.cooling = specs['Sistem Pendingin Mesin'] || null;

  const priceMatches = html.match(/Rp\.?\s?[\d][\d.]+/g) || [];
  const validPrices = priceMatches.map(p => parsePrice(p)).filter(p => p && p > 1000000);
  result.price = validPrices.length > 0 ? validPrices[0] : null;
  result.all_prices = [...new Set(validPrices)];

  return result;
}

// ────────────────────────────────────────────
// YAMAHA SCRAPER (fetch + cheerio)
// ────────────────────────────────────────────
async function scrapeYamaha(url) {
  const result = { url, brand: 'Yamaha', error: null };
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) { result.error = `HTTP ${resp.status}`; return result; }
    const html = await resp.text();
    const $ = cheerio.load(html);

    const titleTag = $('title').text().trim();
    const h1 = $('h1').first().text().trim();
    result.name = h1 || titleTag.replace(/ - .*$/, '').replace(/,.*$/, '').trim();

    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      result.image_url = ogImage.startsWith('http') ? ogImage : `https://www.yamaha-motor.co.id${ogImage}`;
    } else {
      const featImg = $('img[src*="featured_image"]').first().attr('src');
      result.image_url = featImg ? (featImg.startsWith('http') ? featImg : `https://www.yamaha-motor.co.id${featImg}`) : null;
    }

    const allImages = [];
    $('img[src*="product_model_image"], img[src*="featured_image"]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) allImages.push(src.startsWith('http') ? src : `https://www.yamaha-motor.co.id${src}`);
    });
    result.all_images = [...new Set(allImages)];

    const specs = {};
    $('table tr').each((_, tr) => {
      const tds = $(tr).find('td, th');
      if (tds.length >= 2) {
        const label = tds.first().text().trim();
        const value = tds.last().text().trim();
        if (label && value && label.length < 100) specs[label] = value;
      }
    });
    result.specs = specs;

    result.engine_cc = specs['Volume Silinder'] || specs['Kapasitas Mesin'] || null;
    result.compression_ratio = specs['Perbandingan Kompresi'] || null;
    result.power = specs['Daya Maksimum'] || null;
    result.torque = specs['Torsi Maksimum'] || null;
    result.transmission = specs['Tipe Transmisi'] || specs['Transmisi'] || null;
    result.engine_type = specs['Tipe Mesin'] || null;

    const priceMatches = html.match(/Rp[\s.]?[\d][\d.,]+/g) || [];
    const validPrices = priceMatches.map(p => parsePrice(p)).filter(p => p && p > 1000000);
    result.price = validPrices.length > 0 ? validPrices[0] : null;
    result.all_prices = [...new Set(validPrices)];

  } catch (err) { result.error = err.message; }
  return result;
}

// ────────────────────────────────────────────
// HONDA SCRAPER via Puppeteer + Stealth
// ────────────────────────────────────────────
async function scrapeHondaWithPuppeteer(urls) {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: false, // Non-headless mode bypasses Cloudflare much better
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  // Stealth plugin handles navigator properties automatically

  // Step 1: Visit homepage first to establish Cloudflare session
  console.log('  → Visiting homepage to establish Cloudflare session...');
  await page.goto('https://www.wahanahonda.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait for CF challenge to resolve
  try {
    await page.waitForFunction(
      () => {
        const t = document.title.toLowerCase();
        return !t.includes('moment') && !t.includes('tunggu') && !t.includes('checking');
      },
      { timeout: 30000 }
    );
    console.log('  ✅ Cloudflare session established');
  } catch {
    console.log('  ⚠️  Homepage CF challenge timeout, continuing anyway...');
  }
  await sleep(5000);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.split('/').pop();
    process.stdout.write(`[${i + 1}/${urls.length}] ${slug} ... `);

    let success = false;
    const maxRetries = 2;

    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for CF challenge to resolve (check title)
        try {
          await page.waitForFunction(
            () => {
              const t = document.title.toLowerCase();
              return !t.includes('moment') && !t.includes('tunggu') && !t.includes('checking');
            },
            { timeout: 25000 }
          );
        } catch {
          // CF didn't resolve
        }

        const html = await page.content();

        if (html.includes('PRODUK_GAMBAR') || html.includes('col-pc')) {
          const data = parseHondaPage(html, url);
          console.log(`✅ ${data.name} | ${data.image_url ? '🖼️' : '❌ img'} | ${data.engine_cc || '?'} | ${data.price ? 'Rp ' + data.price.toLocaleString('id-ID') : '❌ price'}`);
          results.push(data);
          success = true;
          break;
        } else if (retry < maxRetries) {
          const title = await page.title();
          process.stdout.write(`(CF blocked, retry ${retry + 1}/${maxRetries}) `);
          await sleep(8000 + Math.random() * 5000);
        } else {
          const title = await page.title();
          console.log(`❌ CF challenge not resolved (title: ${title})`);
          results.push({ url, brand: 'Honda', error: 'Cloudflare challenge not resolved' });
        }
      } catch (err) {
        if (retry < maxRetries) {
          process.stdout.write(`(error, retry ${retry + 1}/${maxRetries}) `);
          await sleep(5000);
        } else {
          console.log(`❌ ${err.message.substring(0, 80)}`);
          results.push({ url, brand: 'Honda', error: err.message });
        }
      }
    }

    // Polite delay between pages (longer for CF sites)
    if (i < urls.length - 1) {
      await sleep(6000 + Math.random() * 4000);
    }
  }

  await browser.close();
  return results;
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  PakposRides Product Scraper v3                  ║');
  console.log('║  Yamaha (fetch) & Honda (Puppeteer + Stealth)    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const results = { yamaha: [], honda: [], summary: {} };

  // ── Scrape Yamaha via fetch ──
  console.log(`━━━ YAMAHA (${YAMAHA_URLS.length} models) [fetch+cheerio] ━━━\n`);
  for (let i = 0; i < YAMAHA_URLS.length; i++) {
    const url = YAMAHA_URLS[i];
    const slug = url.split('/').pop();
    process.stdout.write(`[${i + 1}/${YAMAHA_URLS.length}] ${slug} ... `);
    const data = await scrapeYamaha(url);
    if (data.error) {
      console.log(`❌ ${data.error}`);
    } else {
      console.log(`✅ ${data.name} | ${data.image_url ? '🖼️' : '❌ img'} | ${data.engine_cc || '?'} | ${data.price ? 'Rp ' + data.price.toLocaleString('id-ID') : '❌ price'}`);
    }
    results.yamaha.push(data);
    if (i < YAMAHA_URLS.length - 1) await sleep(1500);
  }

  // ── Scrape Honda via Puppeteer+Stealth ──
  console.log(`\n━━━ HONDA (${HONDA_URLS.length} models) [Puppeteer+Stealth] ━━━\n`);
  try {
    results.honda = await scrapeHondaWithPuppeteer(HONDA_URLS);
  } catch (err) {
    console.log(`\n❌ Puppeteer failed: ${err.message}`);
    for (const url of HONDA_URLS) {
      results.honda.push({ url, brand: 'Honda', error: `Puppeteer unavailable: ${err.message}` });
    }
  }

  // ── Summary ──
  const yamahaOk = results.yamaha.filter(r => !r.error);
  const hondaOk = results.honda.filter(r => !r.error);
  const yamahaImgs = yamahaOk.filter(r => r.image_url);
  const hondaImgs = hondaOk.filter(r => r.image_url);
  const yamahaPrices = yamahaOk.filter(r => r.price);
  const hondaPrices = hondaOk.filter(r => r.price);

  results.summary = {
    yamaha_total: YAMAHA_URLS.length, yamaha_scraped: yamahaOk.length,
    yamaha_with_images: yamahaImgs.length, yamaha_with_prices: yamahaPrices.length,
    honda_total: HONDA_URLS.length, honda_scraped: hondaOk.length,
    honda_with_images: hondaImgs.length, honda_with_prices: hondaPrices.length,
  };

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  SUMMARY                                         ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Yamaha: ${yamahaOk.length}/${YAMAHA_URLS.length} scraped, ${yamahaImgs.length} images, ${yamahaPrices.length} prices      ║`);
  console.log(`║  Honda:  ${hondaOk.length}/${HONDA_URLS.length} scraped, ${hondaImgs.length} images, ${hondaPrices.length} prices      ║`);
  console.log('╚══════════════════════════════════════════════════╝');

  const outFile = 'scraped-products.json';
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outFile}`);

  const errors = [...results.yamaha.filter(r => r.error), ...results.honda.filter(r => r.error)];
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors:`);
    errors.forEach(e => console.log(`  - ${e.url}: ${e.error}`));
  }
}

main().catch(console.error);

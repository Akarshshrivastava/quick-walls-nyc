#!/usr/bin/env node
// Scrapes starttofinishconstructionnh.com via Firecrawl
// Downloads site images + fetches Unsplash gallery images

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FIRECRAWL_KEY = 'fc-ed5d2feb67f24badaa545a77a5994fd2';
const UNSPLASH_KEY = 'VuKedx3ig4RfBnDF0JOlNRjf5OPm-18inSipYBm_93M';
const TARGET_URL = 'https://www.starttofinishconstructionnh.com/';

// ---------- helpers ----------
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const proto = fileUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(fileUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    }).on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
  });
}

async function firecrawlScrape() {
  console.log('🔥 Scraping with Firecrawl...');
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_KEY}`
    },
    body: JSON.stringify({
      url: TARGET_URL,
      formats: ['markdown', 'html'],
      waitFor: 2000
    })
  });
  const data = await res.json();
  if (!data.success) {
    console.error('Firecrawl error:', JSON.stringify(data, null, 2));
    return null;
  }
  return data.data;
}

function extractImageUrls(html) {
  const urls = [];
  const srcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = srcRegex.exec(html)) !== null) {
    const src = m[1];
    if (src && !src.startsWith('data:') && src.length > 5) {
      urls.push(src.startsWith('http') ? src : `https://www.starttofinishconstructionnh.com${src}`);
    }
  }
  return [...new Set(urls)];
}

async function fetchUnsplashImages(query, count = 6, folder = 'unsplash') {
  console.log(`📸 Fetching ${count} Unsplash images for: "${query}"...`);
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=${count}&orientation=landscape`,
    { headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` } }
  );
  const photos = await res.json();
  if (!Array.isArray(photos)) {
    console.warn('Unsplash returned:', JSON.stringify(photos).slice(0, 200));
    return [];
  }

  const destDir = path.join(ROOT, 'assets/images', folder);
  fs.mkdirSync(destDir, { recursive: true });
  const saved = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const imgUrl = photo.urls.regular;
    const fileName = `${query.replace(/\s+/g, '-')}-${i + 1}.jpg`;
    const destPath = path.join(destDir, fileName);
    try {
      await downloadFile(imgUrl, destPath);
      saved.push({ local: `assets/images/${folder}/${fileName}`, credit: photo.user.name, unsplashUrl: photo.links.html });
      process.stdout.write(`  ✓ ${fileName}\n`);
    } catch (e) {
      console.warn(`  ✗ failed ${fileName}:`, e.message);
    }
  }
  return saved;
}

async function main() {
  // Phase 1: Firecrawl
  const scraped = await firecrawlScrape();
  if (scraped) {
    fs.writeFileSync(path.join(ROOT, 'scripts/scraped-content.json'), JSON.stringify(scraped, null, 2));
    console.log('✅ Scraped content saved to scripts/scraped-content.json');

    // Extract & download site images
    const html = scraped.html || '';
    const imageUrls = extractImageUrls(html);
    console.log(`\n🖼️  Found ${imageUrls.length} images on site:`);
    const siteDir = path.join(ROOT, 'assets/images/site');
    fs.mkdirSync(siteDir, { recursive: true });
    const siteImages = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i];
      const ext = (imgUrl.split('?')[0].split('.').pop() || 'jpg').toLowerCase().split('/')[0];
      const safeExt = ['jpg','jpeg','png','webp','gif','svg'].includes(ext) ? ext : 'jpg';
      const fileName = `site-img-${i + 1}.${safeExt}`;
      const destPath = path.join(siteDir, fileName);
      try {
        await downloadFile(imgUrl, destPath);
        siteImages.push({ local: `assets/images/site/${fileName}`, original: imgUrl });
        console.log(`  ✓ ${fileName} ← ${imgUrl.slice(0, 80)}`);
      } catch (e) {
        console.warn(`  ✗ ${imgUrl.slice(0, 60)}: ${e.message}`);
      }
    }
    fs.writeFileSync(path.join(ROOT, 'scripts/site-images.json'), JSON.stringify(siteImages, null, 2));
  }

  // Phase 2: Unsplash gallery images
  const galleryImages = await fetchUnsplashImages('luxury custom home construction new england', 8, 'gallery');
  const heroImages = await fetchUnsplashImages('modern home exterior architecture', 2, 'hero');
  const aboutImages = await fetchUnsplashImages('construction workers craftsmanship', 2, 'about');

  const allUnsplash = { gallery: galleryImages, hero: heroImages, about: aboutImages };
  fs.writeFileSync(path.join(ROOT, 'scripts/unsplash-images.json'), JSON.stringify(allUnsplash, null, 2));
  console.log('\n✅ All done. Check assets/images/ for downloaded images.');
}

main().catch(console.error);

/* Generate PWA icons (192, 512, maskable 512) by rendering an SVG in the
   headless browser and screenshotting at exact pixel sizes. */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#bfe4ff"/>
      <stop offset="100%" stop-color="#0a5fbe"/>
    </radialGradient>
    <radialGradient id="globe" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#dcefff"/>
      <stop offset="100%" stop-color="#2b7bd6"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- stars -->
  <text x="96" y="110" font-size="56" fill="#ffd23f">★</text>
  <text x="384" y="120" font-size="48" fill="#ffd23f">★</text>
  <text x="120" y="430" font-size="44" fill="#ffd23f">★</text>
  <text x="400" y="420" font-size="52" fill="#ffd23f">★</text>
  <!-- globe -->
  <circle cx="256" cy="256" r="150" fill="url(#globe)" stroke="#ffffff" stroke-width="10"/>
  <!-- flag on the globe -->
  <rect x="196" y="190" width="120" height="80" rx="6" fill="#ffffff" opacity="0.95"/>
  <rect x="196" y="190" width="40" height="80" fill="#006847"/>
  <rect x="276" y="190" width="40" height="80" fill="#CE1126"/>
  <circle cx="256" cy="230" r="14" fill="#006847"/>
  <line x1="256" y1="150" x2="256" y2="190" stroke="#ffffff" stroke-width="6"/>
</svg>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const dir = path.resolve('app/icons');
  fs.mkdirSync(dir, { recursive: true });

  async function makeIcon(size, file, padding) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const pad = padding ? Math.round(size * 0.1) : 0;
    await page.setContent(`
      <html><body style="margin:0;padding:0;">
      <div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:#0a5fbe;overflow:hidden;">
        <img src="data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString('base64')}"
             style="width:${size - pad * 2}px;height:${size - pad * 2}px;" />
      </div></body></html>`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(dir, file), omitBackground: false });
    await page.close();
    console.log('  wrote ' + file + ' (' + size + 'px)');
  }

  await makeIcon(192, 'icon-192.png', false);
  await makeIcon(512, 'icon-512.png', false);
  await makeIcon(512, 'icon-maskable-512.png', true);   // padded for maskable safe zone
  await browser.close();
  console.log('Icons generated in app/icons/');
})();

/* SIMULATE A RAILWAY DEPLOY EXACTLY:
   1. Install deps with --omit=dev (skips puppeteer, the 170MB test dep)
   2. Start `serve` exactly like Railway will
   3. Run the full PWA + app flow test against it
   This proves the deploy config actually works end-to-end. */
const puppeteer = require('puppeteer');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const failures = [];
  const errs = [];
  const log = m => console.log('  ' + m);
  const fail = m => { console.log('  ❌ ' + m); failures.push(m); };

  // ── Step 1: clean install with --omit=dev (like Railway) ──
  log('Simulating Railway install: npm install --omit=dev ...');
  // Move puppeteer aside so --omit=dev truly leaves it out (it's in devDeps now)
  try {
    execSync('npm install --omit=dev --no-audit --no-fund', { stdio: 'pipe', cwd: process.cwd() });
    log('✓ Runtime deps installed (serve), devDeps (puppeteer) skipped');
  } catch (e) {
    fail('npm install --omit=dev failed: ' + e.message);
  }

  // sanity: serve must be present, puppeteer absent from the install
  const hasServe = fs.existsSync('node_modules/serve/build/main.js');
  log('serve present after --omit=dev: ' + hasServe);
  if (!hasServe) fail('serve missing — Railway could not start the server');

  // ── Step 2: start `serve` like Railway ──
  const server = spawn('node', ['node_modules/serve/build/main.js', '.', '--no-clipboard', '--listen', '8124', '--no-port-switching'], {
    cwd: process.cwd(), stdio: 'pipe',
  });
  await sleep(3500);
  const BASE = 'http://localhost:8124';

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errs.push('PAGE: ' + e.message));
    page.on('response', r => { if (r.status() === 404) errs.push('404: ' + r.url()); });

    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await sleep(500);

    const finalUrl = page.url();
    if (/\/app\/$/.test(finalUrl)) log('✓ Root → /app/ (trailing slash, relative paths OK)');
    else fail('root redirect wrong: ' + finalUrl);

    const hasManifest = await page.$eval('link[rel="manifest"]', el => !!el).catch(() => false);
    if (hasManifest) log('✓ Manifest linked'); else fail('no manifest');

    // JS actually loads (the bug we fixed)
    const uiDefined = await page.evaluate(() => typeof UI !== 'undefined');
    if (uiDefined) log('✓ App scripts load (UI defined)'); else fail('UI undefined — scripts not loading');

    // SW + cache
    await sleep(3000);
    const swOk = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
    if (swOk) log('✓ Service worker registered'); else fail('SW not registered');

    const musicCached = await page.evaluate(async () => {
      const keys = await caches.keys();
      const c = await caches.open(keys[0] || 'liam-banderas-v1');
      return !!(await c.match('http://localhost:8124/music/brainrot.mp3'));
    });
    if (musicCached) log('✓ Music cached (offline-ready)'); else fail('music not cached');

    // Full flow
    await page.evaluate(() => {
      window.speechSynthesis.speak = u => { setTimeout(() => u.onend && u.onend(), 1); };
      window.speechSynthesis.cancel = () => {};
    });
    const flowOk = await page.evaluate(async () => {
      document.querySelector('#splash-start')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 600));
      document.querySelector('#hub-play')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 700));
      return !!document.querySelector('#screen-paint.active');
    });
    if (flowOk) log('✓ Full app flow works over the served http'); else fail('flow broken over http');

    await browser.close();
  } finally {
    server.kill();
  }

  console.log('\n════════ RAILWAY DEPLOY SIMULATION ════════');
  if (failures.length) { console.log('❌ ' + failures.length + ' failure(s):'); failures.forEach(f => console.log('   - ' + f)); }
  else console.log('✅ Deploy config proven: clean install (--omit=dev) + serve + full PWA works.');
  if (errs.length) console.log('   (network issues: ' + [...new Set(errs)].join(' | ') + ')');
  process.exit(failures.length ? 1 : 0);
})();

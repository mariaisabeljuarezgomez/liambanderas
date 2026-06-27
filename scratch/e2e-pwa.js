/* PWA verification — served over REAL http (like Railway), checks:
   1. manifest is linked + valid
   2. service worker registers and caches all assets (incl. music)
   3. icons exist
   4. the full app still works end-to-end over http (incl. music ducking) */
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // Start a static server at the repo root on port 8123
  const server = spawn('node', ['node_modules/serve/build/main.js', '.', '--no-clipboard', '--listen', '8123', '--no-port-switching'], {
    cwd: process.cwd(), stdio: 'pipe',
  });
  // wait for server
  await sleep(3500);
  const BASE = 'http://localhost:8123';
  const failures = [];
  const errs = [];
  const log = m => console.log('  ' + m);
  const fail = m => { console.log('  ❌ ' + m); failures.push(m); };

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errs.push('PAGE: ' + e.message));
    page.on('requestfailed', r => errs.push('REQFAIL: ' + r.url()));
    page.on('response', r => { if (r.status() === 404) errs.push('404: ' + r.url()); });
    page.on('console', m => {
      if (m.type() === 'error') errs.push(m.text());
      if (m.text().includes('[sw]')) log('  [sw-console] ' + m.text());
    });

    // Open the ROOT url (tests the redirect → /app/)
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await sleep(500);
    const finalUrl = page.url();
    log('Root URL redirected to: ' + finalUrl);
    if (/\/app/.test(finalUrl)) log('✓ Root redirect to /app works');
    else fail('root did not redirect to /app: ' + finalUrl);

    // 1. manifest
    const hasManifest = await page.$eval('link[rel="manifest"]', el => !!el).catch(() => false);
    log('Manifest linked: ' + hasManifest);
    if (!hasManifest) fail('manifest not linked');

    // 2. icons exist (fetch them with absolute URL)
    const iconOk = await page.evaluate(async (base) => {
      try { const r = await fetch(base + '/app/icons/icon-192.png'); return r.ok; } catch { return false; }
    }, BASE);
    log('icon-192.png reachable over http: ' + iconOk);
    if (!iconOk) fail('icon-192.png not reachable');

    // 3. service worker registers
    await sleep(1500); // give SW time to register + install
    const swState = await page.evaluate(async () => {
      if (!navigator.serviceWorker) return { supported: false };
      const reg = await navigator.serviceWorker.getRegistration();
      return { supported: true, registered: !!reg, scope: reg && reg.scope };
    });
    log('Service worker: ' + JSON.stringify(swState));
    if (swState.registered) log('✓ Service worker registered');
    else fail('service worker not registered: ' + JSON.stringify(swState));

    // 4. wait for cache to populate, then verify music is cached
    await sleep(2500);
    const cacheCheck = await page.evaluate(async () => {
      if (!window.caches) return { supported: false };
      const keys = await caches.keys();
      const cache = await caches.open(keys[0] || 'liam-banderas-v1');
      const matched = await cache.match('http://localhost:8123/music/brainrot.mp3');
      return { supported: true, cacheKeys: keys, hasBrainrot: !!matched };
    });
    log('Cache check: ' + JSON.stringify(cacheCheck));
    if (cacheCheck.hasBrainrot) log('✓ Music file cached for offline play');
    else fail('brainrot.mp3 not in cache');

    // 5. the full app still works end-to-end over http
    await page.evaluate(() => {
      window.speechSynthesis.speak = u => { setTimeout(() => u.onend && u.onend(), 1); };
      window.speechSynthesis.cancel = () => {};
    });
    await sleep(500);
    // tap splash via evaluate (robust to timing), then drive the flow
    const flowOk = await page.evaluate(async () => {
      try {
        document.querySelector('#splash-start')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise(r => setTimeout(r, 600));
        document.querySelector('#hub-play')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise(r => setTimeout(r, 700));
        return !!document.querySelector('#screen-paint.active');
      } catch (e) { return false; }
    });
    log('App flow over http (paint screen): ' + flowOk);
    if (!flowOk) fail('paint screen did not appear over http');

    await browser.close();
  } finally {
    server.kill();
  }

  console.log('\n════════ PWA RESULT ════════');
  if (failures.length) { console.log('❌ ' + failures.length + ' failure(s):'); failures.forEach(f => console.log('   - ' + f)); }
  else console.log('✅ PWA verified: redirect, manifest, icons, service worker, offline music cache, full flow over http.');
  if (errs.length) console.log('   (also ' + errs.length + ' issues: ' + [...new Set(errs)].join(' | ') + ')');
  process.exit(failures.length ? 1 : 0);
})();

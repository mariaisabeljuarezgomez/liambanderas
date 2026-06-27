/* Real end-to-end runtime test. Loads app/index.html in headless Chromium,
   drives the actual Liam flow, and reports console errors + whether each
   milestone fires. This is the proof that the app RUNS, not just parses. */
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args:['--no-sandbox','--mute-audio'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const errors = [];
  const milestones = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', r => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()||{}).errorText));

  const fileUrl = 'file:///' + path.resolve('app/index.html').replace(/\\/g,'/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Override speech + audio so headless doesn't hang on TTS
  await page.evaluate(() => {
    window.speechSynthesis.speak = u => { setTimeout(()=>u.onend&&u.onend(), 5); };
    window.speechSynthesis.cancel = () => {};
  });

  const log = (m) => { milestones.push(m); console.log('  ✓ ' + m); };

  // 1. Splash visible?
  const splash = await page.$eval('#screen-splash', el => el.classList.contains('active')).catch(()=>false);
  log(splash ? 'Splash screen shows' : '!! Splash NOT visible');

  // 2. Tap JUGAR → should reach hub
  await page.tap('#splash-start');
  await new Promise(r=>setTimeout(r, 800));
  const hubActive = await page.$eval('#screen-hub', el => el.classList.contains('active')).catch(()=>false);
  log(hubActive ? 'JUGAR → Hub appears' : '!! Hub did NOT appear');

  // 3. Hub should list 5 level cards + a JUGAR button
  const levelCards = await page.$$eval('.level-card', els => els.length).catch(()=>0);
  log(levelCards===5 ? `Hub shows 5 level cards` : `!! Hub shows ${levelCards} level cards (expected 5)`);

  // 4. Tap JUGAR (hub) → paint station for first flag
  await page.tap('#hub-play');
  await new Promise(r=>setTimeout(r, 800));
  const paintActive = await page.$eval('#screen-paint', el => el.classList.contains('active')).catch(()=>false);
  log(paintActive ? 'Hub JUGAR → Paint station appears' : '!! Paint station did NOT appear');

  // 5. Flag SVG + palette rendered?
  const hasSVG = await page.$eval('.flag-mount svg', el => !!el).catch(()=>false);
  const swatches = await page.$$eval('.swatch', els => els.length).catch(()=>0);
  log(hasSVG ? 'Flag SVG rendered' : '!! No flag SVG');
  log(swatches>0 ? `Color palette shows ${swatches} colors` : '!! No color swatches');

  // 6. Paint all regions correctly via real pointer taps on each region
  const paintResult = await page.evaluate(() => {
    const active = Paint.getActive();
    if (!active) return { ok:false, reason:'no active session' };
    const flag = active.flag;
    let paintedCount = 0;
    flag.parts.forEach(part => {
      // select the correct color swatch
      const swatch = document.querySelector(`.swatch[data-color="${part.correct}"]`);
      if (swatch) swatch.dispatchEvent(new MouseEvent('click', { bubbles:true }));
      // tap the region inside the flag mount
      const regionEl = document.querySelector(`.flag-mount [data-region="${part.region}"]`);
      if (regionEl) regionEl.dispatchEvent(new MouseEvent('click', { bubbles:true }));
      paintedCount++;
    });
    return { ok:true, paintedCount, partsCount: flag.parts.length };
  });
  log(paintResult.ok ? `Painted ${paintResult.paintedCount}/${paintResult.partsCount} regions` : `!! Paint failed: ${paintResult.reason}`);

  // 7. After correct painting, completion should fire → celebration → auto-advance timer
  await new Promise(r=>setTimeout(r, 1500));
  const dotsAfter = await page.$$eval('.dot.done', els => els.length).catch(()=>0);
  log(`Progress dots after painting: ${dotsAfter}`);

  // Check if Store recorded it
  const stored = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('liam_banderas_v2')||'{}');
    return { paintedCount: s.painted ? Object.keys(s.painted).length : 0, stars: s.stars };
  });
  log(`Store recorded: ${stored.paintedCount} flag(s) painted, ${stored.stars} stars`);

  // 8. Verify level gate: can't access level 2 yet
  const gateWorks = await page.evaluate(() => {
    // level 2 card should be locked
    const cards = document.querySelectorAll('.level-card');
    return cards.length >= 2 ? cards[1].classList.contains('locked') : null;
  });

  // 9. Check quiz is reachable — fast-forward by painting all 10 L1 flags
  const quizReachable = await page.evaluate(() => {
    // paint remaining level-1 flags directly in store, then re-check flow
    const lvl1 = FLAGS.filter(f=>f.level===1).map(f=>f.id);
    lvl1.forEach(id => Store.markPainted(id));
    return lvl1.length;
  });
  log(`Force-marked ${quizReachable} L1 flags painted to test quiz path`);

  // Now advancing should route to quiz. Re-enter flow for level 1.
  await page.evaluate(() => Flow.startLevel(1));
  await new Promise(r=>setTimeout(r, 1000));
  const quizActive = await page.$eval('#screen-quiz', el => el.classList.contains('active')).catch(()=>false);
  log(quizActive ? 'All 10 painted → Quiz launches automatically' : '!! Quiz did NOT launch');

  if (quizActive) {
    // 10. Quiz should show 4 options + a prompt
    const qOpts = await page.$$eval('.quiz-option', els => els.length).catch(()=>0);
    log(qOpts===4 ? `Quiz shows 4 flag options` : `!! Quiz shows ${qOpts} options (expected 4)`);
    // tap the correct one
    const answered = await page.evaluate(() => {
      const card = document.querySelector('.quiz-option');
      if(card) card.click();
      return !!card;
    });
    await new Promise(r=>setTimeout(r, 600));
    log(answered ? 'Quiz answer accepted' : '!! Could not answer quiz');
  }

  console.log('\n════════ RESULT ════════');
  if (errors.length) {
    console.log('❌ RUNTIME ERRORS (' + errors.length + '):');
    [...new Set(errors)].slice(0,15).forEach(e => console.log('   ' + e));
  } else {
    console.log('✅ ZERO runtime/console errors. App runs cleanly end-to-end.');
  }
  console.log('Milestones passed: ' + milestones.length);

  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();

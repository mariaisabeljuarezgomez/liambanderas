/* v2.1 VERIFICATION — proves the three new behaviors:
   1. Wrong quiz answer does NOT advance — child retries until correct.
   2. Quiz Exit button (parent-gated) returns to hub.
   3. Completing a quiz records a full attempt the report can show.
   4. Report screen renders with the recorded data. */
const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args:['--no-sandbox','--mute-audio'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  await page.goto('file:///' + path.resolve('app/index.html').replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.speechSynthesis.speak = u => { setTimeout(()=>u.onend&&u.onend(), 1); };
    window.speechSynthesis.cancel = () => {};
  });
  const log = m => console.log('  ' + m);
  const fail = m => { console.log('  ❌ ' + m); failures.push(m); };
  const failures = [];

  // ── clear any prior state ──
  await page.evaluate(() => { localStorage.removeItem('liam_banderas_v2'); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.speechSynthesis.speak = u => { setTimeout(()=>u.onend&&u.onend(), 1); };
    window.speechSynthesis.cancel = () => {};
  });

  await page.tap('#splash-start'); await sleep(500);

  // Fast-forward to a quiz
  await page.evaluate(() => {
    FLAGS.filter(f=>f.level===1).forEach(f => Store.markPainted(f.id));
    Flow.startLevel(1);
  });
  await sleep(900);

  // ══════ TEST 1: wrong answer does NOT advance ══════
  log('▶ TEST 1: wrong answer keeps him on the same question');
  const qnumBefore = await page.$eval('.quiz-qnum', el => el.textContent).catch(()=>'?');
  // Tap a WRONG option (find an option that is NOT the answer)
  await page.evaluate(() => {
    const promptText = document.querySelector('.qp-es')?.textContent || '';
    const answer = FLAGS.find(f => promptText.includes(f.es));
    const wrong = [...document.querySelectorAll('.quiz-option')].find(c => c.dataset.id !== answer.id);
    if (wrong) wrong.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  });
  await sleep(3200); // past the 2.4s reopen window
  const qnumAfter = await page.$eval('.quiz-qnum', el => el.textContent).catch(()=>'?');
  const gridLockedAfter = await page.$eval('.quiz-grid', el => el.classList.contains('locked')).catch(()=>true);
  log(`  question before wrong tap: "${qnumBefore}" → after: "${qnumAfter}"`);
  if (qnumBefore === qnumAfter && !gridLockedAfter) log('  ✓ WRONG tap did NOT advance, grid re-opened for retry');
  else fail(`wrong answer advanced/locked: ${qnumBefore}→${qnumAfter}, locked=${gridLockedAfter}`);

  // ══════ TEST 2: retry until correct works ══════
  log('▶ TEST 2: now tap the CORRECT answer → should advance');
  await page.evaluate(() => {
    const promptText = document.querySelector('.qp-es')?.textContent || '';
    const answer = FLAGS.find(f => promptText.includes(f.es));
    const right = document.querySelector(`.quiz-option[data-id="${answer.id}"]`);
    if (right) right.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  });
  await sleep(1600);
  const qnumNow = await page.$eval('.quiz-qnum', el => el.textContent).catch(()=>qnumBefore);
  log(`  question after correct tap: "${qnumNow}"`);
  if (qnumNow !== qnumBefore) log('  ✓ correct tap advanced to next question');
  else fail('correct tap did not advance');

  // ══════ TEST 3: Exit button exists + returns to hub (via parent gate) ══════
  log('▶ TEST 3: quiz Exit button → parent gate → hub');
  const exitBtnExists = await page.$eval('.quiz-screen .icon-btn[aria-label*="Volver"], .quiz-screen .topbar .icon-btn', el => !!el).catch(()=>false);
  // The back button is the first icon-btn in the quiz topbar
  const backBtn = await page.$('.quiz-screen .topbar .icon-btn');
  if (backBtn) {
    await backBtn.click();
    await sleep(400);
    const gateOpen = await page.$eval('.pgate-overlay', el => el.classList.contains('open')).catch(()=>false);
    log(`  Exit tap opened parent gate: ${gateOpen}`);
    // solve the gate: tap the correct number
    await page.evaluate(() => {
      const card = document.querySelector('.pgate-card');
      const q = card.querySelector('.pgate-q').textContent; // "3 + 4 = ?"
      const nums = q.match(/\d+/g); const sum = Number(nums[0]) + Number(nums[1]);
      const opts = [...card.querySelectorAll('.pgate-opt')];
      const match = opts.find(o => Number(o.textContent) === sum);
      if (match) match.click();
    });
    await sleep(600);
    const onHub = await page.$eval('#screen-hub', el => el.classList.contains('active')).catch(()=>false);
    log(`  After solving gate → on hub: ${onHub}`);
    if (onHub) log('  ✓ Quiz Exit returned to hub');
    else fail('Exit did not return to hub');
  } else {
    fail('no Exit/back button found in quiz topbar');
  }

  // ══════ TEST 4: complete a quiz, then check report records it ══════
  log('▶ TEST 4: complete a full quiz, verify report data');
  await page.evaluate(() => Flow.startLevel(1));
  await sleep(900);
  // answer all 10 correctly
  for (let i = 0; i < 12; i++) {
    const onQuiz = await page.$eval('#screen-quiz', el => el.classList.contains('active')).catch(()=>false);
    if (!onQuiz) break;
    await page.evaluate(() => {
      const promptText = document.querySelector('.qp-es')?.textContent || '';
      const answer = FLAGS.find(f => promptText.includes(f.es));
      if (answer) document.querySelector(`.quiz-option[data-id="${answer.id}"]`)?.dispatchEvent(new MouseEvent('click', { bubbles:true }));
    });
    await sleep(1500);
  }
  await sleep(800);
  const store = await page.evaluate(() => JSON.parse(localStorage.getItem('liam_banderas_v2')||'{}'));
  const histLen = (store.quizHistory||[]).length;
  const resultsKeys = Object.keys(store.quizResults||{}).length;
  log(`  quizHistory entries: ${histLen}, quizResults flags: ${resultsKeys}`);
  if (histLen === 1 && resultsKeys > 0) log('  ✓ Quiz attempt recorded with per-flag results');
  else fail(`expected 1 history entry + results, got history=${histLen}, results=${resultsKeys}`);

  // ══════ TEST 5: report screen renders ══════
  log('▶ TEST 5: Progress report screen renders with data');
  await page.evaluate(() => {
    // bypass gate for the test by calling Report directly
    Hub.render();
    UI.show('hub');
  });
  await sleep(300);
  await page.evaluate(() => Report.render());
  await sleep(500);
  const reportActive = await page.$eval('#screen-report', el => el.classList.contains('active')).catch(()=>false);
  const histRows = await page.$$eval('.hist-row', els => els.length).catch(()=>0);
  const flagRows = await page.$$eval('.flag-row', els => els.length).catch(()=>0);
  log(`  report visible: ${reportActive}, history rows: ${histRows}, flag rows: ${flagRows}`);
  if (reportActive && histRows === 1 && flagRows > 0) log('  ✓ Report screen renders the recorded data');
  else fail(`report render issue: active=${reportActive}, hist=${histRows}, flags=${flagRows}`);

  // ══════ TEST 6: delete a history record works ══════
  log('▶ TEST 6: delete a history record');
  await page.evaluate(() => {
    document.querySelector('.hist-row .hr-del')?.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  });
  await sleep(400);
  const histRowsAfter = await page.$$eval('.hist-row', els => els.length).catch(()=>1);
  log(`  history rows after delete: ${histRowsAfter}`);
  if (histRowsAfter === 0) log('  ✓ History record deleted');
  else fail(`delete did not work, rows still ${histRowsAfter}`);

  console.log('\n════════ v2.1 RESULT ════════');
  if (failures.length) {
    console.log(`❌ ${failures.length} BEHAVIOR FAILURE(S):`);
    failures.forEach(f => console.log('   - ' + f));
  } else {
    console.log('✅ ALL v2.1 behaviors verified: retry, exit nav, recording, report, delete.');
  }
  if (errors.length) console.log('   (also '+errors.length+' console errors)');
  await browser.close();
  process.exit(failures.length || errors.length ? 1 : 0);
})();

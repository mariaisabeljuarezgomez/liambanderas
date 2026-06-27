/* Capture screenshots of the v2.1 features: quiz with exit bar, parent gate, report screen. */
const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const url = 'file:///' + path.resolve('app/index.html').split(path.sep).join('/');
  await p.goto(url, { waitUntil: 'networkidle0' });
  await p.evaluate(() => { window.speechSynthesis.speak = u => { setTimeout(() => u.onend && u.onend(), 1); }; window.speechSynthesis.cancel = () => {}; });
  const dir = path.resolve('scratch/shots');
  require('fs').mkdirSync(dir, { recursive: true });

  // Seed some data so the report looks realistic: paint flags + run a quiz
  await p.tap('#splash-start'); await sleep(500);
  await p.evaluate(() => {
    // paint a few flags with some wrong tries
    ['francia','italia','alemania'].forEach(id => { Store.markPainted(id); Store.recordPaintTries(id, id==='alemania'?2:0); });
    // record a quiz attempt with mixed results
    const flags = flagsByLevel(1);
    const results = flags.map((f,i) => ({ flagId:f.id, tries: i<6?1:2, wrong: i<6?[]:[flags[0].id], rightOnFirstTry: i<6 }));
    Store.recordQuizAttempt(1, 6, 10, 14, results);
    Store.markQuizPassed(1, 6);
  });

  // 1. Quiz screen WITH exit bar
  await p.evaluate(() => {
    // clear quiz pass so startLevel routes to quiz (flags already painted)
    const s = JSON.parse(localStorage.getItem('liam_banderas_v2'));
    s.quizPassed = {}; localStorage.setItem('liam_banderas_v2', JSON.stringify(s));
    Store.unlockedLevel();
  });
  await p.evaluate(() => Flow.startLevel(1));
  await sleep(1000);
  const onQuiz = await p.$eval('#screen-quiz', el => el.classList.contains('active')).catch(() => false);
  if (onQuiz) {
    await p.screenshot({ path: path.join(dir, '6-quiz-exit.png') });

    // 2. Parent gate open (click the quiz topbar back button)
    const clicked = await p.evaluate(() => {
      const btn = document.querySelector('.quiz-screen .topbar .icon-btn');
      if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
      return false;
    });
    await sleep(600);
    if (clicked) await p.screenshot({ path: path.join(dir, '7-parentgate.png') });
    // close it
    await p.evaluate(() => { const o = document.querySelector('.pgate-overlay'); if (o) o.remove(); });
  } else {
    console.log('  (skipped quiz screenshot — not on quiz screen)');
  }

  // 3. Report screen
  await p.evaluate(() => Report.render());
  await sleep(500);
  await p.screenshot({ path: path.join(dir, '8-report-top.png') });
  // scroll down to show more
  await p.evaluate(() => { const s=document.querySelector('#screen-report .screen-scroll'); if(s) s.scrollTop = s.scrollHeight; });
  await sleep(300);
  await p.screenshot({ path: path.join(dir, '9-report-bottom.png') });

  console.log('v2.1 screenshots saved.');
  await b.close();
})();

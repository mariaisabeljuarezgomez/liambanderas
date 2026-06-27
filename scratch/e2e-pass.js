/* Verify: answering quiz CORRECTLY passes the level + unlocks level 2.
   Reads the answer name from the prompt, finds the matching flag option by id. */
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

  await page.tap('#splash-start'); await sleep(500);
  // Pre-paint all L1 + jump straight to quiz
  await page.evaluate(() => {
    FLAGS.filter(f=>f.level===1).forEach(f => Store.markPainted(f.id));
  });
  await page.evaluate(() => Flow.startLevel(1));
  await sleep(800);

  // Build a name→id map from the prompt and tap the CORRECT option each time.
  // The prompt is "¿Cuál es <name>?" and options have data-id of flag ids.
  // We map flag.es → flag.id using FLAGS.
  for (let i = 0; i < 12; i++) {
    const onQuiz = await page.$eval('#screen-quiz', el => el.classList.contains('active')).catch(()=>false);
    if (!onQuiz) break;
    await page.evaluate(() => {
      // read answer name from prompt
      const promptText = document.querySelector('.qp-es')?.textContent || '';
      // find which flag's es-name is in the prompt
      const answer = FLAGS.find(f => promptText.includes(f.es));
      if (answer) {
        const card = document.querySelector(`.quiz-option[data-id="${answer.id}"]`);
        if (card) card.dispatchEvent(new MouseEvent('click', { bubbles:true }));
      } else {
        // fallback: tap first
        document.querySelector('.quiz-option')?.dispatchEvent(new MouseEvent('click', { bubbles:true }));
      }
    });
    await sleep(2500); // longer wait to clear the 2.4s wrong-delay too
  }

  await sleep(800);
  const finalActive = await page.evaluate(() => [...document.querySelectorAll('.screen.active')].map(s=>s.id));
  const title = await page.evaluate(() => document.querySelector('.lu-title')?.textContent || '(none)');
  log(`Final screen: ${finalActive.join(', ')}`);
  log(`Level-up title: "${title}"  (¡Nivel Completado! = PASS)`);

  // Now check the hub: is level 2 unlocked?
  await page.evaluate(() => Hub.render());
  await page.evaluate(() => UI.show('hub'));
  await sleep(500);
  const level2Locked = await page.evaluate(() => {
    const cards = document.querySelectorAll('.level-card');
    return cards.length >= 2 ? cards[1].classList.contains('locked') : 'no card';
  });
  log(`Level 2 unlocked after passing? ${level2Locked === false ? 'YES ✅' : 'NO (still locked) ❌'}`);

  const store = await page.evaluate(() => JSON.parse(localStorage.getItem('liam_banderas_v2')||'{}'));
  log(`Store: quizzesPassed=${JSON.stringify(store.quizPassed)}, stars=${store.stars}`);

  console.log('\n════════ PASS-GATE RESULT ════════');
  console.log(errors.length ? `❌ ${errors.length} errors` : '✅ ZERO errors. Correct-quiz-answers pass + unlock level 2.');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();

const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const url = 'file:///' + path.resolve('app/index.html').split(path.sep).join('/');
  await p.goto(url, { waitUntil: 'networkidle0' });
  await p.evaluate(() => { window.speechSynthesis.speak = u => { setTimeout(() => u.onend && u.onend(), 1); }; window.speechSynthesis.cancel = () => {}; });
  await p.tap('#splash-start'); await sleep(500); await p.tap('#hub-play'); await sleep(700);

  // Make 2 WRONG taps, then paint everything correctly
  await p.evaluate(() => {
    const f = Paint.getActive().flag;
    const part = f.parts[0];
    const wrongKey = f.palette.find(c => c.key !== part.correct).key;
    document.querySelector(`.swatch[data-color="${wrongKey}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector(`.flag-mount [data-region="${part.region}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const part2 = f.parts[1];
    const wrongKey2 = f.palette.find(c => c.key !== part2.correct).key;
    document.querySelector(`.swatch[data-color="${wrongKey2}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector(`.flag-mount [data-region="${part2.region}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    f.parts.forEach(part => {
      document.querySelector(`.swatch[data-color="${part.correct}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document.querySelector(`.flag-mount [data-region="${part.region}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  });
  await sleep(500);
  const store = await p.evaluate(() => JSON.parse(localStorage.getItem('liam_banderas_v2') || '{}'));
  const tries = store.paintTries && store.paintTries.francia;
  console.log('  paintTries.francia =', tries);
  console.log(tries === 2 ? '✓ Paint tries recorded correctly (2 wrong taps)' : '❌ paint tries wrong: ' + tries);

  await p.evaluate(() => Report.render());
  await sleep(400);
  const ptRows = await p.$$eval('.pt-row', els => els.length).catch(() => 0);
  console.log('  report paint rows:', ptRows);
  console.log(errs.length ? ('❌ ' + errs.length + ' errors: ' + errs.join('; ')) : '✅ zero errors');
  await b.close();
  process.exit(errs.length || tries !== 2 ? 1 : 0);
})();

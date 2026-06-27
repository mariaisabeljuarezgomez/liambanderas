/* Capture screenshots of each screen to assess the current visual state. */
const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args:['--no-sandbox','--mute-audio'] });
  const page = await browser.newPage();
  // iPhone 14 Pro-ish viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('file:///' + path.resolve('app/index.html').replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.speechSynthesis.speak = u => { setTimeout(()=>u.onend&&u.onend(), 1); };
    window.speechSynthesis.cancel = () => {};
  });

  const dir = path.resolve('scratch/shots');
  require('fs').mkdirSync(dir, { recursive: true });

  // 1. Splash
  await sleep(800);
  await page.screenshot({ path: path.join(dir, '1-splash.png') });

  // 2. Hub
  await page.tap('#splash-start'); await sleep(900);
  await page.screenshot({ path: path.join(dir, '2-hub.png') });

  // 3. Paint station
  await page.tap('#hub-play'); await sleep(800);
  await page.screenshot({ path: path.join(dir, '3-paint.png') });

  // 4. Mid-paint (paint first region)
  await page.evaluate(() => {
    const active = Paint.getActive();
    const part = active.flag.parts[0];
    const sw = document.querySelector(`.swatch[data-color="${part.correct}"]`);
    if (sw) sw.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const r = document.querySelector(`.flag-mount [data-region="${part.region}"]`);
    if (r) r.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  });
  await sleep(400);
  await page.screenshot({ path: path.join(dir, '4-paint-mid.png') });

  // 5. Quiz
  await page.evaluate(() => {
    FLAGS.filter(f=>f.level===1).forEach(f => Store.markPainted(f.id));
    Flow.startLevel(1);
  });
  await sleep(900);
  await page.screenshot({ path: path.join(dir, '5-quiz.png') });

  console.log('Screenshots saved to scratch/shots/');
  await browser.close();
})();

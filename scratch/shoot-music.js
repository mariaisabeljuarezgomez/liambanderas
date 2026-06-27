/* Screenshot the music widget: closed, open panel, and playing state. */
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

  await p.tap('#splash-start'); await sleep(500);
  await p.evaluate(() => Hub.render());
  await p.evaluate(() => UI.show('hub'));
  await sleep(400);

  // music button visible on hub (closed)
  await p.screenshot({ path: path.join(dir, '10-music-closed.png') });

  // open the panel
  await p.evaluate(() => document.querySelector('.music-toggle').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await sleep(300);
  await p.screenshot({ path: path.join(dir, '11-music-panel.png') });

  // start brainrot (green playing state)
  await p.evaluate(() => document.querySelector('.music-track[data-id="brainrot"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await sleep(400);
  await p.screenshot({ path: path.join(dir, '12-music-playing.png') });

  console.log('music screenshots saved.');
  await b.close();
})();

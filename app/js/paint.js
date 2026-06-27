/* ════════════════════════════════════════════════════════════════
   paint.js — ONE paint engine that works for every flag in data.js.
   Renders the SVG, listens for taps, validates colors, gives feedback,
   and fires onComplete when every region is painted correctly.
   ════════════════════════════════════════════════════════════════ */

const Paint = (() => {
  let active = null;   // current session: { flag, painted:{}, selKey, onComplete }

  // Build the palette UI for a flag
  function buildPalette(flag, container) {
    container.innerHTML = '';
    flag.palette.forEach(item => {
      const sw = UI.colorSwatch(item);
      sw.addEventListener('click', () => selectColor(item.key, flag));
      container.appendChild(sw);
    });
  }

  function selectColor(key, flag) {
    if (!active) return;
    active.selKey = key;
    const names = COLOR_NAMES[key];
    Audio2.speak(names.es, names.en);
    // visual highlight
    document.querySelectorAll('.swatch').forEach(s => {
      s.classList.toggle('selected', s.dataset.color === key);
    });
  }

  // Apply the chosen color to a region element (handles groups)
  function applyColor(el, hex, isWhite) {
    const stroke = isWhite ? '#d0d7de' : 'none';
    if (el.tagName.toLowerCase() === 'g') {
      el.querySelectorAll('[data-region],[class*="region"], rect, circle, polygon, path').forEach(ch => {
        if (ch.hasAttribute('fill')) ch.setAttribute('fill', hex);
        ch.setAttribute('stroke', stroke);
      });
    } else {
      el.setAttribute('fill', hex);
      el.setAttribute('stroke', stroke);
    }
  }

  function resetRegion(el) {
    if (el.tagName.toLowerCase() === 'g') {
      el.querySelectorAll('rect, circle, polygon, path').forEach(ch => {
        ch.setAttribute('fill', GHOST);
        ch.setAttribute('stroke', GHOST_STROKE);
      });
    } else {
      el.setAttribute('fill', GHOST);
      el.setAttribute('stroke', GHOST_STROKE);
    }
  }

  // Wire up tap handlers on the SVG
  function wireSVG(svg) {
    svg.querySelectorAll('[data-region]').forEach(el => {
      // Use pointer events for mobile reliability
      el.style.cursor = 'pointer';
      el.classList.add('region-hint');   // gentle "tap me" pulse until painted
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        spawnRipple(el, e);
        handleTap(el, e);
      });
    });
  }

  // Paint splash ripple at the tap point (scoped to the SVG via SVG circle)
  function spawnRipple(el, evt) {
    try {
      const svg = el.ownerSVGElement || el.closest('svg');
      if (!svg || !evt) return;
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm.inverse());
      const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ripple.setAttribute('cx', local.x);
      ripple.setAttribute('cy', local.y);
      ripple.setAttribute('r', '2');
      ripple.setAttribute('class', 'paint-ripple');
      svg.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    } catch (e) { /* ripple is decorative — never block a tap */ }
  }

  function handleTap(el, evt) {
    if (!active) return;
    const region = el.getAttribute('data-region');
    const part = active.flag.parts.find(p => p.region === region);
    if (!part) return;

    // Need a color selected first
    if (!active.selKey) {
      document.querySelectorAll('.swatch').forEach(s => {
        s.classList.add('shake'); setTimeout(() => s.classList.remove('shake'), 400);
      });
      Audio2.boing();
      return;
    }

    if (active.selKey === part.correct) {
      // ✅ Correct
      const hex = active.flag.palette.find(p => p.key === part.correct).hex;
      applyColor(el, hex, part.correct === 'blanco' || hex.toLowerCase() === '#ffffff');
      el.classList.remove('region-hint');            // stop the "tap me" pulse
      el.classList.add('region-painted');            // trigger the glossy shine sweep
      setTimeout(() => el.classList.remove('region-painted'), 700);
      active.painted[region] = true;
      updateDots();
      Audio2.sparkle();
      // confetti burst at tap point
      if (evt) {
        const r = evt.target.getBoundingClientRect ? evt.target.getBoundingClientRect() : null;
        if (r) Celebrate.burstAt(r.left + r.width / 2, r.top + r.height / 2, 14);
      }
      checkDone();
    } else {
      // ❌ Wrong — gentle, encouraging. Count it for the progress report.
      active.wrongCount++;
      el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
      Audio2.boing();
      Audio2.speak('¡Intenta otra vez!', 'Try again!');
    }
  }

  function updateDots() {
    if (!active) return;
    const dots = document.querySelectorAll('.paint-screen .dot');
    const regions = active.flag.parts.map(p => p.region);
    regions.forEach((r, i) => {
      if (dots[i]) dots[i].classList.toggle('done', !!active.painted[r]);
    });
  }

  function checkDone() {
    const allDone = active.flag.parts.every(p => active.painted[p.region]);
    if (allDone && active.onComplete) {
      // Record how many wrong colors were tried before success (for the report).
      Store.recordPaintTries(active.flag.id, active.wrongCount);
      const fn = active.onComplete;
      active.onComplete = null; // guard against double-fire
      fn();
    }
  }

  // ── Start a paint session ──
  // mountEl: container; paletteEl: palette container; onComplete: callback
  function start(flag, mountEl, paletteEl, dotsEl, onComplete) {
    const { svg } = getFlagSVG(flag);
    mountEl.innerHTML = svg;
    const svgEl = mountEl.querySelector('svg');
    buildPalette(flag, paletteEl);

    // progress dots
    dotsEl.innerHTML = '';
    flag.parts.forEach(() => {
      const d = document.createElement('span'); d.className = 'dot';
      dotsEl.appendChild(d);
    });

    active = {
      flag,
      painted: {},
      selKey: null,
      wrongCount: 0,      // wrong-color taps this session (for the report)
      onComplete,
    };

    // Wire click handlers ONCE (wireSVG adds the listeners)
    wireSVG(svgEl);
  }

  function reset() {
    if (!active) return;
    active.painted = {};
    active.selKey = null;
    document.querySelectorAll('[data-region]').forEach(resetRegion);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    updateDots();
  }

  function speakCountry(flag) {
    Audio2.speak(flag.es, flag.en);
  }

  function getActive() { return active; }

  return { start, reset, speakCountry, selectColor, getActive };
})();

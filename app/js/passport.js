/* ════════════════════════════════════════════════════════════════
   passport.js — Passport collection screen. Shows every flag as a
   "stamp", colored when painted, grayed when not.
   ════════════════════════════════════════════════════════════════ */

const Passport = (() => {

  function render() {
    UI.show('passport');
    const screen = document.getElementById('screen-passport');
    const body = screen.querySelector('.passport-body');
    body.innerHTML = '';

    const bar = UI.topBar({
      titleEs: 'Mi Pasaporte', titleEn: 'My Passport',
      onBack: () => UI.show('hub'),
      onSettings: () => Settings.open(),
    });
    body.appendChild(bar);

    const state = Store.get();
    const count = FLAGS.filter(f => state.painted[f.id]).length;

    const summary = document.createElement('div');
    summary.className = 'pass-summary glass';
    summary.innerHTML = `
      <div class="ps-stamp"><span class="mi">verified</span></div>
      <div class="ps-text">
        <span class="ps-es">${count} de ${FLAGS.length} banderas</span>
        <span class="ps-en">${count} of ${FLAGS.length} flags collected</span>
      </div>
      <div class="ps-stars">${UI.starBadge(state.stars).outerHTML}</div>`;
    body.appendChild(summary);

    const grid = document.createElement('div');
    grid.className = 'pass-grid';
    FLAGS.forEach(flag => {
      const painted = state.painted[flag.id];
      const cell = document.createElement('div');
      cell.className = 'pass-cell' + (painted ? ' painted' : ' empty');
      cell.innerHTML = `
        <div class="pc-flag">${thumb(flag, painted)}</div>
        <div class="pc-name">
          <span class="pcn-es">${flag.es}</span>
          <span class="pcn-en">${flag.en}</span>
        </div>`;
      cell.addEventListener('click', () => {
        if (painted) Audio2.speak(flag.es, flag.en);
        else Audio2.speak(`¡Aún no has pintado ${flag.es}!`, `You haven't painted ${flag.en} yet!`);
      });
      grid.appendChild(cell);
    });
    body.appendChild(grid);

    const back = UI.button('Volver', { variant: 'ghost', icon: 'arrow_back', onclick: () => UI.show('hub') });
    back.classList.add('pass-back');
    body.appendChild(back);
  }

  // Colored thumbnail if painted, ghost if not
  function thumb(flag, painted) {
    const { svg } = getFlagSVG(flag);
    const tmp = document.createElement('div'); tmp.innerHTML = svg;
    const svgEl = tmp.querySelector('svg');
    flag.parts.forEach(part => {
      const el = svgEl.querySelector(`[data-region="${part.region}"]`);
      if (!el) return;
      if (painted) {
        const hex = flag.palette.find(p => p.key === part.correct).hex;
        if (el.tagName.toLowerCase() === 'g') {
          el.querySelectorAll('rect, circle, polygon, path').forEach(ch => {
            if (ch.hasAttribute('fill')) ch.setAttribute('fill', hex);
          });
        } else el.setAttribute('fill', hex);
      }
    });
    if (!painted) svgEl.style.opacity = '0.35';
    return tmp.innerHTML;
  }

  return { render };
})();

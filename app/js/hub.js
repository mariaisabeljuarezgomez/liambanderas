/* ════════════════════════════════════════════════════════════════
   hub.js — Level hub (main menu). Shows 5 levels, progress, ranks.
   Unlocked by completing the previous level's flags + quiz.
   ════════════════════════════════════════════════════════════════ */

const Hub = (() => {

  function render() {
    const screen = document.getElementById('screen-hub');
    const body = screen.querySelector('.hub-body');
    body.innerHTML = '';

    const unlocked = Store.unlockedLevel();
    const state = Store.get();

    // Header
    const head = UI.topBar({
      titleEs: 'Explorador de Banderas', titleEn: 'Flag Explorer',
      onSpeak: () => Audio2.speak('¡Hola, Liam! ¿A dónde vamos hoy?', 'Hi Liam! Where are we going today?'),
      onSettings: () => Settings.open(),
    });
    body.appendChild(head);

    // Greeting card
    const greet = document.createElement('div');
    greet.className = 'greet-card glass';
    const rankIdx = Math.min(unlocked - 1, RANKS.length - 1);
    greet.innerHTML = `
      <div class="greet-emoji"><span class="mi">waving_hand</span></div>
      <div class="greet-text">
        <span class="g-es">¡Hola, Liam!</span>
        <span class="g-en">Hi, Liam!</span>
      </div>
      <div class="greet-stars">${UI.starBadge(state.stars).outerHTML}</div>`;
    greet.addEventListener('click', () => Audio2.speak('¡Hola, Liam!', 'Hi, Liam!'));
    body.appendChild(greet);

    // Big "Continue" button
    const cont = UI.button('¡JUGAR!', { variant: 'primary', icon: 'play_arrow', id: 'hub-play' });
    cont.classList.add('hub-play');
    cont.addEventListener('click', () => {
      // unlock audio + start the current level
      Audio2.unlock();
      Flow.startLevel(unlocked);
    });
    // Replace the default click (UI.button already wired pop+onclick) — keep it.
    body.appendChild(cont);

    // Level cards
    const lvls = document.createElement('div'); lvls.className = 'levels';
    LEVELS.forEach(level => {
      const flags = flagsByLevel(level);
      const paintedCount = flags.filter(f => state.painted[f.id]).length;
      const quizPassed = state.quizPassed[level];
      const isUnlocked = level <= unlocked;
      const pct = Math.round((paintedCount / flags.length) * 100);

      const card = document.createElement('button');
      card.className = 'level-card glass' + (isUnlocked ? '' : ' locked') + (quizPassed ? ' passed' : '');
      card.innerHTML = `
        <div class="lc-num">${level}</div>
        <div class="lc-body">
          <span class="lc-rank">${(RANKS[level - 1] || RANKS[0]).es}</span>
          <span class="lc-rank-en">${(RANKS[level - 1] || RANKS[0]).en}</span>
          <div class="lc-bar"><span style="width:${pct}%"></span></div>
          <span class="lc-count">${paintedCount}/${flags.length} banderas</span>
        </div>
        <div class="lc-icon">${isUnlocked
          ? (quizPassed ? '<span class="mi">military_tech</span>' : '<span class="mi">play_arrow</span>')
          : '<span class="mi">lock</span>'}</div>`;
      card.addEventListener('click', () => {
        if (!isUnlocked) {
          Audio2.boing();
          Audio2.speak('¡Aún no! Termina el nivel anterior.', 'Not yet! Finish the previous level.');
          card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 400);
          return;
        }
        Audio2.unlock();
        Flow.startLevel(level);
      });
      lvls.appendChild(card);
    });
    body.appendChild(lvls);

    // Footer: passport + progress (parent-gated). Progress is parent-facing.
    const foot = document.createElement('div'); foot.className = 'hub-foot';
    const pass = UI.button('Pasaporte', { variant: 'ghost', icon: 'menu_book', onclick: () => Passport.render() });
    const prog = UI.button('Progreso', { variant: 'ghost', icon: 'analytics', onclick: () => {
      UI.parentGate(() => Report.render(), { messageEs: 'Padres — Progreso', messageEn: 'Parents — Progress' });
    }});
    foot.appendChild(pass);
    foot.appendChild(prog);
    body.appendChild(foot);
  }

  return { render };
})();

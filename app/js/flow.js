/* ════════════════════════════════════════════════════════════════
   flow.js — The automatic flow controller. The BRAIN.
   Drives: flag → auto-speak → paint → celebrate → auto-advance →
           (every 10 flags) quiz → level-up → next 10 → ... all 50.
   ════════════════════════════════════════════════════════════════ */

const Flow = (() => {
  const AUTO_ADVANCE_MS = 4000;     // celebrate, then wait, then next flag
  const SPEAK_DELAY_MS = 900;       // after a flag appears, speak its name

  let currentLevel = 1;
  let queue = [];                   // ordered flag ids for this play session
  let pos = 0;                      // index in queue
  let advanceTimer = null;

  // Build the queue for a level: unpainted flags first (resume), then any painted-but-due
  function buildQueue(level) {
    currentLevel = level;
    const flags = flagsByLevel(level);
    // unpainted first, preserve natural order; painted go to the end (review)
    const unpainted = flags.filter(f => !Store.isPainted(f.id));
    const painted = flags.filter(f => Store.isPainted(f.id));
    // store ids (not objects) — every consumer of queue expects an id
    queue = [...unpainted, ...painted].map(f => f.id);
    pos = 0;
  }

  function currentFlag() { return queue[pos] ? getFlag(queue[pos]) : null; }

  function startLevel(level) {
    buildQueue(level);
    Store.set({ currentLevel: level });
    if (queue.length === 0 || (queue.length === flagsByLevel(level).length && Store.isPainted(queue[0]))) {
      // all painted → go to quiz
      startQuiz(level);
      return;
    }
    showPaint();
  }

  // ── PAINT PHASE ──
  function showPaint() {
    const flag = currentFlag();
    if (!flag) return;
    UI.show('paint');
    const screen = document.getElementById('screen-paint');
    renderPaintScreen(screen, flag);

    // Auto-speak the country name (Liam can't read!)
    clearTimeout(window._speakT);
    window._speakT = setTimeout(() => Paint.speakCountry(flag), SPEAK_DELAY_MS);
  }

  function renderPaintScreen(screen, flag) {
    const main = screen.querySelector('.paint-body');
    main.innerHTML = '';

    const bar = UI.topBar({
      titleEs: flag.es, titleEn: flag.en,
      onBack: () => { clearTimeout(advanceTimer); UI.show('hub'); },
      onSpeak: () => Paint.speakCountry(flag),
      onSettings: () => Settings.open(),
    });
    main.appendChild(bar);

    // Instruction
    const instr = document.createElement('div');
    instr.className = 'paint-instr';
    instr.innerHTML = `<span class="pi-es">¡Pinta la bandera!</span><span class="pi-en">Paint the flag!</span>`;
    main.appendChild(instr);

    // Dots
    const dots = document.createElement('div'); dots.className = 'dots';
    main.appendChild(dots);

    // Flag stage (the "3D easel")
    const stage = document.createElement('div'); stage.className = 'flag-stage';
    const mount = document.createElement('div'); mount.className = 'flag-mount';
    stage.appendChild(mount);
    main.appendChild(stage);

    // Palette
    const palette = document.createElement('div'); palette.className = 'palette';
    main.appendChild(palette);

    // Action row
    const actions = document.createElement('div'); actions.className = 'paint-actions';
    const resetBtn = UI.button('Reiniciar', { variant: 'ghost', icon: 'restart_alt', onclick: () => Paint.reset() });
    const againBtn = UI.button('Escuchar', { variant: 'ghost', icon: 'volume_up', onclick: () => Paint.speakCountry(flag) });
    actions.appendChild(resetBtn);
    actions.appendChild(againBtn);
    main.appendChild(actions);

    Paint.start(flag, mount, palette, dots, () => onFlagComplete(flag));
  }

  function onFlagComplete(flag) {
    Store.markPainted(flag.id);
    Store.set({ lastFlagIndex: pos });
    Audio2.fanfare();
    Audio2.applause();
    setTimeout(() => Audio2.speak(
      `¡Lo lograste! Pintaste la bandera de ${flag.es}!`,
      `You did it! You painted ${flag.en}'s flag!`
    ), 400);
    Celebrate.bigCelebration();
    // 3D wave on the flag
    const svg = document.querySelector('.flag-mount svg');
    if (svg) svg.classList.add('flag-wave');

    // Auto-advance after celebration
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(advance, AUTO_ADVANCE_MS);

    // Show a small "next" affordance for impatient parents
    showTapToSkip();
  }

  let skipEl = null;
  function showTapToSkip() {
    if (skipEl) skipEl.remove();
    skipEl = document.createElement('button');
    skipEl.className = 'skip-affordance';
    skipEl.innerHTML = '<span class="mi">skip_next</span><span>Siguiente / Next</span>';
    skipEl.addEventListener('click', () => { clearTimeout(advanceTimer); skipEl.remove(); skipEl = null; advance(); });
    document.getElementById('screen-paint').appendChild(skipEl);
  }

  function advance() {
    if (skipEl) { skipEl.remove(); skipEl = null; }
    pos++;
    const remaining = queue.slice(pos).filter(id => !Store.isPainted(id));
    // If there are still unpainted flags in this level → next flag
    if (remaining.length > 0) {
      // skip over already-painted ones
      while (pos < queue.length && Store.isPainted(queue[pos])) pos++;
      if (pos < queue.length) { showPaint(); return; }
    }
    // All 10 painted → quiz
    startQuiz(currentLevel);
  }

  // ── QUIZ PHASE ──
  let quizHandle = null;     // { abort } — lets the Exit button stop the quiz cleanly

  function startQuiz(level) {
    UI.show('quiz');
    const screen = document.getElementById('screen-quiz');
    const body = screen.querySelector('.quiz-body');
    body.innerHTML = '';

    // Top bar with an Exit button (parent-gated) so Liam is never locked in.
    const bar = UI.topBar({
      titleEs: 'Examen', titleEn: 'Quiz',
      onBack: () => {
        // Confirm with a parent gate before abandoning a quiz in progress.
        UI.parentGate(() => {
          if (quizHandle) quizHandle.abort();
          UI.show('hub');
        }, { messageEs: '¿Salir del examen?', messageEn: 'Leave the quiz?' });
      },
      onSpeak: null,           // the per-question replay button lives in the prompt card
      onSettings: () => Settings.open(),
    });
    body.appendChild(bar);

    const root = document.createElement('div');
    root.className = 'quiz-content';
    body.appendChild(root);

    quizHandle = Quiz.run(level, root, (res) => onQuizComplete(res), {});
  }

  function onQuizComplete(res) {
    quizHandle = null;
    // v2.1: completion-based — finishing every question always counts as a pass,
    // but `correct` (first-try accuracy) + totalTries are shown + recorded.
    UI.show('levelup');
    const screen = document.getElementById('screen-levelup');
    renderLevelUp(screen, res);
  }

  function renderLevelUp(screen, res) {
    const body = screen.querySelector('.levelup-body');
    body.innerHTML = '';

    // Top bar for consistency with the other screens (Home + settings).
    const bar = UI.topBar({
      titleEs: '¡Bien hecho!', titleEn: 'Well done!',
      onBack: () => UI.show('hub'),
      onSpeak: () => Audio2.speak('¡Bien hecho, Liam!', 'Well done, Liam!'),
      onSettings: () => Settings.open(),
    });
    body.appendChild(bar);

    const rank = RANKS[res.level - 1] || RANKS[RANKS.length - 1];
    const nextLevel = res.level + 1;
    const isFinal = res.level >= LEVELS[LEVELS.length - 1];

    const card = document.createElement('div');
    card.className = 'levelup-card';
    // Show first-try accuracy prominently so Dad sees how it really went.
    card.innerHTML = `
      <div class="lu-medal"><span class="mi">military_tech</span></div>
      <h2 class="lu-title">¡Nivel Completado!</h2>
      <p class="lu-sub">Level Complete!</p>
      <div class="lu-score">
        <span class="mi">star</span>
        <span>${res.correct} / ${res.total} <small style="font-size:.6em;opacity:.7">(al primer intento)</small></span>
      </div>
      <div class="lu-tries">Intentos en total: <b>${res.totalTries}</b> · Total tries</div>
      <div class="lu-rank">
        <span class="lr-es">${rank.es}</span>
        <span class="lr-en">${rank.en}</span>
      </div>`;
    body.appendChild(card);

    Audio2.levelUp();
    setTimeout(() => Audio2.speak(`¡Nuevo nivel! Eres ${rank.es}!`, `New level! You're ${rank.en}!`), 600);
    Celebrate.bigCelebration();
    // medal spin animation
    setTimeout(() => card.querySelector('.lu-medal').classList.add('spin'), 300);

    const actions = document.createElement('div'); actions.className = 'lu-actions';
    if (!isFinal) {
      actions.appendChild(UI.button('Siguiente Nivel', {
        variant: 'primary', icon: 'arrow_forward',
        onclick: () => startLevel(nextLevel),
      }));
    } else {
      actions.appendChild(UI.button('¡Jugar de Nuevo!', {
        variant: 'primary', icon: 'replay',
        onclick: () => startLevel(1),
      }));
    }
    actions.appendChild(UI.button('Inicio', {
      variant: 'ghost', icon: 'home',
      onclick: () => UI.show('hub'),
    }));
    body.appendChild(actions);
  }

  return {
    startLevel,
    showPaint,
    currentLevel: () => currentLevel,
    buildQueue,
  };
})();

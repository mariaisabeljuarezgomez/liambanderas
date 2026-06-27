/* ════════════════════════════════════════════════════════════════
   quiz.js — Audio quiz engine. Spoken prompt ("¿Cuál es México?"),
   4 flag thumbnails to tap, spoken feedback.

   v2.1 — WRONG ANSWERS REQUIRE A RETRY. The child stays on each question
   until they tap the correct flag. Wrong picks say "¡Incorrecto! Esa
   bandera es [name]", shake, then re-open for another try. So every quiz
   is "completed", but we still record real accuracy (first-try) + total
   tries for the parent report. NON-READER FRIENDLY: everything is spoken.
   ════════════════════════════════════════════════════════════════ */

const Quiz = (() => {

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build the 10 questions for a level (one per flag in that level)
  function buildQuestions(level) {
    const flags = flagsByLevel(level);
    return shuffle(flags).map(answer => {
      // 3 distractors from the full pool (prefer same level)
      const pool = shuffle(FLAGS.filter(f => f.id !== answer.id && f.level <= level));
      const distractors = pool.slice(0, 3);
      return { answer, options: shuffle([answer, ...distractors]) };
    });
  }

  // Render a flag thumbnail SVG (fully colored, for the option)
  function thumbnail(flag) {
    const { svg } = getFlagSVG(flag);
    // Replace ghost fills with correct colors so the option shows a real flag
    const tmp = document.createElement('div'); tmp.innerHTML = svg;
    const svgEl = tmp.querySelector('svg');
    flag.parts.forEach(part => {
      const el = svgEl.querySelector(`[data-region="${part.region}"]`);
      if (!el) return;
      const hex = flag.palette.find(p => p.key === part.correct).hex;
      if (el.tagName.toLowerCase() === 'g') {
        el.querySelectorAll('rect, circle, polygon, path').forEach(ch => {
          if (ch.hasAttribute('fill')) ch.setAttribute('fill', hex);
        });
      } else {
        el.setAttribute('fill', hex);
      }
    });
    return tmp.innerHTML;
  }

  // ── Run a quiz ──
  // root: the quiz screen content element (topbar is added by caller in flow.js)
  function run(level, root, onComplete, hooks) {
    const questions = buildQuestions(level);
    const hooks_ = hooks || {};
    let idx = 0;
    const total = questions.length;
    let totalTries = 0;                 // across the whole quiz (every tap)
    let firstTryCorrect = 0;            // how many flags were gotten right on the first attempt
    const perQuestion = [];             // [{ flagId, tries, wrong:[ids], rightOnFirstTry }]
    let qTries = 0;                     // taps on the CURRENT question
    const qWrong = [];                  // wrong flag ids picked on the current question
    let qFirstCorrect = false;          // was the FIRST tap correct?

    // State we must be able to reset when the quiz exits early via Exit button
    let active = true;

    function render() {
      if (!active) return;
      const q = questions[idx];
      root.innerHTML = '';

      qTries = 0;
      qWrong.length = 0;
      qFirstCorrect = false;

      // Header: question number + first-try score
      const meta = document.createElement('div');
      meta.className = 'quiz-meta';
      meta.innerHTML = `
        <span class="quiz-qnum">${idx + 1} / ${total}</span>
        <span class="quiz-score"><span class="mi">star</span> ${firstTryCorrect}</span>`;
      root.appendChild(meta);

      // Prompt card
      const promptCard = document.createElement('div');
      promptCard.className = 'quiz-prompt glass';
      promptCard.innerHTML = `
        <div class="quiz-prompt-icon"><span class="mi">hearing</span></div>
        <div class="quiz-prompt-text">
          <span class="qp-es">¿Cuál es <b>${q.answer.es}</b>?</span>
          <span class="qp-en">Which one is <b>${q.answer.en}</b>?</span>
        </div>
        <button class="icon-btn speaker replay" aria-label="Repetir / Repeat"><span class="mi">volume_up</span></button>`;
      root.appendChild(promptCard);

      // Options grid (2×2)
      const grid = document.createElement('div');
      grid.className = 'quiz-grid';
      q.options.forEach(opt => {
        const card = document.createElement('button');
        card.className = 'quiz-option';
        card.dataset.id = opt.id;          // tie card → flag
        card.innerHTML = `<div class="quiz-flag">${thumbnail(opt)}</div>`;
        card.addEventListener('click', () => answer(card, opt, q, grid));
        grid.appendChild(card);
      });
      root.appendChild(grid);

      // progress bar
      const bar = document.createElement('div');
      bar.className = 'quiz-progress';
      bar.innerHTML = `<span style="width:${(idx / total) * 100}%"></span>`;
      root.appendChild(bar);

      // Speak the prompt automatically
      setTimeout(() => { if (active) speakPrompt(q); }, 350);
      promptCard.querySelector('.replay').addEventListener('click', () => speakPrompt(q));
    }

    function speakPrompt(q) {
      Audio2.speak(`¿Cuál es ${q.answer.es}?`, `Which one is ${q.answer.en}?`);
    }

    function answer(card, opt, q, grid) {
      if (!active || grid.classList.contains('locked')) return;
      grid.classList.add('locked');   // brief lock during the feedback beat
      totalTries++;
      qTries++;

      if (opt.id === q.answer.id) {
        // ✅ CORRECT
        if (qTries === 1) { firstTryCorrect++; qFirstCorrect = true; }
        card.classList.add('correct');
        Audio2.sparkle();
        Audio2.speak('¡Correcto!', 'Correct!');
        perQuestion.push({
          flagId: q.answer.id,
          tries: qTries,
          wrong: [...qWrong],
          rightOnFirstTry: qFirstCorrect,
        });
        // advance after the celebratory beat
        setTimeout(() => {
          if (!active) return;
          grid.classList.remove('locked');
          idx++;
          if (idx < total) render();
          else finish();
        }, 1300);
      } else {
        // ❌ WRONG — tell him which flag he picked, then let him retry.
        // The correct answer is NOT revealed (he must find it himself).
        qWrong.push(opt.id);
        card.classList.add('wrong');
        Audio2.boing();
        Audio2.speak(
          `¡Incorrecto! Esa bandera es ${opt.es}.`,
          `Incorrect! That flag is ${opt.en}.`
        );
        // Re-open for another attempt after the spoken feedback.
        setTimeout(() => {
          if (!active) return;
          card.classList.remove('wrong');
          grid.classList.remove('locked');
        }, 2400);
      }
    }

    function finish() {
      active = false;
      // Record the full attempt (completion-based unlock, but real accuracy kept)
      Store.markQuizPassed(level, firstTryCorrect);
      Store.recordQuizAttempt(level, firstTryCorrect, total, totalTries, perQuestion);
      onComplete({
        correct: firstTryCorrect,
        total,
        totalTries,
        level,
        passed: true,           // completion-based — he finished every question
      });
    }

    // Allow the caller (Exit button) to abort cleanly without firing onComplete
    function abort() { active = false; }

    render();

    return { abort };
  }

  return { run };
})();

/* ════════════════════════════════════════════════════════════════
   store.js — Persistent progress (localStorage). Survives reload.
   v2.1 — records real performance (tries, right/wrong, history) so a
   parent can see how Liam is doing, not just yes/no booleans.
   ════════════════════════════════════════════════════════════════ */

const Store = (() => {
  const KEY = 'liam_banderas_v2';
  const DEFAULT = {
    painted: {},          // { flagId: true }
    quizPassed: {},       // { level: true }  (unlocks by completion)
    stars: 0,
    currentLevel: 1,
    lastFlagIndex: 0,
    quizScore: {},        // { level: bestCorrectCount }   (legacy, kept)
    createdAt: Date.now(),

    // ── v2.1 performance detail (the "how well is he doing" layer) ──
    paintTries: {},       // { flagId: numberOfWrongColorsBeforeSuccess }
    quizHistory: [],      // [{ date, level, correct, total, totalTries, results:[{flagId,tries,wrong:[ids]}] }]
    quizResults: {},      // { flagId: { tries, wrong:[ids], rightOnFirstTry, date } }  (latest per flag)
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT);
      return { ...structuredClone(DEFAULT), ...JSON.parse(raw) };
    } catch (e) { return structuredClone(DEFAULT); }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  let state = load();

  // ════════════════════════════════════════════════════════════════
  //  BASIC ACCESS
  // ════════════════════════════════════════════════════════════════
  function get() { return state; }
  function set(patch) { state = { ...state, ...patch }; save(state); return state; }

  // ════════════════════════════════════════════════════════════════
  //  PAINTING
  // ════════════════════════════════════════════════════════════════
  function markPainted(flagId) {
    if (!state.painted[flagId]) {
      state.painted[flagId] = true;
      state.stars += 1;
      save(state);
    }
  }
  function isPainted(flagId) { return !!state.painted[flagId]; }

  // Record how many wrong colors the child tried before nailing the flag.
  // Called from paint.js on completion. Only the FIRST completion's count sticks
  // (the one that "counts"), but later attempts refresh it so you see current state.
  function recordPaintTries(flagId, wrongCount) {
    state.paintTries[flagId] = wrongCount;
    save(state);
  }

  // ════════════════════════════════════════════════════════════════
  //  QUIZ  —  unlock by completion, but record full accuracy detail
  // ════════════════════════════════════════════════════════════════
  function markQuizPassed(level, score) {
    // Per parent's choice: completing a quiz always unlocks the next level.
    // `score` = number correct on FIRST try across all questions (for the report).
    if (!state.quizPassed[level]) {
      state.quizPassed[level] = true;
      state.stars += 3;
    }
    state.quizScore[level] = Math.max(state.quizScore[level] || 0, score);
    save(state);
  }

  // Record a full quiz attempt. `results` = [{ flagId, tries, wrong:[ids], rightOnFirstTry }]
  function recordQuizAttempt(level, correct, total, totalTries, results) {
    const attempt = {
      date: Date.now(),
      level,
      correct,
      total,
      totalTries,
      results,
    };
    state.quizHistory.push(attempt);
    // latest per-flag quiz result, for the "which flags is he struggling with" view
    (results || []).forEach(r => {
      state.quizResults[r.flagId] = {
        tries: r.tries,
        wrong: r.wrong || [],
        rightOnFirstTry: !!r.rightOnFirstTry,
        date: attempt.date,
      };
    });
    save(state);
  }

  function deleteQuizAttempt(index) {
    if (index < 0 || index >= state.quizHistory.length) return;
    state.quizHistory.splice(index, 1);
    save(state);
  }

  function clearAllHistory() {
    state.quizHistory = [];
    state.quizResults = {};
    state.paintTries = {};
    save(state);
  }

  function isQuizPassed(level) { return !!state.quizPassed[level]; }

  function unlockedLevel() {
    // highest level the child may play. A level unlocks once its 10 flags are
    // painted AND its quiz is completed (completion-based per parent request).
    let lvl = 1;
    for (const l of LEVELS) {
      const allPainted = flagsByLevel(l).every(f => state.painted[f.id]);
      if (allPainted && state.quizPassed[l] && l < LEVELS[LEVELS.length - 1]) {
        lvl = Math.max(lvl, l + 1);
      } else {
        lvl = Math.max(lvl, l);
        if (!(allPainted && state.quizPassed[l])) break;
      }
    }
    state.currentLevel = Math.min(lvl, LEVELS[LEVELS.length - 1]);
    save(state);
    return state.currentLevel;
  }

  // ════════════════════════════════════════════════════════════════
  //  REPORT — aggregate everything for the parent dashboard
  // ════════════════════════════════════════════════════════════════
  function getReport() {
    const levels = LEVELS.map(level => {
      const flags = flagsByLevel(level);
      const paintedCount = flags.filter(f => state.painted[f.id]).length;
      // attempts for this level
      const attempts = state.quizHistory.filter(h => h.level === level);
      const latest = attempts.length ? attempts[attempts.length - 1] : null;
      const accuracy = latest && latest.total ? Math.round((latest.correct / latest.total) * 100) : 0;
      const totalTries = latest ? latest.totalTries : 0;
      return {
        level,
        rank: RANKS[level - 1] || RANKS[0],
        paintedCount,
        flagCount: flags.length,
        attempts: attempts.length,
        latestAccuracy: accuracy,
        latestCorrect: latest ? latest.correct : 0,
        latestTotal: latest ? latest.total : 0,
        latestTries: totalTries,
        passed: !!state.quizPassed[level],
      };
    });

    // per-flag quiz results, enriched with flag names
    const flagResults = FLAGS.map(flag => {
      const r = state.quizResults[flag.id];
      return {
        flag,
        tries: r ? r.tries : null,
        wrong: r ? r.wrong.map(id => getFlag(id)).filter(Boolean) : [],
        rightOnFirstTry: r ? r.rightOnFirstTry : null,
        date: r ? r.date : null,
      };
    }).filter(r => r.tries !== null);

    // per-flag paint tries
    const paintResults = FLAGS
      .filter(f => state.paintTries[f.id] !== undefined)
      .map(f => ({ flag: f, wrongTries: state.paintTries[f.id] }));

    return {
      levels,
      flagResults,
      paintResults,
      quizHistory: [...state.quizHistory].reverse(), // newest first
      totals: {
        painted: Object.keys(state.painted).length,
        totalFlags: FLAGS.length,
        stars: state.stars,
        quizAttempts: state.quizHistory.length,
      },
    };
  }

  function reset() { state = structuredClone(DEFAULT); save(state); }

  return {
    get, set,
    markPainted, isPainted, recordPaintTries,
    markQuizPassed, isQuizPassed, recordQuizAttempt, deleteQuizAttempt,
    clearAllHistory, unlockedLevel, getReport,
    reset,
  };
})();

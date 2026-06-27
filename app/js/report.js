/* ════════════════════════════════════════════════════════════════
   report.js — Progress / parent dashboard. Shows how Liam is doing:
     1. Per-level summary   (accuracy, tries, attempts, painted/10)
     2. Per-flag quiz results (tries, wrong flags picked, first-try?)
     3. Quiz history log    (every attempt: date, score, tries) + delete
     4. Paint-station tries (wrong colors per flag before success)
   Plus per-record delete + "clear all history" (parent-gated).
   Re-render() refreshes after any deletion.
   ════════════════════════════════════════════════════════════════ */

const Report = (() => {

  function render() {
    UI.show('report');
    const screen = document.getElementById('screen-report');
    const body = screen.querySelector('.report-body');
    body.innerHTML = '';

    const bar = UI.topBar({
      titleEs: 'Progreso', titleEn: 'Progress',
      onBack: () => UI.show('hub'),
      onSettings: () => Settings.open(),
    });
    body.appendChild(bar);

    const report = Store.getReport();

    // ── Summary banner ──
    const summary = document.createElement('div');
    summary.className = 'report-summary glass';
    summary.innerHTML = `
      <div class="rs-stat"><span class="mi">flag</span><b>${report.totals.painted}/${report.totals.totalFlags}</b><small>banderas</small></div>
      <div class="rs-stat"><span class="mi">star</span><b>${report.totals.stars}</b><small>estrellas</small></div>
      <div class="rs-stat"><span class="mi">quiz</span><b>${report.totals.quizAttempts}</b><small>exámenes</small></div>`;
    body.appendChild(summary);

    // ── Section 1: per-level summary ──
    body.appendChild(sectionTitle('Por Nivel', 'By Level', 'stacked_bar_chart'));
    const lvlWrap = document.createElement('div'); lvlWrap.className = 'report-levels';
    report.levels.forEach(l => {
      const card = document.createElement('div');
      card.className = 'lvl-row glass' + (l.passed ? ' passed' : '');
      const accColor = l.latestAccuracy >= 70 ? '#1f9d47' : l.latestAccuracy >= 40 ? '#f0a93b' : '#e84a4a';
      card.innerHTML = `
        <div class="lvl-num">${l.level}</div>
        <div class="lvl-info">
          <div class="lvl-rank">${l.rank.es} <span>${l.rank.en}</span></div>
          <div class="lvl-paint">Pintadas: <b>${l.paintedCount}/${l.flagCount}</b></div>
          <div class="lvl-acc">
            <div class="lvl-bar"><span style="width:${l.latestAccuracy}%;background:${accColor}"></span></div>
            <span class="lvl-acc-num">${l.attempts ? l.latestCorrect + '/' + l.latestTotal + ' · ' + l.latestAccuracy + '%' : '—'}</span>
          </div>
        </div>
        <div class="lvl-tries">${l.attempts ? l.latestTries + ' intentos' : ''}<small>${l.attempts} intentos</small></div>`;
      lvlWrap.appendChild(card);
    });
    body.appendChild(lvlWrap);

    // ── Section 2: per-flag quiz results ──
    body.appendChild(sectionTitle('Banderas en Examen', 'Flags in Quiz', 'quiz'));
    if (report.flagResults.length === 0) {
      body.appendChild(empty('Aún no hay exámenes.', 'No quizzes yet.'));
    } else {
      const fgWrap = document.createElement('div'); fgWrap.className = 'report-flags';
      report.flagResults.forEach(r => {
        const chip = document.createElement('div');
        chip.className = 'flag-row glass' + (r.rightOnFirstTry ? ' firsttry' : ' retried');
        const wrongNames = r.wrong.map(f => f.es).join(', ') || '—';
        chip.innerHTML = `
          <div class="fr-flag">${thumb(r.flag)}</div>
          <div class="fr-info">
            <div class="fr-name">${r.flag.es} <span>${r.flag.en}</span></div>
            <div class="fr-badge">${r.rightOnFirstTry
              ? '<span class="tag ok">✓ Al primer intento</span>'
              : `<span class="tag warn">${r.tries} intentos</span>`}</div>
            <div class="fr-wrong">Confundió con: ${wrongNames}</div>
          </div>`;
        fgWrap.appendChild(chip);
      });
      body.appendChild(fgWrap);
    }

    // ── Section 3: quiz history log (with delete) ──
    body.appendChild(sectionTitle('Historial', 'History', 'history'));
    if (report.quizHistory.length === 0) {
      body.appendChild(empty('Sin historial todavía.', 'No history yet.'));
    } else {
      const histWrap = document.createElement('div'); histWrap.className = 'report-history';
      // quizHistory is reversed (newest first). index in that reversed list maps to
      // the real index via (length - 1 - displayIndex).
      const realLen = report.quizHistory.length;
      report.quizHistory.forEach((h, displayIdx) => {
        const realIdx = realLen - 1 - displayIdx;
        const row = document.createElement('div');
        row.className = 'hist-row glass';
        const d = new Date(h.date);
        const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const acc = h.total ? Math.round((h.correct / h.total) * 100) : 0;
        row.innerHTML = `
          <div class="hr-main">
            <div class="hr-rank">Nivel ${h.level} · ${(RANKS[h.level - 1] || RANKS[0]).es}</div>
            <div class="hr-date">${dateStr}</div>
          </div>
          <div class="hr-score">
            <span class="hr-acc">${h.correct}/${h.total}</span>
            <small>${acc}% · ${h.totalTries} intentos</small>
          </div>
          <button class="hr-del icon-btn" aria-label="Borrar"><span class="mi">delete</span></button>`;
        row.querySelector('.hr-del').addEventListener('click', () => {
          Store.deleteQuizAttempt(realIdx);
          render();   // refresh
        });
        histWrap.appendChild(row);
      });
      body.appendChild(histWrap);
    }

    // ── Section 4: paint-station tries ──
    body.appendChild(sectionTitle('Pintura', 'Painting', 'palette'));
    if (report.paintResults.length === 0) {
      body.appendChild(empty('Aún no ha pintado.', 'Nothing painted yet.'));
    } else {
      const ptWrap = document.createElement('div'); ptWrap.className = 'report-paint';
      report.paintResults.forEach(r => {
        const row = document.createElement('div');
        row.className = 'pt-row glass' + (r.wrongTries === 0 ? ' perfect' : '');
        row.innerHTML = `
          <div class="pt-flag">${thumb(r.flag)}</div>
          <div class="pt-info">
            <div class="pt-name">${r.flag.es} <span>${r.flag.en}</span></div>
            <div class="pt-badge">${r.wrongTries === 0
              ? '<span class="tag ok">¡Perfecto a la primera!</span>'
              : `<span class="tag warn">${r.wrongTries} color${r.wrongTries === 1 ? '' : 'es'} incorrecto${r.wrongTries === 1 ? '' : 's'}</span>`}</div>
          </div>`;
        ptWrap.appendChild(row);
      });
      body.appendChild(ptWrap);
    }

    // ── Clear-all (parent-gated) ──
    const clearBtn = UI.button('Borrar todo el historial', { variant: 'ghost', icon: 'delete_sweep' });
    clearBtn.classList.add('report-clear');
    clearBtn.addEventListener('click', () => {
      UI.parentGate(() => {
        Store.clearAllHistory();
        Audio2.speak('Historial borrado.', 'History cleared.');
        render();
      }, { messageEs: '¿Borrar todo el historial?', messageEn: 'Erase ALL history?' });
    });
    body.appendChild(clearBtn);
  }

  // ── helpers ──
  function sectionTitle(es, en, icon) {
    const h = document.createElement('div');
    h.className = 'report-title';
    h.innerHTML = `<span class="mi">${icon}</span><span><b>${es}</b> <small>${en}</small></span>`;
    return h;
  }
  function empty(es, en) {
    const e = document.createElement('div');
    e.className = 'report-empty glass';
    e.innerHTML = `<span class="mi">inbox</span><span><b>${es}</b><small>${en}</small></span>`;
    return e;
  }
  // Colored thumbnail (reuses the quiz/passport coloring trick)
  function thumb(flag) {
    const { svg } = getFlagSVG(flag);
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
      } else el.setAttribute('fill', hex);
    });
    return tmp.innerHTML;
  }

  return { render };
})();

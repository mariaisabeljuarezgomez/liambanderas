/* ════════════════════════════════════════════════════════════════
   ui.js — Screen manager, transitions, shared chrome, helper widgets.
   ════════════════════════════════════════════════════════════════ */

const UI = (() => {
  const screens = {};          // name → HTMLElement
  let current = null;

  function register(name, el) { screens[name] = el; }

  // Spring-eased screen swap with a whoosh
  function show(name, opts = {}) {
    const next = screens[name];
    if (!next || next === current) return;
    // Hide whichever screen is currently active (could be the bootstrap splash
    // that was marked active in HTML before `current` was ever set).
    const prev = current || document.querySelector('.screen.active');
    if (prev && prev !== next) {
      if (!opts.instant) {
        prev.classList.add('screen-leave');
        setTimeout(() => { prev.classList.remove('active', 'screen-leave'); }, 320);
      } else {
        prev.classList.remove('active');
      }
    }
    next.classList.add('active');
    // re-trigger entrance animation
    next.classList.remove('screen-enter'); void next.offsetWidth; next.classList.add('screen-enter');
    current = next;
    if (!opts.silent) Audio2.whoosh();
    window.scrollTo(0, 0);
  }

  // Build a chunky tactile button
  function button(label, opts = {}) {
    const b = document.createElement('button');
    b.className = 'btn-chunky ' + (opts.variant || 'primary');
    b.innerHTML = opts.icon ? `<span class="mi">${opts.icon}</span><span>${label}</span>` : `<span>${label}</span>`;
    if (opts.id) b.id = opts.id;
    if (opts.onclick) b.addEventListener('click', () => { Audio2.pop(); opts.onclick(); });
    return b;
  }

  // Build a color swatch button for the palette
  function colorSwatch(item, state) {
    const names = COLOR_NAMES[item.key];
    const b = document.createElement('button');
    b.className = 'swatch';
    b.dataset.color = item.key;
    b.innerHTML = `
      <span class="swatch-dot" style="background:${item.hex};"></span>
      <span class="swatch-label">
        <span class="swatch-es">${names.es}</span>
        <span class="swatch-en">${names.en}</span>
      </span>`;
    return b;
  }

  // Top app bar with back + title + speaker + settings
  function topBar({ titleEs, titleEn, onBack, onSpeak, onSettings }) {
    const bar = document.createElement('header');
    bar.className = 'topbar glass';
    if (onBack) {
      const back = document.createElement('button');
      back.className = 'icon-btn';
      back.setAttribute('aria-label', 'Volver / Back');
      back.innerHTML = '<span class="mi">arrow_back</span>';
      back.addEventListener('click', () => { Audio2.pop(); onBack(); });
      bar.appendChild(back);
    } else {
      const spacer = document.createElement('span'); spacer.style.width = '48px'; bar.appendChild(spacer);
    }
    const t = document.createElement('div');
    t.className = 'topbar-title';
    t.innerHTML = `<span class="tb-es">${titleEs || ''}</span><span class="tb-en">${titleEn || ''}</span>`;
    if (onSpeak) t.addEventListener('click', onSpeak);
    bar.appendChild(t);
    const right = document.createElement('div'); right.className = 'topbar-right';
    if (onSpeak) {
      const sp = document.createElement('button');
      sp.className = 'icon-btn speaker';
      sp.setAttribute('aria-label', 'Escuchar / Listen');
      sp.innerHTML = '<span class="mi">volume_up</span>';
      sp.addEventListener('click', onSpeak);
      right.appendChild(sp);
    }
    if (onSettings) {
      const s = document.createElement('button');
      s.className = 'icon-btn'; s.setAttribute('aria-label', 'Ajustes / Settings');
      s.innerHTML = '<span class="mi">settings</span>';
      s.addEventListener('click', () => { Audio2.pop(); onSettings(); });
      right.appendChild(s);
    }
    bar.appendChild(right);
    return bar;
  }

  // Progress dots (one per region) shown in the paint station
  function progressDots(count) {
    const wrap = document.createElement('div');
    wrap.className = 'dots';
    for (let i = 0; i < count; i++) {
      const d = document.createElement('span'); d.className = 'dot';
      wrap.appendChild(d);
    }
    return wrap;
  }

  // Stars display
  function starBadge(n) {
    const s = document.createElement('div');
    s.className = 'star-badge';
    s.innerHTML = `<span class="mi">star</span><span>${n}</span>`;
    return s;
  }

  // ── Reusable parent gate (used before leaving a quiz, resetting, etc.) ──
  // onPass(): called if the adult solves the math question.
  // opts { messageEs, messageEn }: optional prompt text.
  function parentGate(onPass, opts = {}) {
    const a = 3 + Math.floor(Math.random() * 4);
    const b = 2 + Math.floor(Math.random() * 3);
    const overlay = document.createElement('div');
    overlay.className = 'pgate-overlay';
    const correct = a + b;
    const choices = new Set([correct]);
    while (choices.size < 3) choices.add(correct + Math.floor(Math.random() * 5) - 2);
    overlay.innerHTML = `
      <div class="pgate-card glass">
        <div class="pgate-lock"><span class="mi">lock</span></div>
        <h3>${opts.messageEs || 'Padres'}</h3>
        <p>${opts.messageEn || 'Parents'}</p>
        <div class="pgate-q">${a} + ${b} = ?</div>
        <div class="pgate-opts"></div>
        <button class="btn-chunky ghost pgate-cancel">Cancelar / Cancel</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const close = () => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 220);
    };
    [...choices].sort(() => Math.random() - 0.5).forEach(n => {
      const b2 = document.createElement('button');
      b2.className = 'btn-chunky ghost pgate-opt'; b2.textContent = n;
      b2.addEventListener('click', () => {
        if (n === correct) { close(); onPass(); }
        else { b2.classList.add('shake'); Audio2.boing(); }
      });
      overlay.querySelector('.pgate-opts').appendChild(b2);
    });
    overlay.querySelector('.pgate-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  // ── Floating background-music control (draggable around screen) ──
  let musicWidget = null;
  function mountMusicWidget() {
    if (musicWidget) return musicWidget;
    const tracks = Audio2.musicTracks;
    musicWidget = document.createElement('div');
    musicWidget.className = 'music-widget';
    musicWidget.innerHTML = `
      <button class="music-toggle" aria-label="Música / Music"><span class="mi">music_note</span></button>
      <div class="music-panel">
        <div class="music-panel-title"><span class="mi">queue_music</span> Música <small>Music</small></div>
        <div class="music-btns"></div>
        <button class="music-stop btn-chunky ghost"><span class="mi">stop</span><span>Silenciar</span></button>
      </div>`;
    document.body.appendChild(musicWidget);

    // Initial positioning (bottom left)
    const initLeft = 12;
    const initTop = Math.max(10, window.innerHeight - 74);
    musicWidget.style.left = initLeft + 'px';
    musicWidget.style.top = initTop + 'px';

    const toggleBtn = musicWidget.querySelector('.music-toggle');
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = initLeft, initialTop = initTop;
    let moved = false;

    function updatePanelPosition() {
      const rect = musicWidget.getBoundingClientRect();
      const isTop = rect.top < window.innerHeight / 2;
      const isRight = rect.left > window.innerWidth / 2;
      musicWidget.classList.toggle('panel-down', isTop);
      musicWidget.classList.toggle('panel-right', isRight);
    }

    function onPointerDown(e) {
      const touch = e.touches ? e.touches[0] : e;
      isDragging = true;
      moved = false;
      startX = touch.clientX;
      startY = touch.clientY;
      const rect = musicWidget.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      musicWidget.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.hypot(dx, dy) > 6) {
        moved = true;
      }
      if (moved) {
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;
        const maxLeft = window.innerWidth - 60;
        const maxTop = window.innerHeight - 60;
        newLeft = Math.max(8, Math.min(maxLeft, newLeft));
        newTop = Math.max(8, Math.min(maxTop, newTop));
        musicWidget.style.left = newLeft + 'px';
        musicWidget.style.top = newTop + 'px';
        updatePanelPosition();
      }
    }

    function onPointerEnd() {
      if (!isDragging) return;
      isDragging = false;
      musicWidget.style.transition = '';
    }

    toggleBtn.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerEnd);
    window.addEventListener('touchcancel', onPointerEnd);

    toggleBtn.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerEnd);

    const btns = musicWidget.querySelector('.music-btns');
    Object.entries(tracks).forEach(([id, t]) => {
      const b = document.createElement('button');
      b.className = 'music-track';
      b.dataset.id = id;
      b.innerHTML = `<span class="mt-play"><span class="mi">play_arrow</span></span><span class="mt-label">${t.labelEs}</span>`;
      b.addEventListener('click', () => {
        Audio2.unlock();
        const st = Audio2.getMusicState();
        if (st.current === id && st.playing) {
          Audio2.stopMusic();
        } else {
          Audio2.playMusic(id);
        }
        refreshMusicUI();
      });
      btns.appendChild(b);
    });

    musicWidget.querySelector('.music-stop').addEventListener('click', () => {
      Audio2.stopMusic(); refreshMusicUI();
    });

    toggleBtn.addEventListener('click', (e) => {
      if (moved) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
      }
      updatePanelPosition();
      musicWidget.classList.toggle('open');
    });

    function refreshMusicUI() {
      const st = Audio2.getMusicState();
      musicWidget.querySelectorAll('.music-track').forEach(b => {
        const on = st.current === b.dataset.id && st.playing;
        b.classList.toggle('playing', on);
        b.querySelector('.mt-play .mi').textContent = on ? 'pause' : 'play_arrow';
      });
      musicWidget.classList.toggle('some-playing', st.playing);
    }
    return musicWidget;
  }

  return { register, show, button, colorSwatch, topBar, progressDots, starBadge, parentGate, mountMusicWidget };
})();

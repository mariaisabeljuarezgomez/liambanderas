/* ════════════════════════════════════════════════════════════════
   settings.js — Settings overlay (mute speech / mute SFX / reset progress).
   Also a lightweight "parent" gate (math question) before reset.
   ════════════════════════════════════════════════════════════════ */

const Settings = (() => {
  let overlay;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-panel glass">
        <div class="settings-head">
          <h2>Ajustes <span>/ Settings</span></h2>
          <button class="icon-btn close" aria-label="Cerrar"><span class="mi">close</span></button>
        </div>
        <div class="settings-body">
          <label class="setting-row">
            <span class="sr-es"><span class="mi">record_voice_over</span> Voz</span>
            <span class="sr-en">Voice</span>
            <input type="checkbox" id="set-voice" class="toggle">
          </label>
          <label class="setting-row">
            <span class="sr-es"><span class="mi">music_note</span> Sonidos</span>
            <span class="sr-en">Sounds</span>
            <input type="checkbox" id="set-sfx" class="toggle">
          </label>
          <button class="btn-chunky ghost parent-reset">
            <span class="mi">lock</span><span>Reiniciar progreso</span>
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const voiceT = overlay.querySelector('#set-voice');
    const sfxT = overlay.querySelector('#set-sfx');
    // toggles: checked = ON
    voiceT.checked = !Audio2.isSpeechMuted();
    sfxT.checked = !Audio2.isSfxMuted();
    voiceT.addEventListener('change', () => {
      Audio2.setSpeechMuted(!voiceT.checked);
      if (voiceT.checked) Audio2.speak('Voz activada', 'Voice on');
    });
    sfxT.addEventListener('change', () => {
      Audio2.setSfxMuted(!sfxT.checked);
      if (sfxT.checked) Audio2.pop();
    });

    overlay.querySelector('.close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.parent-reset').addEventListener('click', parentGate);
  }

  function parentGate() {
    // simple parent gate — solve a small math problem
    const a = 3 + Math.floor(Math.random() * 4);
    const b = 2 + Math.floor(Math.random() * 3);
    const card = document.createElement('div');
    card.className = 'parent-gate';
    card.innerHTML = `
      <h3>Padres / Parents</h3>
      <p>Para reiniciar, resuelve:<br>To reset, solve:</p>
      <div class="pg-q">${a} + ${b} = ?</div>
      <div class="pg-opts"></div>
      <button class="btn-chunky ghost pg-cancel">Cancelar / Cancel</button>`;
    const opts = card.querySelector('.pg-opts');
    const correct = a + b;
    const choices = new Set([correct]);
    while (choices.size < 3) choices.add(correct + Math.floor(Math.random() * 5) - 2);
    [...choices].sort(() => Math.random() - 0.5).forEach(n => {
      const b2 = document.createElement('button');
      b2.className = 'btn-chunky ghost pg-opt'; b2.textContent = n;
      b2.addEventListener('click', () => {
        if (n === correct) {
          Store.reset();
          card.remove();
          close();
          location.reload();
        } else {
          b2.classList.add('shake');
          Audio2.boing();
        }
      });
      opts.appendChild(b2);
    });
    card.querySelector('.pg-cancel').addEventListener('click', () => card.remove());
    overlay.querySelector('.settings-panel').appendChild(card);
  }

  function open() { if (!overlay) build(); overlay.classList.add('open'); }
  function close() { if (overlay) overlay.classList.remove('open'); }

  return { open, close };
})();

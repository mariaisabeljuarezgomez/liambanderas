/* ════════════════════════════════════════════════════════════════
   audio.js — Bilingual TTS (ES → EN) + fully procedural sound effects.
   No audio files. Everything synthesized with the Web Audio API.
   100% offline. Works on mobile (unlocks on first user gesture).
   ════════════════════════════════════════════════════════════════ */

const Audio2 = (() => {
  let ctx = null;
  let masterGain = null;
  let speechMuted = false;
  let sfxMuted = false;
  let _voices = { es: null, en: null };

  // ── AudioContext must be created/resumed on a user gesture (mobile) ──
  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Load + cache preferred bilingual voices once available ──
  function pickVoices() {
    const voices = ('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return;
    // Prefer native es-MX/es-ES and en-US; fall back to any es/en.
    _voices.es = voices.find(v => /es-MX/i.test(v.lang)) ||
                voices.find(v => /es-ES/i.test(v.lang)) ||
                voices.find(v => /^es/i.test(v.lang)) || _voices.es;
    _voices.en = voices.find(v => /en-US/i.test(v.lang)) ||
                voices.find(v => /^en/i.test(v.lang)) || _voices.en;
  }
  if ('speechSynthesis' in window) {
    pickVoices();
    window.speechSynthesis.onvoiceschanged = pickVoices;
  }

  // ── Core tone helper ──
  function tone(freq, type, dur, vol, when = 0) {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // ── Frequency-sweep tone (for chirps / risers) ──
  function sweep(f1, f2, type, dur, vol, when = 0) {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // ── FILTERED NOISE (for applause / ocean-like effects) ──
  function noiseBurst(dur, vol, filterFreq, when = 0) {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + when;
    const frames = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    // pink-ish noise
    let last = 0;
    for (let i = 0; i < frames; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + (0.02 * white)) / 1.02;
      data[i] = last * 3.5;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.05);
    g.gain.setValueAtTime(vol, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter); filter.connect(g); g.connect(masterGain);
    src.start(t); src.stop(t + dur + 0.05);
  }

  // ════════════════════════════════════════════════════════════
  //  SPEECH — Spanish first, then English (the app's golden rule)
  //  IMPORTANT: every spoken phrase calls duckStart() first and
  //  duckEnd() when the LAST utterance finishes, so the background
  //  music drops to ~20% under the voice and rises back up after.
  // ════════════════════════════════════════════════════════════
  function speakOne(text, lang, voice, rate, pitch) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window) || speechMuted || !text) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }

  // speakBilingual('México','Mexico') → says ES then EN, cancelling prior speech.
  function speakBilingual(es, en) {
    if (speechMuted) return Promise.resolve();
    if (!('speechSynthesis' in window)) return Promise.resolve();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    duckStart();                                   // 🔉 lower the music under the voice
    return new Promise(async resolve => {
      await speakOne(es, 'es-ES', _voices.es, 0.92, 1.12);
      if (en && en !== es) {
        await new Promise(r => setTimeout(r, 160));
        await speakOne(en, 'en-US', _voices.en, 0.92, 1.12);
      }
      duckEnd();                                   // 🔊 raise the music back up
      resolve();
    });
  }

  // Just English (used in a few spots)
  function speakEn(text) {
    if (!('speechSynthesis' in window) || speechMuted) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    duckStart();
    const p = speakOne(text, 'en-US', _voices.en, 0.95, 1.1);
    if (p && p.then) p.then(duckEnd); else setTimeout(duckEnd, 1200);
    return p;
  }

  // ════════════════════════════════════════════════════════════
  //  SOUND EFFECTS (all procedural)
  // ════════════════════════════════════════════════════════════
  function pop() {
    if (sfxMuted) return;
    tone(420, 'triangle', 0.08, 0.18);
  }

  // Soft "boing" for wrong answer — gentle, NOT a scary buzzer
  function boing() {
    if (sfxMuted) return;
    const c = ensureCtx(); if (!c) return;
    sweep(280, 130, 'sine', 0.28, 0.22);
    setTimeout(() => tone(150, 'square', 0.10, 0.06), 70);
  }

  // Sparkle arpeggio — correct paint
  function sparkle() {
    if (sfxMuted) return;
    const notes = [880, 1100, 1320, 1568];
    notes.forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.16, 0.10), i * 55));
  }

  // Triumphant rising fanfare — flag completed
  function fanfare() {
    if (sfxMuted) return;
    const melody = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
    melody.forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.40, 0.12), i * 100));
    // low brass anchor
    [130.81, 196, 261.63].forEach((f, i) => setTimeout(() => tone(f, 'sawtooth', 0.6, 0.06), i * 120));
  }

  // Applause + cheer — procedural crowd (filtered noise + whistles)
  function applause() {
    if (sfxMuted) return;
    const c = ensureCtx(); if (!c) return;
    // main hand-clap noise bed
    noiseBurst(2.6, 0.30, 1800);
    // layered rumble
    noiseBurst(2.6, 0.14, 500);
    // random individual claps
    for (let i = 0; i < 26; i++) {
      const w = Math.random() * 2.2;
      setTimeout(() => noiseBurst(0.06, 0.22, 2400), w * 1000);
    }
    // two crowd whistles
    setTimeout(() => sweep(1700, 2100, 'sine', 0.5, 0.06), 400);
    setTimeout(() => sweep(1500, 1900, 'sine', 0.45, 0.05), 1200);
  }

  // Magical chime cascade — level up
  function levelUp() {
    if (sfxMuted) return;
    // C major sweep up then sparkle hold
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => tone(f, 'sine', 0.5, 0.10), i * 90));
    setTimeout(() => {
      [1318.5, 1568, 1975.5].forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.45, 0.09), i * 70));
    }, 420);
  }

  // "Whoosh" — screen transition
  function whoosh() {
    if (sfxMuted) return;
    sweep(180, 720, 'sine', 0.35, 0.10);
    noiseBurst(0.35, 0.05, 1200);
  }

  // ════════════════════════════════════════════════════════════
  //  BACKGROUND MUSIC — Liam's favorite songs, looped, with DUCKING.
  //  Routed through the Web Audio API (via MediaElementSource) so we
  //  can fade the volume smoothly under spoken voice and back up after.
  // ════════════════════════════════════════════════════════════
  const MUSIC_TRACKS = {
    brainrot:      { url: '../music/brainrot.mp3',      labelEs: 'Brainrot',      labelEn: 'Brainrot' },
    rainingtacos:  { url: '../music/rainingtacos.mp3',  labelEs: 'Raining Tacos', labelEn: 'Raining Tacos' },
  };
  const MUSIC_BASE = 0.42;        // normal background level (gentle, not loud)
  const MUSIC_DUCK = 0.09;        // level while the app is speaking (~20% of base)
  const MUSIC_FADE = 0.45;        // fade seconds

  let musicEl = null;             // the <audio> element
  let musicGain = null;           // GainNode between element and master
  let musicSrcNode = null;        // MediaElementSource (created once per element)
  let useElementVolume = false;   // true under file:// where Web Audio CORS blocks routing
  let currentTrack = null;        // id of the playing track, or null
  let duckDepth = 0;              // 0 = full volume, 1 = fully ducked
  let musicEnabled = true;        // user toggle

  function buildMusicGraph() {
    if (musicEl) return;
    const c = ensureCtx();
    musicEl = new Audio();
    musicEl.loop = true;
    // Web Audio's createMediaElementSource treats file:// media as cross-origin
    // and refuses to route it. Only use the Web Audio path on http(s); under
    // file:// we drive the element's own .volume (ducking still works that way).
    const isHttp = /^https?:/i.test(location.protocol);
    if (c && isHttp) {
      musicEl.crossOrigin = 'anonymous';
      musicGain = c.createGain();
      musicGain.gain.value = MUSIC_BASE;
      try {
        musicSrcNode = c.createMediaElementSource(musicEl);
        musicSrcNode.connect(musicGain); musicGain.connect(masterGain);
      } catch (e) { musicGain = null; useElementVolume = true; musicEl.volume = MUSIC_BASE; }
    } else {
      useElementVolume = true;
      musicEl.volume = MUSIC_BASE;
    }
  }

  function setMusicVolume(level) {
    if (useElementVolume || !musicGain) {
      if (musicEl) {
        // smooth-ish ramp via a few steps (element volume can't use Web Audio ramps)
        const from = musicEl.volume, start = performance.now();
        clearInterval(musicEl._ramp);
        musicEl._ramp = setInterval(() => {
          const t = Math.min(1, (performance.now() - start) / (MUSIC_FADE * 1000));
          musicEl.volume = from + (level - from) * t;
          if (t >= 1) clearInterval(musicEl._ramp);
        }, 40);
      }
      return;
    }
    const c = ensureCtx();
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, c.currentTime);
    musicGain.gain.linearRampToValueAtTime(level, c.currentTime + MUSIC_FADE);
  }

  // Called by the speech engine the instant a phrase starts.
  function duckStart() {
    if (!currentTrack) return;
    duckDepth = 1;
    setMusicVolume(MUSIC_DUCK);
  }
  // Called when the phrase finishes — bring the music back up.
  function duckEnd() {
    if (!currentTrack) return;
    duckDepth = 0;
    setMusicVolume(MUSIC_BASE);
  }

  function playMusic(id) {
    if (!musicEnabled) return;
    const track = MUSIC_TRACKS[id];
    if (!track) return;
    const c = ensureCtx();          // needs a user-gesture context on mobile
    if (c && c.state === 'suspended') c.resume();
    buildMusicGraph();
    if (currentTrack === id && !musicEl.paused) return; // already playing
    musicEl.src = track.url;
    musicEl.currentTime = 0;
    currentTrack = id;
    // start at ducked level if speech is happening, else base
    setMusicVolume(duckDepth ? MUSIC_DUCK : MUSIC_BASE);
    musicEl.play().catch(() => {});   // ignore autoplay rejections silently
  }

  function stopMusic() {
    if (musicEl) { musicEl.pause(); }
    currentTrack = null;
    setMusicVolume(0);
  }

  function setMusicEnabled(v) {
    musicEnabled = v;
    if (!v) stopMusic();
  }
  function getMusicState() {
    return { current: currentTrack, playing: !!(musicEl && !musicEl.paused), enabled: musicEnabled };
  }

  // Mute toggles
  function setSpeechMuted(v) { speechMuted = v; if (v) try { window.speechSynthesis.cancel(); } catch (e) {} }
  function setSfxMuted(v) { sfxMuted = v; }

  // ── OFFLINE ALARMS ──
  let alarmAudioEl = new Audio();
  alarmAudioEl.addEventListener('ended', duckEnd);
  alarmAudioEl.addEventListener('pause', duckEnd);

  function playAlarm(path) {
    if (!path) return;
    alarmAudioEl.src = path;
    alarmAudioEl.play().catch(e => console.warn('Alarm play blocked:', e));
    duckStart();
  }

  function stopAlarm() {
    if (!alarmAudioEl.paused) {
      alarmAudioEl.pause();
      alarmAudioEl.currentTime = 0;
    }
    duckEnd();
  }
  return {
    unlock: ensureCtx,
    speak: speakBilingual,     // (es, en)
    speakEn,
    pop, boing, sparkle, fanfare, applause, levelUp, whoosh,
    setSpeechMuted, setSfxMuted,
    isSpeechMuted: () => speechMuted,
    isSfxMuted: () => sfxMuted,
    // background music + ducking
    playMusic, stopMusic, setMusicEnabled, getMusicState, musicTracks: MUSIC_TRACKS,
    playAlarm, stopAlarm
  };
})();

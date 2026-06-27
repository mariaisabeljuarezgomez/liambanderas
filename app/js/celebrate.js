/* ════════════════════════════════════════════════════════════════
   celebrate.js — Canvas confetti + 3D waving flag + reveal choreography.
   ════════════════════════════════════════════════════════════════ */

const Celebrate = (() => {
  let canvas, cctx, W, H, rafId, particles = [], running = false, startTime = 0;
  const COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#FF9F1C', '#C77DFF', '#FFB5E8', '#FFFFFF'];

  // ── Confetti particle ──
  function makeParticle(x, y, force = 1) {
    return {
      x, y,
      vx: (Math.random() - 0.5) * 9 * force,
      vy: (Math.random() * -8 - 4) * force,
      g: 0.28,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 1,
      decay: 0.006 + Math.random() * 0.004,
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    };
  }

  function spawnBurst(x, y, n = 30, force = 1) {
    for (let i = 0; i < n; i++) particles.push(makeParticle(x, y, force));
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = window.innerWidth; H = window.innerHeight;
  }

  function tick() {
    if (!running) return;
    cctx.clearRect(0, 0, W, H);
    // emitter: rain confetti from top during the first 2.5s
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed < 2.5 && Math.random() < 0.6) {
      particles.push(makeParticle(Math.random() * W, -10, 1));
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
      p.vx *= 0.99; p.life -= p.decay;
      if (p.life <= 0 || p.y > H + 40) { particles.splice(i, 1); continue; }
      cctx.save();
      cctx.globalAlpha = Math.max(0, p.life);
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.fillStyle = p.color;
      if (p.shape === 'rect') cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      else { cctx.beginPath(); cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); cctx.fill(); }
      cctx.restore();
    }
    rafId = requestAnimationFrame(tick);
  }

  // ── Public API ──
  function mount() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9000;';
    document.body.appendChild(canvas);
    cctx = canvas.getContext('2d');
    window.addEventListener('resize', resize);
    resize();
  }

  // Burst from a specific point (e.g., the flag) — used on each correct paint
  function burstAt(x, y, n = 18) {
    mount();
    if (!running) { running = true; startTime = performance.now(); tick(); }
    spawnBurst(x, y, n, 1);
  }

  // Full-screen celebration rain
  function bigCelebration() {
    mount();
    particles = [];
    running = true;
    startTime = performance.now();
    // initial bursts from both bottom corners + center top
    spawnBurst(W * 0.2, H * 0.7, 50, 1.3);
    spawnBurst(W * 0.8, H * 0.7, 50, 1.3);
    spawnBurst(W * 0.5, H * 0.2, 40, 1.1);
    if (!rafId) tick();
    // stop emitting after a while; let remaining fall
    setTimeout(stop, 4500);
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    setTimeout(() => {
      if (cctx) cctx.clearRect(0, 0, W, H);
      particles = [];
    }, 300);
  }

  return { mount, burstAt, bigCelebration, stop };
})();

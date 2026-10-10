(() => {
  'use strict';
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.getElementById('overlay-title').textContent = '暂时无法启动游戏';
    document.getElementById('overlay-description').textContent = '浏览器未提供 Canvas 2D，请试试新版浏览器。';
    document.getElementById('start-button').disabled = true;
    document.getElementById('jump-button').disabled = true;
    return;
  }
  const stage = document.getElementById('game-stage');
  const panel = document.getElementById('game-panel');
  const overlay = document.getElementById('game-overlay');
  const title = document.getElementById('overlay-title');
  const description = document.getElementById('overlay-description');
  const eyebrow = document.getElementById('overlay-eyebrow');
  const hint = document.getElementById('overlay-hint');
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const jumpButton = document.getElementById('jump-button');
  const scoreText = document.getElementById('score');
  const bestText = document.getElementById('best-score');
  const status = document.getElementById('game-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'kiana-moon-run-best-v1';
  const engine = new KianaRunner.Runner();
  let best = 0;
  let storageAvailable = true;
  let raf = 0;
  let previousTime = 0;
  let displayScore = -1;
  let isNewBest = false;
  let particles = [];
  let viewWidth = 960;
  let viewHeight = 340;
  const skyStars = Array.from({ length: 37 }, (_, i) => ({
    x: ((i * 173 + 97) % 1000) / 1000,
    y: ((i * 61 + 29) % 190) / 340,
    size: i % 7 === 0 ? 2 : 1,
    alpha: 0.2 + (i % 5) * 0.12
  }));
  const formatScore = score => String(score).padStart(5, '0');
  function useSessionBest() {
    storageAvailable = false;
    document.getElementById('best-label').textContent = '本次会话';
  }
  try {
    const stored = Number(localStorage.getItem(storageKey));
    if (Number.isSafeInteger(stored) && stored >= 0) best = stored;
    const probe = storageKey + '-probe';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch { useSessionBest(); }
  bestText.textContent = formatScore(best);
  function saveBest() {
    if (engine.score <= best) return;
    best = engine.score;
    isNewBest = true;
    bestText.textContent = formatScore(best);
    if (storageAvailable) {
      try { localStorage.setItem(storageKey, String(best)); }
      catch { useSessionBest(); }
    }
  }
  function scoreUpdate() {
    if (displayScore === engine.score) return;
    displayScore = engine.score;
    scoreText.textContent = formatScore(engine.score);
  }
  function setStateUI() {
    const state = engine.state;
    overlay.hidden = state === 'running';
    pauseButton.disabled = state !== 'running' && state !== 'paused';
    pauseButton.innerHTML = state === 'paused' ? '<span aria-hidden="true">▷</span> 继续' : '<span aria-hidden="true">Ⅱ</span> 暂停';
    pauseButton.setAttribute('aria-label', state === 'paused' ? '继续游戏' : '暂停游戏');
    jumpButton.disabled = state === 'paused' || state === 'over';
    if (state === 'paused') {
      eyebrow.textContent = 'TAKE A LITTLE BREAK';
      title.textContent = '星光会等你回来。';
      description.textContent = '准备好后继续，琪亚娜就在这里等你。';
      startButton.innerHTML = '<span aria-hidden="true">▷</span> 继续漫游';
      hint.textContent = '点击继续 · P / Escape 也可继续';
      status.textContent = '游戏已暂停。点击继续漫游或按 P 继续。';
    } else if (state === 'over') {
      eyebrow.textContent = isNewBest ? 'A NEW LITTLE RECORD' : 'UNTIL OUR NEXT ADVENTURE';
      title.textContent = isNewBest ? '新的纪录，新的星光！' : '休息一下，再出发吧。';
      description.textContent = '本次获得 ' + engine.score + ' 分。每一步，都离星光更近一点。';
      startButton.innerHTML = '<span aria-hidden="true">↻</span> 再跑一次';
      hint.textContent = '点击重开 · 空格 / ↑ 也可重开';
      status.textContent = '漫游结束，本次得分 ' + engine.score + (isNewBest ? '，创下新纪录。' : '。') + '可以再跑一次。';
    } else if (state === 'running') {
      status.textContent = '月面漫游开始。空格或上方向键跳跃，P 暂停。';
    }
  }
  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
    previousTime = 0;
  }
  function launchLoop() {
    stopLoop();
    raf = requestAnimationFrame(frame);
  }
  function begin() {
    if (document.hidden) return;
    if (engine.state === 'paused') engine.resume();
    else if (!engine.start()) return;
    particles = [];
    isNewBest = false;
    setStateUI();
    scoreUpdate();
    canvas.focus({ preventScroll: true });
    launchLoop();
  }
  function pause() {
    if (!engine.pause()) return;
    saveBest();
    stopLoop();
    draw();
    setStateUI();
  }
  function togglePause() {
    if (engine.state === 'running') pause();
    else if (engine.state === 'paused') begin();
  }
  function jump() {
    if (engine.state === 'paused') return;
    if (engine.state === 'ready' || engine.state === 'over') begin();
    if (engine.jump()) draw();
  }
  function sparkle(x, y) {
    if (reducedMotion.matches) return;
    for (let i = 0; i < 7; i++) {
      const angle = i * Math.PI * 2 / 7;
      particles.push({ x, y, vx: Math.cos(angle) * 60, vy: Math.sin(angle) * 60, life: 0.5 });
    }
  }
  function frame(now) {
    if (engine.state !== 'running') { raf = 0; return; }
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
    previousTime = now;
    const events = engine.advance(dt);
    for (const event of events) {
      if (event.type === 'star') sparkle(event.x, event.y);
      if (event.type === 'over') {
        saveBest();
        setStateUI();
      }
    }
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    scoreUpdate();
    draw();
    if (engine.state === 'running') raf = requestAnimationFrame(frame);
    else { raf = 0; previousTime = 0; }
  }
  function diamond(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.42, y - size * 0.35);
    ctx.lineTo(x + size, y); ctx.lineTo(x + size * 0.42, y + size * 0.35);
    ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.42, y + size * 0.35);
    ctx.lineTo(x - size, y); ctx.lineTo(x - size * 0.42, y - size * 0.35);
    ctx.closePath(); ctx.fill();
  }
  function mountains(color, baseline, height, shift) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-50, viewHeight);
    for (let x = -50; x <= viewWidth + 60; x += 6) {
      const y = baseline - height * (0.5 + Math.sin((x + shift) / 153) * 0.25 + Math.sin((x + shift) / 67) * 0.22);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(viewWidth + 60, viewHeight); ctx.closePath(); ctx.fill();
  }
  // Original code-drawn pixel interpretation: white twin braids, blue eyes,
  // white/violet outfit, orange hair accent. No sprite/CDN request is needed.
  function drawKiana(x, y) {
    const moving = engine.state === 'running' && engine.player.grounded;
    const beat = moving ? Math.floor(engine.elapsed * 10) % 2 : 0;
    const bob = moving && !reducedMotion.matches ? beat : 0;
    const airborne = !engine.player.grounded;
    const braidSway = moving && !reducedMotion.matches ? beat : 0;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y) + bob);
    ctx.scale(2, 2);
    const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    const outline = '#797495', shadow = '#c7c8e4', hair = '#f5f5ff', skin = '#ffdccb', violet = '#977bd0', dark = '#4b3a74';
    // Back hair and twin braids.
    rect(5, 4, 19, 12, outline); rect(4, 8, 5, 10, outline); rect(22, 8, 5, 10, outline);
    for (let side = 0; side < 2; side++) {
      const bx = side ? 23 : 3;
      for (let n = 0; n < 5; n++) {
        const offset = (n % 2 ? 1 : 0) + (n > 1 ? braidSway : 0);
        rect(bx + offset, 13 + n * 3, 4, 4, outline);
        rect(bx + offset, 13 + n * 3, 3, 3, n % 2 ? hair : shadow);
        rect(bx + offset, 13 + n * 3, 2, 2, hair);
      }
      rect(bx + 1 + braidSway, 26, 3, 2, violet);
      rect(bx + braidSway, 28, 3, 2, hair);
    }
    // Silhouette of the running arms.
    rect(7, 17, 4, 7, dark); rect(20, 16 + beat, 4, 7, dark);
    rect(6, 17, 3, 5, hair); rect(22, 16 + beat, 3, 5, hair);
    rect(5, 21, 3, 3, skin); rect(23, 20 + beat, 3, 3, skin);
    // Boots alternate while running, tuck during a jump.
    const leftLeg = airborne ? 28 : 28 + beat;
    const rightLeg = airborne ? 27 : 29 - beat;
    rect(10, 25, 4, 5, shadow); rect(17, 25, 4, 5, shadow);
    rect(9, leftLeg, 5, 3, dark); rect(17, rightLeg, 5, 3, dark);
    rect(8, leftLeg + 2, 6, 1, violet); rect(17, rightLeg + 2, 6, 1, violet);
    // White battle dress, violet trim, blue pendant and orange waist detail.
    rect(10, 16, 11, 10, dark); rect(11, 16, 9, 8, hair);
    rect(10, 21, 11, 3, violet); rect(9, 24, 13, 3, shadow);
    rect(10, 24, 11, 2, hair); rect(14, 17, 2, 3, '#7bb4f4');
    rect(11, 21, 3, 1, '#f4bd8d'); rect(18, 22, 2, 2, '#7357a3');
    // Face, bangs, hair clips and the iconic little tuft.
    rect(9, 6, 13, 9, skin); rect(9, 5, 13, 4, hair);
    rect(7, 4, 4, 8, hair); rect(21, 4, 4, 8, hair);
    rect(9, 2, 13, 4, hair); rect(12, 1, 5, 2, hair);
    rect(14, 0, 2, 2, shadow); rect(16, 0, 3, 1, hair);
    rect(10, 7, 3, 3, hair); rect(15, 6, 2, 3, hair); rect(19, 7, 3, 2, hair);
    rect(10, 10, 3, 3, '#5796df'); rect(18, 10, 3, 3, '#5796df');
    rect(11, 10, 1, 1, '#fff'); rect(19, 10, 1, 1, '#fff');
    rect(9, 13, 2, 1, '#eeaaa9'); rect(20, 13, 2, 1, '#eeaaa9');
    rect(15, 14, 2, 1, '#cd8889'); rect(12, 15, 7, 1, shadow);
    rect(7, 6, 2, 4, '#8793e5'); rect(22, 5, 3, 2, '#efb877');
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, viewWidth, viewHeight);
    const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
    gradient.addColorStop(0, '#27243d'); gradient.addColorStop(1, '#39304e');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, viewWidth, viewHeight);
    const drift = reducedMotion.matches ? 0 : engine.distance * 0.025;
    for (const star of skyStars) {
      const sx = ((star.x * viewWidth - drift) % viewWidth + viewWidth) % viewWidth;
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#e7d8ff';
      ctx.fillRect(Math.round(sx), Math.round(star.y * viewHeight), star.size, star.size);
    }
    ctx.globalAlpha = 1;
    const moonX = viewWidth * 0.83, moonY = viewHeight * 0.26;
    ctx.fillStyle = '#d8c5f208'; ctx.beginPath(); ctx.arc(moonX, moonY, 55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8c5f211'; ctx.beginPath(); ctx.arc(moonX, moonY, 44, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8c5eb'; ctx.beginPath(); ctx.arc(moonX, moonY, 31, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b7a2d32f';
    for (const [x, y, r] of [[-9, -10, 7], [11, 8, 9], [-9, 17, 4]]) { ctx.beginPath(); ctx.arc(moonX + x, moonY + y, r, 0, Math.PI * 2); ctx.fill(); }
    diamond(viewWidth * 0.64, viewHeight * 0.17, 4, '#b6a1d5');
    const scroll = reducedMotion.matches ? 0 : engine.distance;
    mountains('#413652', engine.ground - 20, 55, scroll * 0.11);
    mountains('#4d3d60', engine.ground + 10, 40, scroll * 0.22 + 178);
    ctx.fillStyle = '#7c6393'; ctx.fillRect(0, engine.ground, viewWidth, 2);
    ctx.fillStyle = '#342c43'; ctx.fillRect(0, engine.ground + 2, viewWidth, viewHeight - engine.ground);
    ctx.fillStyle = '#6b547f';
    for (let i = 0; i < 22; i++) {
      const x = ((i * 79 - scroll) % (viewWidth + 79) + viewWidth + 79) % (viewWidth + 79);
      ctx.fillRect(Math.round(x), engine.ground + 12 + (i % 3) * 9, i % 2 ? 7 : 3, 2);
    }
    if (engine.state === 'ready') {
      // A pair of distant crystals gives the idle scene a little depth.
      drawCrystal({ x: viewWidth * 0.67, y: engine.ground - 31, width: 24, height: 31 }, 0.45);
      drawCrystal({ x: viewWidth * 0.93, y: engine.ground - 42, width: 31, height: 42 }, 0.45);
    }
    for (const obstacle of engine.obstacles) drawCrystal(obstacle);
    for (const star of engine.stars) {
      diamond(star.x + 9, star.y + 9, 11, '#e9c88b19');
      diamond(star.x + 9, star.y + 9, 8, '#f7d59f');
      ctx.fillStyle = '#fff3d6'; ctx.fillRect(star.x + 8, star.y + 5, 2, 4);
    }
    ctx.fillStyle = '#16131e40'; ctx.beginPath();
    ctx.ellipse(engine.player.x + 29, engine.ground + 3, 24, 4, 0, 0, Math.PI * 2); ctx.fill();
    drawKiana(engine.player.x, engine.player.y);
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = '#f7dba4'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
    }
    ctx.globalAlpha = 1;
  }
  function drawCrystal(crystal, alpha = 1) {
    const { x, y, width: w, height: h } = crystal;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#aa87d1'; ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x + 3, y + h * 0.36);
    ctx.lineTo(x + w * 0.43, y); ctx.lineTo(x + w * 0.82, y + h * 0.31);
    ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d2b5f0'; ctx.beginPath();
    ctx.moveTo(x + 3, y + h * 0.36); ctx.lineTo(x + w * 0.43, y);
    ctx.lineTo(x + w * 0.45, y + h * 0.57); ctx.lineTo(x + 4, y + h - 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#775294'; ctx.beginPath();
    ctx.moveTo(x + w * 0.45, y + h * 0.57); ctx.lineTo(x + w * 0.82, y + h * 0.31);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x + w * 0.42, y + h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.round(rect.width), height = Math.round(rect.height);
    if (!width || !height) return;
    if (engine.state === 'running') pause();
    viewWidth = width; viewHeight = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Keep square pixels on phones; the core scales speed to preserve reaction time.
    const worldWidth = Math.max(280, width);
    ctx.setTransform(dpr * width / worldWidth, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    engine.resize(worldWidth, height);
    const cssWidth = viewWidth;
    viewWidth = worldWidth;
    draw();
    // Keep scene dimensions in world units. resize() compares CSS dimensions.
    lastCSSWidth = cssWidth;
    lastCSSHeight = height;
  }
  let lastCSSWidth = 0, lastCSSHeight = 0;
  function resizeIfNeeded() {
    const rect = stage.getBoundingClientRect();
    if (Math.round(rect.width) !== lastCSSWidth || Math.round(rect.height) !== lastCSSHeight) resize();
  }
  startButton.addEventListener('click', begin);
  pauseButton.addEventListener('click', togglePause);
  jumpButton.addEventListener('click', () => { canvas.focus({ preventScroll: true }); jump(); });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    jump();
  });
  panel.addEventListener('keydown', event => {
    const interactive = event.target.closest('button, a, input, select, textarea');
    if (interactive || event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'w', 'p', 'escape'].includes(key)) event.preventDefault();
    if (event.repeat) return;
    if ([' ', 'arrowup', 'w'].includes(key)) jump();
    if (key === 'p' || key === 'escape') togglePause();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', saveBest);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: 0 }).observe(stage);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resizeIfNeeded).observe(stage);
  else window.addEventListener('resize', resizeIfNeeded);
  reducedMotion.addEventListener('change', () => draw());
  resizeIfNeeded();
  scoreUpdate();
})();

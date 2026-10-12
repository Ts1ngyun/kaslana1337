(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const intro = document.getElementById('intro');
  const main = document.getElementById('main');
  const header = document.getElementById('site-header');
  const footer = document.querySelector('.site-footer');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const motionButton = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reduced.matches;
  try { if (localStorage.getItem('kiana-motion') === 'off') motion = false; } catch (_) {}
  let introActive = false;
  let introTimers = [];
  let returnFocus = null;
  let leavingTimer = 0;

  function clearIntroTimers() {
    introTimers.forEach(clearTimeout);
    introTimers = [];
    clearTimeout(window.kianaIntroSafety);
    clearTimeout(leavingTimer);
  }
  function setBlocked(blocked) {
    [main, header, footer].forEach(element => { element.inert = blocked; });
  }
  function finishIntro(animate = false) {
    if (!introActive && !root.classList.contains('intro-boot')) return;
    clearIntroTimers();
    introActive = false;
    if (animate && motion) intro.classList.add('is-leaving');
    root.classList.remove('intro-boot');
    setBlocked(false);
    intro.setAttribute('aria-hidden', 'true');
    if (motion) {
      body.classList.remove('just-arrived');
      void body.offsetWidth;
      body.classList.add('just-arrived');
    }
    try { sessionStorage.setItem('kiana-v3-arrived', '1'); } catch (_) {}
    if (returnFocus) returnFocus.focus({ preventScroll: true });
    else if (document.activeElement === skip) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
    leavingTimer = setTimeout(() => {
      intro.classList.remove('is-leaving');
      body.classList.remove('just-arrived');
    }, 1800);
  }
  function startIntro(manual = false) {
    clearIntroTimers();
    if (!motion) {
      root.classList.remove('intro-boot');
      intro.setAttribute('aria-hidden', 'true');
      setBlocked(false);
      return;
    }
    // Starting the opening always returns to the same arrival point.
    if (manual) window.scrollTo({ top: 0, behavior: 'instant' });
    returnFocus = manual ? replay : null;
    introActive = true;
    intro.classList.remove('is-leaving');
    intro.dataset.phase = 'logo';
    intro.setAttribute('aria-hidden', 'false');
    root.classList.remove('intro-boot');
    void intro.offsetWidth;
    root.classList.add('intro-boot');
    setBlocked(true);
    skip.focus({ preventScroll: true });
    introTimers.push(setTimeout(() => { intro.dataset.phase = 'travel'; }, 2050));
    introTimers.push(setTimeout(() => { intro.dataset.phase = 'arrival'; }, 5000));
    introTimers.push(setTimeout(() => finishIntro(true), 6400));
    // Always release the page even if an animation or image fails.
    window.kianaIntroSafety = setTimeout(() => finishIntro(false), 9000);
  }
  skip.addEventListener('click', () => finishIntro(false));
  replay.addEventListener('click', () => {
    if (!motion) setMotion(true);
    startIntro(true);
  });
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); finishIntro(false); }
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && introActive) finishIntro(false);
  });

  function syncMotionLabel() {
    body.classList.toggle('motion-off', !motion);
    motionButton.textContent = motion ? '动效 ON' : '动效 OFF';
    motionButton.setAttribute('aria-pressed', String(motion));
  }
  function setMotion(enabled) {
    motion = enabled;
    syncMotionLabel();
    if (!motion) finishIntro(false);
    try { localStorage.setItem('kiana-motion', motion ? 'on' : 'off'); } catch (_) {}
    updateStarLoop();
  }
  motionButton.addEventListener('click', () => setMotion(!motion));
  reduced.addEventListener('change', event => setMotion(!event.matches));
  syncMotionLabel();
  if (root.classList.contains('intro-boot') && motion) startIntro();
  else {
    clearTimeout(window.kianaIntroSafety);
    root.classList.remove('intro-boot');
    intro.setAttribute('aria-hidden', 'true');
  }

  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px 20px 0px' });
    root.classList.add('reveal-enabled');
    reveals.forEach(element => observer.observe(element));
  }

  const audio = document.getElementById('music-audio');
  const showPlayback = () => body.classList.toggle('music-is-playing', !audio.paused && !audio.ended);
  ['playing', 'pause', 'ended', 'error', 'waiting'].forEach(name => audio.addEventListener(name, () => {
    if (name === 'waiting') body.classList.remove('music-is-playing');
    else showPlayback();
  }));

  const hero = document.getElementById('welcome');
  const art = document.getElementById('hero-art');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  hero.addEventListener('pointermove', event => {
    if (!motion || !finePointer.matches) return;
    const rect = hero.getBoundingClientRect();
    art.style.setProperty('--parallax-x', ((event.clientX / rect.width - .5) * 13).toFixed(1) + 'px');
    art.style.setProperty('--parallax-y', (((event.clientY - rect.top) / rect.height - .5) * 9).toFixed(1) + 'px');
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    art.style.setProperty('--parallax-x', '0px');
    art.style.setProperty('--parallax-y', '0px');
  });

  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let raf = 0, width = 0, height = 0, last = 0, visible = true;
  const stars = Array.from({ length: 76 }, (_, index) => ({
    x: ((index * 73.37 + 15) % 100) / 100,
    y: ((index * 31.91 + 7) % 100) / 100,
    r: index % 9 === 0 ? 1.35 : .6,
    phase: index * 1.13,
    alpha: .22 + (index % 5) * .1
  }));
  function drawStars(time = 0) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      const pulse = motion ? Math.sin(time * .0005 + star.phase) * .2 + .8 : 1;
      ctx.fillStyle = 'rgba(221,209,251,' + (star.alpha * pulse) + ')';
      const x = star.x * width, y = star.y * height;
      ctx.beginPath(); ctx.arc(x, y, star.r, 0, Math.PI * 2); ctx.fill();
      if (star.r > 1) {
        ctx.strokeStyle = 'rgba(203,185,239,' + star.alpha * pulse * .28 + ')';
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
      }
    });
  }
  function starFrame(time) {
    if (time - last > 45) { drawStars(time); last = time; }
    raf = requestAnimationFrame(starFrame);
  }
  function updateStarLoop() {
    if (!ctx) return;
    cancelAnimationFrame(raf);
    raf = 0;
    drawStars();
    if (motion && visible && !document.hidden) raf = requestAnimationFrame(starFrame);
  }
  function resizeStars() {
    if (!ctx) return;
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawStars();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resizeStars).observe(hero);
  else window.addEventListener('resize', resizeStars, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateStarLoop(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', updateStarLoop);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); if (introActive) finishIntro(false); clearIntroTimers(); });
  window.addEventListener('pageshow', () => { if (!introActive) setBlocked(false); updateStarLoop(); });
  resizeStars();
  updateStarLoop();
})();

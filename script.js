/* AL JYNOM — Antigravity JS */

/* ── Apply favicon from --img-favicon CSS variable (defined in :root in styles.css) ── */
(function () {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--img-favicon').trim();
  // Parse url('path') or url("path") or url(path)
  const m = raw.match(/url\(["']?([^"')]+)["']?\)/);
  if (m && m[1]) {
    const link = document.createElement('link');
    link.rel  = 'icon';
    link.type = m[1].endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    link.href = m[1];
    document.head.appendChild(link);
  }
}());

/* ── Helpers ── */
function closeMobileNav() {
  const nav    = document.querySelector('.main-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav || !toggle) return;
  nav.classList.remove('open');
  const spans = toggle.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

/* ── Smooth scroll + close nav on link click ── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileNav();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Mobile nav toggle (hamburger → X) ── */
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    const spans  = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
}

/* ── Header shadow on scroll ── */
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 16px rgba(0,0,0,0.1)'
      : '0 1px 6px rgba(0,0,0,0.06)';
  }, { passive: true });
}

/* ── Scroll reveal (IntersectionObserver) ── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings inside same parent
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
      );
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Math.min(idx * 90, 450));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach((el) => io.observe(el));
}

/* ── Hero: cursor reveal + auto-looping random reveal spots ── */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(pointer: coarse)').matches) return;

  const parallaxBg = hero.querySelector('.hero-parallax-bg');
  const revealImg  = hero.querySelector('.hero-reveal-img');
  const revealWrap = hero.querySelector('.hero-reveal-wrap');
  const ring       = hero.querySelector('.hero-cursor-ring');

  let heroW = hero.offsetWidth  || 1440;
  let heroH = hero.offsetHeight || 900;
  window.addEventListener('resize', () => { heroW = hero.offsetWidth; heroH = hero.offsetHeight; }, { passive: true });

  // ─ Cursor state
  let curX = -999, curY = -999, tgtX = -999, tgtY = -999;
  let prevTgtX = -999, prevTgtY = -999;
  let vx = 0, vy = 0, tgtVx = 0, tgtVy = 0;
  let imgX = 0, imgY = 0, tgtImgX = 0, tgtImgY = 0;
  let breathe = 0, inside = false;

  // ─ Auto-reveal spots: each one fades in, holds, fades out
  //   phase: 0 = growing | 1 = holding | 2 = shrinking
  const spots = [];
  const MAX_SPOTS = 3;
  let heroVisible = true;
  let raf = null;

  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function makeSpot() {
    // Weighted towards center using polar distribution
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.pow(Math.random(), 0.65) * 0.42;
    return {
      x: heroW / 2 + Math.cos(angle) * heroW * dist,
      y: heroH / 2 + Math.sin(angle) * heroH * dist,
      // Random ellipse shape — uneven rx/ry gives a contour feel
      rx: 70  + Math.random() * 90,
      ry: 55  + Math.random() * 80,
      alpha:  0,
      phase:  0,
      holdFrames: 55 + Math.floor(Math.random() * 75),
      heldFor: 0,
    };
  }

  // Spawn a new spot on a random interval (independent of RAF)
  function scheduleSpawn() {
    const delay = 1100 + Math.random() * 2200;
    setTimeout(() => {
      if (heroVisible && spots.length < MAX_SPOTS) {
        spots.push(makeSpot());
        startRaf();
      }
      scheduleSpawn(); // queue next
    }, delay);
  }
  scheduleSpawn(); // kick off the spawn loop

  function tick() {
    // ── Auto spots lifecycle
    for (let i = spots.length - 1; i >= 0; i--) {
      const s = spots[i];
      if (s.phase === 0) {
        s.alpha = lerp(s.alpha, 1, 0.038);
        if (s.alpha > 0.97) { s.alpha = 1; s.phase = 1; }
      } else if (s.phase === 1) {
        s.heldFor++;
        if (s.heldFor >= s.holdFrames) s.phase = 2;
      } else {
        s.alpha = lerp(s.alpha, 0, 0.05);
        if (s.alpha < 0.015) spots.splice(i, 1);
      }
    }

    // ── Cursor
    curX = lerp(curX, tgtX, 0.12);
    curY = lerp(curY, tgtY, 0.12);
    vx   = lerp(vx,   tgtVx, 0.18);  vy   = lerp(vy,   tgtVy, 0.18);
    tgtVx = lerp(tgtVx, 0, 0.10);    tgtVy = lerp(tgtVy, 0, 0.10);
    const speed = Math.sqrt(vx * vx + vy * vy);
    breathe += 0.022;
    const b   = Math.sin(breathe) * 9;
    const BASE = 120;
    const nvx  = speed > 0.5 ? Math.abs(vx) / speed : 0.5;
    const nvy  = speed > 0.5 ? Math.abs(vy) / speed : 0.5;
    const st   = clamp(speed * 1.6, 0, 140);
    const rx   = Math.round(BASE + st * nvx + b);
    const ry   = Math.round(BASE + st * nvy + b * 0.7);

    // ── Build mask: cursor spot + auto spots combined
    const parts = [];

    // Cursor (only when inside hero)
    if (inside) {
      parts.push(
        `radial-gradient(ellipse ${rx}px ${ry}px at ${Math.round(curX)}px ${Math.round(curY)}px,`
        + `#000 0%,#000 56%,rgba(0,0,0,0.28) 76%,transparent 100%)`
      );
    }

    // Auto spots — softer, semi-transparent for an ethereal ghost-reveal feel
    for (const s of spots) {
      if (s.alpha < 0.01) continue;
      const srx = Math.round(s.rx * s.alpha);
      const sry = Math.round(s.ry * s.alpha);
      const a1  = (0.88 * s.alpha).toFixed(2);
      const a2  = (0.45 * s.alpha).toFixed(2);
      parts.push(
        `radial-gradient(ellipse ${srx}px ${sry}px at ${Math.round(s.x)}px ${Math.round(s.y)}px,`
        + `rgba(0,0,0,${a1}) 0%,rgba(0,0,0,${a2}) 52%,transparent 86%)`
      );
    }

    revealWrap.style.maskImage       = parts.length ? parts.join(',') : 'none';
    revealWrap.style.webkitMaskImage = parts.length ? parts.join(',') : 'none';

    // ── Cursor ring
    ring.style.left = curX + 'px';
    ring.style.top  = curY + 'px';

    // ── Parallax
    imgX = lerp(imgX, tgtImgX, 0.055);
    imgY = lerp(imgY, tgtImgY, 0.055);
    const tf = `translate(${imgX.toFixed(1)}px,${imgY.toFixed(1)}px)`;
    if (parallaxBg) parallaxBg.style.transform = tf;
    if (revealImg)  revealImg.style.transform  = tf;

    // ── Keep RAF alive only while there's work to do
    const busy = inside || spots.length > 0 ||
                 Math.abs(curX - tgtX) > 0.5 ||
                 Math.abs(imgX - tgtImgX) > 0.1 ||
                 speed > 0.2;
    raf = busy ? requestAnimationFrame(tick) : null;
  }

  const startRaf = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // Pause RAF when hero scrolls off-screen
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) startRaf();
    else if (raf)   { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0.05 }).observe(hero);

  // Cursor events
  hero.addEventListener('mouseenter', (e) => {
    inside = true;
    const rect = hero.getBoundingClientRect();
    prevTgtX = e.clientX - rect.left;
    prevTgtY = e.clientY - rect.top;
    ring.style.opacity = '1';
    startRaf();
  });
  hero.addEventListener('mouseleave', () => {
    inside = false;
    ring.style.opacity = '0';
    tgtX = -999; tgtY = -999; tgtImgX = 0; tgtImgY = 0;
    startRaf();
  });
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    tgtVx = x - prevTgtX; tgtVy = y - prevTgtY;
    prevTgtX = x; prevTgtY = y;
    tgtX = x; tgtY = y;
    tgtImgX = ((x - rect.width  / 2) / (rect.width  / 2)) * -18;
    tgtImgY = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    startRaf();
  });
  hero.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '70px'; ring.style.height = '70px';
      ring.style.borderColor = 'rgba(255,255,255,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = ''; ring.style.height = ''; ring.style.borderColor = '';
    });
  });
}());

/* ── Services grid: smooth momentum drag ── */
(function () {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  let down = false;
  let startX = 0, startScroll = 0;
  let velX = 0, prevX = 0, prevT = 0;
  let raf  = null;

  // Inertia loop — velocity decays by friction each frame
  function glide() {
    velX *= 0.92;                    // 0.92 = friction (lower = stops sooner)
    if (Math.abs(velX) < 0.4) { velX = 0; return; }
    grid.scrollLeft -= velX;
    raf = requestAnimationFrame(glide);
  }

  function stopGlide() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  grid.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    stopGlide();
    down        = true;
    startX      = e.clientX;
    startScroll = grid.scrollLeft;
    prevX       = e.clientX;
    prevT       = performance.now();
    velX        = 0;
    grid.classList.add('is-dragging');
    e.preventDefault();
  }, { passive: false });

  // Listen on window so drag continues even if cursor leaves the grid
  window.addEventListener('mousemove', (e) => {
    if (!down) return;
    grid.scrollLeft = startScroll - (e.clientX - startX);

    // Track velocity using exponential moving average
    const now = performance.now();
    const dt  = now - prevT;
    if (dt > 0 && dt < 80) {
      const raw = (e.clientX - prevX) / dt * 16; // normalise to ~60fps
      velX = velX * 0.65 + raw * 0.35;            // smooth via EMA
    }
    prevX = e.clientX;
    prevT = now;
  });

  window.addEventListener('mouseup', () => {
    if (!down) return;
    down = false;
    grid.classList.remove('is-dragging');
    // Launch glide only if there’s meaningful velocity
    if (Math.abs(velX) > 0.5) raf = requestAnimationFrame(glide);
  });
}());

/* ── Quote form validation ── */
const quoteForm   = document.getElementById('quote-form');
const formMessage = quoteForm ? quoteForm.querySelector('.form-message') : null;

if (quoteForm && formMessage) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data     = new FormData(quoteForm);
    const required = ['name', 'phone', 'email', 'service', 'details'];
    const missing  = required.filter((f) => !(data.get(f) || '').toString().trim());

    formMessage.className = 'form-message';

    if (missing.length) {
      formMessage.textContent = 'Please fill in all required fields before submitting.';
      formMessage.classList.add('error');
    } else {
      formMessage.textContent = 'Thank you! Our team will contact you shortly to discuss your project.';
      formMessage.classList.add('success');
      quoteForm.reset();
    }
  });
}

/**
 * lang-selector.js — Rajyaniti Multilingual Entry
 * ─────────────────────────────────────────────────
 * Apne index.html mein sirf yeh 2 lines add karo:
 *
 *   1. <head> mein (Google Fonts ke baad):
 *      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap" rel="stylesheet">
 *
 *   2. </body> se pehle (transitions.js ke BAAD):
 *      <script src="lang-selector.js"></script>
 *
 * Bas — kuch aur nahi todna.
 * ─────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── CONFIG ──────────────────────────────────────────────────── */
  const STORAGE_KEY   = 'rajyaniti-lang';
  const PRELOADER_ID  = 'preloader';          // existing preloader id
  const PRELOADER_MS  = 2600;                 // existing preloader kitne ms mein hide hota hai
  const OVERLAY_ID    = 'rj-lang-overlay';

  /* Koi returning visitor ho toh seedha skip karo */
  const saved = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  })();
  if (saved) {
    applyLang(saved, false);
    return; // overlay nahi dikhana
  }

  /* ── CSS INJECT ───────────────────────────────────────────────── */
  const css = `
  /* ── overlay ── */
  #rj-lang-overlay {
    position: fixed;
    inset: 0;
    z-index: 99998; /* preloader(99999) ke theek neeche, phir apne aap upar aa jayega */
    background: #0D0906;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    opacity: 0;
    visibility: hidden;
    transition: opacity .55s ease, visibility .55s ease;
    overflow: hidden;
  }
  #rj-lang-overlay.rj-show {
    opacity: 1;
    visibility: visible;
    z-index: 99998;
  }
  #rj-lang-overlay.rj-exit {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  /* particle canvas */
  #rj-canvas {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  /* header text */
  .rj-header {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: 40px;
    opacity: 0;
    transform: translateY(-14px);
    transition: opacity .5s ease .1s, transform .5s ease .1s;
  }
  #rj-lang-overlay.rj-show .rj-header { opacity: 1; transform: translateY(0); }

  .rj-header-logo {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 700;
    color: transparent;
    background: linear-gradient(135deg, #E8B84B 0%, #C8922A 55%, #E8600A 100%);
    -webkit-background-clip: text;
    background-clip: text;
    letter-spacing: .02em;
    margin-bottom: 6px;
  }
  .rj-header-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(10px, 1.6vw, 12px);
    color: #7A6E5A;
    letter-spacing: .28em;
    text-transform: uppercase;
  }

  /* divider */
  .rj-divider {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
    opacity: 0;
    transition: opacity .5s ease .2s;
  }
  #rj-lang-overlay.rj-show .rj-divider { opacity: 1; }
  .rj-divider::before, .rj-divider::after {
    content: '';
    flex: 1;
    max-width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,146,42,.4));
  }
  .rj-divider::after { background: linear-gradient(270deg, transparent, rgba(200,146,42,.4)); }
  .rj-divider span {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: #7A6E5A;
    white-space: nowrap;
  }

  /* cards row */
  .rj-cards {
    position: relative;
    z-index: 1;
    display: flex;
    gap: clamp(14px, 2.5vw, 24px);
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* single card */
  .rj-card {
    position: relative;
    width: clamp(180px, 24vw, 260px);
    background: #1A1208;
    border: 1px solid rgba(200,146,42,.2);
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(28px, 4vw, 40px) clamp(18px, 2.5vw, 28px);
    cursor: pointer;
    overflow: hidden;
    opacity: 0;
    transform: translateY(36px) scale(.95);
    transition:
      opacity .5s ease,
      transform .5s cubic-bezier(.34,1.18,.64,1),
      border-color .3s ease,
      box-shadow .3s ease;
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
  .rj-card:focus-visible { outline: 2px solid #C8922A; outline-offset: 3px; }

  /* stagger */
  .rj-card:nth-child(1) { transition-delay: 0s; }
  .rj-card:nth-child(2) { transition-delay: .1s; }
  .rj-card:nth-child(3) { transition-delay: .2s; }

  #rj-lang-overlay.rj-show .rj-card {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .rj-card:hover {
    border-color: rgba(200,146,42,.7);
    box-shadow:
      0 0 36px rgba(200,146,42,.12),
      0 0 72px rgba(200,146,42,.05),
      inset 0 0 32px rgba(200,146,42,.04);
    transform: translateY(-6px) scale(1.02) !important;
  }
  .rj-card:active { transform: translateY(-2px) scale(.99) !important; }

  /* rangoli corners */
  .rj-card::before, .rj-card::after {
    content: '';
    position: absolute;
    width: 32px; height: 32px;
    border-color: rgba(200,146,42,.25);
    border-style: solid;
    transition: border-color .3s ease;
    border-radius: 2px;
  }
  .rj-card::before { top: 10px; left: 10px; border-width: 1px 0 0 1px; }
  .rj-card::after  { bottom: 10px; right: 10px; border-width: 0 1px 1px 0; }
  .rj-card:hover::before, .rj-card:hover::after { border-color: rgba(200,146,42,.7); }

  /* shimmer border */
  .rj-card-shimmer {
    position: absolute;
    inset: -1px;
    border-radius: 14px;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      transparent 60%,
      rgba(200,146,42,.55) 75%,
      rgba(232,96,26,.45) 85%,
      transparent 95%
    );
    opacity: 0;
    transition: opacity .3s ease;
    animation: rjShimmerSpin 2.8s linear infinite paused;
    z-index: 0;
  }
  .rj-card-shimmer-mask {
    position: absolute;
    inset: 1px;
    border-radius: 13px;
    background: #1A1208;
    z-index: 1;
  }
  @keyframes rjShimmerSpin {
    to { transform: rotate(360deg); }
  }
  .rj-card:hover .rj-card-shimmer {
    opacity: 1;
    animation-play-state: running;
  }

  /* card inner content */
  .rj-card-inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .rj-symbol {
    font-size: clamp(34px, 4.5vw, 48px);
    line-height: 1;
    margin-bottom: 18px;
    filter: drop-shadow(0 0 10px rgba(200,146,42,.35));
    transition: transform .3s ease, filter .3s ease;
  }
  .rj-card:hover .rj-symbol {
    transform: scale(1.15) translateY(-3px);
    filter: drop-shadow(0 0 18px rgba(200,146,42,.65));
  }

  .rj-greeting {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 8px;
    text-align: center;
    color: #FAF6EE;
    transition: color .3s ease;
  }
  .rj-card:hover .rj-greeting { color: #E8B84B; }
  .rj-card-hi .rj-greeting { font-family: 'Noto Sans Devanagari', sans-serif; }
  .rj-card-ta .rj-greeting { font-family: 'Noto Sans Tamil', sans-serif; }
  .rj-card-en .rj-greeting { font-family: 'Playfair Display', serif; }

  .rj-subtext {
    font-size: clamp(11px, 1.5vw, 13px);
    color: #7A6E5A;
    letter-spacing: .1em;
    margin-bottom: 20px;
    text-align: center;
    transition: color .3s ease;
  }
  .rj-card-hi .rj-subtext { font-family: 'Noto Sans Devanagari', sans-serif; letter-spacing: .04em; }
  .rj-card-ta .rj-subtext { font-family: 'Noto Sans Tamil', sans-serif; letter-spacing: .04em; }
  .rj-card:hover .rj-subtext { color: rgba(200,146,42,.8); }

  .rj-hr {
    width: 36px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,146,42,.6), transparent);
    margin-bottom: 16px;
    transition: width .3s ease;
  }
  .rj-card:hover .rj-hr { width: 64px; }

  .rj-lang-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: .28em;
    text-transform: uppercase;
    color: rgba(122,110,90,.55);
    transition: color .3s ease, letter-spacing .3s ease;
  }
  .rj-card:hover .rj-lang-label { color: rgba(200,146,42,.8); letter-spacing: .35em; }

  /* arrow badge */
  .rj-arrow {
    position: absolute;
    bottom: 14px; right: 18px;
    z-index: 2;
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1px solid rgba(200,146,42,.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #C8922A;
    font-family: sans-serif;
    opacity: 0; transform: translateX(-5px);
    transition: opacity .3s ease, transform .3s ease;
  }
  .rj-card:hover .rj-arrow { opacity: 1; transform: translateX(0); }

  /* flash transition */
  #rj-flash {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: #1A1208;
    opacity: 0;
    pointer-events: none;
    transition: opacity .32s ease;
  }
  #rj-flash.rj-on { opacity: 1; pointer-events: all; }

  /* mobile */
  @media (max-width: 680px) {
    .rj-cards { flex-direction: column; align-items: center; gap: 14px; }
    .rj-card { width: min(86vw, 300px); }
    .rj-symbol { font-size: 32px; }
    .rj-greeting { font-size: 30px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rj-card, #rj-lang-overlay, #rj-flash { transition-duration: .15s !important; }
    @keyframes rjShimmerSpin { to {} }
  }
  `;

  /* ── INJECT CSS ───────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.id = 'rj-lang-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── BUILD HTML ───────────────────────────────────────────────── */
  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Bhasha Chayan — Language Selection');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <canvas id="rj-canvas"></canvas>

      <div class="rj-header">
        <div class="rj-header-logo">राजनीति · Rajyaniti</div>
        <div class="rj-header-sub">ज्ञान · राजनय · संस्कृति</div>
      </div>

      <div class="rj-divider">
        <span>भाषा चयन करें · மொழி தேர்வு · Choose Language</span>
      </div>

      <div class="rj-cards">

        <div class="rj-card rj-card-hi" tabindex="0" role="button"
             aria-label="Hindi — हिन्दी" data-lang="hi"
             onclick="window._rjSelect('hi')"
             onkeydown="if(event.key==='Enter'||event.key===' ')window._rjSelect('hi')">
          <div class="rj-card-shimmer"></div>
          <div class="rj-card-shimmer-mask"></div>
          <div class="rj-card-inner">
            <div class="rj-symbol">🪔</div>
            <div class="rj-greeting">नमस्ते</div>
            <div class="rj-subtext">स्वागत है आपका</div>
            <div class="rj-hr"></div>
            <div class="rj-lang-label">Hindi · हिन्दी</div>
          </div>
          <div class="rj-arrow">→</div>
        </div>

        <div class="rj-card rj-card-ta" tabindex="0" role="button"
             aria-label="Tamil — தமிழ்" data-lang="ta"
             onclick="window._rjSelect('ta')"
             onkeydown="if(event.key==='Enter'||event.key===' ')window._rjSelect('ta')">
          <div class="rj-card-shimmer"></div>
          <div class="rj-card-shimmer-mask"></div>
          <div class="rj-card-inner">
            <div class="rj-symbol">🌺</div>
            <div class="rj-greeting">வணக்கம்</div>
            <div class="rj-subtext">உங்களை வரவேற்கிறோம்</div>
            <div class="rj-hr"></div>
            <div class="rj-lang-label">Tamil · தமிழ்</div>
          </div>
          <div class="rj-arrow">→</div>
        </div>

        <div class="rj-card rj-card-en" tabindex="0" role="button"
             aria-label="English" data-lang="en"
             onclick="window._rjSelect('en')"
             onkeydown="if(event.key==='Enter'||event.key===' ')window._rjSelect('en')">
          <div class="rj-card-shimmer"></div>
          <div class="rj-card-shimmer-mask"></div>
          <div class="rj-card-inner">
            <div class="rj-symbol">✦</div>
            <div class="rj-greeting">Welcome</div>
            <div class="rj-subtext">You are warmly received</div>
            <div class="rj-hr"></div>
            <div class="rj-lang-label">English · अंग्रेज़ी</div>
          </div>
          <div class="rj-arrow">→</div>
        </div>

      </div>
    `;

    /* flash element */
    const flash = document.createElement('div');
    flash.id = 'rj-flash';
    document.body.appendChild(flash);
    document.body.appendChild(overlay);
    return overlay;
  }

  /* ── PARTICLE ENGINE ─────────────────────────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('rj-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Pt() { return reset({}); }
    function reset(p) {
      p.x  = Math.random() * (W || 800);
      p.y  = H ? H + 6 : 800;
      p.vx = (Math.random() - .5) * .45;
      p.vy = -(Math.random() * 1.1 + .4);
      p.life = 0;
      p.max  = Math.random() * 110 + 80;
      p.r    = Math.random() * 2.2 + .4;
      p.hue  = Math.random() * 28 + 22;
      return p;
    }

    for (let i = 0; i < 80; i++) {
      const p = Pt();
      p.y = Math.random() * (H || 600); // scatter on init
      pts.push(p);
    }

    let alive = true;
    function tick() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.life++;
        p.x += p.vx + Math.sin(p.life * .05) * .28;
        p.y += p.vy;
        p.vy -= .004;
        if (p.life >= p.max || p.y < -8) reset(p);

        const t = p.life / p.max;
        const a = t < .2 ? t / .2 : t > .72 ? 1 - (t - .72) / .28 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 - t * .4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},82%,${56 + t * 14}%,${a * .16})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
    return () => { alive = false; };
  }

  /* ── APPLY LANGUAGE (body class + html lang attr) ───────────── */
  function applyLang(lang, save) {
    /* Set <html lang> */
    const langMap = { hi: 'hi', ta: 'ta', en: 'en' };
    document.documentElement.lang = langMap[lang] || lang;

    /* Body class for CSS hooks */
    document.body.classList.remove('lang-hi', 'lang-ta', 'lang-en');
    document.body.classList.add('lang-' + lang);

    /* Persist */
    if (save) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    }

    /* Dispatch event so your own scripts can listen */
    window.dispatchEvent(new CustomEvent('rajyaniti:lang', { detail: { lang } }));
  }

  /* ── SELECT HANDLER ──────────────────────────────────────────── */
  let selecting = false;
  window._rjSelect = function (lang) {
    if (selecting) return;
    selecting = true;

    const flash   = document.getElementById('rj-flash');
    const overlay = document.getElementById(OVERLAY_ID);

    /* flash on */
    flash.classList.add('rj-on');

    setTimeout(() => {
      applyLang(lang, true);

      /* hide overlay */
      overlay.classList.remove('rj-show');
      overlay.classList.add('rj-exit');

      /* flash off */
      flash.classList.remove('rj-on');

      /* remove overlay from DOM after transition */
      setTimeout(() => {
        overlay.remove();
        flash.remove();
        document.getElementById('rj-lang-styles'); // keep styles
      }, 600);

    }, 330);
  };

  /* ── WATCH FOR EXISTING PRELOADER TO FINISH ─────────────────── */
  function waitForPreloader(cb) {
    const pre = document.getElementById(PRELOADER_ID);
    if (!pre) { cb(); return; }

    /* Watch for .hide class being added to existing preloader */
    const observer = new MutationObserver(() => {
      if (pre.classList.contains('hide')) {
        observer.disconnect();
        cb();
      }
    });
    observer.observe(pre, { attributes: true, attributeFilter: ['class'] });

    /* Fallback: if preloader never hides within 4s, show anyway */
    setTimeout(cb, 4000);
  }

  /* ── MAIN INIT ───────────────────────────────────────────────── */
  function init() {
    const overlay = buildOverlay();
    const stopParticles = initParticles();

    waitForPreloader(() => {
      /* Small buffer so preloader fade-out looks clean */
      setTimeout(() => {
        overlay.classList.add('rj-show');
        /* focus first card for keyboard users */
        setTimeout(() => {
          const firstCard = overlay.querySelector('.rj-card');
          if (firstCard) firstCard.focus({ preventScroll: true });
        }, 600);
      }, 80);
    });
  }

  /* Run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

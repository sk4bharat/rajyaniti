/**
 * lang-switcher.js — Rajyaniti Persistent Language Switcher
 * ──────────────────────────────────────────────────────────
 * Har page pe ek floating globe button dikhata hai.
 * Click karo → 3 language options slide out.
 * Current language highlighted rehti hai.
 *
 * index.html mein ADD KARO — </body> se pehle, content.js ke BAAD:
 *   <script src="lang-switcher.js"></script>
 *
 * Yahi line SABHI pages pe daalni hai:
 *   article.html, kids.html, quiz.html, store.html, book-reviews.html
 * ──────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'rajyaniti-lang';
  const SWITCHER_ID = 'rj-switcher';

  /* ── LANGUAGES CONFIG ─────────────────────────────────────── */
  const LANGS = [
    {
      code: 'hi',
      label: 'हिन्दी',
      sublabel: 'Hindi',
      symbol: '🪔',
      aria: 'Hindi mein switch karein'
    },
    {
      code: 'ta',
      label: 'தமிழ்',
      sublabel: 'Tamil',
      symbol: '🌺',
      aria: 'Switch to Tamil'
    },
    {
      code: 'en',
      label: 'English',
      sublabel: 'Eng',
      symbol: '✦',
      aria: 'Switch to English'
    }
  ];

  /* ── GET CURRENT LANG ─────────────────────────────────────── */
  function getCurrentLang() {
    try { return localStorage.getItem(STORAGE_KEY) || 'hi'; } catch { return 'hi'; }
  }

  /* ── APPLY LANG (body class + html attr + storage) ───────── */
  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.body.classList.remove('lang-hi', 'lang-ta', 'lang-en');
    document.body.classList.add('lang-' + lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    window.dispatchEvent(new CustomEvent('rajyaniti:lang', { detail: { lang } }));
    updateSwitcherUI(lang);
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  const css = `
  /* ── Floating Button ── */
  #rj-switcher {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
  }

  /* Main globe trigger button */
  #rj-sw-trigger {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1A1208;
    border: 1.5px solid rgba(200,146,42,.45);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 4px 24px rgba(0,0,0,.35),
      0 0 0 0 rgba(200,146,42,0);
    transition:
      border-color .3s ease,
      box-shadow .3s ease,
      transform .2s ease;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    position: relative;
    z-index: 1;
  }
  #rj-sw-trigger:hover {
    border-color: rgba(200,146,42,.85);
    box-shadow:
      0 4px 24px rgba(0,0,0,.4),
      0 0 18px rgba(200,146,42,.22);
    transform: scale(1.07);
  }
  #rj-sw-trigger:active { transform: scale(.96); }
  #rj-sw-trigger:focus-visible {
    outline: 2px solid #C8922A;
    outline-offset: 3px;
  }

  /* Globe SVG icon */
  .rj-globe-icon {
    width: 22px;
    height: 22px;
    stroke: #C8922A;
    fill: none;
    transition: stroke .3s ease, transform .4s ease;
  }
  #rj-switcher.rj-open .rj-globe-icon {
    stroke: #E8B84B;
    transform: rotate(20deg);
  }

  /* Current lang badge on trigger */
  #rj-sw-badge {
    position: absolute;
    top: -4px;
    left: -4px;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    background: #C8922A;
    color: #0D0906;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .04em;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    text-transform: uppercase;
    transition: background .3s ease;
  }

  /* Options container */
  #rj-sw-options {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  /* Individual option pill */
  .rj-sw-option {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1A1208;
    border: 1px solid rgba(200,146,42,.25);
    border-radius: 28px;
    padding: 6px 14px 6px 10px;
    cursor: pointer;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(10px) scale(.9);
    transition:
      opacity .25s ease,
      transform .25s cubic-bezier(.34,1.18,.64,1),
      border-color .2s ease,
      box-shadow .2s ease,
      background .2s ease;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    box-shadow: 0 2px 12px rgba(0,0,0,.25);
  }
  .rj-sw-option:focus-visible {
    outline: 2px solid #C8922A;
    outline-offset: 2px;
  }
  #rj-switcher.rj-open .rj-sw-option {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  }

  /* Stagger delays */
  .rj-sw-option:nth-child(1) { transition-delay: .05s; }
  .rj-sw-option:nth-child(2) { transition-delay: .10s; }
  .rj-sw-option:nth-child(3) { transition-delay: .15s; }

  .rj-sw-option:hover {
    border-color: rgba(200,146,42,.75);
    box-shadow: 0 2px 18px rgba(200,146,42,.15);
    background: #231910;
  }
  .rj-sw-option:active { transform: scale(.97) !important; }

  /* Active / current language */
  .rj-sw-option.rj-active {
    border-color: rgba(200,146,42,.6);
    background: rgba(200,146,42,.1);
  }
  .rj-sw-option.rj-active .rj-sw-name {
    color: #E8B84B;
  }

  /* Symbol */
  .rj-sw-symbol {
    font-size: 15px;
    line-height: 1;
  }

  /* Lang name */
  .rj-sw-name {
    font-size: 13px;
    font-weight: 600;
    color: #FAF6EE;
    letter-spacing: .01em;
    transition: color .2s ease;
  }

  /* Active checkmark */
  .rj-sw-check {
    margin-left: 2px;
    color: #C8922A;
    font-size: 12px;
    opacity: 0;
    transition: opacity .2s ease;
  }
  .rj-sw-option.rj-active .rj-sw-check {
    opacity: 1;
  }

  /* Backdrop (closes panel when clicking outside) */
  #rj-sw-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 8999;
  }
  #rj-switcher.rj-open ~ #rj-sw-backdrop,
  body.rj-sw-open #rj-sw-backdrop {
    display: block;
  }

  /* Tooltip on trigger when closed */
  #rj-sw-tooltip {
    position: absolute;
    right: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: #1A1208;
    border: 1px solid rgba(200,146,42,.3);
    color: #FAF6EE;
    font-size: 11px;
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s ease;
    letter-spacing: .04em;
  }
  #rj-sw-trigger:hover #rj-sw-tooltip {
    opacity: 1;
  }
  #rj-switcher.rj-open #rj-sw-tooltip {
    opacity: 0 !important;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    #rj-switcher {
      bottom: 18px;
      right: 16px;
    }
    #rj-sw-trigger {
      width: 44px;
      height: 44px;
    }
    .rj-sw-option {
      padding: 5px 12px 5px 9px;
    }
    .rj-sw-name {
      font-size: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rj-sw-option,
    #rj-sw-trigger,
    .rj-globe-icon {
      transition-duration: .1s !important;
    }
  }
  `;

  /* ── INJECT CSS ────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.id = 'rj-switcher-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── BUILD HTML ────────────────────────────────────────────── */
  function buildSwitcher() {
    /* Backdrop */
    const backdrop = document.createElement('div');
    backdrop.id = 'rj-sw-backdrop';
    backdrop.addEventListener('click', closePanel);
    document.body.appendChild(backdrop);

    /* Main container */
    const sw = document.createElement('div');
    sw.id = SWITCHER_ID;
    sw.setAttribute('role', 'navigation');
    sw.setAttribute('aria-label', 'Bhasha badlein — Language switcher');

    /* Options */
    const opts = document.createElement('div');
    opts.id = 'rj-sw-options';
    opts.setAttribute('role', 'menu');

    LANGS.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'rj-sw-option';
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('aria-label', lang.aria);
      btn.dataset.lang = lang.code;
      btn.innerHTML = `
        <span class="rj-sw-symbol" aria-hidden="true">${lang.symbol}</span>
        <span class="rj-sw-name">${lang.label}</span>
        <span class="rj-sw-check" aria-hidden="true">✓</span>
      `;
      btn.addEventListener('click', () => selectLang(lang.code));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectLang(lang.code);
        }
      });
      opts.appendChild(btn);
    });

    /* Trigger button */
    const trigger = document.createElement('button');
    trigger.id = 'rj-sw-trigger';
    trigger.setAttribute('aria-label', 'Bhasha badlein');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.innerHTML = `
      <svg class="rj-globe-icon" viewBox="0 0 24 24" stroke-width="1.6"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3C12 3 8 7 8 12S12 21 12 21"/>
        <path d="M12 3C12 3 16 7 16 12S12 21 12 21"/>
        <path d="M3.6 9h16.8M3.6 15h16.8"/>
      </svg>
      <span id="rj-sw-badge">HI</span>
      <span id="rj-sw-tooltip">Bhasha badlein</span>
    `;
    trigger.addEventListener('click', togglePanel);
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });

    sw.appendChild(opts);
    sw.appendChild(trigger);
    document.body.appendChild(sw);

    return sw;
  }

  /* ── PANEL OPEN / CLOSE ────────────────────────────────────── */
  let isOpen = false;

  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    const sw = document.getElementById(SWITCHER_ID);
    const trigger = document.getElementById('rj-sw-trigger');
    if (sw) sw.classList.add('rj-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('rj-sw-open');

    /* Focus first option for keyboard nav */
    setTimeout(() => {
      const first = document.querySelector('.rj-sw-option');
      if (first) first.focus();
    }, 200);
  }

  function closePanel() {
    isOpen = false;
    const sw = document.getElementById(SWITCHER_ID);
    const trigger = document.getElementById('rj-sw-trigger');
    if (sw) sw.classList.remove('rj-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
    document.body.classList.remove('rj-sw-open');
  }

  /* Close on Escape key anywhere */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── SELECT LANGUAGE ───────────────────────────────────────── */
  function selectLang(lang) {
    applyLang(lang);
    closePanel();
  }

  /* ── UPDATE UI TO REFLECT CURRENT LANG ────────────────────── */
  function updateSwitcherUI(lang) {
    /* Badge text */
    const badge = document.getElementById('rj-sw-badge');
    if (badge) {
      const found = LANGS.find(l => l.code === lang);
      badge.textContent = found ? found.sublabel.slice(0, 2).toUpperCase() : lang.toUpperCase();
    }

    /* Active class on options */
    document.querySelectorAll('.rj-sw-option').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('rj-active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });
  }

  /* ── INIT ──────────────────────────────────────────────────── */
  function init() {
    /* ── ARTICLE-ONLY GUARD ──────────────────────────────────
     * Switcher sirf article.html pe dikhega.
     * Baaki sabhi pages pe yeh file load hogi lekin kuch nahi karega.
     * ──────────────────────────────────────────────────────── */
    const path = window.location.pathname;
    const isArticlePage = path.endsWith('article.html') || path.includes('/article');
    if (!isArticlePage) return;

    buildSwitcher();
    const currentLang = getCurrentLang();
    applyLang(currentLang);

    /* Listen for lang changes from lang-selector.js too */
    window.addEventListener('rajyaniti:lang', function (e) {
      updateSwitcherUI(e.detail.lang);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

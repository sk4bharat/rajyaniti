/**
 * sk4bharat — Dark Mode v3 (Final Fix)
 * ─────────────────────────────────────────────────────────────
 * Strategy: Two-layer approach
 *   Layer 1: CSS with maximum specificity for elements we can predict
 *   Layer 2: JS scans every text element and directly sets/removes
 *            color on elements that have hardcoded dark colors,
 *            so they show properly in dark mode.
 *
 * Add to every page just before </body>:
 *   <script src="darkmode.js"></script>
 *
 * Add button anywhere in nav:
 *   <button id="sk4-dark-toggle" aria-label="Toggle dark mode"></button>
 */

(function () {
  "use strict";

  const STORAGE_KEY  = "sk4-theme";
  const DARK_CLASS   = "sk4-dark";
  const BTN_ID       = "sk4-dark-toggle";
  const DATA_ORIG    = "data-sk4-orig-color";  // stores original color for restoration

  /* ═══════════════════════════════════════════════════════════
     LAYER 1 — CSS
     Uses html.sk4-dark + body chain for maximum specificity.
     Covers everything we can predict from class names.
  ═══════════════════════════════════════════════════════════ */
  const CSS = `

    /* ── Smooth transitions ─────────────────────────────────── */
    html { transition: background-color 0.3s ease; }
    html.sk4-dark *,
    html.sk4-dark *::before,
    html.sk4-dark *::after {
      transition:
        background-color 0.3s ease,
        border-color     0.3s ease,
        box-shadow       0.3s ease !important;
    }
    /* Color transitions on text handled by JS to avoid flash */

    /* ── Base ───────────────────────────────────────────────── */
    html.sk4-dark,
    html.sk4-dark body {
      background-color: #0f0e0b !important;
      color: #f0ece3 !important;
    }

    /* ── HEADER / NAV ───────────────────────────────────────── */
    html.sk4-dark header {
      background-color: rgba(15,14,11,0.97) !important;
      border-bottom: 1px solid rgba(255,255,255,0.07) !important;
      backdrop-filter: blur(12px) !important;
    }
    html.sk4-dark header *,
    html.sk4-dark nav * {
      color: #c8c4bc !important;
    }
    html.sk4-dark header a:hover,
    html.sk4-dark nav a:hover {
      color: #f0ece3 !important;
    }
    /* Keep CONTACT button orange */
    html.sk4-dark header a[href*="contact"],
    html.sk4-dark nav a[href*="contact"],
    html.sk4-dark .btn-contact,
    html.sk4-dark [class*="contact"] {
      background-color: #c75b1a !important;
      color: #ffffff !important;
      border-color: #c75b1a !important;
    }

    /* ── HERO LEFT (dark brown panel) ───────────────────────── */
    /* The panel is already dark — just fix the text inside it  */
    html.sk4-dark [class*="hero-left"] h1,
    html.sk4-dark [class*="hero-left"] h2,
    html.sk4-dark [class*="hero"] > div:first-child h1,
    html.sk4-dark [class*="hero"] > div:first-child h2 {
      color: #f5f1e8 !important;
    }
    html.sk4-dark [class*="hero-left"] h1 em,
    html.sk4-dark [class*="hero"] > div:first-child h1 em {
      color: #d4a843 !important;
    }
    html.sk4-dark [class*="hero-left"] p,
    html.sk4-dark [class*="hero"] > div:first-child p {
      color: #aaa89e !important;
    }
    /* READ ARTICLES button (solid) */
    html.sk4-dark [class*="hero-left"] a[class*="btn"]:first-of-type,
    html.sk4-dark [class*="btn-main"],
    html.sk4-dark [class*="btn-primary"] {
      background-color: #f5f1e8 !important;
      color: #1a1814 !important;
      border-color: #f5f1e8 !important;
    }
    /* ABOUT ME button (ghost/outline) */
    html.sk4-dark [class*="hero-left"] a[class*="btn"]:last-of-type,
    html.sk4-dark [class*="btn-ghost"],
    html.sk4-dark [class*="btn-outline"] {
      background-color: transparent !important;
      color: #f5f1e8 !important;
      border-color: rgba(245,241,232,0.3) !important;
    }

    /* ── HERO RIGHT (cream panel) ───────────────────────────── */
    html.sk4-dark [class*="hero-right"],
    html.sk4-dark [class*="hero"] > div:last-child {
      background-color: #161410 !important;
    }

    /* ── LATEST POST CARD ───────────────────────────────────── */
    html.sk4-dark [class*="post-card"],
    html.sk4-dark [class*="latest-post"],
    html.sk4-dark [class*="featured-post"],
    html.sk4-dark [class*="hero"] [class*="card"] {
      background-color: #1e1b16 !important;
      border-color: rgba(255,255,255,0.08) !important;
      box-shadow: 0 4px 32px rgba(0,0,0,0.5) !important;
    }
    /* Card title */
    html.sk4-dark [class*="post-card"] h1,
    html.sk4-dark [class*="post-card"] h2,
    html.sk4-dark [class*="post-card"] h3,
    html.sk4-dark [class*="latest-post"] h1,
    html.sk4-dark [class*="latest-post"] h2,
    html.sk4-dark [class*="latest-post"] h3 {
      color: #f0ece3 !important;
    }
    html.sk4-dark [class*="post-card"] p,
    html.sk4-dark [class*="latest-post"] p {
      color: #c8c4bc !important;
    }
    html.sk4-dark [class*="post-card"] time,
    html.sk4-dark [class*="latest-post"] time,
    html.sk4-dark [class*="post-card"] .date,
    html.sk4-dark [class*="latest-post"] .date {
      color: #888076 !important;
    }

    /* ── ARTICLES PAGE ──────────────────────────────────────── */
    /* Page heading "Articles" */
    html.sk4-dark main h1,
    html.sk4-dark main h2 {
      color: #f0ece3 !important;
    }
    /* ALL article cards — the cards showing date·category, title, excerpt */
    html.sk4-dark [class*="article"],
    html.sk4-dark article,
    html.sk4-dark [class*="card"] {
      background-color: #161410 !important;
      border-color: rgba(255,255,255,0.06) !important;
    }
    /* Article card titles — THIS IS THE MAIN FIX FOR IMAGE 2 */
    html.sk4-dark article h1,
    html.sk4-dark article h2,
    html.sk4-dark article h3,
    html.sk4-dark [class*="article"] h1,
    html.sk4-dark [class*="article"] h2,
    html.sk4-dark [class*="article"] h3,
    html.sk4-dark [class*="card"] h1,
    html.sk4-dark [class*="card"] h2,
    html.sk4-dark [class*="card"] h3 {
      color: #f0ece3 !important;
    }
    /* Article card excerpts */
    html.sk4-dark article p,
    html.sk4-dark [class*="article"] p,
    html.sk4-dark [class*="card"] p {
      color: #c8c4bc !important;
    }
    /* Date · Category line */
    html.sk4-dark article .meta,
    html.sk4-dark article time,
    html.sk4-dark [class*="article"] .meta,
    html.sk4-dark [class*="article"] time,
    html.sk4-dark [class*="meta"] {
      color: #888076 !important;
    }

    /* ── FILTER PILLS ───────────────────────────────────────── */
    html.sk4-dark [class*="filter"],
    html.sk4-dark [class*="pill"]:not([class*="tag"]) {
      background-color: transparent !important;
      border-color: rgba(255,255,255,0.15) !important;
      color: #c8c4bc !important;
    }
    /* Active/selected pill */
    html.sk4-dark [class*="filter"][class*="active"],
    html.sk4-dark [class*="pill"][class*="active"],
    html.sk4-dark [class*="filter"].active {
      background-color: #c75b1a !important;
      border-color: #c75b1a !important;
      color: #ffffff !important;
    }
    /* ALL button (orange pill) — stays orange */
    html.sk4-dark [class*="filter"]:first-child,
    html.sk4-dark [class*="pill"]:first-child {
      background-color: #c75b1a !important;
      border-color: #c75b1a !important;
      color: #ffffff !important;
    }

    /* ── CATEGORY TAGS (dark filled pills on cards) ─────────── */
    html.sk4-dark .tag,
    html.sk4-dark [class*="tag"] {
      background-color: #2a2720 !important;
      color: #c8c4bc !important;
      border-color: rgba(255,255,255,0.1) !important;
    }

    /* ── DIVIDERS ───────────────────────────────────────────── */
    html.sk4-dark hr,
    html.sk4-dark [class*="divider"],
    html.sk4-dark [class*="separator"] {
      border-color: rgba(255,255,255,0.07) !important;
    }

    /* ── ALL SECTIONS ───────────────────────────────────────── */
    html.sk4-dark section,
    html.sk4-dark main {
      background-color: #0f0e0b !important;
    }
    html.sk4-dark [class*="section-alt"],
    html.sk4-dark [class*="bg-light"] {
      background-color: #161410 !important;
    }

    /* ── EYEBROW / OVERLINE labels ──────────────────────────── */
    html.sk4-dark [class*="eyebrow"],
    html.sk4-dark [class*="overline"],
    html.sk4-dark [class*="label"] {
      color: #c75b1a !important;
    }

    /* ── INPUTS / FORMS ─────────────────────────────────────── */
    html.sk4-dark input,
    html.sk4-dark textarea,
    html.sk4-dark select {
      background-color: #1e1b16 !important;
      color: #f0ece3 !important;
      border-color: rgba(255,255,255,0.12) !important;
    }
    html.sk4-dark input::placeholder,
    html.sk4-dark textarea::placeholder {
      color: #888076 !important;
    }
    html.sk4-dark input:focus,
    html.sk4-dark textarea:focus {
      border-color: #c75b1a !important;
      box-shadow: 0 0 0 3px rgba(199,91,26,0.2) !important;
    }

    /* ── FOOTER ─────────────────────────────────────────────── */
    html.sk4-dark footer {
      background-color: #080807 !important;
      border-top-color: rgba(255,255,255,0.05) !important;
    }
    html.sk4-dark footer *:not(a) {
      color: #666055 !important;
    }
    html.sk4-dark footer a {
      color: #888076 !important;
    }
    html.sk4-dark footer a:hover {
      color: #d4a843 !important;
    }

    /* ── IMAGES ──────────────────────────────────────────────── */
    html.sk4-dark img:not([data-no-dim]):not([class*="logo"]):not([class*="avatar"]) {
      filter: brightness(0.85) !important;
    }

    /* ══════════════════════════════════════════════════════════
       TOGGLE BUTTON — fixed size, clean SVG, proper alignment
    ══════════════════════════════════════════════════════════ */
    #sk4-dark-toggle {
      /* Reset everything that might be inherited */
      all: unset;
      /* Size — small, same height as nav items */
      width: 32px;
      height: 32px;
      border-radius: 50%;
      /* Border */
      border: 1px solid rgba(0,0,0,0.18);
      /* Layout */
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      vertical-align: middle;
      /* No inherited font sizes inflating it */
      font-size: 0;
      line-height: 0;
      color: #555;
      background: transparent;
    }
    #sk4-dark-toggle:hover {
      background-color: rgba(0,0,0,0.06) !important;
      border-color: rgba(0,0,0,0.3) !important;
    }
    #sk4-dark-toggle:focus-visible {
      outline: 2px solid #c75b1a !important;
      outline-offset: 2px !important;
    }

    /* Dark mode button appearance */
    html.sk4-dark #sk4-dark-toggle {
      border-color: rgba(255,255,255,0.18) !important;
      color: #c8c4bc !important;
    }
    html.sk4-dark #sk4-dark-toggle:hover {
      background-color: rgba(255,255,255,0.07) !important;
      border-color: rgba(255,255,255,0.3) !important;
    }

    /* SVG icons */
    #sk4-dark-toggle svg {
      position: absolute;
      width: 15px;
      height: 15px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #sk4-dark-toggle .i-sun {
      opacity: 1;
      transform: rotate(0deg) scale(1);
      transition: opacity 0.22s ease, transform 0.32s cubic-bezier(.22,.68,0,1.5);
    }
    #sk4-dark-toggle .i-moon {
      opacity: 0;
      transform: rotate(-50deg) scale(0.4);
      transition: opacity 0.22s ease, transform 0.32s cubic-bezier(.22,.68,0,1.5);
    }
    html.sk4-dark #sk4-dark-toggle .i-sun {
      opacity: 0;
      transform: rotate(50deg) scale(0.4);
    }
    html.sk4-dark #sk4-dark-toggle .i-moon {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* ── Reduced motion ─────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      html.sk4-dark *, html {
        transition: none !important;
      }
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.id = "sk4-dark-css";
  styleEl.textContent = CSS;
  document.head.insertBefore(styleEl, document.head.firstChild);


  /* ═══════════════════════════════════════════════════════════
     LAYER 2 — JS COLOR PATCHER
     Scans every text/heading element. If it has a hardcoded
     dark color (computed color is dark), we store the original
     and set a light color instead when in dark mode.
     On switch back to light, we restore the original.
  ═══════════════════════════════════════════════════════════ */

  // Colors to force on specific element types in dark mode
  const DARK_PATCH = {
    "H1": "#f5f1e8",
    "H2": "#f0ece3",
    "H3": "#f0ece3",
    "H4": "#f0ece3",
    "H5": "#f0ece3",
    "H6": "#f0ece3",
    "P":  "#c8c4bc",
    "LI": "#c8c4bc",
    "SPAN": null,  // only patch if it has a hardcoded dark color
    "A":  null,    // only patch if dark
    "TIME": "#888076",
  };

  // What counts as "dark" — rgb values where R+G+B < threshold
  function isColorDark(rgb) {
    const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return false;
    return (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) < 180;
  }

  // Is this element inside the always-dark hero left panel?
  // (that panel has its own hardcoded dark bg — text there should be light always)
  function isInDarkPanel(el) {
    let node = el.parentElement;
    while (node) {
      const bg = window.getComputedStyle(node).backgroundColor;
      const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (m) {
        const brightness = parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3]);
        if (brightness < 120) return true; // very dark panel
      }
      node = node.parentElement;
    }
    return false;
  }

  function patchForDark() {
    const all = document.querySelectorAll(Object.keys(DARK_PATCH).join(","));
    all.forEach(el => {
      const tag = el.tagName;
      const targetColor = DARK_PATCH[tag];

      // Store original inline color (if any) so we can restore it
      if (!el.hasAttribute(DATA_ORIG)) {
        el.setAttribute(DATA_ORIG, el.style.color || "__none__");
      }

      if (targetColor) {
        // Always patch these element types (H1-H6, P, LI, TIME)
        el.style.setProperty("color", targetColor, "important");
      } else {
        // Patch SPAN and A only if their computed color is dark
        const computed = window.getComputedStyle(el).color;
        if (isColorDark(computed)) {
          el.style.setProperty("color", "#c8c4bc", "important");
        }
      }

      // Special: em inside H1 = gold "shape" word
      if (tag === "H1") {
        el.querySelectorAll("em, i").forEach(em => {
          if (!em.hasAttribute(DATA_ORIG)) {
            em.setAttribute(DATA_ORIG, em.style.color || "__none__");
          }
          em.style.setProperty("color", "#d4a843", "important");
        });
      }
    });
  }

  function restoreFromDark() {
    const all = document.querySelectorAll("[" + DATA_ORIG + "]");
    all.forEach(el => {
      const orig = el.getAttribute(DATA_ORIG);
      if (orig === "__none__") {
        el.style.removeProperty("color");
      } else {
        el.style.color = orig;
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     THEME MANAGEMENT
  ═══════════════════════════════════════════════════════════ */
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, patch) {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add(DARK_CLASS);
      if (patch) patchForDark();
    } else {
      html.classList.remove(DARK_CLASS);
      restoreFromDark();
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateBtn(theme);
  }

  function updateBtn(theme) {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }

  // Apply class immediately (before paint) to avoid flash
  // Skip JS patching on initial load — do it after DOM is ready
  const initialTheme = getInitialTheme();
  if (initialTheme === "dark") {
    document.documentElement.classList.add(DARK_CLASS);
    localStorage.setItem(STORAGE_KEY, "dark");
  }


  /* ═══════════════════════════════════════════════════════════
     DOM READY — patch colors + init button
  ═══════════════════════════════════════════════════════════ */
  function onReady() {
    // Run JS color patch now that DOM exists
    if (initialTheme === "dark") {
      patchForDark();
    }
    updateBtn(initialTheme);
    initButton();
  }

  function initButton() {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;

    btn.innerHTML = `
      <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2"    x2="12" y2="5"/>
        <line x1="12" y1="19"   x2="12" y2="22"/>
        <line x1="4.22" y1="4.22"   x2="6.34" y2="6.34"/>
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
        <line x1="2"  y1="12"   x2="5"   y2="12"/>
        <line x1="19" y1="12"   x2="22"  y2="12"/>
        <line x1="4.22" y1="19.78"  x2="6.34" y2="17.66"/>
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
      </svg>`;

    btn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains(DARK_CLASS);
      applyTheme(isDark ? "light" : "dark", true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }


  /* ═══════════════════════════════════════════════════════════
     CROSS-TAB SYNC + OS PREFERENCE
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
      applyTheme(e.newValue, true);
    }
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light", true);
    }
  });

  /* Bfcache restore */
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    document.body.style.opacity = "0";
    requestAnimationFrame(() => {
      document.body.style.transition = "opacity 0.2s ease";
      document.body.style.opacity    = "1";
      setTimeout(() => {
        document.body.style.transition = "";
        document.body.style.opacity    = "";
      }, 200);
    });
  });

})();

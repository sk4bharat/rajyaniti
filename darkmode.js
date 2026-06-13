/**
 * sk4bharat — Dark Mode Toggle
 * ─────────────────────────────────────────────────────────────
 * Drop this file on your server. Add ONE line to every page:
 *   <script src="darkmode.js"></script>   ← just before </body>
 *
 * Then add the toggle button HTML anywhere in your nav:
 *   <button id="sk4-dark-toggle" aria-label="Toggle dark mode"></button>
 *
 * Everything else is automatic:
 *   • Reads the user's OS preference on first visit
 *   • Saves their choice in localStorage (persists across pages)
 *   • Transitions smoothly (no flash on page load)
 *   • Adds a sun/moon icon to the button automatically
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  const STORAGE_KEY   = "sk4-theme";          // localStorage key
  const DARK_CLASS    = "sk4-dark";           // class added to <html>
  const BTN_ID        = "sk4-dark-toggle";    // your button's id

  /* ── 1. Inject CSS variables & dark overrides ─────────────────
     These map onto sk4bharat's existing visual language:
     Light: warm parchment, dark ink, gold accents
     Dark:  deep ink background, cream text, same gold accents   */
  const styleEl = document.createElement("style");
  styleEl.textContent = `

    /* ── Transition: smooth colour switch on toggle ──────────── */
    html {
      transition: background-color 0.35s ease, color 0.35s ease;
    }
    *, *::before, *::after {
      transition: background-color 0.35s ease,
                  color           0.35s ease,
                  border-color    0.35s ease;
    }
    /* Don't transition images/videos — they don't need it */
    img, video, canvas, svg { transition: none !important; }

    /* ── Light mode tokens (site's existing palette) ─────────── */
    :root {
      --bg-primary:       #ffffff;
      --bg-secondary:     #f8f6f1;
      --bg-tertiary:      #f0ece3;
      --text-primary:     #111111;
      --text-secondary:   #444444;
      --text-muted:       #777777;
      --accent-gold:      #b5802a;
      --accent-gold-light:#e8c97a;
      --border-color:     #e5e2da;
      --nav-bg:           rgba(255,255,255,0.92);
      --nav-border:       rgba(0,0,0,0.08);
      --card-bg:          #ffffff;
      --card-border:      #e8e4dc;
      --tag-bg:           #f0ece3;
      --tag-color:        #555555;
      --quote-border:     #b5802a;
      --footer-bg:        #1a1814;
      --footer-text:      #c8c4bc;
      --shadow-sm:        0 1px 4px rgba(0,0,0,0.06);
      --shadow-md:        0 4px 16px rgba(0,0,0,0.08);
    }

    /* ── Dark mode token overrides ───────────────────────────── */
    html.sk4-dark {
      --bg-primary:       #0e0d0b;
      --bg-secondary:     #161410;
      --bg-tertiary:      #1e1b16;
      --text-primary:     #f0ece3;
      --text-secondary:   #c8c4bc;
      --text-muted:       #888076;
      --accent-gold:      #d4a843;
      --accent-gold-light:#f0cc7a;
      --border-color:     #2e2b24;
      --nav-bg:           rgba(14,13,11,0.94);
      --nav-border:       rgba(255,255,255,0.06);
      --card-bg:          #161410;
      --card-border:      #2a2720;
      --tag-bg:           #242018;
      --tag-color:        #c8c4bc;
      --quote-border:     #d4a843;
      --footer-bg:        #080807;
      --footer-text:      #888076;
      --shadow-sm:        0 1px 6px rgba(0,0,0,0.4);
      --shadow-md:        0 4px 20px rgba(0,0,0,0.5);
    }

    /* ── Apply tokens to common elements ─────────────────────── */
    body {
      background-color: var(--bg-primary) !important;
      color: var(--text-primary) !important;
    }

    /* Navigation */
    header, nav, .nav, .navbar, .site-header {
      background: var(--nav-bg) !important;
      border-bottom-color: var(--nav-border) !important;
      backdrop-filter: blur(12px);
    }
    nav a, .nav a, .nav-link {
      color: var(--text-secondary) !important;
    }
    nav a:hover, .nav a:hover {
      color: var(--accent-gold) !important;
    }

    /* Logo */
    .logo, .logo-link, .site-logo, .brand {
      color: var(--text-primary) !important;
    }

    /* Hero section */
    .hero, .hero-section, section:first-of-type {
      background-color: var(--bg-primary) !important;
    }
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary) !important;
    }
    h1 em, h2 em, .hero-title em, .headline em {
      color: var(--accent-gold) !important;
    }
    p, li, span:not(.tag):not(.badge):not(.label) {
      color: var(--text-secondary);
    }

    /* Article cards */
    .article-card, .card, .post-card, .book-card, .review-card {
      background-color: var(--card-bg) !important;
      border-color: var(--card-border) !important;
      box-shadow: var(--shadow-sm) !important;
    }
    .article-card:hover, .card:hover {
      box-shadow: var(--shadow-md) !important;
      border-color: var(--accent-gold) !important;
    }

    /* Tags / badges / pills */
    .tag, .badge, .category-tag, .filter-pill, .label {
      background-color: var(--tag-bg) !important;
      color: var(--tag-color) !important;
      border-color: var(--border-color) !important;
    }

    /* Sections and dividers */
    section, .section {
      background-color: var(--bg-primary) !important;
    }
    .section-alt, .bg-light, .bg-secondary {
      background-color: var(--bg-secondary) !important;
    }
    hr, .divider, .separator {
      border-color: var(--border-color) !important;
    }

    /* Eyebrow labels (✦ markers) */
    .eyebrow, .section-label, .overline {
      color: var(--accent-gold) !important;
    }

    /* Blockquotes */
    blockquote, .quote, .pullquote {
      border-left-color: var(--quote-border) !important;
      color: var(--text-secondary) !important;
    }

    /* Buttons */
    .btn-primary, .btn-main, .cta-btn {
      background-color: var(--text-primary) !important;
      color: var(--bg-primary) !important;
      border-color: var(--text-primary) !important;
    }
    .btn-outline, .btn-secondary {
      border-color: var(--border-color) !important;
      color: var(--text-primary) !important;
    }
    .btn-outline:hover, .btn-secondary:hover {
      background-color: var(--bg-tertiary) !important;
    }

    /* Inputs / newsletter form */
    input, textarea, select {
      background-color: var(--bg-tertiary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-color) !important;
    }
    input::placeholder, textarea::placeholder {
      color: var(--text-muted) !important;
    }
    input:focus, textarea:focus {
      border-color: var(--accent-gold) !important;
      outline-color: var(--accent-gold) !important;
    }

    /* Stats counters */
    .stat-num, .counter, .stats-number {
      color: var(--accent-gold) !important;
    }

    /* Footer */
    footer, .footer, .site-footer {
      background-color: var(--footer-bg) !important;
    }
    footer p, footer a, footer span,
    .footer p, .footer a, .footer span {
      color: var(--footer-text) !important;
    }
    footer a:hover, .footer a:hover {
      color: var(--accent-gold) !important;
    }

    /* Book covers — slight dim in dark mode */
    html.sk4-dark img:not([data-no-dim]) {
      filter: brightness(0.88) contrast(1.02);
    }

    /* ── Toggle button styling ───────────────────────────────── */
    #sk4-dark-toggle {
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      transition: border-color 0.2s ease, background 0.2s ease !important;
    }
    #sk4-dark-toggle:hover {
      border-color: var(--accent-gold) !important;
      background: var(--bg-tertiary) !important;
    }
    #sk4-dark-toggle:focus-visible {
      outline: 2px solid var(--accent-gold);
      outline-offset: 2px;
    }

    /* Sun and moon icons inside the button */
    #sk4-dark-toggle .sk4-icon-sun,
    #sk4-dark-toggle .sk4-icon-moon {
      position: absolute;
      width: 18px;
      height: 18px;
      transition: opacity 0.25s ease, transform 0.35s cubic-bezier(.22,.68,0,1.4) !important;
    }
    /* Light mode: show sun, hide moon */
    #sk4-dark-toggle .sk4-icon-sun  { opacity: 1; transform: rotate(0deg)   scale(1);    }
    #sk4-dark-toggle .sk4-icon-moon { opacity: 0; transform: rotate(-90deg) scale(0.6);  }

    /* Dark mode: hide sun, show moon */
    html.sk4-dark #sk4-dark-toggle .sk4-icon-sun  { opacity: 0; transform: rotate(90deg)  scale(0.6);  }
    html.sk4-dark #sk4-dark-toggle .sk4-icon-moon { opacity: 1; transform: rotate(0deg)   scale(1);    }

  `;
  document.head.insertBefore(styleEl, document.head.firstChild);


  /* ── 2. Determine initial theme (no flash) ────────────────── */
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    /* Fall back to OS preference */
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add(DARK_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
    }
    localStorage.setItem(STORAGE_KEY, theme);

    /* Update aria-label on button if it exists */
    const btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      btn.setAttribute("data-theme", theme);
    }
  }

  /* Apply immediately — before paint — to prevent flash */
  applyTheme(getInitialTheme());


  /* ── 3. Wire up the toggle button once DOM is ready ──────── */
  function initButton() {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return; /* page doesn't have the button yet — that's fine */

    /* Inject sun + moon SVG icons */
    btn.innerHTML = `
      <svg class="sk4-icon-sun" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2"  x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="2"  y1="12" x2="4"  y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="sk4-icon-moon" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3
                 a7 7 0 0 0 9.79 9.79z"/>
      </svg>`;

    btn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains(DARK_CLASS);
      applyTheme(isDark ? "light" : "dark");
    });
  }

  /* Run after DOM is parsed */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initButton);
  } else {
    initButton();
  }


  /* ── 4. Sync across tabs ──────────────────────────────────── */
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
      applyTheme(e.newValue);
    }
  });


  /* ── 5. Sync with OS preference changes ──────────────────── */
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      /* Only follow OS if user hasn't made a manual choice */
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

})();

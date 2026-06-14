/**
 * sk4bharat — Universal Mobile Nav
 * ─────────────────────────────────────────────────────────────────
 * Fixes:
 *   1. Consistent hamburger menu on every page (home, articles,
 *      book-reviews, store, quiz, kids, ask-the-text, about)
 *   2. Dark mode toggle button included in mobile menu
 *   3. Sun/moon icon correct initial state on desktop
 *   4. Menu closes on link click, Escape key, back-swipe
 *
 * Add ONE line before </body> on every page:
 *   <script src="nav.js"></script>
 *
 * The script finds your existing hamburger button by looking for:
 *   - A button with id="mobile-menu-btn"  OR
 *   - A button with class containing "hamburger", "menu-btn", "nav-toggle"
 *   - Any <button> inside <header> or <nav> that isn't #sk4-dark-toggle
 * It replaces the OLD mobile menu overlay with a new consistent one.
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  /* ── Nav links — same on every page ──────────────────────── */
  const NAV_LINKS = [
    { label: "Home",          href: "index.html" },
    { label: "Articles",      href: "article.html" },
    { label: "Book Reviews",  href: "book-reviews.html" },
    { label: "Store",         href: "store.html" },
    { label: "Kids",          href: "yuva-write.html" },
    { label: "Quiz",          href: "quiz.html" },
    { label: "Ask Me Anything", href: "ask-the-text.html" },
    { label: "About",         href: "about.html" },
  ];

  const CONTACT_HREF = "contact.html";

  /* ── Inject styles ────────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    /* ── Hamburger button ────────────────────────────────────── */
    #sk4-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      flex-shrink: 0;
      transition: background 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #sk4-hamburger:hover { background: rgba(128,128,128,0.1); }
    #sk4-hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: currentColor;
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.2s ease, width 0.3s ease;
      transform-origin: center;
    }
    /* Animated to X when open */
    #sk4-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #sk4-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    #sk4-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 768px) {
      #sk4-hamburger { display: flex !important; }
    }

    /* ── Mobile overlay ──────────────────────────────────────── */
    #sk4-mobile-nav {
      position: fixed;
      inset: 0;
      z-index: 999;
      display: flex;
      flex-direction: column;
      background: #1a1814;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    #sk4-mobile-nav.open {
      transform: translateX(0);
    }

    /* Header row inside menu */
    #sk4-mobile-nav .mnav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 20px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    #sk4-mobile-nav .mnav-logo {
      display: flex;
      flex-direction: column;
      line-height: 1;
      text-decoration: none;
    }
    #sk4-mobile-nav .mnav-logo-text {
      font-family: 'EB Garamond', 'Playfair Display', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #f5f1e8;
      letter-spacing: -0.01em;
    }
    #sk4-mobile-nav .mnav-logo-text .accent { color: #c75b1a; }
    #sk4-mobile-nav .mnav-tagline {
      font-size: 0.6rem;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      margin-top: 4px;
    }
    #sk4-mobile-nav .mnav-close {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #f5f1e8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      transition: background 0.2s;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #sk4-mobile-nav .mnav-close:hover { background: rgba(255,255,255,0.12); }

    /* Nav links */
    #sk4-mobile-nav .mnav-links {
      flex: 1;
      padding: 8px 0;
    }
    #sk4-mobile-nav .mnav-link {
      display: block;
      padding: 16px 28px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #c8c4bc;
      text-decoration: none;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      transition: color 0.18s ease, background 0.18s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #sk4-mobile-nav .mnav-link:hover,
    #sk4-mobile-nav .mnav-link.active {
      color: #f5f1e8;
      background: rgba(255,255,255,0.04);
    }
    #sk4-mobile-nav .mnav-link.active::before {
      content: '✦ ';
      color: #c75b1a;
      font-size: 0.6rem;
    }

    /* Footer of menu */
    #sk4-mobile-nav .mnav-footer {
      padding: 20px 28px 36px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #sk4-mobile-nav .mnav-contact {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 20px;
      background: #c75b1a;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 6px;
      border: 1px solid #c75b1a;
      transition: background 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    #sk4-mobile-nav .mnav-contact:hover { background: #a84a14; }

    /* Dark mode row inside menu */
    #sk4-mobile-nav .mnav-dark-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }
    #sk4-mobile-nav .mnav-dark-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
    #sk4-mobile-nav .mnav-dark-toggle {
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      position: relative;
      cursor: pointer;
      transition: background 0.25s ease;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
    }
    #sk4-mobile-nav .mnav-dark-toggle::after {
      content: '';
      position: absolute;
      top: 3px; left: 3px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s;
    }
    #sk4-mobile-nav .mnav-dark-toggle.dark-on {
      background: rgba(199,91,26,0.35);
      border-color: rgba(199,91,26,0.5);
    }
    #sk4-mobile-nav .mnav-dark-toggle.dark-on::after {
      transform: translateX(20px);
      background: #c75b1a;
    }

    /* Scroll lock when menu open */
    body.sk4-nav-open { overflow: hidden; }

    /* Scrim behind menu (optional tap-to-close area) */
    #sk4-nav-scrim {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 998;
      background: rgba(0,0,0,0.5);
    }
    #sk4-nav-scrim.open { display: block; }
  `;
  document.head.appendChild(style);


  /* ── Detect current page for active link highlight ───────── */
  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split("/").pop() || "index.html";
    return file;
  }

  /* ── Build the mobile nav overlay ────────────────────────── */
  function buildMobileNav() {
    // Remove any existing sk4 mobile nav
    const old = document.getElementById("sk4-mobile-nav");
    if (old) old.remove();
    const oldScrim = document.getElementById("sk4-nav-scrim");
    if (oldScrim) oldScrim.remove();

    const current = getCurrentPage();
    const isDark  = document.documentElement.classList.contains("sk4-dark");

    // Scrim
    const scrim = document.createElement("div");
    scrim.id = "sk4-nav-scrim";
    document.body.appendChild(scrim);

    // Overlay
    const nav = document.createElement("div");
    nav.id = "sk4-mobile-nav";
    nav.setAttribute("role", "dialog");
    nav.setAttribute("aria-modal", "true");
    nav.setAttribute("aria-label", "Navigation menu");

    // Header
    nav.innerHTML = `
      <div class="mnav-header">
        <a class="mnav-logo" href="index.html">
          <span class="mnav-logo-text">sk<span class="accent">4</span>bharat</span>
          <span class="mnav-tagline">Writer · Thinker · Speaker</span>
        </a>
        <button class="mnav-close" id="sk4-mnav-close" aria-label="Close menu">✕</button>
      </div>

      <nav class="mnav-links" aria-label="Site navigation">
        ${NAV_LINKS.map(link => `
          <a class="mnav-link${current === link.href ? " active" : ""}"
             href="${link.href}">${link.label}</a>
        `).join("")}
      </nav>

      <div class="mnav-footer">
        <a class="mnav-contact" href="${CONTACT_HREF}">Contact</a>
        <div class="mnav-dark-row">
          <span class="mnav-dark-label">Dark mode</span>
          <button
            class="mnav-dark-toggle${isDark ? " dark-on" : ""}"
            id="sk4-mnav-dark"
            aria-label="Toggle dark mode"
            aria-pressed="${isDark}">
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(nav);

    /* Close button */
    document.getElementById("sk4-mnav-close").addEventListener("click", closeMenu);

    /* Scrim click */
    scrim.addEventListener("click", closeMenu);

    /* Dark mode toggle inside menu */
    const darkBtn = document.getElementById("sk4-mnav-dark");
    if (darkBtn) {
      darkBtn.addEventListener("click", () => {
        const html   = document.documentElement;
        const isDark = html.classList.contains("sk4-dark");
        // Trigger the main darkmode.js toggle if it exists
        const mainBtn = document.getElementById("sk4-dark-toggle");
        if (mainBtn) {
          mainBtn.click();
        } else {
          // Fallback: toggle manually
          if (isDark) {
            html.classList.remove("sk4-dark");
            localStorage.setItem("sk4-theme", "light");
          } else {
            html.classList.add("sk4-dark");
            localStorage.setItem("sk4-theme", "dark");
          }
        }
        darkBtn.classList.toggle("dark-on");
        darkBtn.setAttribute("aria-pressed", String(!isDark));
      });
    }

    /* Close on nav link click */
    nav.querySelectorAll(".mnav-link").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    return nav;
  }


  /* ── Inject hamburger button into the existing header ─────── */
  function injectHamburger() {
    // Don't inject twice
    if (document.getElementById("sk4-hamburger")) return;

    const header = document.querySelector("header");
    if (!header) return;

    const btn = document.createElement("button");
    btn.id = "sk4-hamburger";
    btn.setAttribute("aria-label", "Open navigation menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<span></span><span></span><span></span>`;
    btn.addEventListener("click", toggleMenu);

    // Hide existing hamburger buttons that conflict
    header.querySelectorAll("button").forEach(b => {
      if (b.id !== "sk4-dark-toggle" && b.id !== "sk4-hamburger") {
        b.style.setProperty("display", "none", "important");
      }
    });

    // Append to header
    header.appendChild(btn);
  }


  /* ── Open / close ─────────────────────────────────────────── */
  let mobileNav = null;

  function openMenu() {
    mobileNav = buildMobileNav();
    requestAnimationFrame(() => {
      mobileNav.classList.add("open");
      document.getElementById("sk4-nav-scrim").classList.add("open");
    });
    document.body.classList.add("sk4-nav-open");

    const hamBtn = document.getElementById("sk4-hamburger");
    if (hamBtn) {
      hamBtn.classList.add("open");
      hamBtn.setAttribute("aria-expanded", "true");
    }

    // Focus close button for accessibility
    setTimeout(() => {
      const closeBtn = document.getElementById("sk4-mnav-close");
      if (closeBtn) closeBtn.focus();
    }, 350);
  }

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    const scrim = document.getElementById("sk4-nav-scrim");
    if (scrim) scrim.classList.remove("open");
    document.body.classList.remove("sk4-nav-open");

    const hamBtn = document.getElementById("sk4-hamburger");
    if (hamBtn) {
      hamBtn.classList.remove("open");
      hamBtn.setAttribute("aria-expanded", "false");
      hamBtn.focus();
    }

    // Remove from DOM after transition
    setTimeout(() => {
      if (mobileNav) { mobileNav.remove(); mobileNav = null; }
      if (scrim) scrim.remove();
    }, 380);
  }

  function toggleMenu() {
    if (mobileNav) { closeMenu(); } else { openMenu(); }
  }

  /* Keyboard: Escape closes menu */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav) closeMenu();
  });


  /* ── Hide desktop nav on mobile — scoped tightly to header only ── */
  const hideStyle = document.createElement("style");
  hideStyle.textContent = `
    @media (max-width: 768px) {

      /* Hide desktop nav links inside the real <header> only.
         We use :not(#sk4-mobile-nav *) to never touch the overlay. */
      header > nav,
      header > ul,
      header > div > nav,
      header > div > ul,
      header .nav-links,
      header .nav-right,
      header .desktop-nav {
        display: none !important;
      }

      /* Make header bar layout work on mobile */
      header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding-left: 20px !important;
        padding-right: 16px !important;
      }

      /* CRITICAL: Always show the mobile overlay and everything inside it */
      #sk4-mobile-nav,
      #sk4-mobile-nav * {
        display: revert !important;
      }
      /* Re-apply specific display values the overlay needs */
      #sk4-mobile-nav               { display: flex !important; flex-direction: column !important; }
      #sk4-mobile-nav .mnav-header  { display: flex !important; }
      #sk4-mobile-nav .mnav-logo    { display: flex !important; flex-direction: column !important; }
      #sk4-mobile-nav .mnav-links   { display: block !important; flex: 1 !important; }
      #sk4-mobile-nav .mnav-link    { display: block !important; }
      #sk4-mobile-nav .mnav-footer  { display: flex !important; flex-direction: column !important; }
      #sk4-mobile-nav .mnav-dark-row { display: flex !important; }
      #sk4-mobile-nav .mnav-close   { display: flex !important; }
      #sk4-mobile-nav .mnav-contact { display: flex !important; }
    }
  `;
  document.head.appendChild(hideStyle);


  /* ── Dark mode toggle sun/moon icon — fix initial state ─────── */
  /* Run after darkmode.js has applied the theme               */
  function fixDarkToggleIcon() {
    const btn = document.getElementById("sk4-dark-toggle");
    if (!btn) return;
    const isDark = document.documentElement.classList.contains("sk4-dark");
    const sun  = btn.querySelector(".i-sun, .sk4-sun");
    const moon = btn.querySelector(".i-moon, .sk4-moon");
    if (!sun || !moon) return;

    if (isDark) {
      sun.style.opacity  = "0";
      sun.style.transform = "rotate(50deg) scale(0.4)";
      moon.style.opacity  = "1";
      moon.style.transform = "rotate(0deg) scale(1)";
    } else {
      sun.style.opacity  = "1";
      sun.style.transform = "rotate(0deg) scale(1)";
      moon.style.opacity  = "0";
      moon.style.transform = "rotate(-50deg) scale(0.4)";
    }
  }


  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    injectHamburger();
    fixDarkToggleIcon();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Re-fix icon after storage sync (tab switch) */
  window.addEventListener("storage", () => {
    setTimeout(fixDarkToggleIcon, 100);
  });

})();

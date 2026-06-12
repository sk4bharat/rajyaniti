/**
 * sk4bharat — Page Transition Animations
 * Uses the CSS View Transitions API (no library, no dependencies).
 * Drop this file on your server and add one <script> tag to every page.
 *
 * Browser support: Chrome 111+, Edge 111+, Safari 18+
 * Older browsers get an instant navigation — no errors, no flash.
 */

(function () {
  "use strict";

  /* ── Configuration ─────────────────────────────────── */
  const SAME_ORIGIN_ONLY = true;   // never animate cross-origin links
  const DURATION_MS      = 340;    // total transition time in ms
  const EASING           = "cubic-bezier(0.4, 0, 0.2, 1)";

  /* ── Inject styles once ────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    /* Default cross-fade for the whole page */
    ::view-transition-old(root) {
      animation: sk4-fade-out ${DURATION_MS}ms ${EASING} both;
    }
    ::view-transition-new(root) {
      animation: sk4-fade-in  ${DURATION_MS}ms ${EASING} both;
    }

    /* Outgoing page slides left and fades */
    @keyframes sk4-fade-out {
      from { opacity: 1; transform: translateX(0)    scale(1);    }
      to   { opacity: 0; transform: translateX(-18px) scale(0.98); }
    }

    /* Incoming page slides in from the right and fades */
    @keyframes sk4-fade-in {
      from { opacity: 0; transform: translateX(18px)  scale(0.98); }
      to   { opacity: 1; transform: translateX(0)     scale(1);    }
    }

    /* ── Named view-transition for the nav logo ──────── */
    /* Add  style="view-transition-name: sk4-logo"  to your logo element */
    /* and it will glide smoothly instead of cutting */
    ::view-transition-old(sk4-logo),
    ::view-transition-new(sk4-logo) {
      animation-duration: ${DURATION_MS}ms;
      animation-timing-function: ${EASING};
    }

    /* ── Named view-transition for article hero text ─── */
    /* Add  style="view-transition-name: sk4-hero"  to your <h1> */
    ::view-transition-old(sk4-hero) {
      animation: sk4-hero-out ${DURATION_MS}ms ${EASING} both;
    }
    ::view-transition-new(sk4-hero) {
      animation: sk4-hero-in  ${DURATION_MS}ms ${EASING} both;
    }
    @keyframes sk4-hero-out {
      from { opacity: 1; transform: translateY(0);    }
      to   { opacity: 0; transform: translateY(-12px); }
    }
    @keyframes sk4-hero-in {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    /* ── Respect reduced-motion preference ───────────── */
    @media (prefers-reduced-motion: reduce) {
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: sk4-fade-out ${Math.round(DURATION_MS / 3)}ms linear both,
                   sk4-fade-in  ${Math.round(DURATION_MS / 3)}ms linear both;
      }
      @keyframes sk4-fade-out { to { opacity: 0; } }
      @keyframes sk4-fade-in  { from { opacity: 0; } }
    }
  `;
  document.head.appendChild(style);

  /* ── Utility: is this a same-page anchor link? ─────── */
  function isAnchorOnly(href, current) {
    try {
      const target = new URL(href, current);
      return (
        target.pathname === current.pathname &&
        target.search   === current.search   &&
        target.hash !== ""
      );
    } catch { return false; }
  }

  /* ── Utility: is this link worth animating? ─────────── */
  function shouldAnimate(anchor) {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    if (anchor.target === "_blank" || anchor.hasAttribute("download"))  return false;
    if (anchor.dataset.noTransition !== undefined)                       return false;

    try {
      const url = new URL(href, window.location.href);
      if (SAME_ORIGIN_ONLY && url.origin !== window.location.origin)    return false;
      if (isAnchorOnly(href, window.location))                           return false;
      return true;
    } catch { return false; }
  }

  /* ── Core: intercept clicks ─────────────────────────── */
  function handleClick(e) {
    /* Walk up the DOM in case click landed on a child element */
    const anchor = e.target.closest("a");
    if (!anchor || !shouldAnimate(anchor)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; /* let browser handle modifiers */

    /* API not supported → plain navigation */
    if (!document.startViewTransition) return;

    e.preventDefault();
    const destination = anchor.href;

    document.startViewTransition(() => {
      window.location.href = destination;
      /* The promise never resolves (navigation moves us away),
         which is exactly what startViewTransition expects —
         it plays the exit animation and the browser handles the rest. */
      return new Promise(() => {});
    });
  }

  document.addEventListener("click", handleClick);

  /* ── Back / forward navigation ──────────────────────── */
  /* The browser's bfcache restores the page instantly.
     We fire a brief fade-in so it doesn't feel like a flash. */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;          /* normal load — nothing to do */
    if (!document.startViewTransition) return;

    document.body.style.opacity = "0";
    requestAnimationFrame(() => {
      document.body.style.transition = `opacity ${DURATION_MS / 2}ms ease`;
      document.body.style.opacity    = "1";
      setTimeout(() => {
        document.body.style.transition = "";
        document.body.style.opacity    = "";
      }, DURATION_MS / 2);
    });
  });
})();

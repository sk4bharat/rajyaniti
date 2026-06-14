/**
 * sk4bharat — Sitewide Search
 * Drop this file into your project root and add to every page:
 *   <script src="/rajyaniti/search.js" defer></script>
 *
 * It reads /rajyaniti/search-index.json at runtime (no build step needed).
 * Open with Cmd+K (Mac) or Ctrl+K (Windows/Linux). Close with Esc or click outside.
 */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────────────── */
  const INDEX_URL = "/rajyaniti/search-index.json";

  /* ── State ───────────────────────────────────────────────────── */
  let index = [];       // loaded once on first open
  let loaded = false;
  let activeFilter = "all";
  let query = "";
  let cursor = 0;       // keyboard-selected result index
  let filtered = [];    // current visible results

  /* ── DOM refs (created once) ─────────────────────────────────── */
  let overlay, modal, input, filterBar, resultsList;

  /* ════════════════════════════════════════════════════════════════
     BUILD DOM
  ════════════════════════════════════════════════════════════════ */
  function buildModal() {
    /* Overlay --------------------------------------------------- */
    overlay = document.createElement("div");
    overlay.id = "sk-search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Site search");
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });

    /* Modal ----------------------------------------------------- */
    modal = document.createElement("div");
    modal.id = "sk-search-modal";

    /* Search bar ------------------------------------------------ */
    const bar = document.createElement("div");
    bar.id = "sk-search-bar";

    const icon = document.createElement("span");
    icon.className = "sk-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';

    input = document.createElement("input");
    input.type = "search";
    input.id = "sk-search-input";
    input.placeholder = "Search articles, books, quizzes\u2026";
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Search");
    input.setAttribute("aria-controls", "sk-results");
    input.addEventListener("input", function () {
      query = input.value.trim().toLowerCase();
      cursor = 0;
      renderResults();
    });

    const esc = document.createElement("kbd");
    esc.className = "sk-kbd";
    esc.textContent = "ESC";

    bar.appendChild(icon);
    bar.appendChild(input);
    bar.appendChild(esc);

    /* Filter pills ---------------------------------------------- */
    filterBar = document.createElement("div");
    filterBar.id = "sk-filter-bar";
    filterBar.setAttribute("role", "tablist");
    filterBar.setAttribute("aria-label", "Filter by type");

    ["all", "article", "book", "quiz"].forEach(function (type) {
      const pill = document.createElement("button");
      pill.className = "sk-pill" + (type === "all" ? " sk-pill--active" : "");
      pill.dataset.type = type;
      pill.setAttribute("role", "tab");
      pill.setAttribute("aria-selected", type === "all" ? "true" : "false");
      pill.textContent = type === "all" ? "All" : type === "article" ? "Articles" : type === "book" ? "Books" : "Quizzes";
      pill.addEventListener("click", function () {
        activeFilter = type;
        cursor = 0;
        filterBar.querySelectorAll(".sk-pill").forEach(function (p) {
          p.classList.toggle("sk-pill--active", p.dataset.type === type);
          p.setAttribute("aria-selected", p.dataset.type === type ? "true" : "false");
        });
        renderResults();
      });
      filterBar.appendChild(pill);
    });

    /* Results --------------------------------------------------- */
    resultsList = document.createElement("div");
    resultsList.id = "sk-results";
    resultsList.setAttribute("role", "listbox");

    /* Footer hints ---------------------------------------------- */
    const footer = document.createElement("div");
    footer.id = "sk-search-footer";
    footer.innerHTML =
      '<span class="sk-hint"><kbd class="sk-kbd sk-kbd--sm">\u2191\u2193</kbd> navigate</span>' +
      '<span class="sk-hint"><kbd class="sk-kbd sk-kbd--sm">\u21b5</kbd> open</span>' +
      '<span class="sk-hint"><kbd class="sk-kbd sk-kbd--sm">ESC</kbd> close</span>';

    modal.appendChild(bar);
    modal.appendChild(filterBar);
    modal.appendChild(resultsList);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER RESULTS
  ════════════════════════════════════════════════════════════════ */
  const TYPE_META = {
    article: { label: "Articles",     color: "blue",   icon: "📄" },
    book:    { label: "Book reviews",  color: "purple", icon: "📖" },
    quiz:    { label: "Quizzes",       color: "green",  icon: "❓" },
  };

  function renderResults() {
    filtered = index.filter(function (item) {
      if (activeFilter !== "all" && item.type !== activeFilter) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        (item.tags || []).some(function (t) { return t.toLowerCase().includes(query); })
      );
    });

    if (cursor >= filtered.length) cursor = 0;

    if (!filtered.length) {
      resultsList.innerHTML =
        '<p class="sk-empty">No results for \u201c' + escHtml(input.value) + '\u201d</p>';
      return;
    }

    /* Group by type in order */
    const groups = {};
    filtered.forEach(function (item, i) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push({ item: item, idx: i });
    });

    let html = "";
    ["article", "book", "quiz"].forEach(function (type) {
      if (!groups[type]) return;
      const meta = TYPE_META[type];
      html += '<div class="sk-group-label">' + meta.label + "</div>";
      groups[type].forEach(function (entry) {
        const active = entry.idx === cursor ? " sk-result--active" : "";
        const tagsHtml = (entry.item.tags || [])
          .map(function (t) { return '<span class="sk-tag sk-tag--' + type + '">' + escHtml(t) + "</span>"; })
          .join("");
        html +=
          '<a class="sk-result' + active + '" href="' + escHtml(entry.item.url) + '" ' +
          'data-idx="' + entry.idx + '" role="option" aria-selected="' + (entry.idx === cursor) + '">' +
          '<span class="sk-result-icon sk-result-icon--' + type + '">' + meta.icon + "</span>" +
          '<span class="sk-result-body">' +
          '<span class="sk-result-title">' + highlight(entry.item.title, query) + "</span>" +
          '<span class="sk-result-meta">' + escHtml(entry.item.date) + (tagsHtml ? " &middot; " + tagsHtml : "") + "</span>" +
          "</span></a>";
      });
    });

    resultsList.innerHTML = html;

    /* Mouse hover updates cursor */
    resultsList.querySelectorAll(".sk-result").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor = parseInt(el.dataset.idx, 10);
        renderResults();
      });
    });

    /* Scroll active item into view */
    const activeEl = resultsList.querySelector(".sk-result--active");
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }

  /* ════════════════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════════════════ */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlight(text, q) {
    if (!q) return escHtml(text);
    const safe = escHtml(text);
    const safeQ = escHtml(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + safeQ + ")", "gi"), "<mark>$1</mark>");
  }

  function openSearch() {
    if (!overlay) buildModal();
    if (!loaded) {
      fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          index = data;
          loaded = true;
          renderResults();
        })
        .catch(function () {
          resultsList.innerHTML = '<p class="sk-empty">Could not load search index.</p>';
        });
    }
    overlay.classList.add("sk-open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { input && input.focus(); }, 50);
  }

  function closeSearch() {
    overlay && overlay.classList.remove("sk-open");
    document.body.style.overflow = "";
    if (input) { input.value = ""; query = ""; }
    activeFilter = "all";
    cursor = 0;
    if (filterBar) {
      filterBar.querySelectorAll(".sk-pill").forEach(function (p) {
        p.classList.toggle("sk-pill--active", p.dataset.type === "all");
        p.setAttribute("aria-selected", p.dataset.type === "all" ? "true" : "false");
      });
    }
    if (resultsList) renderResults();
  }

  /* ════════════════════════════════════════════════════════════════
     KEYBOARD
  ════════════════════════════════════════════════════════════════ */
  document.addEventListener("keydown", function (e) {
    /* Open: Cmd+K or Ctrl+K */
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (overlay && overlay.classList.contains("sk-open")) {
        closeSearch();
      } else {
        openSearch();
      }
      return;
    }

    if (!overlay || !overlay.classList.contains("sk-open")) return;

    if (e.key === "Escape") { closeSearch(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cursor = Math.min(cursor + 1, filtered.length - 1);
      renderResults();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cursor = Math.max(cursor - 1, 0);
      renderResults();
      return;
    }
    if (e.key === "Enter" && filtered.length) {
      e.preventDefault();
      const target = filtered[cursor];
      if (target) window.location.href = target.url;
    }
  });

  /* ════════════════════════════════════════════════════════════════
     INJECT CSS
  ════════════════════════════════════════════════════════════════ */
  const CSS = `
#sk-search-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  padding-left: 16px;
  padding-right: 16px;
}
#sk-search-overlay.sk-open {
  display: flex;
}
#sk-search-modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  overflow: hidden;
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  #sk-search-modal { background: #1c1c1e; color: #f5f5f7; }
}
#sk-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
@media (prefers-color-scheme: dark) {
  #sk-search-bar { border-color: rgba(255,255,255,0.08); }
}
.sk-icon { color: #999; display: flex; align-items: center; flex-shrink: 0; }
#sk-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  -webkit-appearance: none;
}
#sk-search-input::placeholder { color: #aaa; }
#sk-search-input::-webkit-search-cancel-button { display: none; }
.sk-kbd {
  font-size: 11px;
  color: #999;
  background: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 3px 7px;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}
@media (prefers-color-scheme: dark) {
  .sk-kbd { background: #2c2c2e; border-color: #444; color: #aaa; }
}
.sk-kbd--sm { padding: 2px 5px; font-size: 10px; }
#sk-filter-bar {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap;
}
@media (prefers-color-scheme: dark) {
  #sk-filter-bar { border-color: rgba(255,255,255,0.06); }
}
.sk-pill {
  font-size: 12px;
  padding: 5px 13px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.15);
  background: transparent;
  color: #666;
  font-family: inherit;
  transition: all 0.12s;
  line-height: 1;
}
.sk-pill:hover { background: #f5f5f5; }
.sk-pill--active {
  background: #e0f5eb;
  border-color: #1d9e75;
  color: #085041;
}
@media (prefers-color-scheme: dark) {
  .sk-pill { border-color: rgba(255,255,255,0.15); color: #aaa; }
  .sk-pill:hover { background: rgba(255,255,255,0.05); }
  .sk-pill--active { background: #054535; border-color: #1d9e75; color: #9fe1cb; }
}
#sk-results {
  max-height: 340px;
  overflow-y: auto;
  padding: 6px 0;
  scroll-behavior: smooth;
}
.sk-group-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #aaa;
  padding: 10px 16px 3px;
}
.sk-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 16px;
  cursor: pointer;
  transition: background 0.1s;
  text-decoration: none;
  color: inherit;
}
.sk-result:hover, .sk-result--active {
  background: #f5f5f5;
}
@media (prefers-color-scheme: dark) {
  .sk-result:hover, .sk-result--active { background: rgba(255,255,255,0.06); }
}
.sk-result-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.sk-result-icon--article { background: #e6f1fb; }
.sk-result-icon--book    { background: #eeedfe; }
.sk-result-icon--quiz    { background: #eaf3de; }
.sk-result-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.sk-result-title {
  font-size: 13.5px;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sk-result-title mark {
  background: #fff3b0;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
@media (prefers-color-scheme: dark) {
  .sk-result-title mark { background: #5a4d00; }
}
.sk-result-meta {
  font-size: 11.5px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.sk-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.sk-tag--article { background: #e6f1fb; color: #185fa5; }
.sk-tag--book    { background: #eeedfe; color: #534ab7; }
.sk-tag--quiz    { background: #eaf3de; color: #3b6d11; }
@media (prefers-color-scheme: dark) {
  .sk-tag--article { background: #0c3058; color: #85b7eb; }
  .sk-tag--book    { background: #26215c; color: #afa9ec; }
  .sk-tag--quiz    { background: #173404; color: #97c459; }
}
.sk-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: #aaa;
  font-size: 14px;
}
#sk-search-footer {
  padding: 9px 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  gap: 14px;
  align-items: center;
}
@media (prefers-color-scheme: dark) {
  #sk-search-footer { border-color: rgba(255,255,255,0.06); }
}
.sk-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #bbb;
}
`;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Expose opener so you can wire a button too ── */
  window.skOpenSearch = openSearch;

})();

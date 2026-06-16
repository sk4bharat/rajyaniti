/**
 * sk4bharat — Sitewide Search
 * Handles: Cmd+K shortcut, search strip click, filter pill sync, modal UI
 */

(function () {
  "use strict";

  const INDEX_URL = "search-index.json";

  let index = [];
  let loaded = false;
  let activeFilter = "all";
  let query = "";
  let cursor = 0;
  let filtered = [];

  let overlay, modal, input, filterBar, resultsList;

  /* ── Build modal DOM (once) ───────────────────────────── */
  function buildModal() {
    overlay = document.createElement("div");
    overlay.id = "sk-search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Site search");
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });

    modal = document.createElement("div");
    modal.id = "sk-search-modal";

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

    filterBar = document.createElement("div");
    filterBar.id = "sk-filter-bar";
    filterBar.setAttribute("role", "tablist");

    ["all", "article", "book", "quiz"].forEach(function (type) {
      const pill = document.createElement("button");
      pill.className = "sk-pill" + (type === activeFilter ? " sk-pill--active" : "");
      pill.dataset.type = type;
      pill.setAttribute("role", "tab");
      pill.setAttribute("aria-selected", type === activeFilter ? "true" : "false");
      pill.textContent = type === "all" ? "All" : type === "article" ? "Articles" : type === "book" ? "Books" : "Quizzes";
      pill.addEventListener("click", function () { setFilter(type); });
      filterBar.appendChild(pill);
    });

    resultsList = document.createElement("div");
    resultsList.id = "sk-results";
    resultsList.setAttribute("role", "listbox");

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

  /* ── Filter sync (strip pills <-> modal pills) ────────── */
  function setFilter(type) {
    activeFilter = type;
    cursor = 0;
    if (filterBar) {
      filterBar.querySelectorAll(".sk-pill").forEach(function (p) {
        p.classList.toggle("sk-pill--active", p.dataset.type === type);
        p.setAttribute("aria-selected", p.dataset.type === type ? "true" : "false");
      });
    }
    document.querySelectorAll(".sk-strip-pill").forEach(function (p) {
      p.classList.toggle("sk-strip-pill--active", p.dataset.type === type);
    });
    renderResults();
  }

  /* ── Render results ───────────────────────────────────── */
  const TYPE_META = {
    article: { label: "Articles",    icon: "\uD83D\uDCC4" },
    book:    { label: "Book reviews", icon: "\uD83D\uDCD6" },
    quiz:    { label: "Quizzes",      icon: "\u2753" },
  };

  function renderResults() {
    if (!resultsList) return;
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
      resultsList.innerHTML = '<p class="sk-empty">No results for \u201c' + escHtml(input.value) + '\u201d</p>';
      return;
    }
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
          '<a class="sk-result' + active + '" href="' + escHtml(entry.item.url) + '" data-idx="' + entry.idx + '" role="option" aria-selected="' + (entry.idx === cursor) + '">' +
          '<span class="sk-result-icon sk-result-icon--' + type + '">' + meta.icon + "</span>" +
          '<span class="sk-result-body">' +
          '<span class="sk-result-title">' + highlight(entry.item.title, query) + "</span>" +
          '<span class="sk-result-meta">' + escHtml(entry.item.date) + (tagsHtml ? " &middot; " + tagsHtml : "") + "</span>" +
          "</span></a>";
      });
    });
    resultsList.innerHTML = html;
    resultsList.querySelectorAll(".sk-result").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor = parseInt(el.dataset.idx, 10);
        renderResults();
      });
    });
    var activeEl = resultsList.querySelector(".sk-result--active");
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }

  /* ── Helpers ──────────────────────────────────────────── */
  function escHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function highlight(text, q) {
    if (!q) return escHtml(text);
    var safe = escHtml(text);
    var safeQ = escHtml(q).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    return safe.replace(new RegExp("(" + safeQ + ")","gi"),"<mark>$1</mark>");
  }

  /* ── Open / close ─────────────────────────────────────── */
  function openSearch(filterType) {
    if (!overlay) buildModal();
    if (filterType && filterType !== "all") setFilter(filterType);
    if (!loaded) {
      fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) { index = data; loaded = true; renderResults(); })
        .catch(function () {
          if (resultsList) resultsList.innerHTML = '<p class="sk-empty">Could not load search index.</p>';
        });
    } else {
      renderResults();
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
    document.querySelectorAll(".sk-strip-pill").forEach(function (p) {
      p.classList.toggle("sk-strip-pill--active", p.dataset.type === "all");
    });
    if (filterBar) {
      filterBar.querySelectorAll(".sk-pill").forEach(function (p) {
        p.classList.toggle("sk-pill--active", p.dataset.type === "all");
        p.setAttribute("aria-selected", p.dataset.type === "all" ? "true" : "false");
      });
    }
    if (resultsList) renderResults();
  }

  /* ── Keyboard ─────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      overlay && overlay.classList.contains("sk-open") ? closeSearch() : openSearch();
      return;
    }
    if (!overlay || !overlay.classList.contains("sk-open")) return;
    if (e.key === "Escape") { closeSearch(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); cursor = Math.min(cursor + 1, filtered.length - 1); renderResults(); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); cursor = Math.max(cursor - 1, 0); renderResults(); return; }
    if (e.key === "Enter" && filtered.length) {
      e.preventDefault();
      var target = filtered[cursor];
      if (target) window.location.href = target.url;
    }
  });

  /* ── Inject all CSS ───────────────────────────────────── */
  var CSS = [
    /* Strip */
    "#sk-search-strip{background:#13100A;border-bottom:1px solid rgba(232,96,10,0.2);padding:9px 1.5rem;display:flex;align-items:center;justify-content:center;position:sticky;top:67px;z-index:490;}",
    "#sk-strip-inner{display:flex;align-items:center;gap:10px;background:#1E1810;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px 14px;width:100%;max-width:620px;cursor:text;transition:border-color 0.2s;}",
    "#sk-strip-inner:hover{border-color:rgba(232,96,10,0.45);}",
    "#sk-strip-inner svg{color:#8A7968;flex-shrink:0;}",
    "#sk-strip-placeholder{flex:1;font-family:'DM Sans',sans-serif;font-size:13px;color:#4A4030;letter-spacing:0.03em;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".sk-strip-divider{width:1px;height:14px;background:rgba(255,255,255,0.07);flex-shrink:0;}",
    ".sk-strip-pills{display:flex;gap:5px;flex-shrink:0;}",
    ".sk-strip-pill{font-family:'DM Sans',sans-serif;font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid #2E2820;background:transparent;color:#5A5040;cursor:pointer;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.15s;white-space:nowrap;}",
    ".sk-strip-pill:hover{border-color:#E8600A;color:#E8600A;}",
    ".sk-strip-pill--active{background:rgba(232,96,10,0.12);border-color:#E8600A;color:#E8600A;}",
    ".sk-strip-shortcut{display:flex;gap:3px;flex-shrink:0;}",
    ".sk-strip-kbd{font-size:10px;background:#0E0B04;border:1px solid #2A2520;border-radius:4px;padding:2px 5px;color:#4A4030;font-family:'DM Sans',sans-serif;line-height:1.5;}",
    "@media(max-width:768px){#sk-search-strip{top:64px;padding:8px 1rem;}.sk-strip-pills,.sk-strip-shortcut,.sk-strip-divider{display:none;}}",
    /* Modal */
    "#sk-search-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:flex-start;justify-content:center;padding-top:100px;padding-left:16px;padding-right:16px;}",
    "#sk-search-overlay.sk-open{display:flex;}",
    "#sk-search-modal{background:#1A1208;border:1px solid rgba(232,96,10,0.3);border-radius:10px;width:100%;max-width:580px;box-shadow:0 16px 60px rgba(0,0,0,0.6);overflow:hidden;font-family:'DM Sans',sans-serif;}",
    "#sk-search-bar{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.07);}",
    ".sk-icon{color:#8A7968;display:flex;align-items:center;flex-shrink:0;}",
    "#sk-search-input{flex:1;border:none;outline:none;font-size:15px;background:transparent;color:#FAF6EE;font-family:'DM Sans',sans-serif;-webkit-appearance:none;}",
    "#sk-search-input::placeholder{color:#4A4030;}",
    "#sk-search-input::-webkit-search-cancel-button{display:none;}",
    ".sk-kbd{font-size:11px;color:#4A4030;background:#0E0B04;border:1px solid #2A2520;border-radius:4px;padding:3px 7px;font-family:'DM Sans',sans-serif;white-space:nowrap;flex-shrink:0;}",
    ".sk-kbd--sm{padding:2px 5px;font-size:10px;}",
    "#sk-filter-bar{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);flex-wrap:wrap;}",
    ".sk-pill{font-size:11px;padding:4px 12px;border-radius:20px;cursor:pointer;border:1px solid #2E2820;background:transparent;color:#5A5040;font-family:'DM Sans',sans-serif;transition:all 0.12s;letter-spacing:0.04em;}",
    ".sk-pill:hover{border-color:#E8600A;color:#E8600A;}",
    ".sk-pill--active{background:rgba(232,96,10,0.15);border-color:#E8600A;color:#E8600A;}",
    "#sk-results{max-height:360px;overflow-y:auto;padding:6px 0;scroll-behavior:smooth;}",
    ".sk-group-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4A4030;padding:10px 16px 3px;}",
    ".sk-result{display:flex;align-items:center;gap:12px;padding:9px 16px;cursor:pointer;transition:background 0.1s;text-decoration:none;color:#FAF6EE;}",
    ".sk-result:hover,.sk-result--active{background:rgba(232,96,10,0.08);}",
    ".sk-result-icon{width:34px;height:34px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}",
    ".sk-result-icon--article{background:rgba(55,138,221,0.15);}",
    ".sk-result-icon--book{background:rgba(83,74,183,0.15);}",
    ".sk-result-icon--quiz{background:rgba(99,153,34,0.15);}",
    ".sk-result-body{display:flex;flex-direction:column;gap:2px;min-width:0;}",
    ".sk-result-title{font-size:13.5px;font-weight:500;color:#FAF6EE;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".sk-result-title mark{background:rgba(232,96,10,0.3);color:#FAF6EE;border-radius:2px;padding:0 1px;}",
    ".sk-result-meta{font-size:11.5px;color:#6A5F50;display:flex;align-items:center;gap:5px;flex-wrap:wrap;}",
    ".sk-tag{font-size:10px;padding:1px 6px;border-radius:4px;font-weight:500;}",
    ".sk-tag--article{background:rgba(55,138,221,0.15);color:#85B7EB;}",
    ".sk-tag--book{background:rgba(83,74,183,0.15);color:#AFA9EC;}",
    ".sk-tag--quiz{background:rgba(99,153,34,0.15);color:#97C459;}",
    ".sk-empty{text-align:center;padding:2rem 1rem;color:#4A4030;font-size:14px;}",
    "#sk-search-footer{padding:9px 16px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:14px;align-items:center;}",
    ".sk-hint{display:flex;align-items:center;gap:5px;font-size:11px;color:#4A4030;}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Build search strip ───────────────────────────────── */
  function buildStrip() {
    var strip = document.createElement("div");
    strip.id = "sk-search-strip";
    strip.setAttribute("role", "search");
    strip.setAttribute("aria-label", "Sitewide search");
    strip.innerHTML =
      '<div id="sk-strip-inner">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<span id="sk-strip-placeholder">Search articles, books, quizzes\u2026</span>' +
        '<div class="sk-strip-divider"></div>' +
        '<div class="sk-strip-pills">' +
          '<button class="sk-strip-pill sk-strip-pill--active" data-type="all">All</button>' +
          '<button class="sk-strip-pill" data-type="article">Articles</button>' +
          '<button class="sk-strip-pill" data-type="book">Books</button>' +
          '<button class="sk-strip-pill" data-type="quiz">Quiz</button>' +
        '</div>' +
        '<div class="sk-strip-divider"></div>' +
        '<div class="sk-strip-shortcut">' +
          '<span class="sk-strip-kbd">\u2318</span><span class="sk-strip-kbd">K</span>' +
        '</div>' +
      '</div>';

    strip.querySelector("#sk-strip-inner").addEventListener("click", function () {
      openSearch();
    });
    strip.querySelectorAll(".sk-strip-pill").forEach(function (pill) {
      pill.addEventListener("click", function (e) {
        e.stopPropagation();
        setFilter(pill.dataset.type);
        openSearch(pill.dataset.type);
      });
    });

    var header = document.querySelector("header");
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(strip, header.nextSibling);
    } else if (header) {
      header.parentNode.appendChild(strip);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildStrip);
  } else {
    buildStrip();
  }

  window.skOpenSearch = openSearch;

})();

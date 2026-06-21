/**
 * article-loader.js — Rajyaniti Language-Based Article Feed
 * ──────────────────────────────────────────────────────────
 * 1. localStorage se current language padhta hai
 * 2. articles.json se us language ke articles fetch karta hai
 * 3. article.html ke template mein inject karta hai
 * 4. Language switch hone pe apne aap reload karta hai
 *
 * article.html ke </body> se pehle add karo:
 *   <script src="article-loader.js"></script>
 * ──────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  const STORAGE_KEY  = 'rajyaniti-lang';
  const JSON_PATH    = 'articles.json'; // same folder mein hona chahiye

  /* ── Utility: current lang ──────────────────────────────── */
  function getLang() {
    try { return localStorage.getItem(STORAGE_KEY) || 'hi'; } catch { return 'hi'; }
  }

  /* ── Build one article card for the listing view ─────────── */
  function buildCard(article, lang) {
    const card = document.createElement('div');
    card.className = 'rj-article-card';
    card.dataset.id = article.id;

    // Direction for Hindi/Tamil (RTL nahi hai, but font class useful hai)
    const langClass = 'rj-lang-' + lang;

    card.innerHTML = `
      <div class="rj-card-inner ${langClass}">
        <div class="rj-card-top">
          <span class="rj-card-category">${article.category}</span>
          <span class="rj-card-readtime">${article.readTime}</span>
        </div>
        <h2 class="rj-card-title">${article.title}</h2>
        <p class="rj-card-dek">${article.dek}</p>
        <div class="rj-card-meta">
          <span class="rj-card-author">${article.author}</span>
          <span class="rj-card-dot">·</span>
          <span class="rj-card-date">${article.date}</span>
        </div>
        <div class="rj-card-tags">
          ${article.tags.map(t => `<span class="rj-card-tag">${t}</span>`).join('')}
        </div>
        <button class="rj-read-btn" data-id="${article.id}">
          ${lang === 'hi' ? 'पूरा पढ़ें' : lang === 'ta' ? 'முழுவதும் படிக்க' : 'Read Article'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    `;

    // Read button click → open full article
    card.querySelector('.rj-read-btn').addEventListener('click', () => {
      openArticle(article, lang);
    });

    return card;
  }

  /* ── Build full article view ─────────────────────────────── */
  function buildFullArticle(article, lang) {
    const wrap = document.createElement('div');
    wrap.className = 'rj-full-article rj-lang-' + lang;

    // Back button label
    const backLabel = lang === 'hi' ? '← वापस जाएं' : lang === 'ta' ? '← திரும்பு' : '← Back to Articles';

    // Build sections HTML
    let sectionsHTML = '';
    article.sections.forEach(sec => {
      if (sec.type === 'drop-cap') {
        sectionsHTML += `<p class="drop-cap" id="${sec.id}">${sec.content}</p>`;
      } else if (sec.type === 'h2') {
        sectionsHTML += `
          <h2 id="${sec.id}">${sec.heading}</h2>
          <p>${sec.content}</p>
        `;
      } else if (sec.type === 'blockquote') {
        sectionsHTML += `
          <blockquote>
            <p>${sec.content}</p>
            ${sec.cite ? `<cite>${sec.cite}</cite>` : ''}
          </blockquote>
        `;
      } else if (sec.type === 'pullquote') {
        sectionsHTML += `
          <div class="pull-quote">
            <p>${sec.content}</p>
          </div>
        `;
      } else if (sec.type === 'hr') {
        sectionsHTML += `<hr>`;
      }
    });

    wrap.innerHTML = `
      <button class="rj-back-btn" id="rj-back-btn">${backLabel}</button>

      <!-- Masthead -->
      <div class="rj-full-masthead">
        <span class="article-category-badge">✦ ${article.category}</span>
        <h1 class="article-main-title">${article.title}</h1>
        <p class="article-dek">${article.dek}</p>
        <div class="article-meta-bar">
          <div class="meta-author">
            <div class="author-avatar">sk</div>
            <div>
              <div class="author-info-name">${article.author}</div>
              <div class="author-info-role">${article.authorRole}</div>
            </div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span>${lang === 'hi' ? 'प्रकाशित' : lang === 'ta' ? 'வெளியிடப்பட்டது' : 'Published'}</span>
            <strong>${article.date}</strong>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span>${lang === 'hi' ? 'पढ़ने का समय' : lang === 'ta' ? 'படிக்கும் நேரம்' : 'Read time'}</span>
            <strong>${article.readTime}</strong>
          </div>
        </div>
        <div class="article-tags-bar">
          ${article.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>

      <!-- Hero image placeholder -->
      <div class="masthead-image-strip" style="background:var(--ink);padding:2rem 2rem 0;">
        <div style="max-width:820px;margin:0 auto;">
          <div class="hero-image-block">
            <span class="hero-image-placeholder">✦</span>
          </div>
          <p class="hero-image-caption">${article.imageCaption}</p>
        </div>
      </div>

      <!-- Article body -->
      <div class="article-body-wrapper">
        <div style="max-width:820px;margin:0 auto;">
          <article class="article-prose">
            ${sectionsHTML}
            <div class="article-signature">
              <div class="signature-avatar">sk</div>
              <div>
                <div class="signature-name">${article.author}</div>
                <div class="signature-bio">${article.authorRole}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    `;

    // Back button
    wrap.querySelector('#rj-back-btn').addEventListener('click', () => {
      showListing();
    });

    return wrap;
  }

  /* ── CSS for the listing + cards ─────────────────────────── */
  const CSS = `
  /* ── Container ── */
  #rj-article-root {
    padding: 3rem 2rem;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ── Language Header Bar ── */
  .rj-lang-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .rj-lang-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--ink);
  }

  .rj-lang-title span {
    color: var(--saffron);
    font-style: italic;
  }

  .rj-article-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--border);
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
  }

  /* ── Cards Grid ── */
  .rj-cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .rj-article-card {
    border-top: 1px solid var(--border);
    transition: border-color 0.2s;
    cursor: pointer;
  }

  .rj-article-card:last-child {
    border-bottom: 1px solid var(--border);
  }

  .rj-article-card:hover {
    border-color: var(--saffron);
  }

  .rj-card-inner {
    padding: 2rem 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  /* Hindi font boost */
  .rj-lang-hi .rj-card-title,
  .rj-lang-hi .rj-card-dek,
  .rj-lang-hi .article-main-title,
  .rj-lang-hi .article-dek,
  .rj-lang-hi p,
  .rj-lang-hi h2 {
    font-family: 'Noto Sans Devanagari', 'EB Garamond', serif;
  }

  /* Tamil font boost */
  .rj-lang-ta .rj-card-title,
  .rj-lang-ta .rj-card-dek,
  .rj-lang-ta .article-main-title,
  .rj-lang-ta .article-dek,
  .rj-lang-ta p,
  .rj-lang-ta h2 {
    font-family: 'Noto Sans Tamil', 'EB Garamond', serif;
  }

  .rj-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.2rem;
  }

  .rj-card-category {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--saffron);
  }

  .rj-card-readtime {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  .rj-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.45rem;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.25;
    margin: 0;
    transition: color 0.2s;
  }

  .rj-article-card:hover .rj-card-title {
    color: var(--saffron);
  }

  .rj-card-dek {
    font-family: 'EB Garamond', serif;
    font-size: 1rem;
    font-style: italic;
    color: var(--muted);
    line-height: 1.6;
    margin: 0;
  }

  .rj-card-meta {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }

  .rj-card-dot { color: var(--border); }

  .rj-card-tags {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .rj-card-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
  }

  .rj-read-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--saffron);
    background: transparent;
    border: 1px solid rgba(232,96,10,0.3);
    padding: 0.45rem 1rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
    width: fit-content;
  }

  .rj-read-btn:hover {
    background: var(--saffron);
    color: white;
    border-color: var(--saffron);
  }

  /* ── Empty state ── */
  .rj-empty {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--muted);
  }

  .rj-empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  .rj-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    color: var(--ink);
    margin-bottom: 0.5rem;
  }

  .rj-empty-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: var(--muted);
  }

  /* ── Loading state ── */
  .rj-loading {
    text-align: center;
    padding: 4rem 2rem;
  }

  .rj-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--saffron);
    border-radius: 50%;
    animation: rj-spin 0.7s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes rj-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Full article back button ── */
  .rj-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: transparent;
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    margin: 2rem 2rem 0;
  }

  .rj-back-btn:hover {
    color: var(--saffron);
    border-color: var(--saffron);
  }

  /* ── Full article masthead override ── */
  .rj-full-masthead {
    background: var(--ink);
    padding: 4rem 2rem 0;
    position: relative;
    overflow: hidden;
  }

  .rj-full-masthead .article-main-title,
  .rj-full-masthead .article-dek,
  .rj-full-masthead .article-meta-bar,
  .rj-full-masthead .article-tags-bar {
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Fade-in animation for cards */
  .rj-article-card {
    opacity: 0;
    transform: translateY(16px);
    animation: rj-fadeup 0.4s ease forwards;
  }

  .rj-article-card:nth-child(1) { animation-delay: 0.05s; }
  .rj-article-card:nth-child(2) { animation-delay: 0.12s; }
  .rj-article-card:nth-child(3) { animation-delay: 0.19s; }
  .rj-article-card:nth-child(4) { animation-delay: 0.26s; }
  .rj-article-card:nth-child(5) { animation-delay: 0.33s; }

  @keyframes rj-fadeup {
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    #rj-article-root { padding: 2rem 1.25rem; }
    .rj-card-title { font-size: 1.2rem; }
    .rj-full-masthead { padding: 2.5rem 1.25rem 0; }
    .rj-back-btn { margin: 1.5rem 1.25rem 0; }
  }
  `;

  /* ── State ──────────────────────────────────────────────── */
  let allArticles = null;  // cache
  let rootEl      = null;
  let currentView = 'listing'; // 'listing' | 'article'

  /* ── Show listing ─────────────────────────────────────────── */
  function showListing() {
    currentView = 'listing';
    const lang     = getLang();
    const articles = allArticles[lang] || [];

    // Clear root
    rootEl.innerHTML = '';

    // Language header labels
    const headerLabels = {
      hi: { title: 'हिन्दी <span>लेख</span>', countSuffix: 'लेख' },
      ta: { title: 'தமிழ் <span>கட்டுரைகள்</span>', countSuffix: 'கட்டுரைகள்' },
      en: { title: 'English <span>Articles</span>', countSuffix: 'articles' }
    };
    const labels = headerLabels[lang] || headerLabels.en;

    // Empty state
    if (!articles.length) {
      const emptyLabels = {
        hi: { title: 'जल्द आ रहा है', sub: 'हिन्दी में लेख लिखे जा रहे हैं।' },
        ta: { title: 'விரைவில் வருகிறது', sub: 'தமிழில் கட்டுரைகள் எழுதப்படுகின்றன.' },
        en: { title: 'Coming Soon', sub: 'Articles in English are being written.' }
      };
      const el = emptyLabels[lang] || emptyLabels.en;
      rootEl.innerHTML = `
        <div class="rj-empty">
          <div class="rj-empty-icon">✦</div>
          <h3 class="rj-empty-title">${el.title}</h3>
          <p class="rj-empty-sub">${el.sub}</p>
        </div>
      `;
      return;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'rj-lang-header';
    header.innerHTML = `
      <h2 class="rj-lang-title">${labels.title}</h2>
      <span class="rj-article-count">${articles.length} ${labels.countSuffix}</span>
    `;
    rootEl.appendChild(header);

    // Cards grid
    const grid = document.createElement('div');
    grid.className = 'rj-cards-grid';

    articles.forEach(article => {
      grid.appendChild(buildCard(article, lang));
    });

    rootEl.appendChild(grid);
    window.scrollTo({ top: rootEl.offsetTop - 80, behavior: 'smooth' });
  }

  /* ── Open full article ───────────────────────────────────── */
  function openArticle(article, lang) {
    currentView = 'article';
    rootEl.innerHTML = '';
    rootEl.appendChild(buildFullArticle(article, lang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Inject CSS once ─────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('rj-loader-styles')) return;
    const s = document.createElement('style');
    s.id = 'rj-loader-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Find or create root element ─────────────────────────── */
  function getRoot() {
    // Existing article content ko replace karo
    // article.html mein <div id="rj-article-root"> hona chahiye
    let root = document.getElementById('rj-article-root');
    if (!root) {
      // Fallback: article-body-wrapper ke andar inject karo
      const wrapper = document.querySelector('.article-body-wrapper');
      if (wrapper) {
        wrapper.innerHTML = '<div id="rj-article-root"></div>';
        root = document.getElementById('rj-article-root');
      } else {
        // Last resort: body ke end mein
        root = document.createElement('div');
        root.id = 'rj-article-root';
        document.body.appendChild(root);
      }
    }
    return root;
  }

  /* ── Main init ───────────────────────────────────────────── */
  async function init() {
    injectCSS();
    rootEl = getRoot();

    // Show loader
    rootEl.innerHTML = `
      <div class="rj-loading">
        <div class="rj-spinner"></div>
      </div>
    `;

    // Fetch JSON
    try {
      const res  = await fetch(JSON_PATH);
      if (!res.ok) throw new Error('JSON fetch failed: ' + res.status);
      allArticles = await res.json();
    } catch (err) {
      rootEl.innerHTML = `
        <div class="rj-empty">
          <div class="rj-empty-icon">⚠</div>
          <h3 class="rj-empty-title">Could not load articles</h3>
          <p class="rj-empty-sub">articles.json not found. Make sure it is in the same folder.</p>
        </div>
      `;
      console.error('[article-loader]', err);
      return;
    }

    showListing();

    // Reload listing when language changes (from lang-switcher.js)
    window.addEventListener('rajyaniti:lang', function () {
      if (currentView === 'listing') {
        showListing();
      }
      // If reading an article, go back to listing in new lang
      if (currentView === 'article') {
        showListing();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

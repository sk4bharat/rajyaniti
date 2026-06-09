const GLOSSARY = {
  "dharma": {
    term: "Dharma", script: "धर्म", lang: "Sanskrit",
    def: "Often mistranslated as 'duty', dharma is the cosmic order each being must uphold — contextual, relational, never simply a rule to follow.",
    link: "/rajyaniti/article.html"
  },
  "bhagavad-gita": {
    term: "Bhagavad Gita", script: "भगवद् गीता", lang: "Sanskrit",
    def: "A 700-verse dialogue between Arjuna and Krishna embedded in the Mahabharata — one of the most profound texts on ethics, duty, and action.",
    link: "/rajyaniti/article.html"
  },
  "kurukshetra": {
    term: "Kurukshetra", script: "कुरुक्षेत्र", lang: "Sanskrit / Geography",
    def: "The battlefield of the Mahabharata war in present-day Haryana. Used figuratively for any arena of impossible moral reckoning.",
    link: "/rajyaniti/article.html"
  },
  "dharmasankat": {
    term: "Dharmasaṅkaṭa", script: "धर्मसंकट", lang: "Sanskrit",
    def: "A moral dilemma in which two dharmic obligations collide directly — impossible to honour one without violating another.",
    link: "/rajyaniti/article.html"
  },
  "nishkama-karma": {
    term: "Nishkama Karma", script: "निष्काम कर्म", lang: "Sanskrit",
    def: "Action without attachment to its fruits. Do what the situation demands, with full effort, without calculating returns you cannot control.",
    link: "/rajyaniti/article.html"
  },
  "karna": {
    term: "Karna", script: "कर्ण", lang: "Sanskrit",
    def: "Gifted warrior and tragic hero of the Mahabharata. His loyalty to Duryodhana despite knowing it was misplaced makes him the epic's defining study in allegiance.",
    link: "/rajyaniti/article.html"
  },
  "prajna": {
    term: "Prajñā", script: "प्रज्ञा", lang: "Sanskrit",
    def: "Wisdom combining knowledge, experience, and the capacity to read a situation — distinct from mere intelligence or rule-following.",
    link: "/rajyaniti/article.html"
  },
  "vyuha": {
    term: "Vyūha", script: "व्यूह", lang: "Sanskrit",
    def: "A military formation used in ancient Indian warfare. In the Mahabharata, commanders arranged armies in specific geometric vyuhas like Chakravyuha (discus) or Garuda (eagle).",
    link: "/rajyaniti/article.html"
  }
};

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .gloss {
      border-bottom: 1.5px dashed #8B6B3D;
      cursor: help;
      position: relative;
      padding: 0 1px;
      border-radius: 2px;
      transition: background 0.15s;
      text-decoration: none;
      color: inherit;
    }
    .gloss:hover, .gloss.gloss-active {
      background: rgba(139,107,61,0.10);
    }
    .gloss-popup {
      display: none;
      position: absolute;
      z-index: 9999;
      width: 280px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 12px;
      padding: 14px 16px 13px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .gloss-popup.gloss-below {
      bottom: auto;
      top: calc(100% + 8px);
    }
    .gloss-popup-lang {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #8B6B3D;
      margin-bottom: 3px;
    }
    .gloss-popup-term {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 3px;
      color: #1a1a1a;
    }
    .gloss-popup-script {
      font-size: 13px;
      color: #777;
      margin-bottom: 8px;
    }
    .gloss-popup-def {
      font-size: 13px;
      line-height: 1.6;
      color: #444;
      border-top: 1px solid #eee;
      padding-top: 8px;
    }
    .gloss-popup-link {
      display: inline-block;
      margin-top: 8px;
      font-size: 12px;
      color: #8B6B3D;
      text-decoration: none;
    }
    .gloss-popup-link:hover { text-decoration: underline; }
    @media (prefers-color-scheme: dark) {
      .gloss-popup { background: #1e1e1e; border-color: rgba(255,255,255,0.12); }
      .gloss-popup-term { color: #f0f0f0; }
      .gloss-popup-script { color: #999; }
      .gloss-popup-def { color: #ccc; border-top-color: #333; }
    }
  `;
  document.head.appendChild(style);

  let activePopup = null;

  function initGlossary() {
    document.querySelectorAll('.gloss').forEach(el => {
      if (el.dataset.glossInit) return;
      el.dataset.glossInit = '1';

      const key = el.dataset.term;
      const data = GLOSSARY[key];
      if (!data) return;

      const popup = document.createElement('div');
      popup.className = 'gloss-popup';
      popup.innerHTML = `
        <div class="gloss-popup-lang">${data.lang}</div>
        <div class="gloss-popup-term">${data.term}</div>
        <div class="gloss-popup-script">${data.script}</div>
        <div class="gloss-popup-def">${data.def}
          <a class="gloss-popup-link" href="${data.link}">Read more →</a>
        </div>`;
      el.appendChild(popup);

      function show() {
        if (activePopup && activePopup !== popup) {
          activePopup.style.display = 'none';
          activePopup.closest('.gloss')?.classList.remove('gloss-active');
        }
        const rect = el.getBoundingClientRect();
        popup.classList.toggle('gloss-below', rect.top < 180);
        popup.style.display = 'block';
        el.classList.add('gloss-active');
        activePopup = popup;
      }

      function hide(e) {
        if (popup.contains(e?.relatedTarget) || el.contains(e?.relatedTarget)) return;
        popup.style.display = 'none';
        el.classList.remove('gloss-active');
        if (activePopup === popup) activePopup = null;
      }

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      popup.addEventListener('mouseleave', hide);
      el.addEventListener('click', e => {
        e.preventDefault();
        popup.style.display === 'block' ? hide() : show();
      });
    });
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.gloss') && activePopup) {
      activePopup.style.display = 'none';
      document.querySelectorAll('.gloss-active').forEach(g => g.classList.remove('gloss-active'));
      activePopup = null;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlossary);
  } else {
    initGlossary();
  }
})();

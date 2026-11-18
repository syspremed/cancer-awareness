/* ================================================================
   Cancer Awareness App — Core JS
   Version: 0.1 (prototype)
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   LANGUAGE MANAGEMENT
   ---------------------------------------------------------------- */
const LangManager = {
  KEY: 'ca_lang',
  modes: ['both', 'en', 'ta'],
  labels: {
    both: 'EN + தமிழ்',
    en:   'English',
    ta:   'தமிழ்'
  },

  init() {
    const saved = localStorage.getItem(this.KEY) || 'both';
    this.set(saved, false);
    this._bindButtons();
  },

  get() {
    return document.documentElement.dataset.lang || 'both';
  },

  set(mode, save = true) {
    if (!this.modes.includes(mode)) mode = 'both';
    document.documentElement.dataset.lang = mode;
    if (save) localStorage.setItem(this.KEY, mode);
    this._updateButtons(mode);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { mode } }));
  },

  _bindButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => this.set(btn.dataset.langBtn));
    });
    this._updateButtons(this.get());
  },

  _updateButtons(mode) {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.langBtn === mode);
      btn.setAttribute('aria-pressed', btn.dataset.langBtn === mode);
    });
  }
};

/* ----------------------------------------------------------------
   NAV TOGGLE (mobile)
   ---------------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.innerHTML = open
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });
}

/* ----------------------------------------------------------------
   ACTIVE NAV LINK
   ---------------------------------------------------------------- */
function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });
}

/* ----------------------------------------------------------------
   QUIZ ENGINE
   ---------------------------------------------------------------- */
const QuizEngine = {
  init(containerEl) {
    if (!containerEl) return;
    containerEl.querySelectorAll('.quiz-question').forEach(q => this._bindQuestion(q));
  },

  _bindQuestion(qEl) {
    const opts = qEl.querySelectorAll('.quiz-option');
    const feedback = qEl.querySelector('.quiz-feedback');
    let answered = false;

    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = opt.dataset.correct === 'true';
        opts.forEach(o => o.classList.add(o.dataset.correct === 'true' ? 'correct' : 'wrong'));
        opt.classList.add(correct ? 'correct' : 'wrong');
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = correct
            ? (feedback.dataset.correctMsg || '✓ Correct!')
            : (feedback.dataset.wrongMsg  || '✗ Not quite — the correct answer is highlighted.');
          feedback.className = 'quiz-feedback info-box ' + (correct ? 'info-box-success' : 'info-box-warn');
        }
      });
    });
  }
};

/* ----------------------------------------------------------------
   MYTH REVEAL
   ---------------------------------------------------------------- */
function initMythCards() {
  document.querySelectorAll('.myth-card[data-reveal]').forEach(card => {
    const bottom = card.querySelector('.myth-bottom');
    if (!bottom) return;
    bottom.hidden = true;
    const btn = card.querySelector('.myth-reveal-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        bottom.hidden = false;
        btn.hidden = true;
      });
    }
  });
}

/* ----------------------------------------------------------------
   TEXT SIZE CONTROLS
   ---------------------------------------------------------------- */
function initTextSize() {
  const KEY = 'ca_textsize';
  const levels = ['normal', 'large', 'xlarge'];
  const saved = localStorage.getItem(KEY) || 'normal';
  document.documentElement.dataset.textSize = saved;

  document.querySelectorAll('[data-textsize]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sz = btn.dataset.textsize;
      document.documentElement.dataset.textSize = sz;
      localStorage.setItem(KEY, sz);
    });
  });
}

/* ----------------------------------------------------------------
   SCROLL PROGRESS (for module pages)
   ---------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(100, pct) + '%';
  }, { passive: true });
}

/* ----------------------------------------------------------------
   DETAILS / EXPAND ALL
   ---------------------------------------------------------------- */
function initExpandAll() {
  document.querySelectorAll('[data-expand-all]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.expandAll);
      if (!target) return;
      const all = target.querySelectorAll('details');
      const anyOpen = [...all].some(d => d.open);
      all.forEach(d => d.open = !anyOpen);
      btn.textContent = anyOpen ? 'Expand all' : 'Collapse all';
    });
  });
}

/* ----------------------------------------------------------------
   INIT
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  LangManager.init();
  initNavToggle();
  highlightActiveNav();
  QuizEngine.init(document.body);
  initMythCards();
  initTextSize();
  initScrollProgress();
  initExpandAll();
});

// Export for other modules
window.CA = { LangManager, QuizEngine };

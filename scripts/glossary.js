
(function () {
  'use strict';

  const GLOSSARY_PATH = window.GLOSSARY_PATH || '/scripts/glossary.json';

  // ── Nodes we should never touch ──────────────────────────────────────────
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT',
    'CODE', 'PRE', 'A', 'BUTTON', 'NAV', 'HEADER', 'FOOTER',
    'TRANSPARENT-NAVBAR', 'NAV-BLOCK', 'FOOTER-BLOCK'
  ]);

  // ── Tooltip element (singleton) ───────────────────────────────────────────
  let tooltip = null;
  let hideTimer = null;

  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'gloss-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = `
      <div class="gloss-tooltip-inner">
        <div class="gloss-term-label"></div>
        <p class="gloss-definition"></p>
        <a class="gloss-more" href="#" target="_blank">See more →</a>
      </div>
    `;
    document.body.appendChild(tooltip);

    // Keep tooltip alive when hovered
    tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    tooltip.addEventListener('mouseleave', hideTooltip);
  }

  function showTooltip(anchor, termData) {
    clearTimeout(hideTimer);

    tooltip.querySelector('.gloss-term-label').textContent = termData.term;
    tooltip.querySelector('.gloss-definition').textContent = termData.definition;

    const moreLink = tooltip.querySelector('.gloss-more');
    if (termData.link) {
      moreLink.href = termData.link;
      moreLink.style.display = 'inline-flex';
    } else {
      moreLink.style.display = 'none';
    }

    // Position
    tooltip.style.opacity = '0';
    tooltip.style.display = 'block';
    positionTooltip(anchor);
    // Tiny delay so display:block registers before transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.classList.add('gloss-tooltip--visible');
      });
    });
  }

  function positionTooltip(anchor) {
    const rect = anchor.getBoundingClientRect();
    const ttW  = tooltip.offsetWidth  || 280;
    const ttH  = tooltip.offsetHeight || 120;
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top  = rect.bottom + scrollY + 10;
    let left = rect.left   + scrollX + rect.width / 2 - ttW / 2;

    // Flip above if too close to bottom
    if (rect.bottom + ttH + 20 > vh) {
      top = rect.top + scrollY - ttH - 10;
    }

    // Clamp horizontally
    left = Math.max(scrollX + 12, Math.min(left, scrollX + vw - ttW - 12));

    tooltip.style.top  = top  + 'px';
    tooltip.style.left = left + 'px';
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => {
      tooltip.classList.remove('gloss-tooltip--visible');
      tooltip.style.opacity = '0';
      setTimeout(() => { tooltip.style.display = 'none'; }, 200);
    }, 120);
  }

  // ── Text-node walker + wrapper ────────────────────────────────────────────
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildPattern(terms) {
    // Sort longest first so "Great Schism" matches before "Schism"
    const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
    const parts  = sorted.map(t => escapeRegex(t.term));
    return new RegExp(`\\b(${parts.join('|')})\\b`, 'gi');
  }

  function walkAndHighlight(node, pattern, lookup) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        // Text before match
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
        }

        const matched = match[0];
        const key     = matched.toLowerCase();
        const data    = lookup[key];

        const span = document.createElement('span');
        span.className = 'gloss-term' + (data && data.link ? ' gloss-term--linked' : '');
        span.textContent = matched;
        span.setAttribute('tabindex', '0');
        span.setAttribute('aria-describedby', 'gloss-tooltip');

        span.addEventListener('mouseenter', () => showTooltip(span, data));
        span.addEventListener('mouseleave', hideTooltip);
        span.addEventListener('focus',      () => showTooltip(span, data));
        span.addEventListener('blur',       hideTooltip);

        frag.appendChild(span);
        lastIdx = match.index + matched.length;
      }

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }

      node.parentNode.replaceChild(frag, node);
      return;
    }

    // Skip unwanted elements and already-processed spans
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_TAGS.has(node.tagName)) return;
      if (node.classList && node.classList.contains('gloss-term')) return;
    }

    // Walk children (copy to array first — DOM changes mid-walk break live NodeLists)
    Array.from(node.childNodes).forEach(child => walkAndHighlight(child, pattern, lookup));
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init(glossaryData) {
    if (!Array.isArray(glossaryData) || glossaryData.length === 0) return;

    // Build a lookup keyed by lowercase term
    const lookup = {};
    glossaryData.forEach(entry => {
      if (entry.term && entry.definition) {
        lookup[entry.term.toLowerCase()] = entry;
      }
    });

    const pattern = buildPattern(glossaryData.filter(e => e.term && e.definition));

    createTooltip();

    // Walk the main content area; fall back to body
    const root = document.querySelector('.all-content, .story, main, article') || document.body;
    walkAndHighlight(root, pattern, lookup);
  }

  // ── Fetch glossary + run after DOM is ready ───────────────────────────────
  function run() {
    
      if (document.querySelector('meta[name="glossary"][content="off"]') ) return;
    
    fetch(GLOSSARY_PATH)
      .then(r => {
        if (!r.ok) throw new Error('Glossary fetch failed: ' + r.status);
        return r.json();
      })
      .then(data => init(data))
      .catch(err => console.warn('[glossary.js]', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();

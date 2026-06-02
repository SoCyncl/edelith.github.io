/* ═══════════════════════════════════════════════════════════
   gallery-core.js
   Shared gallery logic for gallery.html and character pages.
   Exports: GalleryCore { fetchItems, buildLightbox, buildCard,
                          parseDate, dateToMs, CAT_LABEL, CAT_LABEL_SM }
═══════════════════════════════════════════════════════════ */

const GalleryCore = (() => {

  const CACHE_KEY      = 'gallery_json_cache_v1';
  const CACHE_TIME_KEY = 'gallery_json_cache_time_v1';
  const CACHE_LIFETIME = 1000 * 60 * 60 * 24; // 24 hours

  const CAT_LABEL = {
    illustration: 'Illustration',
    doodle:       'Doodle',
    render:       'Render',
    slander:      'Slander',
  };

  const CAT_LABEL_SM = {
    illustration: 'Illus.',
    doodle:       'Doodle',
    render:       'Render',
    slander:      'Slander',
  };

  /* ── Date helpers ─────────────────────────────────────── */
  function parseDate(str) {
    if (!str) return '—';
    const [year, day, month] = str.split('-');
    const d = new Date(+year, +month - 1, +day);
    return isNaN(d) ? str : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  function dateToMs(str) {
    if (!str) return 0;
    const [year, day, month] = str.split('-');
    return new Date(+year, +month - 1, +day).getTime() || 0;
  }

  /* ── Data fetching ────────────────────────────────────── */
  async function fetchItems() {
    try {
      const cached     = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const valid      = cached && cachedTime &&
                         (Date.now() - Number(cachedTime) < CACHE_LIFETIME);

      if (valid) {
        // Return cache immediately, refresh in background
        fetch('/data/gallery.json')
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(fresh => {
            localStorage.setItem(CACHE_KEY,      JSON.stringify(fresh));
            localStorage.setItem(CACHE_TIME_KEY, Date.now());
          })
          .catch(() => {});
        return JSON.parse(cached);
      }

      const res   = await fetch('/data/gallery.json');
      if (!res.ok) throw new Error(res.statusText);
      const items = await res.json();
      localStorage.setItem(CACHE_KEY,      JSON.stringify(items));
      localStorage.setItem(CACHE_TIME_KEY, Date.now());
      return items;

    } catch (e) {
      console.warn('gallery-core: fetch failed', e);
      const stale = localStorage.getItem(CACHE_KEY);
      return stale ? JSON.parse(stale) : [];
    }
  }

  /* ── Category badge HTML ──────────────────────────────── */
  function catBadge(cat, { prefix = 'glb', small = false } = {}) {
    const label = small ? (CAT_LABEL_SM[cat] || cat) : (CAT_LABEL[cat] || cat);
    return `<span class="${prefix}-tag ${prefix}-tag--${cat}">${label}</span>`;
  }

  /* ── Lightbox DOM builder ─────────────────────────────── */
  // prefix: css class prefix, e.g. 'glb' → '.glb-overlay', 'csg-glb' → '.csg-glb-overlay'
  // Returns: { overlay (element), open(items, index), close(), populate(index) }
  function buildLightbox({ prefix = 'glb', showChars = false } = {}) {
    const p   = prefix;
    const el  = id => document.getElementById(`${p}-${id}`);

    const overlay = document.createElement('div');
    overlay.id        = `${p}-overlay`;
    overlay.className = `${p}-overlay`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');

    overlay.innerHTML = `
      <button class="${p}-close" id="${p}-close" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <button class="${p}-nav ${p}-nav--prev" id="${p}-prev" aria-label="Previous">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="${p}-nav ${p}-nav--next" id="${p}-next" aria-label="Next">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <div class="${p}-inner" id="${p}-inner">
        <div class="${p}-img-wrap">
          <img class="${p}-img" id="${p}-img" src="" alt="">
          <div class="${p}-img-loader" id="${p}-loader">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
          </div>
        </div>
        <div class="${p}-meta" id="${p}-meta">
          <div class="${p}-meta-top">
            <div class="${p}-tags"    id="${p}-tags"></div>
            <div class="${p}-counter" id="${p}-counter"></div>
          </div>
          <h2 class="${p}-title"   id="${p}-title"></h2>
          <div class="${p}-caption" id="${p}-caption"></div>
          <div class="${p}-details">
            <div class="${p}-detail-row">
              <span class="${p}-detail-label"><i class="fa-solid fa-paintbrush"></i> Artist</span>
              <span class="${p}-detail-val" id="${p}-artist"></span>
            </div>
            <div class="${p}-detail-row">
              <span class="${p}-detail-label"><i class="fa-regular fa-calendar"></i> Date</span>
              <span class="${p}-detail-val" id="${p}-date"></span>
            </div>
          </div>
          ${showChars ? `<div class="${p}-chars" id="${p}-chars"></div>` : ''}
          <div class="${p}-share-row">
            <a class="${p}-raw-link" id="${p}-raw-link" target="_blank" rel="noopener">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> View full image
            </a>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    let items = [];
    let index = 0;

    function populate(i) {
      const item   = items[i];
      const img    = el('img');
      const loader = el('loader');
      if (!item || !img) return;

      img.classList.add(`${p}-img--loading`);
      loader.classList.add(`${p}-img-loader--active`);

      const src = item.full || item.thumbnail;
      const tmp = new Image();
      tmp.onload = () => {
        img.src = src; img.alt = item.title || '';
        requestAnimationFrame(() => {
          img.classList.remove(`${p}-img--loading`);
          loader.classList.remove(`${p}-img-loader--active`);
        });
      };
      tmp.onerror = () => {
        img.classList.remove(`${p}-img--loading`);
        loader.classList.remove(`${p}-img-loader--active`);
      };
      tmp.src = src;

      el('title').textContent  = item.title  || 'Untitled';
      el('artist').textContent = item.artist || '—';
      el('date').textContent   = parseDate(item.date);
      el('raw-link').href      = item.full   || item.thumbnail;

      const cap = el('caption');
      cap.textContent   = item.caption || '';
      cap.style.display = item.caption ? 'block' : 'none';

      const cat = item.category || 'illustration';
      el('tags').innerHTML    = catBadge(cat, { prefix: p });
      el('counter').textContent = `${i + 1} / ${items.length}`;
      el('prev').style.opacity  = i > 0                 ? '1' : '0.2';
      el('next').style.opacity  = i < items.length - 1  ? '1' : '0.2';

      if (showChars && el('chars')) {
        const chars = item.characters || [];
        el('chars').innerHTML = chars.length
          ? `<div class="${p}-chars-label">
               <i class="fa-solid fa-masks-theater fa-xs"></i> Characters
             </div>
             <div class="${p}-chars-list">
               ${chars.map(ch => {
                 const slug = ch.toLowerCase().replace(/\s+/g, '-');
                 return `<a href="/characters/index.html?data=${slug}.json" class="${p}-char-link">
                   ${ch} <i class="fa-solid fa-arrow-right fa-xs"></i>
                 </a>`;
               }).join('')}
             </div>`
          : '';
      }
    }

    function open(newItems, i) {
      items = newItems;
      index = i;
      populate(i);
      overlay.classList.add(`${p}-overlay--active`);
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove(`${p}-overlay--active`);
      document.body.style.overflow = '';
    }

    // Wire up controls
    el('close').addEventListener('click', close);
    el('prev').addEventListener('click', e => {
      e.stopPropagation();
      if (index > 0) { populate(--index); }
    });
    el('next').addEventListener('click', e => {
      e.stopPropagation();
      if (index < items.length - 1) { populate(++index); }
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains(`${p}-overlay--active`)) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft'  && index > 0)                  populate(--index);
      if (e.key === 'ArrowRight' && index < items.length - 1)   populate(++index);
    });

    let touchStartX = 0;
    el('inner').addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    el('inner').addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0 && index < items.length - 1) populate(++index);
      if (dx > 0 && index > 0)                populate(--index);
    }, { passive: true });

    return { overlay, open, close, populate: i => { index = i; populate(i); } };
  }

  /* ── Card builder ─────────────────────────────────────── */
  // Returns a DOM element. onClick receives (item, index, allItems).
  function buildCard(item, index, { onClick, cardClass = 'gal-card', prefix = 'gal' } = {}) {
    const cat         = item.category || 'illustration';
    const charClasses = (item.characters || [])
      .map(c => 'char-' + c.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      .join(' ');

    const div = document.createElement('div');
    div.className      = `${cardClass} cat-${cat} ${charClasses}`;
    div.dataset.index  = index;
    div.dataset.chars  = (item.characters || []).map(c => c.toLowerCase()).join('|');

    div.innerHTML = `
      <div class="${prefix}-card-img-wrap">
        <img class="${prefix}-card-placeholder" src="" alt="" aria-hidden="true">
        <img class="${prefix}-card-img"
             data-src="${(item.thumbnail || item.full).replace(/"/g, '&quot;')}"
             alt="${(item.title || '').replace(/"/g, '&quot;')}">
        <div class="${prefix}-card-hover">
          <span class="${prefix}-card-hover-title">${item.title || 'Untitled'}</span>
          <span class="${prefix}-card-hover-artist">${item.artist || ''}</span>
          <i class="fa-solid fa-expand ${prefix}-card-hover-icon"></i>
        </div>
        <span class="${prefix}-card-cat ${prefix}-card-cat--${cat}">
          ${CAT_LABEL_SM[cat] || cat}
        </span>
      </div>`;

    if (onClick) div.addEventListener('click', () => onClick(item, index));
    return div;
  }

  /* ── Lazy image loader for a card (after Isotope/append) ─ */
  function loadCardImage(card, { prefix = 'gal', onLoad } = {}) {
    const img = card.querySelector(`.${prefix}-card-img[data-src]`);
    if (!img) return;
    const src = img.dataset.src;
    delete img.dataset.src;
    const tmp = new Image();
    tmp.onload = () => {
      img.src = src;
      img.closest(`.${prefix}-card-img-wrap`).classList.add('img-loaded');
      if (onLoad) onLoad();
    };
    tmp.onerror = () => {
      img.closest(`.${prefix}-card-img-wrap`).classList.add('img-loaded');
    };
    tmp.src = src;
  }

  return {
    fetchItems,
    buildLightbox,
    buildCard,
    loadCardImage,
    parseDate,
    dateToMs,
    CAT_LABEL,
    CAT_LABEL_SM,
  };
})();

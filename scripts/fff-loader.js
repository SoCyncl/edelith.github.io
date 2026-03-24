/**
 * ═══════════════════════════════════════════════════════════════
 *  fff-loader.js  ·  Solstitheo Archives
 *  Renders Fun Fact Friday cards from /data/fff-entries.json
 *
 *  ── FULL PAGE (fun-fact-friday.html) ───────────────────────────
 *  Requires: jQuery, Isotope
 *
 *    FFFLoader.initFullPage({
 *      gridId:    'fffGrid',
 *      filtersId: 'fffFilters',
 *      sortId:    'fffSort',
 *      dataUrl:   '/data/fff-entries.json'
 *    });
 *
 *  ── EMBED ON ANY OTHER PAGE ────────────────────────────────────
 *  Only needs this script (no jQuery / Isotope required).
 *
 *    FFFLoader.embed({
 *      containerId: 'myContainer',
 *      filter: 'solstithean',     // category string, array, or '*' for all
 *      limit: 3,                  // optional cap
 *      dataUrl: '/data/fff-entries.json'
 *    });
 *
 * ═══════════════════════════════════════════════════════════════
 */

const FFFLoader = (() => {

  // ── Build a single card element ──────────────────────────────
  function buildCard(entry) {
    const categoryClasses = entry.categories.join(' ');
    const tagsHTML = entry.tags.map(t => `<span class="news-tag">${t}</span>`).join('');

    const outer = document.createElement('div');
    outer.className = `grid-item ${categoryClasses}`;
    outer.setAttribute('data-date', entry.date);
    outer.innerHTML = `
      <a href="${entry.link}" class="news-card-link">
        <div class="news-card">
          <img src="${entry.img}" alt="${entry.title}" loading="lazy" width="400" height="243">
          <div class="news-content">
            <h5 class="news-author">${entry.author}</h5>
            <h3 class="news-title">${entry.title}</h3>
            <div class="news-meta">
              ${tagsHTML}
              <span class="news-date">${entry.displayDate}</span>
            </div>
          </div>
        </div>
      </a>`;
    return outer;
  }

  // ── Fetch JSON helper ─────────────────────────────────────────
  async function fetchEntries(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fff-loader: could not load ${url} (${res.status})`);
    return res.json();
  }

  // ── FULL PAGE MODE (with Isotope) ────────────────────────────
  async function initFullPage(opts = {}) {
    const cfg = Object.assign({
      gridId:    'fffGrid',
      filtersId: 'fffFilters',
      sortId:    'fffSort',
      dataUrl:   '/data/fff-entries.json'
    }, opts);

    let entries;
    try {
      entries = await fetchEntries(cfg.dataUrl);
    } catch (e) {
      console.error('[FFFLoader] Failed to load entry data:', e);
      const grid = document.getElementById(cfg.gridId);
      if (grid) grid.innerHTML = '<p style="color:#937341;padding:40px;text-align:center;letter-spacing:2px;">Could not load entries.<br>Check the console for details.</p>';
      return;
    }

    const $grid = $(`#${cfg.gridId}`);
    entries.forEach(e => $grid.append(buildCard(e)));

    // Isotope — date strings sort correctly as ISO format (YYYY-MM-DD)
    const iso = $grid.isotope({
      itemSelector: '.grid-item',
      layoutMode: 'fitRows',
      getSortData: {
        date: el => el.getAttribute('data-date')
      },
      sortBy: 'date',
      sortAscending: false
    });

    // ── Filter buttons ──────────────────────────────────────────
    $(`#${cfg.filtersId}`).on('click', '.fff-filter-btn', function () {
      iso.isotope({ filter: $(this).attr('data-filter') });
      $(`#${cfg.filtersId} .fff-filter-btn`).removeClass('active');
      $(this).addClass('active');
    });

    // ── Sort buttons ────────────────────────────────────────────
    $(`#${cfg.sortId}`).on('click', '.fff-sort-btn', function () {
      iso.isotope({ sortAscending: $(this).attr('data-sort') === 'oldest' });
      $(`#${cfg.sortId} .fff-sort-btn`).removeClass('active');
      $(this).addClass('active');
    });
  }

  // ── EMBED MODE ───────────────────────────────────────────────
  async function embed(opts = {}) {
    const cfg = Object.assign({
      containerId: null,
      filter: '*',
      limit: null,
      dataUrl: '/data/fff-entries.json'
    }, opts);

    if (!cfg.containerId) { console.warn('fff-loader embed: containerId is required'); return; }
    const container = document.getElementById(cfg.containerId);
    if (!container) { console.warn(`fff-loader embed: #${cfg.containerId} not found`); return; }

    let entries;
    try {
      entries = await fetchEntries(cfg.dataUrl);
    } catch (e) {
      console.error('[FFFLoader] embed fetch failed:', e);
      return;
    }

    const filters = cfg.filter === '*' ? null
      : (Array.isArray(cfg.filter) ? cfg.filter : [cfg.filter]);

    let filtered = filters
      ? entries.filter(e => filters.some(f => e.categories.includes(f)))
      : entries;

    if (cfg.ids) {
      const idList = Array.isArray(cfg.ids) ? cfg.ids : [cfg.ids];
      filtered = idList.map(id => filtered.find(c => c.id === id)).filter(Boolean);
    }

    // Default embed sort: newest first
    filtered = filtered.sort((a, b) => b.date.localeCompare(a.date));

    if (cfg.limit) filtered = filtered.slice(0, cfg.limit);

    filtered.forEach(e => container.appendChild(buildCard(e)));
  }

  return { initFullPage, embed };

})();

/**
 * ═══════════════════════════════════════════════════════════════
 *  char-loader.js  ·  Solstitheo Archives
 *  Renders character cards from /data/characters.json
 *
 *  ── FULL PAGE (characters/index.html) ──────────────────────────
 *  Requires: jQuery, imagesLoaded, isotope
 *
 *    CharLoader.initFullPage({
 *      gridId:    'charGrid',       // id of the .character-select container
 *      filtersId: 'charFilters',    // id of the filter button group
 *      sortId:    'charSort',       // id of the sort button group
 *      searchId:  'charSearch',     // id of the search <input>
 *      clearId:   'charSearchClear' // id of the clear <button>
 *    });
 *
 *  ── EMBED ON ANY OTHER PAGE ────────────────────────────────────
 *  Only needs this script (no jQuery / isotope required).
 *
 *    CharLoader.embed({
 *      containerId: 'myContainer',  // id of any <div> on the page
 *      filter: 'main',              // category string OR array e.g. ['main','bjornguard']
 *                                   // omit / pass '*' for all characters
 *      limit: 4,                    // optional: max cards to show
 *      dataUrl: '/data/characters.json'  // path to JSON (default shown)
 *    });
 *
 * ═══════════════════════════════════════════════════════════════
 */

const CharLoader = (() => {

  const ARROW_SVG = `
    <svg viewBox="0 0 162 70.28">
      <circle cx="31.57" cy="35.21" r="11.57"></circle>
      <g>
        <polygon points="124.18,70.39 118.31,64.09 149.37,35.22 118.31,6.35 124.18,0.05 162,35.22"></polygon>
        <rect x="84.61" y="29.76" width="65" height="11.06"></rect>
      </g>
    </svg>`;

  // ── Build a single card element ──────────────────────────────
  function buildCard(char) {
    const categoryClasses = char.categories.join(' ');
    const href = char.link || '#';
    const tag  = char.link ? 'a' : 'div';
    const linkAttrs = char.link
      ? `href="${char.link}"`
      : '';

    const outer = document.createElement('div');
    outer.className = `char ${categoryClasses}`;
    outer.innerHTML = `
      <${tag} class="card" ${linkAttrs}
        data-name="${char.name}"
        data-date="${char.date}"
        data-bg="${char.bg}"
        data-id="${char.id}"
        ${char.link ? '' : 'style="cursor:default"'}>
        <div class="bg" style="background-image:url('${char.bg}')"></div>
        <div class="card-info">
          <div class="card-info-section">
            <div class="card-info__faction">
              <div class="card-info__name">${char.name}</div>
              <div class="card-info__region">${char.race}</div>
            </div>
          </div>
          <div class="see-more">
            ${char.link ? 'Explore' : 'Profile'}
            <div class="arrow">${ARROW_SVG}</div>
          </div>
        </div>
      </${tag}>`;
    return outer;
  }

  // ── Fetch JSON helper (works everywhere) ─────────────────────
  async function fetchChars(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`char-loader: could not load ${url} (${res.status})`);
    return res.json();
  }

  // ── FULL PAGE MODE (with Isotope) ────────────────────────────
  async function initFullPage(opts = {}) {
    const cfg = Object.assign({
      gridId:    'charGrid',
      filtersId: 'charFilters',
      sortId:    'charSort',
      searchId:  'charSearch',
      clearId:   'charSearchClear',
      dataUrl:   '/data/characters.json'
    }, opts);

    // ── Fetch with visible error handling ──────────────────────
    let chars;
    try {
      chars = await fetchChars(cfg.dataUrl);
    } catch (e) {
      console.error('[CharLoader] Failed to load character data:', e);
      const grid = document.getElementById(cfg.gridId);
      if (grid) grid.innerHTML = '<p style="color:#937341;padding:40px;text-align:center;letter-spacing:2px;">Could not load character data.<br>Check the console for details.</p>';
      return;
    }

    const $grid = $(`#${cfg.gridId}`);

    // ── Render all cards ────────────────────────────────────────
    const $items = $();
    chars.forEach(c => {
      const el = buildCard(c);
      $grid.append(el);
      $items.push(el); // collect for Isotope
    });

    // ── Init Isotope directly (no imagesLoaded needed — card
    //    images are CSS background-image, not <img> elements) ───
    const iso = $grid.isotope({
      itemSelector: '.char',
      layoutMode: 'fitRows',
      transitionDuration: '0.4s',
      sortAscending: false,
      getSortData: {
        name: el => $(el).find('.card-info__name').text().toLowerCase(),
        date: el => parseInt($(el).find('.card').attr('data-date'), 10) || 0
      },
      sortBy: 'date'
    });

    let activeFilter = '*';
    let searchQuery  = '';

    function applyFilters() {
      iso.isotope({
        filter: function () {
          const $el    = $(this);
          const name   = $el.find('.card-info__name').text().toLowerCase();
          const region = $el.find('.card-info__region').text().toLowerCase();
          const matchQ = !searchQuery || name.includes(searchQuery) || region.includes(searchQuery);
          const matchF = activeFilter === '*' || $el.is(activeFilter);
          return matchQ && matchF;
        }
      });
    }

    // ── Filter buttons ──────────────────────────────────────────
    $(`#${cfg.filtersId}`).on('click', '.fff-filter-btn', function () {
      activeFilter = $(this).attr('data-filter');
      applyFilters();
      $(`#${cfg.filtersId} .fff-filter-btn`).removeClass('active');
      $(this).addClass('active');
    });

    // ── Sort buttons ────────────────────────────────────────────
    $(`#${cfg.sortId}`).on('click', '.fff-sort-btn', function () {
      const sortBy  = $(this).attr('data-sort');
      const sortAsc = $(this).attr('data-order') === 'asc';
      iso.isotope({ sortBy, sortAscending: sortAsc });
      $(`#${cfg.sortId} .fff-sort-btn`).removeClass('active');
      $(this).addClass('active');
    });

    // ── Search ──────────────────────────────────────────────────
    let timer;
    $(`#${cfg.searchId}`).on('input', function () {
      clearTimeout(timer);
      const val = $(this).val().trim().toLowerCase();
      timer = setTimeout(() => {
        searchQuery = val;
        applyFilters();
        $(`#${cfg.clearId}`).toggleClass('visible', val.length > 0);
      }, 160);
    });

    $(`#${cfg.clearId}`).on('click', function () {
      $(`#${cfg.searchId}`).val('').trigger('input').focus();
    });
  }

  // ── EMBED MODE (no jQuery / Isotope needed) ──────────────────
async function embed(opts = {}) {
    const cfg = Object.assign({
      containerId: null,
      filter: '*',
      limit: null,
      dataUrl: '/data/characters.json'
    }, opts);

    if (!cfg.containerId) {
      console.warn('char-loader embed: containerId is required');
      return;
    }

    const container = document.getElementById(cfg.containerId);
    if (!container) {
      console.warn(`char-loader embed: element #${cfg.containerId} not found`);
      return;
    }

    const chars = await fetchChars(cfg.dataUrl);

    // Resolve filter to an array
    const filters = cfg.filter === '*'
      ? null
      : (Array.isArray(cfg.filter) ? cfg.filter : [cfg.filter]);

    let filtered = filters
      ? chars.filter(c => filters.some(f => c.categories.includes(f)))
      : chars;

    if (cfg.shuffle) filtered = filtered.sort(() => Math.random() - 0.5);
  
    if (cfg.limit) filtered = filtered.slice(0, cfg.limit);


    if (cfg.limit) filtered = filtered.slice(0, cfg.limit);

    filtered.forEach(c => container.appendChild(buildCard(c)));
  }

  return { initFullPage, embed };

})();

class NavbarTransparent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Josefin+Sans:wght@300;400&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
          font-size: 0.7rem;
        }

        /* ── SHELL ── */
        .navbar {
          position: fixed;
          top: 0; left: 0; width: 100%;
          padding: 15px 30px;
          background: transparent;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 999999999;
          transition: background 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-bottom: 1px solid transparent;
        }

        .navbar.scrolled {
          background: var(--void);
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          border-bottom-color: rgba(201, 168, 76, 0.18);
        }

        /* ── LOGO — Cinzel Decorative ── */
        .logo {
          font-family: 'Cinzel Decorative', serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 1.5px;
          color: var(--default-text);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.3s ease, text-shadow 0.3s ease;
          display: flex;
          align-items: center;
        }

        .logo::after {
          content: " ✦";
          font-size: 1.4em;
          color: rgba(201, 168, 76, 0.55);
          font-family: sans-serif;
          margin-left: 6px;
        }

        .logo:hover {
          color: #c9a84c;
          text-shadow: 0 0 16px rgba(201, 168, 76, 0.35);
        }

        /* ── NAV LINKS ── */
        .nav-links {
          display: flex;
          gap: 2px;
        }

        .nav-links a {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--default-text);
          font-size: 0.65rem;
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 400;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
          padding: 7px 10px;
          border-radius: 4px;
          position: relative;
          border: 1px solid transparent;
        }

        .nav-links a:hover {
          color: #c9a84c;
          background: rgba(201, 168, 76, 0.07);
          border-color: rgba(201, 168, 76, 0.2);
        }

        /* gold underline sweep */
        .nav-links a::after {
          content: "";
          position: absolute;
          bottom: 3px; left: 10px; right: 10px;
          height: 1px;
          background: #c9a84c;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .nav-links a:hover::after { transform: scaleX(1); }

        .nav-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          margin-right: 8px;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        /* ── SEARCH WRAPPER ── */
        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .bx-search {
          position: absolute;
          left: 13px;
          color: rgba(201, 168, 76, 0.55);
          font-size: 16px;
          pointer-events: none;
          z-index: 2;
          transition: color 0.2s ease;
        }

        .search-wrapper:focus-within .bx-search {
          color: rgba(201, 168, 76, 0.9);
        }

        /* ── SEARCH INPUT ── */
        .search-input {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: none;
          color: var(--default-text);
          outline: none;
          height: 34px;
          width: 300px;
          border: 1px solid rgba(201, 168, 76, 0.22);
          border-radius: 2px;
          background: rgba(22, 25, 29, 0.45);
          padding: 0 12px 0 36px;
          transition: border-color 0.3s ease, background 0.3s ease,
                      box-shadow 0.3s ease, width 0.4s ease;
        }

        .search-input::placeholder {
          color: rgba(112, 117, 122, 0.65);
          font-style: italic;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.65rem;
        }

        .search-input:focus {
          border-color: rgba(201, 168, 76, 0.55);
          background: rgba(22, 25, 29, 0.7);
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.09),
                      inset 0 1px 4px rgba(0,0,0,0.35);
          width: 360px;
        }

        /* ── RESULTS DROPDOWN ── */
        #search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0; right: 0;
          display: none;
          background: rgba(22, 25, 29, 0.97);
          border: 1px solid rgba(201, 168, 76, 0.22);
          border-top: 2px solid rgba(201, 168, 76, 0.5);
          padding: 5px 0;
          z-index: 10001;
          box-shadow: 0 14px 36px rgba(0,0,0,0.7);
          border-radius: 0 0 2px 2px;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        /* decorative corner clip */
        #search-results::after {
          content: "";
          position: absolute;
          top: 0; right: 0;
          width: 14px; height: 14px;
          background: rgba(201, 168, 76, 0.12);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          pointer-events: none;
        }

        #search-results li {
          list-style: none;
          margin: 0; padding: 0;
        }

        #search-results li a {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 9px 14px;
          color: var(--default-text);
          text-decoration: none;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          line-height: 1.55;
          border-bottom: 1px solid rgba(201, 168, 76, 0.06);
          transition: color 0.2s ease, background 0.2s ease, padding-left 0.2s ease;
          background: transparent !important;
        }

        #search-results li a .result-text {
          flex: 1;
          min-width: 0;
          white-space: normal;
          word-break: break-word;
        }

        #search-results li a:hover,
        #search-results li.highlighted a {
          color: #c9a84c !important;
          background: rgba(201, 168, 76, 0.06) !important;
          padding-left: 20px !important;
        }

        #search-results li a i {
          font-size: 15px;
          color: rgba(201, 168, 76, 0.5);
          flex-shrink: 0;
        }

        .search-result-image {
          width: 32px;
          height: 32px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .search-highlight {
          color: #c9a84c;
          font-weight: 600;
        }

        .no-results {
          padding: 10px 14px;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(112, 117, 122, 0.6);
          font-style: italic;
          text-align: center;
          list-style: none;
        }

        /* ── MOBILE ── */
        .menu-toggle {
          display: none;
          font-size: 24px;
          color: var(--default-text);
          cursor: pointer;
          border: 1px solid rgba(201, 168, 76, 0.2);
          padding: 3px 5px;
          transition: color 0.2s, border-color 0.2s;
        }
        .menu-toggle:hover {
          color: #c9a84c;
          border-color: rgba(201, 168, 76, 0.5);
        }

        @media (max-width: 768px) {
          .nav-links {
            position: fixed;
            top: 70px; left: 0; width: 100%;
            background: var(--nav-bg);
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
            gap: 6px;
            transform: translateY(-150%);
            transition: transform 0.3s ease;
            z-index: 999999998;
          }
          .nav-links.active { transform: translateY(0); }
          .nav-links a {
            border-radius: 0;
            border-left: 2px solid transparent;
            width: 100%;
          }
          .nav-links a:hover { border-left-color: #c9a84c; }
          .nav-links a::after { display: none; }
          .menu-toggle { display: block; }
          .search-input { width: 150px; }
          .search-input:focus { width: 200px; }
        }

        @keyframes singleFlip {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
      </style>

      <nav class="navbar">
        <a href="/" class="logo">Edelith.org</a>

        <div class="nav-links">
          <a href="/">
            <img src="/assets/img/homepage/Biblio_yellow.png" class="nav-icon" alt="Homepage">
            <span>Homepage</span>
          </a>
          <a href="/quill-and-terms.html">
            <img src="/assets/img/homepage/Biblio_brown.png" class="nav-icon" alt="Quill & Terms">
            <span>Quill &amp; Terms</span>
          </a>
          <a href="/characters/index.html">
            <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Characters">
            <span>Characters</span>
          </a>
          <a href="/recap.html">
            <img src="/assets/img/homepage/Biblio_blue.png" class="nav-icon" alt="Recap">
            <span>Recap</span>
          </a>
          <a href="/fun-fact-friday.html">
            <img src="/assets/img/homepage/Biblio_red.png" class="nav-icon" alt="Fun Fact Friday">
            <span>Fun Fact Friday</span>
          </a>
          <a href="/edelithle.html">
            <img src="/assets/img/homepage/Biblio_purple.png" class="nav-icon" alt="Edelitle">
            <span>Edelithle</span>
          </a>
          <a href="/regions/index.html">
            <img src="/assets/img/homepage/Biblio_orange.png" class="nav-icon" alt="Regions">
            <span>Regions</span>
          </a>
          <a href="/shop.html">
            <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Shop">
            <span>Shop</span>
          </a>
          <a href="stocks.edelith.org">
            <img src="/assets/img/homepage/Biblio_green.png" class="nav-icon" alt="Stocks">
            <span>Edel Exchange</span>
          </a>
        </div>

        <div class="search-wrapper">
          <i class='bx bx-search'></i>
          <input type="text" id="search-input" class="search-input" placeholder="Search the archive…">
          <ul id="search-results"></ul>
        </div>

        <i class='bx bx-menu menu-toggle'></i>
      </nav>
    `;
  }

  connectedCallback() {
    const shadow           = this.shadowRoot;
    const navbar           = shadow.querySelector(".navbar");
    const searchInput      = shadow.querySelector("#search-input");
    const resultsContainer = shadow.querySelector("#search-results");
    const menuToggle       = shadow.querySelector(".menu-toggle");
    const navLinks         = shadow.querySelector(".nav-links");

    /* ── Search ── */
    let searchData = [];
    fetch('/search-data.json')
      .then(r => r.json())
      .then(d => { searchData = d; })
      .catch(e => console.error('Search data error:', e));

    const highlight = (text, q) => {
      if (!q) return text;
      return text.replace(new RegExp(`(${q})`, 'gi'),
        '<span class="search-highlight">$1</span>');
    };

    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      resultsContainer.innerHTML = '';

      if (!q) { resultsContainer.style.display = 'none'; return; }

      const hits = searchData.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.keywords && i.keywords.toLowerCase().includes(q))
      ).slice(0, 8);

      resultsContainer.style.display = 'block';

      if (!hits.length) {
        const li = document.createElement('li');
        li.className = 'no-results';
        li.textContent = 'No results found';
        resultsContainer.appendChild(li);
        return;
      }

      hits.forEach(item => {
        const li   = document.createElement('li');
        const icon = item.image
          ? `<img src="${item.image}" class="search-result-image" alt="${item.title}">`
          : `<i class='bx ${item.icon || 'bx-file-blank'}'></i>`;
        li.innerHTML = `<a href="${item.url}">${icon}<span class="result-text">${highlight(item.title, q)}</span></a>`;
        resultsContainer.appendChild(li);
      });
    });

    document.addEventListener('click', e => {
      if (!shadow.querySelector('.search-wrapper').contains(e.target))
        resultsContainer.style.display = 'none';
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0)
        resultsContainer.style.display = 'block';
    });

    /* keyboard nav */
    searchInput.addEventListener('keydown', e => {
      const items = resultsContainer.querySelectorAll('li:not(.no-results)');
      if (!items.length) return;
      let idx = -1;
      items.forEach((li, i) => { if (li.classList.contains('highlighted')) idx = i; });

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items.forEach(li => li.classList.remove('highlighted'));
        idx = e.key === 'ArrowDown'
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
        items[idx].classList.add('highlighted');
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        const hi = resultsContainer.querySelector('li.highlighted a');
        if (hi) hi.click();
      } else if (e.key === 'Escape') {
        resultsContainer.style.display = 'none';
        searchInput.blur();
      }
    });

    resultsContainer.style.display = 'none';

    /* ── Mobile menu ── */
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('bx-x');
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('bx-x');
      })
    );

    /* ── Scroll state (original threshold preserved) ── */
    const setScroll = () =>
      navbar.classList.toggle('scrolled', window.scrollY > 400);
    window.addEventListener('scroll', setScroll, { passive: true });
    setScroll();

    /* ── Icon flip sequence (original logic preserved exactly) ── */
    const navIcons       = shadow.querySelectorAll('.nav-icon');
    let currentIcon      = 0;
    const flipDuration   = 400;
    const pauseBetween   = 200;
    const cyclePause     = 3000;

    function startFlipAnimation() {
      if (!navIcons.length) return;
      navIcons[currentIcon].style.transform = 'rotateY(0deg)';
      navIcons[currentIcon].style.animation = 'none';
      currentIcon = (currentIcon + 1) % navIcons.length;
      navIcons[currentIcon].style.animation = `singleFlip ${flipDuration}ms ease forwards`;
      setTimeout(() => {
        if (currentIcon === navIcons.length - 1)
          setTimeout(startFlipAnimation, cyclePause);
        else
          startFlipAnimation();
      }, flipDuration + pauseBetween);
    }

    setTimeout(startFlipAnimation, 1000);

    navIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => icon.style.animationPlayState = 'paused');
      icon.addEventListener('mouseleave', () => icon.style.animationPlayState = 'running');
    });
  }
}

customElements.define('transparent-navbar', NavbarTransparent);

// Inside header.js, at the bottom:
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/scripts/glossary.css">');
const s = document.createElement('script');
s.src = '/scripts/glossary.js';
document.head.appendChild(s);

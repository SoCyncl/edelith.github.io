class SidebarNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100%;
          width: 78px;
          background: var(--nav-bg);
          padding: 6px 14px;
          z-index: 999999999;
          transition: all 0.5s ease;
        }

        .sidebar.open {
          width: 250px;
        }

        .sidebar .logo-details {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .sidebar .logo-details .logo_name {
          color: var(--default-text);
          font-size: 20px;
          font-weight: 600;
          opacity: 0;
          transition: all 0.5s ease;
        }

        .sidebar.open .logo-details,
        .sidebar.open .logo-details .logo_name {
          opacity: 1;
        }

        .sidebar .logo-details #btn {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          font-size: 22px;
          text-align: center;
          cursor: pointer;
          transition: all 0.5s ease;
          color: var(--default-text);
        }

        .sidebar i {
          color: var(--default-text);
          height: 60px;
          min-width: 50px;
          font-size: 28px;
          text-align: center;
          line-height: 60px;
        }

        .sidebar .nav-list {
          margin-top: 20px;
          height: 100%;
        }

        .sidebar li {
          position: relative;
          margin: 8px 0;
          list-style: none;
        }

        .sidebar .search-wrapper {
          position: relative;
          z-index: 10000;
        }

        .sidebar input {
          font-size: 15px;
          color: var(--default-text);
          font-weight: 400;
          outline: none;
          height: 50px;
          width: 100%;
          border: none;
          border-radius: 12px;
          transition: all 0.5s ease;
          background: var(--box-bg);
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar input::placeholder {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        .sidebar input:focus {
          border-color: var(--content-bg);
          background: var(--box-bg);
          box-shadow: 0 0 0 2px rgba(136, 250, 255, 0.2);
        }

        .sidebar.open input {
          padding: 0 20px 0 50px;
          width: 100%;
        }

        .sidebar .bx-search {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 22px;
          background: var(--box-bg);
          color: var(--default-text);
        }

        .sidebar .bx-search:hover {
          background: var(--default-text);
          color: var(--nav-bg);
        }

        .sidebar.open .bx-search:hover {
          background: var(--box-bg);
          color: var(--default-text);
        }

        .sidebar li i {
          height: 50px;
          line-height: 50px;
          font-size: 18px;
          border-radius: 12px;
        }

        .sidebar li a {
          display: flex;
          height: 100%;
          width: 100%;
          border-radius: 12px;
          align-items: center;
          text-decoration: none;
          transition: all 0.4s ease;
          background: var(--nav-bg);
          margin-bottom: 20px;
        }

        .sidebar li a:hover {
          background: var(--default-text);
        }

        .sidebar li a .links_name {
          color: var(--default-text);
          font-size: 15px;
          font-weight: 400;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: 0.4s;
        }

        .sidebar.open li a .links_name {
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar li a:hover .links_name,
        .sidebar li a:hover i {
          transition: all 0.5s ease;
          color: var(--nav-bg);
        }

        .sidebar li .tooltip {
          position: absolute;
          top: -20px;
          left: calc(100% + 15px);
          background: var(--default-text);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 15px;
          font-weight: 400;
          opacity: 0;
          white-space: nowrap;
          pointer-events: none;
          transition: 0s;
          color: var(--nav-bg);
        }

        .sidebar li:hover .tooltip {
          opacity: 1;
          pointer-events: auto;
          transition: all 0.4s ease;
          top: 50%;
          transform: translateY(-50%);
        }

        .sidebar.open li .tooltip {
          display: none;
        }

        .sidebar li.profile {
          position: fixed;
          height: 60px;
          width: 78px;
          left: 0;
          bottom: -8px;
          padding: 10px 14px;
          background: var(--box-bg);
          transition: all 0.5s ease;
          overflow: hidden;
        }

        .sidebar.open li.profile {
          width: 250px;
        }

        .sidebar li .profile-details {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
        }

        .sidebar li img {
          height: 45px;
          width: 45px;
          object-fit: contain;
          border-radius: 6px;
          margin-right: 10px;
        }

        .sidebar li.profile .name,
        .sidebar li.profile .job {
          font-size: 15px;
          font-weight: 400;
          color: var(--default-text);
          white-space: nowrap;
        }

        .sidebar li.profile .job {
          font-size: 12px;
        }

        .sidebar .profile #log_out {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          background: var(--box-bg);
          width: 100%;
          height: 60px;
          line-height: 60px;
          transition: all 0.5s ease;
          color: var(--default-text);
        }

        .sidebar.open .profile #log_out {
          width: 50px;
          background: none;
        }

        /* Search Results Dropdown - Kept from improved version */
        #search-results {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 100%;
          max-height: 300px;
          overflow-y: auto;
          display: none;
          background: var(--nav-bg);
          border-radius: 12px;
          padding: 8px;
          z-index: 10001;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #search-results::-webkit-scrollbar {
          width: 6px;
        }

        #search-results::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        #search-results::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        #search-results li {
          list-style: none;
          margin: 4px 0;
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        #search-results li a {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          color: var(--default-text);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        #search-results li a:hover {
          background: rgba(136, 250, 255, 0.2);
          transform: none;
          box-shadow: none;
        }

        #search-results li a i {
          font-size: 16px;
          margin-right: 10px;
          color: rgba(255, 255, 255, 0.7);
        }

        #search-results li.no-results {
          padding: 12px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          font-style: italic;
        }

        .search-highlight {
          color: #88faff;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .sidebar:not(.open) #search-results {
            display: none !important;
          }
          
          .sidebar.open {
            width: 280px;
          }
        }
        
        .search-result-image {
          width: 20px;
          height: 20px;
          object-fit: contain;
          margin-right: 10px;
          border-radius: 3px;
        }
        
        .bx-user::before {
          background-image: "url(assets/img/homepage/quill-and-terms.png);";
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
          margin-right: 13px;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          animation: none;
        }
        
        @keyframes singleFlip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        
        .sidebar:not(.open) .nav-icon {
          margin-right: 0;
          margin-left: 3px;
        }
        
        .sidebar li a:hover .nav-icon {
          filter: grayscale(0%) brightness(1);
          opacity: 1;
          transform: translateY(-2px);
          animation: none;
        }
        
        @keyframes gentlePulse {
          0%, 100% {
            transform: translateY(-3px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .sidebar:not(.open) .nav-icon {
          margin-right: 0;
          margin-left: 3px;
        }
              
      
      </style>
      <div class="sidebar">
        <div class="logo-details">
          <div class="logo_name">Edelith.org</div>
          <i class='bx bx-menu' id="btn"></i>
        </div>
        <ul class="nav-list">
          <li class="search-wrapper">
            <i class='bx bx-search'></i>
            <input type="text" id="search-input" placeholder="Search...">
            <ul id="search-results"></ul>
            <span class="tooltip">Search</span>
            
          <li>
            <a href="/index.html">
              <img src="/assets/img/homepage/Biblio_yellow.png" class="nav-icon" alt="Homepage">
              <span class="links_name">Homepage</span>
            </a>
            <span class="tooltip">Homepage</span>
          </li>
          <li>
            <a href="/quill-and-terms">
              <img src="/assets/img/homepage/Biblio_brown.png" class="nav-icon" alt="Quill & Terms">
              <span class="links_name">Quill & Terms</span>
            </a>
            <span class="tooltip">Quill & Terms</span>
          </li>
          <li>
            <a href="/characters/index.html">
              <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Characters">
              <span class="links_name">Characters</span>
            </a>
            <span class="tooltip">Characters</span>
          </li>
          <li>
            <a href="/recap">
              <img src="/assets/img/homepage/Biblio_blue.png" class="nav-icon" alt="Recap">
              <span class="links_name">Recap</span>
            </a>
            <span class="tooltip">Recap</span>
          </li>
          <li>
            <a href="/fun-fact-friday">
              <img src="/assets/img/homepage/Biblio_red.png" class="nav-icon" alt="Fun Fact Friday">
              <span class="links_name">Fun Fact Friday</span>
            </a>
            <span class="tooltip">Fun Fact Friday</span>
          </li>
          <li>
            <a href="/beastiary/index.html">
              <img src="/assets/img/homepage/Biblio_purple.png" class="nav-icon" alt="Beastiary">
              <span class="links_name">Beastiary</span>
            </a>
            <span class="tooltip">Beastiary</span>
          </li>
          <li>
            <a href="/regions/index.html">
              <img src="/assets/img/homepage/Biblio_orange.png" class="nav-icon" alt="Regions">
              <span class="links_name">Regions</span>
            </a>
            <span class="tooltip">Regions</span>
          </li>
          <li>
            <a href="/info.html">
              <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Info">
              <span class="links_name">Info</span>
            </a>
            <span class="tooltip">Info</span>
          </li>

        </ul>
      </div>
    `;
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    const sidebar = shadow.querySelector(".sidebar");
    const closeBtn = shadow.querySelector("#btn");
    const searchBtn = shadow.querySelector(".bx-search");
    const searchInput = shadow.querySelector("#search-input");
    const resultsContainer = shadow.querySelector("#search-results");

    // Initialize search data
    let searchData = [];

    // Fetch search data
    fetch('/search-data.json')
      .then(res => res.json())
      .then(data => {
        searchData = data;
      })
      .catch(error => {
        console.error('Error loading search data:', error);
      });

    // Highlight matching text in search results
    const highlightText = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<span class="search-highlight">$1</span>');
    };

   // Search functionality
  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    resultsContainer.innerHTML = '';
  
    if (query.length === 0) {
      resultsContainer.style.display = 'none';
      return;
    }
  
    const results = searchData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.keywords && item.keywords.toLowerCase().includes(query))
    ).slice(0, 8); // limit to 8 suggestions
  
    resultsContainer.style.display = results.length > 0 ? 'block' : 'block';
  
    if (results.length === 0) {
      const noResults = document.createElement('li');
      noResults.className = 'no-results';
      noResults.textContent = 'No results found';
      resultsContainer.appendChild(noResults);
    } else {
      results.forEach(item => {
        const li = document.createElement('li');
        // Check if image exists in the item
        const iconContent = item.image 
          ? `<img src="${item.image}" class="search-result-image" alt="${item.title}">`
          : `<i class='bx ${item.icon || 'bx-file'}'></i>`;
        
        li.innerHTML = `
          <a href="${item.url}">
            ${iconContent}
            ${highlightText(item.title, query)}
          </a>
        `;
        resultsContainer.appendChild(li);
      });
    }
  });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
      if (!shadow.querySelector('.search-wrapper').contains(e.target)) {
        resultsContainer.style.display = 'none';
      }
    });

    // Show results when input is focused
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        resultsContainer.style.display = 'block';
      }
    });

    // Keyboard navigation for search results
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const results = resultsContainer.querySelectorAll('li');
        if (results.length === 0) return;
        
        let currentIndex = -1;
        results.forEach((result, index) => {
          if (result.classList.contains('highlighted')) {
            currentIndex = index;
            result.classList.remove('highlighted');
          }
        });
        
        if (e.key === 'ArrowDown') {
          currentIndex = (currentIndex + 1) % results.length;
        } else {
          currentIndex = (currentIndex - 1 + results.length) % results.length;
        }
        
        results[currentIndex].classList.add('highlighted');
        results[currentIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        const highlighted = resultsContainer.querySelector('li.highlighted');
        if (highlighted) {
          highlighted.querySelector('a').click();
        }
      }
    });

    // Initialize results container as hidden
    resultsContainer.style.display = 'none';

    // Sidebar toggle functionality
    const menuBtnChange = () => {
      if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
      } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
      }
    };

    closeBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtnChange();
    });

    searchBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtnChange();
      if (sidebar.classList.contains("open")) {
        searchInput.focus();
      }
    });

    menuBtnChange();
    
    
    // Sequential single flip animation
    const navIcons = shadow.querySelectorAll('.nav-icon');
    let currentIcon = 0;
    const flipDuration = 400; // milliseconds
    const pauseBetween = 200; // milliseconds between icons
    const cyclePause = 3000; // pause before restarting sequence
    
    function startFlipAnimation() {
      if (navIcons.length === 0) return;
      
      // Reset current icon
      navIcons[currentIcon].style.transform = 'rotateY(0deg)';
      navIcons[currentIcon].style.animation = 'none';
      
      // Animate next icon
      currentIcon = (currentIcon + 1) % navIcons.length;
      navIcons[currentIcon].style.animation = `singleFlip ${flipDuration}ms ease forwards`;
      
      // Schedule next flip or restart cycle
      setTimeout(() => {
        if (currentIcon === navIcons.length - 1) {
          setTimeout(startFlipAnimation, cyclePause);
        } else {
          startFlipAnimation();
        }
      }, flipDuration + pauseBetween);
    }
    
    // Start animation after initial delay
    setTimeout(startFlipAnimation, 1000);
    
    // Pause/resume on hover
    navIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        icon.style.animationPlayState = 'paused';
      });
      icon.addEventListener('mouseleave', () => {
        icon.style.animationPlayState = 'running';
      });
    });
  }
}

customElements.define('side-bar-nav', SidebarNav);

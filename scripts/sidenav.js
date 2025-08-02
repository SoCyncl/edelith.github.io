class NavbarTransparent extends HTMLElement {
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

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 15px 30px;
          background: transparent;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 999999999;
          transition: all 0.5s ease;
          backdrop-filter: blur(5px);
        }

        .navbar.scrolled {
          background: var(--nav-bg);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .logo {
          color: var(--default-text);
          font-size: 24px;
          font-weight: 600;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-links a {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--default-text);
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .nav-links a:hover {
          background: var(--default-text);
          color: var(--nav-bg);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          margin-right: 10px;
          transition: all 0.3s ease;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          font-size: 15px;
          color: var(--default-text);
          font-weight: 400;
          outline: none;
          height: 40px;
          width: 440px;
          border: none;
          border-radius: 20px;
          transition: all 0.5s ease;
          background: rgba(255, 255, 255, 0.1);
          padding: 0 15px 0 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          left: -60px
        }

        .search-input:focus {
          border-color: var(--content-bg);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 2px rgba(136, 250, 255, 0.2);
        }

        .bx-search {
          position: absolute;
          left: 15px;
          color: var(--default-text);
          font-size: 18px;
        }

        #search-results {
          position: absolute;
          top: calc(100% + 10px);
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
          background: transparent !important;
        }

        #search-results li a:hover {
          background: rgba(136, 250, 255, 0.2) !important;
        }

        #search-results li a i {
          font-size: 16px;
          margin-right: 10px;
          color: rgba(255, 255, 255, 0.7);
        }

        .search-highlight {
          color: #88faff;
          font-weight: 500;
        }

        .search-result-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
          margin-right: 10px;
          border-radius: 3px;
        }

        .menu-toggle {
          display: none;
          font-size: 24px;
          color: var(--default-text);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: var(--nav-bg);
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
            gap: 15px;
            transform: translateY(-150%);
            transition: transform 0.3s ease;
            z-index: 999999998;
          }

          .nav-links.active {
            transform: translateY(0);
          }

          .menu-toggle {
            display: block;
          }

          .search-input {
            width: 150px;
          }
        }

        /* Animation styles */
        @keyframes singleFlip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
      </style>
      <nav class="navbar">
        <a href="/home.html" class="logo">Edelith.org</a>
        
        <div class="nav-links">
          <a href="/index.html">
            <img src="/assets/img/homepage/Biblio_yellow.png" class="nav-icon" alt="Homepage">
            <span>Homepage</span>
          </a>
          <a href="/quill-and-terms">
            <img src="/assets/img/homepage/Biblio_brown.png" class="nav-icon" alt="Quill & Terms">
            <span>Quill & Terms</span>
          </a>
          <a href="/characters/index.html">
            <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Characters">
            <span>Characters</span>
          </a>
          <a href="/recap">
            <img src="/assets/img/homepage/Biblio_blue.png" class="nav-icon" alt="Recap">
            <span>Recap</span>
          </a>
          <a href="/fun-fact-friday">
            <img src="/assets/img/homepage/Biblio_red.png" class="nav-icon" alt="Fun Fact Friday">
            <span>Fun Fact Friday</span>
          </a>
          <a href="/beastiary/index.html">
            <img src="/assets/img/homepage/Biblio_purple.png" class="nav-icon" alt="Beastiary">
            <span>Beastiary</span>
          </a>
          <a href="/regions/index.html">
            <img src="/assets/img/homepage/Biblio_orange.png" class="nav-icon" alt="Regions">
            <span>Regions</span>
          </a>
          <a href="/info">
            <img src="/assets/img/homepage/Biblio_gray.png" class="nav-icon" alt="Info">
            <span>Info</span>
          </a>
        </div>

        <div class="search-wrapper">
          <i class='bx bx-search'></i>
          <input type="text" id="search-input" class="search-input" placeholder="Search...">
          <ul id="search-results"></ul>
        </div>

        <i class='bx bx-menu menu-toggle'></i>
      </nav>
    `;
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    const navbar = shadow.querySelector(".navbar");
    const searchInput = shadow.querySelector("#search-input");
    const resultsContainer = shadow.querySelector("#search-results");
    const menuToggle = shadow.querySelector(".menu-toggle");
    const navLinks = shadow.querySelector(".nav-links");

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

    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('bx-x');
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('bx-x');
      });
    });

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Initialize scroll state
    if (window.scrollY > 400) {
      navbar.classList.add('scrolled');
    }

    // Icon animation
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

customElements.define('transparent-navbar', NavbarTransparent);

customElements.define('side-bar-nav', SidebarNav);

class Footer extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <div class="footer">
          2025
          <br>
          Created by Cyncl. Additional credits can be found <a href="/credits.html">here</a>.
          <br>
          <img src="/assets/img/homepage/biblio.gif" style="width: 80px;">
          <br>
          View count: <span id="hitcount">loading…</span>
          <br>
          Last Updated: <span id="lastupdate">loading…</span>
        </div>
      `;
  
      this.loadStats();
    }
  
    async loadStats() {
      try {
        const url = 'https://nekoweb.org/api/site/info/cyncl'; // ← change 'solstitheo' if needed
        const res = await fetch(url);
        const data = await res.json();
  
        // Format views with commas
        const formattedViews = data.views.toLocaleString();
        document.getElementById("hitcount").textContent = formattedViews;
  
        // Format last updated date
        const date = new Date(data.updated_at);
        const formattedDate = `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;
        document.getElementById("lastupdate").textContent = formattedDate;
  
      } catch (e) {
        document.getElementById("hitcount").textContent = "error";
        document.getElementById("lastupdate").textContent = "error";
      }
    }
  }
  
  customElements.define('footer-block', Footer);
  

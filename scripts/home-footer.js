class Footer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<style>
/* ═══════════════════════════════════════════
   FOOTER — self-contained
═══════════════════════════════════════════ */

/*
  CONTROL VARIABLES — edit these to tune the background:
  --sf-solar-height   : how tall the solar system bg peeks up (default 300px)
  --sf-solar-opacity  : opacity of the solar system layer ONLY —
                        change this without touching the true void background
*/
.sf {
  --sf-solar-height:  480px;  /* window height — increase if top arcs clip */
  --sf-solar-opacity: 0.6;   /* solar layer only, void bg unaffected */

  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--void, #16191d);
  border-top: 2px solid var(--gold-dim, #7a6030);
  font-family: var(--f-label, 'Josefin Sans', sans-serif);
}

/* ── shimmer rule ── */
.sf__rule {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gold-dim, #7a6030) 20%,
    var(--gold, #c9a84c) 50%,
    var(--gold-dim, #7a6030) 80%,
    transparent 100%
  );
  opacity: 0.55;
  position: relative;
  z-index: 2;
}

/* ═══════════════════════════════════════════
   SOLAR SYSTEM BACKGROUND
   — sits in an absolutely-positioned wrapper
     that is clipped by the footer's overflow:hidden.
   — height is controlled by --sf-solar-height so
     the footer never grows taller for this element.
   — --sf-solar-opacity controls only this layer;
     the void background beneath is unaffected.
═══════════════════════════════════════════ */
.sf__solar-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  /* height matches the variable — the solar system peeks up this far */
  height: var(--sf-solar-height, 300px);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  /* separate opacity so void background is untouched */
  opacity: var(--sf-solar-opacity, 0.78);
}

#sf-solarsystem {
  position: absolute;
  /*
    The sun centre sits at (left+210, top+210) within this div.
    We want the sun roughly centred horizontally and the orbit arcs
    to peek up from the bottom — so we position the whole group so
    its centre lands just below the footer's bottom edge.
    Tweak --sf-solar-height and this value together if needed.
  */
  bottom: 380px;  /* sun sits near footer bottom; raise toward 0 to show more */
  left: 50%;
  transform: translateX(-50%);
}

#sf-sun {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gold, #c9a84c);
  position: absolute;
  left: 210px;
  top: 210px;
  box-shadow: 0 0 30px rgba(201,168,76,0.6);
}

/* orbit rings */
.sf-planet {
  border: 1px dashed rgba(201,168,76,0.5);
  border-radius: 50%;
  position: absolute;
  animation: sf-orbit linear infinite;
}

#sf-mercury { width:160px; height:160px; left:170px; top:170px; animation-duration:7.23s; }
#sf-venus   { width:260px; height:260px; left:120px; top:120px; animation-duration:18.45s; }
#sf-earth   { width:360px; height:360px; left:70px;  top:70px;  animation-duration:30s; }
#sf-mars    { width:460px; height:460px; left:20px;  top:20px;  animation-duration:56.43s; }
#sf-jupiter { width:640px; height:640px; left:-70px; top:-70px; animation-duration:355.8s; }
#sf-saturn  { width:820px; height:820px; left:-160px;top:-160px;animation-duration:883.8s; }
#sf-uranus  { width:1000px;height:1000px;left:-250px;top:-250px;animation-duration:2520s; }
#sf-neptune { width:1180px;height:1180px;left:-340px;top:-340px;animation-duration:4944s; }

#sf-moon {
  width: 28px; height: 28px;
  border-radius: 50%;
  position: absolute;
  left: 130px; top: -14px;
  animation: sf-orbit 2.4s linear infinite;
}

@keyframes sf-orbit {
  100% { transform: rotate(360deg); }
}

/* planet dots via ::after — gold for all, red stays red for Mars */
.sf-planet::after {
  content: "";
  border-radius: 50%;
  position: absolute;
  background: var(--gold, #c9a84c);
  box-shadow: 0 0 6px rgba(201,168,76,0.4);
  margin-left: 40%;
}

#sf-mercury::after { width:8px;  height:8px;  top:-4px;   border-radius:50%; }
#sf-venus::after   { width:14px; height:14px; top:75px; right:0; border-radius:50%; }
#sf-earth::after   { width:18px; height:18px; top:-9px;   border-radius:50%; }
#sf-moon::after    { width:7px;  height:7px;  top:-10px;  border-radius:50%; }

/* Mars keeps its red */
#sf-mars::after    {
  width:10px; height:10px; top:-5px;
  border-radius: 50%;
  background: #c0614a;
  box-shadow: 0 0 5px rgba(192,97,74,0.5);
}

#sf-jupiter::after { width:70px; height:70px; top:185px; right:-30px; border-radius:50%; }
#sf-saturn::after  { width:55px; height:55px; top:270px; right:-25px; border-radius:50%; }
#sf-uranus::after  { width:40px; height:40px; top:390px; right:-20px; border-radius:50%; }
#sf-neptune::after { width:38px; height:38px; top:480px; right:-18px; border-radius:50%; }

/* ═══════════════════════════════════════════
   FOOTER CONTENT
═══════════════════════════════════════════ */
.sf__body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px 36px;
  gap: 14px;
}

/* ── logo ── */
.sf__logo {
  width: 100px;
  height: auto;
  display: block;
  filter: drop-shadow(0 0 10px rgba(201,168,76,0.2));
}

/* ── tagline ── */
.sf__tagline {
  font-family: var(--f-body, 'Crimson Pro', serif);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--fog, #70757a);
  max-width: 480px;
  margin: 0;
}

.sf__tagline a {
  color: rgba(201,168,76,0.7);
  text-decoration: none;
  transition: color 0.2s;
}
.sf__tagline a:hover { color: var(--gold, #c9a84c); }

/* ── credits ── */
.sf__credits {
  font-family: var(--f-body, 'Crimson Pro', serif);
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--fog, #70757a);
  margin: 0;
  opacity: 0.75;
}
.sf__credits a {
  color: var(--fog, #70757a);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.sf__credits a:hover { color: var(--gold, #c9a84c); }

/* ── ornament ── */
.sf__ornament {
  font-size: 0.38rem;
  letter-spacing: 8px;
  color: var(--gold-dim, #7a6030);
  opacity: 0.4;
}

/* ── nav links ── */
.sf__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 20px;
}

.sf__links a {
  font-size: 0.5rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--fog, #70757a);
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.sf__links a::after {
  content: "";
  position: absolute;
  left: 0; bottom: -2px;
  width: 0; height: 1px;
  background: var(--gold, #c9a84c);
  transition: width 0.25s ease;
}

.sf__links a:hover { color: var(--gold, #c9a84c); }
.sf__links a:hover::after { width: 100%; }

/* ── last updated ── */
.sf__updated {
  font-size: 0.44rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--fog, #70757a);
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 7px;
}

.sf__updated-label { opacity: 0.6; }
.sf__updated-value { color: var(--fog, #c5c8ca); }

/* ── responsive ── */
@media (max-width: 680px) {
  .sf__body { padding: 32px 16px 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .sf-planet, #sf-moon { animation: none; }
}
</style>

<footer class="sf" role="contentinfo">
  <div class="sf__rule"></div>

  <!-- Solar system background overlay
       Opacity is controlled by --sf-solar-opacity on .sf
       Height is controlled by --sf-solar-height on .sf
       Neither value affects the void background beneath -->
  <div class="sf__solar-wrap" aria-hidden="true">
    <div id="sf-solarsystem">
      <div id="sf-sun"></div>
      <div class="sf-planet" id="sf-mercury"></div>
      <div class="sf-planet" id="sf-venus"></div>
      <div class="sf-planet" id="sf-earth">
        <div id="sf-moon"></div>
      </div>
      <div class="sf-planet" id="sf-mars"></div>
      <div class="sf-planet" id="sf-jupiter"></div>
      <div class="sf-planet" id="sf-saturn"></div>
      <div class="sf-planet" id="sf-uranus"></div>
      <div class="sf-planet" id="sf-neptune"></div>
    </div>
  </div>

  <!-- Content -->
  <div class="sf__body">

    <img src="https://edelith.org/assets/img/themes/default/logo.png" alt="Solstitheo Archives" class="sf__logo">

    <p class="sf__tagline">
      A fan archive for <em>The Immortal City of Edelith</em>,
      an original D&amp;D campaign created by
      <a href="#" target="_blank">Horkah</a>.
      All campaign content belongs to its respective creators.
    </p>

    <p class="sf__credits">
      Site by <a href="/credits.html">Cyncl</a>.
      Additional credits <a href="/credits.html">here</a>.
      <br>© 2025 Solstitheo Archives. All rights reserved.
    </p>

    <div class="sf__ornament" aria-hidden="true">◆ &nbsp; ◆ &nbsp; ◆</div>

    <nav class="sf__links" aria-label="Footer navigation">
      <a href="/wiki/landing.html">Wiki</a>
      <a href="/index.html">Main Site</a>
      <a href="/shop.html">Shop</a>    
      <a href="/credits.html">Credits</a>
    </nav>

    <div class="sf__updated" aria-label="Last updated">
      <span class="sf__updated-label">Last updated</span>
      <span class="sf__updated-value" id="sf-lastupdate">—</span>
    </div>

  </div>
</footer>
`;

    this._initLastUpdated();
  }

  async _initLastUpdated() {
    const el = this.querySelector('#sf-lastupdate');
    if (!el) return;
    try {
      const res  = await fetch('https://api.github.com/repos/SoCyncl/edelith.github.io');
      const data = await res.json();
      const d    = new Date(data.pushed_at);
      el.textContent = `${d.getMonth()+1}·${String(d.getDate()).padStart(2,'0')}·${d.getFullYear()}`;
    } catch {
      el.textContent = '—';
    }
  }
}

customElements.define('footer-block', Footer);

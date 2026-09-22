import "./styles.css";
import "./game-brief.css";
import "./media-banner.css";
import "./storefront-polish.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const app = document.querySelector("#app");
let mode = "login";
let currentUser = null;
let page = location.hash === "#account" ? "account" : "home";

const games = [
    { title: "Night Circuit", type: "RACING / 2026", art: "circuit", price: "$39.99" },
    { title: "Echoes of Aster", type: "ADVENTURE / 2026", art: "aster", price: "$49.99" },
    { title: "Neon Divide", type: "ACTION / 2025", art: "neon", price: "$29.99" },
];

const renderHome = () => {
    app.innerHTML = `
      <main class="storefront">
        <nav class="nav"><a class="logo" href="#home">GG <span>Market</span></a><div class="nav-links"><a href="#discover">Discover</a><a href="#new">New releases</a><button class="nav-account" data-account>${currentUser ? escapeHtml(currentUser.name) : "Sign in"} <b>↗</b></button></div></nav>
        <section class="hero"><div class="hero-copy"><p class="eyebrow hero-tag">GG MARKET / GAME STORE</p><h1>Find your next<br><span>great escape.</span></h1><p class="lead">A hand-picked collection of worlds worth getting lost in. Play what moves you.</p><div class="hero-actions"><a class="button primary" href="#discover">Explore games <b>↓</b></a><button class="play-link" data-account><i>▶</i> How it works</button></div><p class="availability"><i></i> INSTANT DELIVERY / SECURE CHECKOUT</p></div><div class="hero-art"><div class="orb"></div><div class="hero-game-card"><span>FEATURED DROP</span><strong>VOID<br>RUNNER</strong><small>AN INTERSTELLAR ODYSSEY</small><button data-account>Add to library <b>↗</b></button></div><p class="art-index">01 <em>/ 03</em></p></div></section>
        <section class="catalogue" id="discover"><div class="section-heading"><div><p class="eyebrow">CURATED FOR YOU</p><h2>Play something<br><span>unforgettable.</span></h2></div><a href="#new">View all games ↗</a></div><div class="game-grid">${games.map((game, index) => `<article class="game-card ${game.art}"><div class="game-art"><span>0${index + 1}</span><b>${game.art === "circuit" ? "NC" : game.art === "aster" ? "EA" : "ND"}</b></div><div class="game-info"><p>${game.type}</p><h3>${game.title}</h3><div><strong>${game.price}</strong><button data-account aria-label="Add ${game.title} to library">+</button></div></div></article>`).join("")}</div></section>
        <section class="join-banner"><p class="eyebrow">YOUR LIBRARY, ANYWHERE</p><h2>Ready when<br>you are.</h2><button class="button primary" data-account>${currentUser ? "Go to account" : "Create your account"} <b>↗</b></button></section>
        <footer><a class="logo" href="#home">GG <span>Market</span></a><span>© 2026 GG MARKET</span><span>PLAY WITHOUT LIMITS</span></footer>
      </main>`;
    app.querySelector(".nav").insertAdjacentHTML("afterend", `<nav class="market-nav" aria-label="GG Market navigation"><div class="market-links"><a href="#discover">Discover</a><a href="#discover">Browse</a><a href="#discover">Deals</a><a href="#discover">Wishlist</a></div><label class="market-search"><span>⌕</span><input type="search" placeholder="Search games" aria-label="Search games" /></label></nav>`);
    app.querySelector(".hero").insertAdjacentHTML("beforebegin", `
        <header class="game-header" aria-labelledby="game-title">
          <div class="key-art">
            <p class="eyebrow">GG MARKET PRESENTS</p>
            <p class="key-art-kicker">AN INTERSTELLAR ODYSSEY</p>
            <h1 id="game-title">VOID<br><span>RUNNER</span></h1>
            <p>Outrun the void. Rewrite the stars.</p>
          </div>
          <section class="media-gallery" aria-labelledby="media-gallery-title">
            <div class="media-heading"><p class="eyebrow" id="media-gallery-title">MEDIA GALLERY</p><span>01 — 09</span></div>
            <div class="media-strip">
              <button class="media-tile trailer" type="button" aria-label="Play Void Runner gameplay trailer"><span class="play-icon">▶</span><strong>GAMEPLAY TRAILER</strong><small>02:14</small></button>
              <figure class="media-tile screenshot cockpit"><figcaption>01 / STARPORT</figcaption></figure>
              <figure class="media-tile screenshot planet"><figcaption>02 / ASHEN MOON</figcaption></figure>
              <figure class="media-tile screenshot city"><figcaption>03 / NEON DISTRICT</figcaption></figure>
              <figure class="media-tile screenshot warp"><figcaption>04 / WARP JUMP</figcaption></figure>
              <figure class="media-tile screenshot desert"><figcaption>05 / GLASS DUNES</figcaption></figure>
              <figure class="media-tile screenshot orbital"><figcaption>06 / ORBITAL RING</figcaption></figure>
              <figure class="media-tile screenshot battle"><figcaption>07 / VOID STORM</figcaption></figure>
              <figure class="media-tile screenshot station"><figcaption>08 / LAST SIGNAL</figcaption></figure>
            </div>
          </section>
        </header>`);
    app.querySelector(".catalogue").insertAdjacentHTML("beforebegin", `
        <section class="game-brief" aria-labelledby="game-brief-title">
          <div class="capsule-art" role="img" aria-label="Void Runner game cover"><span>VOID</span><strong>RUNNER</strong><small>AN INTERSTELLAR ODYSSEY</small></div>
          <aside class="brief-summary">
            <p class="eyebrow">GAME BRIEF</p>
            <h2 id="game-brief-title">Void Runner</h2>
            <p class="brief-description">Race through a fractured galaxy, outrun collapsing stars, and uncover the secret at the edge of space.</p>
            <dl class="brief-facts">
              <div><dt>RELEASE DATE</dt><dd>24 October 2026</dd></div>
              <div><dt>DEVELOPER</dt><dd>Nova Frame Studio</dd></div>
              <div><dt>PUBLISHER</dt><dd>GG Market Originals</dd></div>
            </dl>
            <div class="tag-list" aria-label="Game tags"><span>RPG</span><span>Open World</span><span>Singleplayer</span></div>
          </aside>
        </section>`);
    const deals = [{ discount: "35% OFF", was: "$39.99" }, { discount: "20% OFF", was: "$49.99" }, { discount: "50% OFF", was: "$29.99" }];
    app.querySelectorAll(".game-card").forEach((card, index) => card.querySelector(".game-info div").insertAdjacentHTML("afterbegin", `<span class="deal-label"><b>${deals[index].discount}</b><s>${deals[index].was}</s></span>`));
    app.querySelectorAll("[data-account]").forEach((element) => element.addEventListener("click", () => navigate("account")));
};

const renderAccount = () => {
    if (currentUser) {
        app.innerHTML = `<main class="shell signed-in"><button class="back-link" data-home>← Back to store</button><div class="brand-mark">GG</div><p class="eyebrow">GG MARKET / ACCOUNT</p><h1>Good to see you,<br><span>${escapeHtml(currentUser.name)}</span>.</h1><p class="lead">Your gaming account is ready. Explore your next adventure.</p><section class="account-panel"><div><span class="panel-label">SIGNED IN AS</span><strong>${escapeHtml(currentUser.email)}</strong></div><button class="button secondary" id="logout">Log out</button></section></main>`;
        document.querySelector("#logout").addEventListener("click", logout);
    } else {
        const isLogin = mode === "login";
        app.innerHTML = `<main class="shell"><button class="back-link" data-home>← Back to store</button><section class="intro"><div class="brand-mark">GG</div><p class="eyebrow">GG MARKET / ${isLogin ? "WELCOME BACK" : "NEW ACCOUNT"}</p><h1>Level up<br><span>your game.</span></h1><p class="lead">Discover great games, new releases, and exclusive deals.</p><div class="signal"><i></i><span>PRIVATE / PERSONAL / READY</span></div></section><section class="auth-card"><div class="card-heading"><span class="step">0${isLogin ? "1" : "2"}</span><div><h2>${isLogin ? "Welcome back, gamer" : "Create your gamer account"}</h2><p>${isLogin ? "Sign in to discover your next game." : "Create an account to start shopping."}</p></div></div><form id="auth-form">${isLogin ? "" : `<label>Name<input name="name" type="text" placeholder="Your name" minlength="2" required autocomplete="name" /></label>`}<label>Email<input name="email" type="email" placeholder="you@example.com" required autocomplete="email" /></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" minlength="8" required autocomplete="${isLogin ? "current-password" : "new-password"}" /></label><p class="form-message" id="form-message" role="alert"></p><button class="button primary" type="submit"><span>${isLogin ? "Enter workspace" : "Create account"}</span><b>↗</b></button></form><button class="switch" id="switch-mode">${isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>`;
        document.querySelector("#auth-form").addEventListener("submit", submitAuth);
        document.querySelector("#switch-mode").addEventListener("click", () => { mode = isLogin ? "register" : "login"; renderAccount(); });
    }
    document.querySelector("[data-home]").addEventListener("click", () => navigate("home"));
};
const render = () => page === "home" ? renderHome() : renderAccount();
const navigate = (destination) => { page = destination; location.hash = destination === "account" ? "account" : "home"; render(); };
const submitAuth = async (event) => {
    event.preventDefault(); const form = event.currentTarget; const message = document.querySelector("#form-message"); const button = form.querySelector("button"); const data = Object.fromEntries(new FormData(form));
    button.disabled = true; button.querySelector("span").textContent = "Connecting..."; message.textContent = "";
    try { const response = await fetch(`${API_URL}/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Something went wrong"); localStorage.setItem("portable_track_token", result.token); currentUser = result.user; renderAccount(); }
    catch (error) { message.textContent = error.message.includes("fetch") ? "Cannot connect to the server. Check that the API is running." : error.message; button.disabled = false; button.querySelector("span").textContent = mode === "login" ? "Enter workspace" : "Create account"; }
};
const restoreSession = async () => { const token = localStorage.getItem("portable_track_token"); if (token) try { const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error(); ({ user: currentUser } = await response.json()); } catch { localStorage.removeItem("portable_track_token"); } render(); };
const logout = () => { localStorage.removeItem("portable_track_token"); currentUser = null; mode = "login"; navigate("home"); };
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
window.addEventListener("hashchange", () => { page = location.hash === "#account" ? "account" : "home"; render(); });
restoreSession();

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const assetUrl = (value) => value?.startsWith("/") ? `${API_URL.replace(/\/api$/, "")}${value}` : value;
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%2309070f'/%3E%3Cpath d='M0 420 220 230l120 100 120-170 340 260H0Z' fill='%2329133f'/%3E%3Ctext x='40' y='80' fill='%23c084fc' font-family='monospace' font-size='24'%3EGG MARKET%3C/text%3E%3C/svg%3E";
const sampleGames = [
  { _id: "sample-forza", title: "Forza Horizon 6", developer: "Playground Games", genre: "Racing / Open World", releaseYear: 2026, price: 69.99, salePercent: 0, featured: true, imageUrl: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85", platforms: ["PC", "Xbox"], tags: ["Racing", "Open World"] },
  { _id: "sample-elden", title: "ELDEN RING", developer: "FromSoftware, Inc.", genre: "Action RPG / Open World", releaseYear: 2022, price: 59.99, salePercent: 20, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg", platforms: ["PC", "PlayStation", "Xbox"], tags: ["Action", "RPG"] },
  { _id: "sample-clair", title: "Clair Obscur: Expedition 33", developer: "Sandfall Interactive", genre: "Turn-Based RPG / Adventure", releaseYear: 2025, price: 49.99, salePercent: 15, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_600x900.jpg", platforms: ["PC", "PlayStation", "Xbox"], tags: ["RPG", "Adventure"] },
];
const games = [
  { title: "Night Circuit", genre: "RACING / 2026", price: "$39.99", sale: "35% OFF", art: "from-sky-950 to-cyan-950", mark: "NC" },
  { title: "Echoes of Aster", genre: "ADVENTURE / 2026", price: "$49.99", sale: "20% OFF", art: "from-violet-950 to-rose-950", mark: "EA" },
  { title: "Neon Divide", genre: "ACTION / 2025", price: "$29.99", sale: "50% OFF", art: "from-fuchsia-950 to-indigo-950", mark: "ND" },
];

const Arrow = () => <span aria-hidden="true">↗</span>;
const CartIcon = () => <span aria-hidden="true">🛒</span>;
function GamePreview({ game, onError }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (!game.previewUrl || !videoRef.current) return undefined;
    const video = videoRef.current;
    const hls = Hls.isSupported() ? new Hls({ enableWorker: true }) : null;
    if (hls) hls.loadSource(game.previewUrl); else video.src = game.previewUrl;
    if (hls) hls.attachMedia(video);
    return () => { hls?.destroy(); video.pause(); video.removeAttribute("src"); };
  }, [game.previewUrl]);
  if (!game.previewUrl) return null;
  const play = event => event.currentTarget.play().catch(() => {});
  const stop = event => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; };
  return <video ref={videoRef} poster={game.previewPoster} muted loop playsInline preload="metadata" onMouseEnter={play} onMouseLeave={stop} onError={onError} className="pointer-events-auto absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />;
}
const Button = ({ children, className = "", ...props }) => <button className={`inline-flex min-h-13 items-center justify-between gap-7 bg-lime px-5 font-semibold text-moss transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-65 ${className}`} {...props}>{children}<Arrow /></button>;

export default function App() {
  const pageFromHash = () => location.hash.startsWith("#game/") ? "game" : location.hash === "#account" ? "account" : "home";
  const [page, setPage] = useState(pageFromHash());
  const [gameId, setGameId] = useState(location.hash.replace("#game/", ""));
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const change = () => { setPage(pageFromHash()); setGameId(location.hash.replace("#game/", "")); };
    addEventListener("hashchange", change);
    const token = localStorage.getItem("portable_track_token");
    if (token) fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject()).then(({ user }) => setUser(user)).catch(() => localStorage.removeItem("portable_track_token"));
    return () => removeEventListener("hashchange", change);
  }, []);

  const navigate = destination => { location.hash = destination === "account" ? "account" : "home"; setPage(destination); };
  const logout = () => { localStorage.removeItem("portable_track_token"); setUser(null); navigate("home"); };
  const addToCart = game => setCart(current => current.some(item => item._id === game._id) ? current : [...current, game]);
  const toggleWishlist = game => setWishlist(current => current.some(item => item._id === game._id) ? current.filter(item => item._id !== game._id) : [...current, game]);
  return page === "account" ? <AccountV2 user={user} mode={mode} setMode={setMode} setUser={setUser} navigate={navigate} logout={logout} /> : page === "game" ? <GameDetail gameId={gameId} navigate={navigate} /> : <StorefrontV2 user={user} navigate={navigate} cart={cart} wishlist={wishlist} currency={currency} setCurrency={setCurrency} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
}

function Storefront({ user, navigate }) {
  const [databaseGames, setDatabaseGames] = useState(null);
  const [catalogueError, setCatalogueError] = useState("");
  useEffect(() => {
    fetch(`${API_URL}/games`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Unable to load game catalogue")))
      .then(setDatabaseGames)
      .catch(error => setCatalogueError(error.message));
  }, []);
  const games = databaseGames === null ? [] : databaseGames.map((game, index) => ({
    ...game,
    basePrice: Number(game.price),
    price: `$${Number(game.price).toFixed(2)}`,
    sale: game.salePercent ? `${game.salePercent}% OFF` : "FULL PRICE",
    art: ["from-sky-950 to-cyan-950", "from-violet-950 to-rose-950", "from-fuchsia-950 to-indigo-950"][index % 3],
    mark: game.imageUrl
      ? <img src={assetUrl(game.imageUrl)} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
      : game.title.split(/\s+/).map(word => word[0]).join("").slice(0, 2).toUpperCase(),
  }));
  useEffect(() => {
    const cards = [...document.querySelectorAll("#discover article")];
    const openGame = index => event => { event.preventDefault(); event.stopPropagation(); location.hash = `game/${games[index]._id}`; };
    const listeners = cards.map((card, index) => { const listener = openGame(index); card.addEventListener("click", listener); card.style.cursor = "pointer"; return [card, listener]; });
    return () => listeners.forEach(([card, listener]) => card.removeEventListener("click", listener));
  }, [databaseGames]);
  return <main className="mx-auto w-[min(1180px,calc(100%_-_48px))] animate-[appear_.7s_ease_both]">
    <nav className="flex h-[92px] items-center justify-between border-b border-white/15">
      <a className="font-mono text-2xl font-bold tracking-[-.18em]" href="#home">GG <span className="text-lime">Market</span></a>
      <div className="flex items-center gap-8 text-sm"><a className="hidden text-muted hover:text-lime sm:block" href="#discover">Discover</a><a className="hidden text-muted hover:text-lime sm:block" href="#new">New releases</a><button onClick={() => navigate("account")} className="border border-white/15 px-4 py-2.5">{user?.name || "Sign in"} <span className="ml-3 text-lime">↗</span></button></div>
    </nav>
    <section className="grid min-h-[620px] items-center gap-10 py-16 md:grid-cols-2">
      <div><p className="mb-6 font-mono text-[11px] text-lime">GG MARKET / GAME STORE</p><h1 className="max-w-165 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] font-semibold tracking-[-.06em]">Find your next<br /><span className="text-lime">great escape.</span></h1><p className="mt-7 max-w-92 text-[17px] leading-relaxed text-muted">A hand-picked collection of worlds worth getting lost in. Play what moves you.</p><div className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center"><Button onClick={() => document.querySelector("#discover")?.scrollIntoView()}>Explore games</Button><button onClick={() => navigate("account")} className="text-sm">◉ <span className="ml-2">How it works</span></button></div><p className="mt-12 flex items-center gap-2 font-mono text-[11px] text-muted"><i className="h-2 w-2 rounded-full bg-lime shadow-[0_0_0_5px_rgba(213,243,107,.12)]" /> INSTANT DELIVERY / SECURE CHECKOUT</p></div>
      <div className="relative h-[470px] overflow-hidden border border-white/15 bg-gradient-to-br from-emerald-700 via-emerald-950 to-moss"><div className="absolute -right-[70px] -top-24 h-[360px] w-[360px] rounded-full border-[46px] border-lime shadow-[0_0_70px_rgba(213,243,107,.25)]" /><div className="absolute bottom-11 left-10 z-10"><p className="font-mono text-[11px] text-lime">FEATURED DROP</p><strong className="my-3 block text-6xl leading-[.82] tracking-[-.08em]">VOID<br />RUNNER</strong><small className="font-mono text-[11px] text-emerald-100">AN INTERSTELLAR ODYSSEY</small><button onClick={() => navigate("account")} className="mt-6 block bg-ink px-3 py-2.5 font-semibold text-moss">Add to library <Arrow /></button></div><p className="absolute bottom-5 right-6 z-10 font-mono text-xs">01 <span className="text-muted">/ 03</span></p></div>
    </section>
    <section className="border-y border-white/15 py-12"><p className="font-mono text-[11px] text-lime">MEDIA GALLERY</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="grid aspect-video place-items-center bg-lime text-center text-sm font-bold text-moss">▶<br />TRAILER</div>{["STARPORT", "ASHEN MOON", "NEON DISTRICT"].map((name, i) => <div key={name} className={`relative aspect-video bg-gradient-to-br ${["from-slate-700 to-indigo-950", "from-orange-400 to-violet-950", "from-cyan-500 to-fuchsia-950"][i]}`}><span className="absolute bottom-2 left-2 font-mono text-[10px]">0{i + 1} / {name}</span></div>)}</div></section>
    <section id="discover" className="py-24"><div className="mb-9 flex items-end justify-between"><div><p className="mb-4 font-mono text-[11px] text-muted">CURATED FOR YOU</p><h2 className="text-[clamp(2.2rem,4vw,3.25rem)] leading-[.92] tracking-[-.05em]">Play something<br /><span className="text-lime">unforgettable.</span></h2></div><a className="text-sm text-lime" href="#new">View all games ↗</a></div><div className="grid gap-5 md:grid-cols-3">{games.map((game, index) => <article key={game.title} className="border border-white/15 bg-white/[.03]"><div className={`relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br ${game.art}`}><span className="absolute left-4 top-4 font-mono text-[11px]">0{index + 1}</span><b className="-rotate-9 text-7xl tracking-[-.12em]">{game.mark}</b></div><div className="p-5"><p className="font-mono text-[11px] text-muted">{game.genre}</p><h3 className="my-2 text-2xl">{game.title}</h3><div className="flex items-center justify-between"><div><b className="mr-2 rounded bg-lime/15 px-2 py-1 text-xs text-lime">{game.sale}</b><strong className="text-sm">{game.price}</strong></div><button onClick={() => navigate("account")} className="grid h-8 w-8 place-items-center border border-white/15 text-xl text-lime">+</button></div></div></article>)}</div></section>
    <section className="bg-lime px-7 py-16 text-moss sm:px-17"><p className="mb-5 font-mono text-[11px] text-lime-900">YOUR LIBRARY, ANYWHERE</p><h2 className="text-[clamp(3rem,6vw,4.7rem)] leading-[.86] tracking-[-.07em]">Ready when<br />you are.</h2><Button onClick={() => navigate("account")} className="mt-8 bg-moss text-ink">{user ? "Go to account" : "Create your account"}</Button></section>
    <footer className="flex flex-wrap items-center gap-4 py-9 font-mono text-[10px] text-muted"><a className="mr-auto text-xl font-bold tracking-[-.18em] text-ink" href="#home">GG <span className="text-lime">Market</span></a><span>© 2026 GG MARKET</span><span>PLAY WITHOUT LIMITS</span></footer>
  </main>;
}

function StorefrontV2({ user, navigate, cart, wishlist, currency, setCurrency, addToCart, toggleWishlist }) {
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All games");
  const [sort, setSort] = useState("featured");
  const [platform, setPlatform] = useState("All platforms");
  const [budget, setBudget] = useState("Any price");
  const [ranking, setRanking] = useState("all");
  const [quickSearch, setQuickSearch] = useState("");
  const [panel, setPanel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${API_URL}/games`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Unable to load catalogue")))
      .then(data => setGames(data.length ? data : sampleGames))
      .catch(loadError => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = games.length ? games[featuredIndex % games.length] : null;
  const genres = [...new Set(games.map(game => game.genre?.split("/")[0].trim()).filter(Boolean))];
  const platforms = ["All platforms", ...new Set(games.flatMap(game => game.platforms || ["PC"]))];
  const visibleGames = games
    .filter(game => genre === "All games" || game.genre?.toLowerCase().startsWith(genre.toLowerCase()))
    .filter(game => platform === "All platforms" || (game.platforms || ["PC"]).includes(platform))
    .filter(game => budget === "Any price" || (budget === "Under $100" && game.price < 100) || (budget === "On sale" && game.salePercent > 0))
    .filter(game => `${game.title} ${game.genre} ${game.developer}`.toLowerCase().includes(query.toLowerCase().trim()))
    .filter(game => ranking !== "upcoming" || (game.releaseDate && new Date(game.releaseDate) > new Date()))
    .sort((first, second) => ranking === "top" ? second.unitsSold - first.unitsSold : ranking === "new" ? new Date(second.releaseDate || second.createdAt) - new Date(first.releaseDate || first.createdAt) : sort === "price-low" ? first.price - second.price : sort === "price-high" ? second.price - first.price : Number(second.featured) - Number(first.featured));
  const openGame = game => { location.hash = `game/${game._id}`; };
  const showNextGame = () => setFeaturedIndex(current => games.length ? (current + 1) % games.length : 0);
  const showPreviousGame = () => setFeaturedIndex(current => games.length ? (current - 1 + games.length) % games.length : 0);
  const rate = currency === "THB" ? 36 : 1;
  const formatPrice = price => currency === "THB" ? `฿${Math.round(Number(price) * rate).toLocaleString()}` : `$${Number(price).toFixed(2)}`;
  const finalPrice = game => Number((Number(game.price) * (1 - Number(game.salePercent || 0) / 100)).toFixed(2));
  const handleImageError = event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; };
  const searchFromHeader = event => { event.preventDefault(); setQuery(quickSearch); document.querySelector("#discover")?.scrollIntoView({ behavior: "smooth" }); };
  const selectRanking = value => { setRanking(value); setGenre("All games"); };
  const selectGenre = value => { setGenre(value); setRanking("all"); };
  const clearFilters = () => { setQuery(""); setQuickSearch(""); setGenre("All games"); setRanking("all"); setPlatform("All platforms"); setBudget("Any price"); setSort("featured"); };
  return <main className="mx-auto w-[min(1180px,calc(100%_-_48px))] animate-[appear_.7s_ease_both]">
    <nav className="flex min-h-[92px] flex-wrap items-center gap-4 border-b border-white/15 py-5">
      <a className="mr-auto font-mono text-2xl font-bold tracking-[-.18em]" href="#home">GG <span className="text-lime">Market</span></a>
      <form onSubmit={searchFromHeader} className="order-3 flex min-h-10 w-full items-center gap-2 border border-white/15 bg-white/[.03] px-3 sm:order-2 sm:w-52 lg:w-64"><span className="text-lime">⌕</span><input value={quickSearch} onChange={event => setQuickSearch(event.target.value)} placeholder="Search" aria-label="Quick search" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" /></form>
      <div className="order-2 flex items-center gap-2 text-sm sm:order-3"><select value={currency} onChange={event => setCurrency(event.target.value)} aria-label="Currency" className="h-10 border border-white/15 bg-moss px-2 text-xs text-ink outline-none"><option>USD</option><option>THB</option></select><button onClick={() => setPanel(panel === "wishlist" ? "" : "wishlist")} aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center border border-white/15 text-lg hover:border-lime">♡{wishlist.length > 0 && <span className="absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center bg-lime px-1 text-[10px] font-bold text-moss">{wishlist.length}</span>}</button><button onClick={() => setPanel(panel === "cart" ? "" : "cart")} aria-label="Cart" className="relative grid h-10 w-10 place-items-center border border-white/15 text-lg hover:border-lime"><CartIcon />{cart.length > 0 && <span className="absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center bg-lime px-1 text-[10px] font-bold text-moss">{cart.length}</span>}</button><button onClick={() => navigate("account")} className="border border-white/15 px-4 py-2.5 text-sm">{user?.name || "Sign in"}<span className="ml-3 text-lime">↗</span></button></div>
    </nav>
    {panel && <div className="relative z-30 border-b border-white/15 bg-emerald-950/90 p-4 backdrop-blur"><div className="flex items-center justify-between"><p className="font-mono text-[10px] text-lime">{panel === "cart" ? "YOUR CART" : "YOUR WISHLIST"}</p><button onClick={() => setPanel("")} className="text-muted hover:text-lime">Close ×</button></div><div className="mt-3 flex flex-wrap gap-2">{(panel === "cart" ? cart : wishlist).length ? (panel === "cart" ? cart : wishlist).map(game => <button key={game._id} onClick={() => { setPanel(""); openGame(game); }} className="border border-white/15 px-3 py-2 text-sm hover:border-lime">{game.title}</button>) : <span className="text-sm text-muted">คลังยังว่างเปล่า? ไปหาเกมเติมคลังกันหน่อย!</span>}</div></div>}
    {featured && <section className="group relative mt-8 grid min-h-[430px] items-end overflow-hidden border border-white/15 bg-emerald-950 lg:grid-cols-[1fr_1fr]">
      <img src={assetUrl(featured.mediaUrl || featured.imageUrl)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /><GamePreview game={featured} onError={handleImageError} />
      <div className="absolute inset-0 bg-gradient-to-r from-moss via-moss/75 to-transparent" />
      <div className="relative z-10 max-w-xl p-8 sm:p-12"><p className="font-mono text-[11px] text-lime">FEATURED NOW / {featured.genre}</p><h1 className="mt-4 max-w-2xl text-[clamp(3rem,6vw,5.8rem)] leading-[.88] tracking-[-.07em]">{featured.title}</h1><p className="mt-5 max-w-md leading-7 text-muted">{featured.description || "Discover a new world worth getting lost in."}</p><div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={() => openGame(featured)} className="bg-lime px-5 py-3 font-semibold text-moss">View game <Arrow /></button><button onClick={() => addToCart(featured)} aria-label="Add featured game to cart" className="grid h-12 w-12 place-items-center border border-lime text-xl text-lime hover:bg-lime hover:text-moss"><CartIcon /></button><button onClick={() => toggleWishlist(featured)} aria-label="Add featured game to wishlist" className="grid h-12 w-12 place-items-center border border-white/25 text-xl hover:border-lime hover:text-lime">♡</button><span className="border border-white/20 px-4 py-3 text-sm">From {formatPrice(finalPrice(featured))}</span></div></div>
      <div className="relative z-10 flex items-end justify-between gap-6 p-8 lg:justify-self-end lg:p-10"><div className="hidden text-right lg:block"><span className="font-mono text-[11px] text-muted">FEATURED DROP</span><strong className="mt-3 block max-w-[280px] text-5xl leading-[.9] tracking-[-.06em]">PLAY<br /><span className="text-lime">NEXT.</span></strong></div><div className="flex items-center gap-2"><button onClick={showPreviousGame} aria-label="Previous featured game" className="grid h-11 w-11 place-items-center border border-white/25 bg-moss/50 text-xl hover:border-lime hover:text-lime">←</button><button onClick={showNextGame} aria-label="Next featured game" className="grid h-11 w-11 place-items-center border border-lime bg-lime text-xl text-moss hover:bg-white">→</button></div></div>
      <div className="absolute bottom-3 left-8 z-20 flex gap-2">{games.map((game, index) => <button key={game._id} onClick={() => setFeaturedIndex(index)} aria-label={`Show ${game.title}`} className={`h-1.5 transition-all ${index === featuredIndex % games.length ? "w-10 bg-lime" : "w-4 bg-white/35 hover:bg-white"}`} />)}</div>
    </section>}
    <section className="border-b border-white/15 py-8" aria-label="Game catalogue controls"><div className="grid gap-4 lg:grid-cols-[1fr_auto]"><label className="flex min-h-12 items-center gap-3 border border-white/15 bg-white/[.03] px-4"><span className="text-xl text-lime">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search games, genres, or studios" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" /></label><div className="flex flex-wrap gap-2"><select value={platform} onChange={event => setPlatform(event.target.value)} className="border border-white/15 bg-moss px-3 text-xs text-ink outline-none">{platforms.map(item => <option key={item}>{item}</option>)}</select><select value={budget} onChange={event => setBudget(event.target.value)} className="border border-white/15 bg-moss px-3 text-xs text-ink outline-none"><option>Any price</option><option>Under $100</option><option>On sale</option></select><select value={sort} onChange={event => setSort(event.target.value)} className="border border-white/15 bg-moss px-3 text-xs text-ink outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div><div className="mt-4 flex flex-wrap gap-2"><span className="mr-2 py-2 font-mono text-[10px] text-muted">RANKINGS</span>{[["all", "All games"], ["top", "Top sellers"], ["new", "New releases"], ["upcoming", "Upcoming"]].map(([value, label]) => <button key={value} onClick={() => selectRanking(value)} className={`border px-3 py-2 text-xs ${ranking === value ? "border-lime bg-lime text-moss" : "border-white/15 text-muted hover:border-lime"}`}>{label}</button>)}<div className="flex flex-wrap gap-2">{genres.map(item => <button key={item} onClick={() => selectGenre(item)} className={`border px-3 py-2 text-xs ${genre === item ? "border-lime bg-lime text-moss" : "border-white/15 text-muted hover:border-lime"}`}>{item}</button>)}</div></div></section>
    <section id="discover" className="py-16"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="mb-3 font-mono text-[11px] text-lime">THE CATALOGUE</p><h2 className="text-[clamp(2.5rem,5vw,4rem)] leading-[.9] tracking-[-.06em]">Find your<br /><span className="text-lime">next game.</span></h2></div><span className="font-mono text-[11px] text-muted">{visibleGames.length} TITLES</span></div>{loading && <p className="border-y border-white/15 py-8 text-muted">Loading catalogue...</p>}{error && <p className="border-y border-orange-300/30 py-8 text-orange-200">{error}</p>}{!loading && !error && !visibleGames.length && <div className="border-y border-white/15 py-8"><p className="text-muted">No games match your current filters.</p><button onClick={clearFilters} className="mt-4 border border-lime px-4 py-2 text-sm text-lime hover:bg-lime hover:text-moss">Clear filters ↗</button></div>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleGames.map((game, index) => { const discountedPrice = finalPrice(game); const inWishlist = wishlist.some(item => item._id === game._id); return <article key={game._id} className="group overflow-hidden border border-white/15 bg-white/[.03] transition hover:-translate-y-1 hover:border-lime/70"><button onClick={() => openGame(game)} className="block w-full text-left"><div className="relative aspect-[4/3] overflow-hidden bg-emerald-950"><img src={assetUrl(game.imageUrl)} onError={handleImageError} alt={game.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 bg-moss/85 px-2 py-1 font-mono text-[10px] text-lime">0{index + 1}</span>{game.salePercent > 0 ? <span className="absolute right-3 top-3 bg-lime px-2 py-1 font-mono text-[10px] font-bold text-moss">-{game.salePercent}%</span> : <span className="absolute right-3 top-3 border border-lime/60 bg-moss/85 px-2 py-1 font-mono text-[10px] text-lime">NEW</span>}</div></button><div className="p-5"><button onClick={() => openGame(game)} className="w-full text-left"><p className="font-mono text-[10px] text-muted">{game.genre} / {game.releaseYear}</p><h3 className="mt-2 min-h-14 text-2xl leading-tight">{game.title}</h3></button><div className="mt-5 flex items-end justify-between gap-4 pr-1"><div><span className="block text-xs text-muted">{game.developer}</span><div className="mt-1 flex items-center gap-2"><strong className="text-lime">{formatPrice(discountedPrice)}</strong>{game.salePercent > 0 && <del className="text-sm font-medium text-muted decoration-2">{formatPrice(Number(game.price))}</del>}</div></div><div className="flex shrink-0 gap-2"><button onClick={() => toggleWishlist(game)} aria-label={`${inWishlist ? "Remove" : "Add"} ${game.title} wishlist`} className={`grid h-10 w-10 place-items-center border text-lg ${inWishlist ? "border-lime text-lime" : "border-white/15 text-muted hover:border-lime"}`}>♡</button><button onClick={() => addToCart(game)} aria-label={`Add ${game.title} to cart`} className="grid h-10 w-10 place-items-center border border-lime text-lime hover:bg-lime hover:text-moss"><CartIcon /></button></div></div></div></article>; })}</div></section>
    <section id="deals" className="grid gap-8 border-y border-white/15 py-12 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-mono text-[11px] text-lime">PLAY MORE / SPEND LESS</p><h2 className="mt-3 text-4xl tracking-[-.05em]">Your next world<br /><span className="text-lime">is waiting.</span></h2><p className="mt-4 max-w-md text-sm leading-6 text-muted">Secure checkout, instant delivery, and a library that stays with you.</p></div><button onClick={() => document.querySelector("#discover")?.scrollIntoView()} className="border border-lime px-5 py-3 text-sm text-lime hover:bg-lime hover:text-moss">Browse all games ↗</button></section>
    <footer className="flex flex-wrap items-center gap-4 py-9 font-mono text-[10px] text-muted"><a className="mr-auto text-xl font-bold tracking-[-.18em] text-ink" href="#home">GG <span className="text-lime">Market</span></a><span>© 2026 GG MARKET</span><span>SECURE CHECKOUT</span><span>PLAY WITHOUT LIMITS</span></footer>
  </main>;
}

function GameDetail({ gameId, navigate }) {
  const [game, setGame] = useState(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`${API_URL}/games/${gameId}`).then(response => response.ok ? response.json() : Promise.reject(new Error("Game not found"))).then(setGame).catch(error => setError(error.message)); }, [gameId]);
  if (error) return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-16"><button onClick={() => navigate("home")} className="text-muted hover:text-lime">← Back to store</button><p className="mt-10 text-orange-300">{error}</p></main>;
  if (!game) return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-16 text-muted">Loading game…</main>;
  const displayGame = { ...game, basePrice: Number(game.price), price: `$${Number(game.price).toFixed(2)}`, sale: game.salePercent ? `${game.salePercent}% OFF` : "FULL PRICE" };
  return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-14"><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><section className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]"><img src={assetUrl(game.imageUrl)} alt={`${game.title} cover`} className="aspect-[2/3] w-full border border-white/15 object-cover object-center" /><div><p className="font-mono text-[11px] text-lime">GAME DETAILS</p><h1 className="mt-4 text-5xl tracking-[-.06em]">{game.title}</h1><p className="mt-3 text-muted">{game.developer} · {game.genre} · {game.releaseYear}</p><p className="mt-8 max-w-2xl leading-relaxed text-muted">{game.description || "Discover your next great adventure."}</p>{game.maturityWarning && <div className="mt-8 border-l-2 border-orange-300 bg-orange-300/10 p-4 text-sm text-orange-100" role="note"><p className="font-mono text-[10px] text-orange-300">CONTENT WARNING</p><p className="mt-2 leading-relaxed">{game.maturityWarning}</p></div>}</div></section><AboutGame game={game} /><SystemRequirements game={game} /><AdditionalFeaturesSidebar game={game} /><ReviewsSection game={game} /><PurchaseSection games={[displayGame]} /></main>;
}

function AboutGame({ game }) {
  const paragraphs = (game.detailedDescription || game.description || "Discover a carefully crafted world filled with memorable moments.").split(/\n+/).filter(Boolean);
  const features = game.keyFeatures?.length ? game.keyFeatures : ["Explore a world shaped by your choices", "Master a flexible mix of abilities and tools", "Follow a story built around discovery"];
  const mediaUrl = assetUrl(game.mediaUrl || game.imageUrl);
  return <section className="mt-16 border-y border-white/15 py-14" aria-labelledby="about-game-title"><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><div><p className="font-mono text-[11px] text-lime">ABOUT THIS GAME</p><h2 id="about-game-title" className="mt-3 text-4xl tracking-[-.05em]">The full story.</h2><div className="mt-7 grid gap-5 text-[15px] leading-7 text-muted">{paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}</div><div className="mt-10 border-t border-white/15 pt-7"><p className="font-mono text-[10px] text-lime">HOW IT PLAYS</p><p className="mt-3 leading-7 text-muted">{game.gameplayDescription || "Move through each encounter at your own pace, combine your abilities, and let exploration guide the next objective."}</p></div><div className="mt-8 border-t border-white/15 pt-7"><p className="font-mono text-[10px] text-lime">STORY HIGHLIGHTS</p><p className="mt-3 leading-7 text-muted">{game.storyHighlights || "Every discovery adds context to the world and brings you closer to the mystery at its heart."}</p></div></div><aside className="h-fit border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">KEY FEATURES</p><ul className="mt-5 grid gap-4">{features.map(feature => <li key={feature} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-lime" />{feature}</li>)}</ul></aside></div><figure className="mt-12 border border-white/15 bg-black/20"><img src={mediaUrl} alt={`${game.title} gameplay or artwork`} className="aspect-video w-full object-cover" /><figcaption className="flex flex-wrap justify-between gap-3 border-t border-white/15 px-4 py-3 font-mono text-[10px] text-muted"><span>{game.mediaUrl ? "GAMEPLAY / MEDIA" : "FEATURED ARTWORK"}</span><span>{game.title.toUpperCase()}</span></figcaption></figure></section>;
}

function SystemRequirements({ game }) {
  const fallback = {
    minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i5-8400", ram: "8 GB RAM", gpu: "NVIDIA GTX 1060 6 GB", storage: "50 GB available space" },
    recommended: { os: "Windows 11 64-bit", cpu: "Intel Core i7-10700", ram: "16 GB RAM", gpu: "NVIDIA RTX 2060 6 GB", storage: "50 GB SSD space" },
    supportedLanguages: [
      { language: "English", subtitles: true, audio: true, menu: true },
      { language: "Thai", subtitles: true, audio: false, menu: true },
      { language: "Japanese", subtitles: true, audio: true, menu: true },
    ],
  };
  const requirements = { ...fallback, ...game.systemRequirements, minimum: { ...fallback.minimum, ...game.systemRequirements?.minimum }, recommended: { ...fallback.recommended, ...game.systemRequirements?.recommended }, supportedLanguages: game.systemRequirements?.supportedLanguages?.length ? game.systemRequirements.supportedLanguages : fallback.supportedLanguages };
  const specs = [["OS", "os"], ["CPU", "cpu"], ["RAM", "ram"], ["GPU", "gpu"], ["Storage", "storage"]];
  const availability = value => value ? "✓" : "—";
  return <section className="border-b border-white/15 py-14" aria-labelledby="system-requirements-title"><p className="font-mono text-[11px] text-lime">TECHNICAL INFORMATION</p><h2 id="system-requirements-title" className="mt-3 text-4xl tracking-[-.05em]">System requirements.</h2><div className="mt-8 overflow-x-auto border border-white/15"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead><tr className="bg-white/[.04] font-mono text-[10px] text-muted"><th className="p-4">COMPONENT</th><th className="p-4">MINIMUM</th><th className="p-4">RECOMMENDED</th></tr></thead><tbody>{specs.map(([label, key]) => <tr key={key} className="border-t border-white/10"><th className="p-4 font-normal text-muted">{label}</th><td className="p-4">{requirements.minimum[key]}</td><td className="p-4 text-lime">{requirements.recommended[key]}</td></tr>)}</tbody></table></div><div className="mt-10"><p className="font-mono text-[10px] text-lime">SUPPORTED LANGUAGES</p><div className="mt-4 overflow-x-auto border border-white/15"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead><tr className="bg-white/[.04] font-mono text-[10px] text-muted"><th className="p-4">LANGUAGE</th><th className="p-4">SUBTITLES</th><th className="p-4">VOICE</th><th className="p-4">MENU</th></tr></thead><tbody>{requirements.supportedLanguages.map(item => <tr key={item.language} className="border-t border-white/10"><th className="p-4 font-normal">{item.language}</th><td className="p-4 text-center text-lime">{availability(item.subtitles)}</td><td className="p-4 text-center text-lime">{availability(item.audio)}</td><td className="p-4 text-center text-lime">{availability(item.menu)}</td></tr>)}</tbody></table></div></div></section>;
}

function AdditionalFeaturesSidebar({ game }) {
  const features = game.platformFeatures?.length ? game.platformFeatures : [
    { label: "Single-player", icon: "◈", enabled: true },
    { label: "Online Co-op", icon: "◎", enabled: true },
    { label: "Achievements", icon: "◆", enabled: true },
    { label: "Full Controller Support", icon: "⌁", enabled: true },
    { label: "Cloud Saves", icon: "☁", enabled: true },
  ];
  const links = [
    ["Official Website", game.externalLinks?.website],
    ["Join the Discord", game.externalLinks?.discord],
    ["Developer Social", game.externalLinks?.social],
  ].filter(([, url]) => url);
  const fallbackLinks = links.length ? links : [["Developer Website", "https://example.com"], ["Community Discord", "https://discord.com"]];
  return <section className="grid gap-8 border-b border-white/15 py-14 lg:grid-cols-[minmax(0,1fr)_320px]" aria-labelledby="additional-features-title"><div><p className="font-mono text-[11px] text-lime">GAME FEATURES</p><h2 id="additional-features-title" className="mt-3 text-4xl tracking-[-.05em]">Built for your setup.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map(feature => <div key={feature.label} className={`flex items-center gap-4 border p-4 ${feature.enabled === false ? "border-white/10 opacity-40" : "border-white/15 bg-white/[.03]"}`}><span className="grid h-9 w-9 shrink-0 place-items-center border border-lime/40 font-mono text-lime" aria-hidden="true">{feature.icon || "◆"}</span><span className="text-sm">{feature.label}</span><span className="ml-auto text-lime" aria-label={feature.enabled === false ? "Not supported" : "Supported"}>{feature.enabled === false ? "—" : "✓"}</span></div>)}</div></div><aside className="h-fit border border-white/15 bg-emerald-950/35 p-5"><p className="font-mono text-[10px] text-muted">EXTERNAL LINKS</p><div className="mt-4 grid gap-2">{fallbackLinks.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-white/10 py-3 text-sm transition hover:border-lime hover:text-lime"><span>{label}</span><span aria-hidden="true">↗</span></a>)}</div></aside></section>;
}

function ReviewsSection({ game }) {
  const fallbackReviews = [
    { _id: "sample-1", authorName: "Mira K.", rating: 5, hoursPlayed: 42, content: "A confident world with excellent pacing. I kept finding one more place to explore.", helpfulCount: 128, funnyCount: 14 },
    { _id: "sample-2", authorName: "Jon R.", rating: 4, hoursPlayed: 18, content: "The core loop feels great once the systems open up. The atmosphere does a lot of heavy lifting.", helpfulCount: 74, funnyCount: 8 },
  ];
  const [sort, setSort] = useState("recent");
  const [data, setData] = useState({ summary: { average: 0, total: 0, label: "No reviews yet" }, reviews: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/reviews/game/${game._id}?sort=${sort === "helpful" ? "helpful" : "recent"}`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Unable to load reviews")))
      .then(setData)
      .catch(() => setData({ summary: { average: 4.5, total: fallbackReviews.length, label: "Overwhelmingly Positive" }, reviews: fallbackReviews }))
      .finally(() => setLoading(false));
  }, [game._id, sort]);
  const reviews = data.reviews.length ? data.reviews : fallbackReviews;
  const summary = data.summary.total ? data.summary : { average: 4.5, total: fallbackReviews.length, label: "Overwhelmingly Positive" };
  const react = async (reviewId, type) => {
    setData(current => ({ ...current, reviews: current.reviews.map(review => review._id === reviewId ? { ...review, [`${type}Count`]: review[`${type}Count`] + 1 } : review) }));
    if (!reviewId.startsWith("sample-")) await fetch(`${API_URL}/reviews/${reviewId}/reactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) });
  };
  const stars = rating => "★".repeat(rating) + "☆".repeat(5 - rating);
  return <section className="border-b border-white/15 py-14" aria-labelledby="reviews-title"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="font-mono text-[11px] text-lime">COMMUNITY / REVIEWS</p><h2 id="reviews-title" className="mt-3 text-4xl tracking-[-.05em]">What players say.</h2></div><div className="flex items-center gap-4"><strong className="text-4xl text-lime">{summary.average}</strong><div><p className="text-sm">{summary.label}</p><p className="mt-1 text-xs text-muted">{summary.total} reviews</p></div></div></div><div className="mt-8 flex gap-2 border-b border-white/15"><button onClick={() => setSort("recent")} className={`border-b-2 px-3 py-3 text-sm ${sort === "recent" ? "border-lime text-lime" : "border-transparent text-muted"}`}>Most Recent</button><button onClick={() => setSort("helpful")} className={`border-b-2 px-3 py-3 text-sm ${sort === "helpful" ? "border-lime text-lime" : "border-transparent text-muted"}`}>Most Helpful</button></div><div className="mt-6 grid gap-4">{loading ? <p className="text-sm text-muted">Loading community reviews...</p> : reviews.map(review => <article key={review._id} className="border border-white/15 bg-white/[.03] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><strong>{review.authorName}</strong><p className="mt-1 font-mono text-[11px] text-muted">{review.hoursPlayed} HOURS PLAYED</p></div><span className="font-mono text-sm text-lime" aria-label={`${review.rating} out of 5 stars`}>{stars(review.rating)}</span></div><p className="mt-5 leading-7 text-muted">{review.content}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => react(review._id, "helpful")} className="border border-white/15 px-3 py-2 text-xs text-muted hover:border-lime hover:text-lime">Helpful · {review.helpfulCount}</button><button onClick={() => react(review._id, "funny")} className="border border-white/15 px-3 py-2 text-xs text-muted hover:border-lime hover:text-lime">Funny · {review.funnyCount}</button></div></article>)}</div></section>;
}

function PurchaseSection({ games }) {
  const [selectedId, setSelectedId] = useState("");
  const [edition, setEdition] = useState("standard");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  useEffect(() => { if (!selectedId && games[0]) setSelectedId(games[0]._id); }, [games, selectedId]);
  const game = games.find(item => item._id === selectedId) || games[0];
  if (!game) return null;
  const discount = Number(game.salePercent || 0);
  const standardPrice = game.basePrice * (1 - discount / 100);
  const editions = [
    { id: "standard", name: "Standard Edition", detail: "Base game", price: standardPrice },
    { id: "deluxe", name: "Deluxe Edition", detail: "Base game + digital soundtrack + bonus cosmetic pack", price: standardPrice + 12.99 },
    { id: "bundle", name: "Explorer Bundle", detail: "Base game + season DLC bundle", price: standardPrice + 24.99 },
  ];
  const choice = editions.find(item => item.id === edition) || editions[0];
  const isWishlisted = wishlist.includes(game._id);
  const cartKey = `${game._id}-${edition}`;
  const inCart = cart.includes(cartKey);
  const addCart = () => setCart(current => current.includes(cartKey) ? current : [...current, cartKey]);
  const buyNow = async () => {
    const token = localStorage.getItem("portable_track_token");
    if (!token) { location.hash = "account"; return; }
    setCheckoutMessage("Processing order...");
    const response = await fetch(`${API_URL}/account/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ gameId: game._id, paymentMethod }) });
    const result = await response.json();
    setCheckoutMessage(result.message || (response.ok ? "Order created." : "Unable to create order"));
  };
  return <section className="border-b border-white/15 py-12" aria-labelledby="purchase-title">
    <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><p className="font-mono text-[11px] text-lime">PURCHASE & PROMOTIONS</p><h2 id="purchase-title" className="mt-3 text-3xl tracking-[-.04em]">Get {game.title}</h2><div className="mt-5 flex flex-wrap gap-2">{games.map(item => <button key={item._id} onClick={() => { setSelectedId(item._id); setEdition("standard"); }} className={`border px-3 py-2 text-sm ${item._id === game._id ? "border-lime bg-lime text-moss" : "border-white/15 text-muted hover:border-lime"}`}>{item.title}</button>)}</div><div className="mt-7 grid gap-3">{editions.map(item => <button key={item.id} onClick={() => setEdition(item.id)} className={`flex items-center justify-between border p-4 text-left transition ${edition === item.id ? "border-lime bg-lime/10" : "border-white/15 hover:border-lime/60"}`}><span><b className="block">{item.name}</b><small className="mt-1 block text-muted">{item.detail}</small></span><strong>${item.price.toFixed(2)}</strong></button>)}</div></div>
    <aside className="h-fit border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[11px] text-muted">{choice.name.toUpperCase()}</p>{discount > 0 && <span className="mt-4 inline-block bg-lime px-2 py-1 text-xs font-bold text-moss">-{discount}%</span>}<div className="mt-4 flex items-end gap-3">{discount > 0 && <del className="pb-1 text-muted">${game.basePrice.toFixed(2)}</del>}<strong className="text-4xl text-lime">${choice.price.toFixed(2)}</strong></div><p className="mt-2 text-sm text-muted">Instant Key Delivery · Secure checkout</p><select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="mt-6 min-h-11 w-full border border-white/15 bg-moss px-3 text-sm text-ink"><option value="wallet">Store wallet</option><option value="promptpay">PromptPay QR</option><option value="card">Credit / debit card</option><option value="truemoney">TrueMoney</option><option value="mobile-banking">Mobile banking</option></select><Button onClick={buyNow} className="mt-3 w-full">Get game</Button><Button onClick={addCart} className="mt-3 w-full bg-transparent text-lime ring-1 ring-white/15">{inCart ? "Added to cart" : "Add to cart"}</Button><button onClick={() => setWishlist(current => current.includes(game._id) ? current.filter(id => id !== game._id) : [...current, game._id])} className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 border ${isWishlisted ? "border-lime text-lime" : "border-white/15 text-ink hover:border-lime"}`}>{isWishlisted ? "♥ Wishlisted" : "♡ Add to wishlist"}</button><p className="mt-5 min-h-5 text-xs text-lime">{checkoutMessage}</p><p className="mt-2 font-mono text-[10px] text-muted">CART: {cart.length} · WISHLIST: {wishlist.length}</p></aside></div>
  </section>;
}

function AccountV2({ user, mode, setMode, setUser, navigate, logout }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [otp, setOtp] = useState("");
  const [developmentOtp, setDevelopmentOtp] = useState("");
  const isLogin = mode === "login";
  const submit = async event => {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(`${API_URL}/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Something went wrong");
      if (result.requiresTwoFactor) { setChallengeToken(result.challengeToken); setDevelopmentOtp(result.developmentOtp || ""); setMessage("Enter the one-time code sent to your email."); }
      else { localStorage.setItem("portable_track_token", result.token); setUser(result.user); }
    } catch (error) { setMessage(error.message.includes("fetch") ? "Cannot connect to the server." : error.message); } finally { setLoading(false); }
  };
  const verifyLogin = async event => {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/auth/2fa/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeToken, code: otp }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || "Invalid OTP");
      localStorage.setItem("portable_track_token", result.token); setUser(result.user); setChallengeToken("");
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };
  if (user) return <AccountDashboard user={user} setUser={setUser} navigate={navigate} logout={logout} />;
  return <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%_-_48px))] items-center gap-16 py-14 lg:grid-cols-[1fr_470px]"><section><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><div className="mt-14 grid h-12 w-12 place-items-center -rotate-6 bg-lime font-mono text-sm text-moss">GG</div><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {isLogin ? "WELCOME BACK" : "NEW ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Level up<br /><span className="text-lime">your game.</span></h1><p className="mt-7 max-w-[370px] text-[17px] leading-relaxed text-muted">Your library, orders, wallet, and account security in one place.</p></section><section className="border border-white/15 bg-emerald-950/50 p-7 backdrop-blur sm:p-10"><div className="border-b border-white/15 pb-8"><span className="font-mono text-[11px] text-lime">0{isLogin ? "1" : "2"}</span><h2 className="mt-3 text-2xl">{challengeToken ? "Verify your sign-in" : isLogin ? "Welcome back, gamer" : "Create your gamer account"}</h2><p className="mt-2 text-sm text-muted">{challengeToken ? "A one-time code is required to continue." : isLogin ? "Sign in to access your games and orders." : "Create an account to start shopping."}</p></div>{challengeToken ? <form onSubmit={verifyLogin} className="grid gap-5 pt-8"><Field label="One-time code" name="code" value={otp} onChange={event => setOtp(event.target.value)} inputMode="numeric" placeholder="6-digit code" /><p className="text-sm text-orange-300">{message}{developmentOtp && ` Development code: ${developmentOtp}`}</p><Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify sign-in"}</Button></form> : <form onSubmit={submit} className="grid gap-5 pt-8">{!isLogin && <Field name="name" label="Name" type="text" placeholder="Your name" minLength="2" />}<Field name="email" label="Email" type="email" placeholder="you@example.com" /><Field name="password" label="Password" type="password" placeholder="At least 8 characters" minLength="8" /><p className="min-h-5 text-sm text-orange-300">{message}</p><Button type="submit" disabled={loading}>{loading ? "Connecting..." : isLogin ? "Enter workspace" : "Create account"}</Button></form>}<button onClick={() => { setMode(isLogin ? "register" : "login"); setMessage(""); }} className="mx-auto mt-7 block text-sm text-muted hover:text-lime">{isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

function AccountDashboard({ user, setUser, navigate, logout }) {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const token = localStorage.getItem("portable_track_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const loadAccount = () => fetch(`${API_URL}/account`, { headers }).then(response => response.ok ? response.json() : Promise.reject(new Error("Unable to load account"))).then(setAccount).catch(error => setMessage(error.message));
  useEffect(() => { loadAccount(); }, []);
  const request2FA = async () => { const response = await fetch(`${API_URL}/account/2fa/request`, { method: "POST", headers }); const result = await response.json(); setMessage(`${result.message}${result.developmentOtp ? ` Development code: ${result.developmentOtp}` : ""}`); };
  const verify2FA = async event => { event.preventDefault(); const response = await fetch(`${API_URL}/account/2fa/verify`, { method: "POST", headers, body: JSON.stringify({ code: otp }) }); const result = await response.json(); setMessage(result.message || (response.ok ? "Two-factor authentication enabled." : "Unable to verify OTP")); if (response.ok) { setUser({ ...user, twoFactorEnabled: true }); loadAccount(); } };
  const topUp = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`${API_URL}/account/wallet/top-up`, { method: "POST", headers, body: JSON.stringify({ amount: Number(data.amount), paymentMethod: data.paymentMethod }) }); const result = await response.json(); setMessage(result.message); };
  if (!account) return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14 text-muted">Loading account...</main>;
  const library = account.orders.flatMap(order => order.items.filter(item => item.key).map(item => ({ ...item, orderNumber: order.orderNumber, deliveredAt: order.deliveredAt })));
  return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14"><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><div className="mt-12 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[11px] text-lime">PLAYER ACCOUNT</p><h1 className="mt-4 text-5xl tracking-[-.06em]">Welcome, <span className="text-lime">{account.account.name}.</span></h1><p className="mt-3 text-muted">{account.account.email}</p></div><button onClick={logout} className="border border-white/15 px-5 py-3 text-sm">Log out</button></div><section className="mt-12 grid gap-4 md:grid-cols-3"><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">WALLET BALANCE</p><strong className="mt-3 block text-3xl text-lime">${Number(account.account.walletBalance || 0).toFixed(2)}</strong></div><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">LIBRARY ITEMS</p><strong className="mt-3 block text-3xl">{library.length}</strong></div><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">2FA STATUS</p><strong className="mt-3 block text-3xl text-lime">{account.account.twoFactorEnabled ? "ON" : "OFF"}</strong></div></section><div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_.8fr]"><section><p className="font-mono text-[11px] text-lime">YOUR LIBRARY / PURCHASE HISTORY</p><h2 className="mt-3 text-3xl">Owned games and keys.</h2><div className="mt-6 grid gap-3">{library.length ? library.map(item => <article key={`${item.orderNumber}-${item.game?._id || item.title}`} className="border border-white/15 bg-white/[.03] p-5"><div className="flex flex-wrap justify-between gap-3"><div><strong>{item.title}</strong><p className="mt-1 text-xs text-muted">{item.orderNumber} · Delivered {new Date(item.deliveredAt).toLocaleDateString()}</p></div><code className="border border-lime/40 px-3 py-2 text-xs text-lime">{item.key}</code></div></article>) : <p className="border border-white/15 p-5 text-muted">Your library is empty. Purchased keys will appear here.</p>}</div><h2 className="mt-12 text-3xl">All orders.</h2><div className="mt-5 grid gap-3">{account.orders.length ? account.orders.map(order => <div key={order._id} className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-4 text-sm"><span>{order.orderNumber}</span><span className="text-muted">{order.paymentMethod} · {order.paymentStatus}</span><strong>${order.total.toFixed(2)}</strong></div>) : <p className="mt-4 text-muted">No orders yet.</p>}</div></section><aside className="grid h-fit gap-5"><section className="border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[10px] text-lime">ADD TO WALLET</p><form onSubmit={topUp} className="mt-5 grid gap-4"><input name="amount" type="number" min="50" step="50" placeholder="Amount" required className="border-b border-white/15 bg-transparent px-0 py-3 outline-none focus:border-lime" /><select name="paymentMethod" className="border border-white/15 bg-moss p-3 text-sm"><option value="promptpay">PromptPay QR</option><option value="card">Credit / debit card</option><option value="truemoney">TrueMoney</option><option value="mobile-banking">Mobile banking</option></select><button className="bg-lime px-4 py-3 font-semibold text-moss">Request top-up ↗</button></form></section><section className="border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[10px] text-lime">ACCOUNT SECURITY</p>{account.account.twoFactorEnabled ? <p className="mt-4 text-sm text-lime">Two-factor authentication is active.</p> : <form onSubmit={verify2FA} className="mt-4 grid gap-4"><button type="button" onClick={request2FA} className="border border-white/15 px-4 py-3 text-left text-sm">Send OTP</button><input value={otp} onChange={event => setOtp(event.target.value)} placeholder="Enter OTP" className="border-b border-white/15 bg-transparent px-0 py-3 outline-none focus:border-lime" /><button className="bg-lime px-4 py-3 font-semibold text-moss">Enable 2FA</button></form>}</section><p className="min-h-6 text-sm text-orange-300">{message}</p></aside></div></main>;
}

function Account({ user, mode, setMode, setUser, navigate, logout }) {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); const isLogin = mode === "login";
  const submit = async event => { event.preventDefault(); setLoading(true); setMessage(""); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch(`${API_URL}/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Something went wrong"); localStorage.setItem("portable_track_token", result.token); setUser(result.user); } catch (error) { setMessage(error.message.includes("fetch") ? "Cannot connect to the server. Check that the API is running." : error.message); } finally { setLoading(false); } };
  if (user) return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14"><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {user.role === "admin" ? "ADMIN" : "ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Good to see you,<br /><span className="text-lime">{user.name}.</span></h1><section className="mt-12 flex max-w-[590px] flex-col items-start justify-between gap-5 border-y border-white/15 p-6 sm:flex-row sm:items-center"><div><span className="font-mono text-[11px] text-muted">SIGNED IN AS</span><strong className="mt-2 block font-normal">{user.email}</strong></div><button onClick={logout} className="border border-white/15 px-5 py-3">Log out</button></section>{user.role === "admin" && <AdminDashboard />}</main>;
  return <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%_-_48px))] items-center gap-16 py-14 lg:grid-cols-[1fr_470px]"><section><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><div className="mt-14 grid h-12 w-12 place-items-center -rotate-6 bg-lime font-mono text-sm text-moss">GG</div><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {isLogin ? "WELCOME BACK" : "NEW ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Level up<br /><span className="text-lime">your game.</span></h1><p className="mt-7 max-w-[370px] text-[17px] leading-relaxed text-muted">Discover great games, new releases, and exclusive deals.</p></section><section className="border border-white/15 bg-emerald-950/50 p-7 backdrop-blur sm:p-10"><div className="border-b border-white/15 pb-8"><span className="font-mono text-[11px] text-lime">0{isLogin ? "1" : "2"}</span><h2 className="mt-3 text-2xl">{isLogin ? "Welcome back, gamer" : "Create your gamer account"}</h2><p className="mt-2 text-sm text-muted">{isLogin ? "Sign in to discover your next game." : "Create an account to start shopping."}</p></div><form onSubmit={submit} className="grid gap-5 pt-8">{!isLogin && <Field name="name" label="Name" type="text" placeholder="Your name" minLength="2" />}<Field name="email" label="Email" type="email" placeholder="you@example.com" /><Field name="password" label="Password" type="password" placeholder="At least 8 characters" minLength="8" /><p className="min-h-5 text-sm text-orange-300">{message}</p><Button type="submit" disabled={loading}>{loading ? "Connecting..." : isLogin ? "Enter workspace" : "Create account"}</Button></form><button onClick={() => { setMode(isLogin ? "register" : "login"); setMessage(""); }} className="mx-auto mt-7 block text-sm text-muted hover:text-lime">{isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

function Field({ label, ...props }) { return <label className="grid gap-2 font-mono text-[11px] text-muted">{label}<input {...props} required className="border-0 border-b border-white/15 bg-transparent px-0 py-2.5 text-base outline-none placeholder:text-emerald-100/40 focus:border-lime" /></label>; }

const emptyGame = { title: "", developer: "", genre: "", releaseYear: new Date().getFullYear(), price: "", salePercent: 0, description: "", detailedDescription: "", keyFeatures: "", gameplayDescription: "", storyHighlights: "", mediaUrl: "", previewUrl: "", maturityWarning: "", imageUrl: "", featured: false };

function AdminDashboard() {
  const [games, setGames] = useState([]); const [form, setForm] = useState(emptyGame); const [editingId, setEditingId] = useState(null); const [status, setStatus] = useState("Loading games…"); const [uploading, setUploading] = useState(false); const token = localStorage.getItem("portable_track_token");
  const loadGames = async () => { try { const response = await fetch(`${API_URL}/games`); if (!response.ok) throw new Error("Unable to load games"); setGames(await response.json()); setStatus(""); } catch (error) { setStatus(error.message); } };
  useEffect(() => { loadGames(); }, []);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const uploadCover = async event => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); setStatus("Uploading cover…"); try { const body = new FormData(); body.append("cover", file); const response = await fetch(`${API_URL}/uploads/game-cover`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to upload cover"); setForm(current => ({ ...current, imageUrl: data.imageUrl })); setStatus("Cover uploaded. Save the game to keep it."); } catch (error) { setStatus(error.message); } finally { setUploading(false); } };
  const save = async event => { event.preventDefault(); setStatus("Saving…"); try { const payload = { ...form, keyFeatures: form.keyFeatures.split(/\n|,/).map(item => item.trim()).filter(Boolean), releaseYear: Number(form.releaseYear), price: Number(form.price), salePercent: Number(form.salePercent) }; const response = await fetch(`${API_URL}/games${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || "Unable to save game"); setForm(emptyGame); setEditingId(null); setStatus(editingId ? "Game updated." : "Game created."); loadGames(); } catch (error) { setStatus(error.message); } };
  const edit = game => { setEditingId(game._id); setForm({ ...emptyGame, title: game.title, developer: game.developer, genre: game.genre, releaseYear: game.releaseYear, price: game.price, salePercent: game.salePercent, description: game.description || "", detailedDescription: game.detailedDescription || "", keyFeatures: (game.keyFeatures || []).join("\n"), gameplayDescription: game.gameplayDescription || "", storyHighlights: game.storyHighlights || "", mediaUrl: game.mediaUrl || "", previewUrl: game.previewUrl || "", maturityWarning: game.maturityWarning || "", imageUrl: game.imageUrl || "", featured: game.featured }); setStatus(`Editing ${game.title}`); };
  const remove = async game => { if (!confirm(`Delete “${game.title}”?`)) return; try { const response = await fetch(`${API_URL}/games/${game._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) { const data = await response.json(); throw new Error(data.message || "Unable to delete game"); } setStatus("Game deleted."); loadGames(); } catch (error) { setStatus(error.message); } };
  const coverUrl = form.imageUrl.startsWith("/") ? `${API_URL.replace(/\/api$/, "")}${form.imageUrl}` : form.imageUrl;
  return <section className="mt-16 border-t border-white/15 pt-10"><div className="mb-8"><p className="font-mono text-[11px] text-lime">GAME CATALOGUE</p><h2 className="mt-3 text-3xl">Admin dashboard</h2><p className="mt-2 text-sm text-muted">Create, edit, and remove games via the protected API.</p></div><div className="grid gap-8 lg:grid-cols-[390px_1fr]"><form onSubmit={save} className="grid h-fit gap-4 border border-white/15 bg-emerald-950/40 p-6"><h3 className="text-xl">{editingId ? "Edit game" : "Add game"}</h3><GameField label="Title" name="title" value={form.title} onChange={update} /><GameField label="Developer" name="developer" value={form.developer} onChange={update} /><GameField label="Genre" name="genre" value={form.genre} onChange={update} /><div className="grid grid-cols-2 gap-4"><GameField label="Release year" name="releaseYear" type="number" value={form.releaseYear} onChange={update} /><GameField label="Price (USD)" name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} /></div><GameField label="Discount (%)" name="salePercent" type="number" min="0" max="100" value={form.salePercent} onChange={update} required={false} /><label className="grid gap-2 font-mono text-[11px] text-muted">Description<textarea name="description" value={form.description} onChange={update} className="min-h-20 border border-white/15 bg-transparent p-2 font-display text-sm outline-none focus:border-lime" /></label><label className="grid gap-2 font-mono text-[11px] text-muted">Upload game cover<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadCover} disabled={uploading} className="text-sm text-muted file:mr-3 file:border-0 file:bg-lime file:px-3 file:py-2 file:text-moss disabled:opacity-60" /></label>{coverUrl && <img src={coverUrl} alt="Game cover preview" className="h-40 w-full border border-white/15 object-cover" />}<GameField label="Image URL (optional)" name="imageUrl" type="url" value={form.imageUrl} onChange={update} required={false} /><label className="flex items-center gap-2 text-sm"><input name="featured" type="checkbox" checked={form.featured} onChange={update} /> Featured game</label><p className="min-h-5 text-sm text-lime">{status}</p><div className="flex gap-3"><Button type="submit" disabled={uploading}>{uploading ? "Uploading…" : editingId ? "Save changes" : "Add game"}</Button>{editingId && <button type="button" onClick={() => { setForm(emptyGame); setEditingId(null); setStatus(""); }} className="border border-white/15 px-4">Cancel</button>}</div></form><div className="overflow-hidden border border-white/15"><div className="grid grid-cols-[1.4fr_.9fr_.7fr_auto] gap-3 border-b border-white/15 p-4 font-mono text-[10px] text-muted"><span>GAME</span><span>GENRE</span><span>PRICE</span><span>ACTIONS</span></div>{games.map(game => <div key={game._id} className="grid grid-cols-[1.4fr_.9fr_.7fr_auto] items-center gap-3 border-b border-white/10 p-4 text-sm last:border-0"><div className="flex items-center gap-3">{game.imageUrl && <img src={game.imageUrl.startsWith("/") ? `${API_URL.replace(/\/api$/, "")}${game.imageUrl}` : game.imageUrl} alt="" className="h-10 w-8 object-cover" />}<div><b className="block">{game.title}</b><span className="text-xs text-muted">{game.developer} {game.featured && "• Featured"}</span></div></div><span className="text-muted">{game.genre}</span><span>${game.price.toFixed(2)}</span><div className="flex gap-2"><button onClick={() => edit(game)} className="text-lime">Edit</button><button onClick={() => remove(game)} className="text-orange-300">Delete</button></div></div>)}{!games.length && !status && <p className="p-6 text-muted">No games yet. Add the first game from the form.</p>}</div></div></section>;
}

function GameField({ label, required = true, ...props }) { return <label className="grid gap-2 font-mono text-[11px] text-muted">{label}<input {...props} required={required} className="border-0 border-b border-white/15 bg-transparent px-0 py-2 text-sm outline-none focus:border-lime" /></label>; }

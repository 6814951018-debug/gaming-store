import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { API_URL } from "./api";

const assetUrl = (value) => value?.startsWith("/") ? `${API_URL.replace(/\/api$/, "")}${value}` : value;
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%2309070f'/%3E%3Cpath d='M0 420 220 230l120 100 120-170 340 260H0Z' fill='%2329133f'/%3E%3Ctext x='40' y='80' fill='%23c084fc' font-family='monospace' font-size='24'%3EGG MARKET%3C/text%3E%3C/svg%3E";
const officialGameArt = {
  "forza horizon 6": { cover: "https://cdn2.steamgriddb.com/grid/360300840757d13956988ac98ba2a44c.jpg", hero: "https://cdn2.steamgriddb.com/hero/56540abcdb375502c6c871b8f141a40b.jpg", thbPrice: 1999 },
  "elden ring": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg", thbPrice: 1790 },
  "clair obscur: expedition 33": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_hero.jpg", video: "https://cdn2.steamgriddb.com/hero_thumb/33407be4b5168f09b45b33b72739fedc.webm", thbPrice: 1350 },
  "resident evil requiem": { cover: "https://cdn2.steamgriddb.com/grid/cc6e7d0c4f62a13d5a51b8fe38b8be28.jpg", hero: "https://cdn2.steamgriddb.com/hero_thumb/2908a94a0c74238e4af35e845b0e28b0.jpg", thbPrice: 1890 },
  "hogwarts legacy": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg", thbPrice: 1890 },
  "silent hill 2": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_hero.jpg", thbPrice: 2147 },
  "red dead redemption 2": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg", thbPrice: 1899 },
  "marvel’s spider-man remastered": { cover: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg", hero: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg", thbPrice: 1899 },
};
const withOfficialGameArt = game => {
  const art = officialGameArt[game.title?.trim().toLowerCase()];
  return art ? { ...game, imageUrl: art.cover, mediaUrl: art.hero, videoUrl: art.video, thbPrice: art.thbPrice } : game;
};
const sampleGames = [
  { _id: "sample-forza", title: "Forza Horizon 6", developer: "Playground Games", genre: "Racing / Open World", releaseYear: 2026, price: 69.99, salePercent: 0, featured: true, imageUrl: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85", platforms: ["PC", "Xbox"], tags: ["Racing", "Open World"] },
  { _id: "sample-elden", title: "ELDEN RING", developer: "FromSoftware, Inc.", genre: "Action RPG / Open World", releaseYear: 2022, price: 59.99, salePercent: 20, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg", platforms: ["PC", "PlayStation", "Xbox"], tags: ["Action", "RPG"] },
  { _id: "sample-clair", title: "Clair Obscur: Expedition 33", developer: "Sandfall Interactive", genre: "Turn-Based RPG / Adventure", releaseYear: 2025, price: 49.99, salePercent: 15, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_600x900.jpg", platforms: ["PC", "PlayStation", "Xbox"], tags: ["RPG", "Adventure"] },
  { _id: "sample-requiem", title: "Resident Evil Requiem", developer: "CAPCOM Co., Ltd.", genre: "Survival Horror / Action", releaseYear: 2026, releaseDate: "2026-02-27T00:00:00.000Z", price: 69.99, salePercent: 0, featured: false, imageUrl: "https://cdn2.steamgriddb.com/grid/cc6e7d0c4f62a13d5a51b8fe38b8be28.jpg", mediaUrl: "https://cdn2.steamgriddb.com/hero_thumb/2908a94a0c74238e4af35e845b0e28b0.jpg", platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch 2"], tags: ["Survival Horror", "Action"] },
  { _id: "hogwarts-legacy", title: "Hogwarts Legacy", developer: "Avalanche Software", genre: "Action RPG / Open World", releaseYear: 2023, price: 59.99, salePercent: 0, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg", mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg", platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"], tags: ["Action", "RPG", "Open World", "Fantasy", "Adventure"] },
  { _id: "silent-hill-2", title: "SILENT HILL 2", developer: "Bloober Team SA", genre: "Survival Horror / Psychological Horror", releaseYear: 2024, releaseDate: "2024-10-08T00:00:00.000Z", price: 69.99, salePercent: 0, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900.jpg", mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_hero.jpg", platforms: ["PC", "PlayStation"], tags: ["Survival Horror", "Psychological Horror", "Action", "Adventure", "Single-player"] },
  { _id: "red-dead-redemption-2", title: "Red Dead Redemption 2", developer: "Rockstar Games", genre: "Action / Open World / Adventure", releaseYear: 2019, releaseDate: "2019-12-05T00:00:00.000Z", price: 59.99, salePercent: 0, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg", mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg", platforms: ["PC", "PlayStation", "Xbox"], tags: ["Action", "Open World", "Adventure", "Western", "Story Rich"] },
  { _id: "marvels-spider-man-remastered", title: "Marvel’s Spider-Man Remastered", developer: "Insomniac Games, Nixxes Software", genre: "Action / Adventure / Open World", releaseYear: 2022, releaseDate: "2022-08-12T00:00:00.000Z", price: 59.99, salePercent: 0, featured: false, imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg", mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg", platforms: ["PC", "PlayStation"], tags: ["Action", "Adventure", "Open World", "Superhero", "Single-player"] },
];
const games = [
  { title: "Night Circuit", genre: "RACING / 2026", price: "$39.99", sale: "35% OFF", art: "from-sky-950 to-cyan-950", mark: "NC" },
  { title: "Echoes of Aster", genre: "ADVENTURE / 2026", price: "$49.99", sale: "20% OFF", art: "from-violet-950 to-rose-950", mark: "EA" },
  { title: "Neon Divide", genre: "ACTION / 2025", price: "$29.99", sale: "50% OFF", art: "from-fuchsia-950 to-indigo-950", mark: "ND" },
];

const Arrow = () => <span aria-hidden="true">↗</span>;
const CartIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h8a2 2 0 0 0 1.9-1.4L21 8H6"/><path d="M9 8v5m4-5v5m4-5v5"/><circle cx="10" cy="19" r="1"/><circle cx="18" cy="19" r="1"/></svg>;
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

function StorePageHeader({ user, navigate, cartCount, onOpenCart }) {
  return <header className="sticky top-0 z-30 border-b border-white/[.08] bg-[#17181e]/95 backdrop-blur"><div className="mx-auto flex w-[min(1320px,calc(100%_-_40px))] items-center gap-4 py-3"><a href="#home" className="flex items-center gap-2 text-xl font-bold"><span className="grid h-8 w-8 place-items-center rounded-sm bg-[#b6ec75] text-sm text-[#17210f]">GG</span>Market</a><a href="#home" className="text-sm text-white/60 transition hover:text-[#b6ec75]">Store</a><span className="ml-auto hidden font-mono text-[10px] text-white/40 sm:block">PC GAMES · INSTANT DELIVERY · SECURE CHECKOUT</span><button onClick={onOpenCart} aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`} className="relative grid h-10 w-10 place-items-center border border-white/10 text-white/75 transition hover:border-[#b6ec75] hover:text-[#b6ec75]"><CartIcon />{cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#b6ec75] px-1 text-[10px] font-bold text-[#17210f]">{cartCount}</span>}</button><button onClick={() => navigate("account")} className="rounded-sm bg-[#b6ec75] px-4 py-2.5 text-sm font-semibold text-[#17210f]">{user?.name || "Sign in"}</button></div></header>;
}

export default function App() {
  const pageFromHash = () => location.hash.startsWith("#game/") ? "game" : location.hash === "#account" ? "account" : "home";
  const [page, setPage] = useState(pageFromHash());
  const [gameId, setGameId] = useState(location.hash.replace("#game/", ""));
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [cartOpen, setCartOpen] = useState(false);
  const [accountRefreshKey, setAccountRefreshKey] = useState(0);

  useEffect(() => {
    const change = () => { setPage(pageFromHash()); setGameId(location.hash.replace("#game/", "")); };
    const checkoutSuccess = () => {
      setCart([]);
      setCartOpen(false);
      setAccountRefreshKey(key => key + 1);
      location.hash = "account";
      setPage("account");
    };
    addEventListener("hashchange", change);
    addEventListener("gg:checkout-success", checkoutSuccess);
    const token = localStorage.getItem("portable_track_token");
    if (token) fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject()).then(({ user }) => setUser(user)).catch(() => localStorage.removeItem("portable_track_token"));
    return () => { removeEventListener("hashchange", change); removeEventListener("gg:checkout-success", checkoutSuccess); };
  }, []);

  const navigate = destination => { location.hash = destination === "account" ? "account" : "home"; setPage(destination); };
  const logout = () => { localStorage.removeItem("portable_track_token"); setUser(null); navigate("home"); };
  const addToCart = game => { setCart(current => current.some(item => item._id === game._id) ? current : [...current, game]); setCartOpen(true); };
  const removeFromCart = gameId => setCart(current => current.filter(item => item._id !== gameId));
  const toggleWishlist = game => setWishlist(current => current.some(item => item._id === game._id) ? current.filter(item => item._id !== game._id) : [...current, game]);
  return <>{page === "account" ? <><StorePageHeader user={user} navigate={navigate} cartCount={cart.length} onOpenCart={() => setCartOpen(true)} /><AccountV2 user={user} mode={mode} setMode={setMode} setUser={setUser} navigate={navigate} logout={logout} refreshKey={accountRefreshKey} /></> : page === "game" ? <><StorePageHeader user={user} navigate={navigate} cartCount={cart.length} onOpenCart={() => setCartOpen(true)} /><GameDetail gameId={gameId} navigate={navigate} addToCart={addToCart} cart={cart} /></> : <StorefrontV2 user={user} navigate={navigate} cart={cart} wishlist={wishlist} currency={currency} setCurrency={setCurrency} addToCart={addToCart} toggleWishlist={toggleWishlist} onOpenCart={() => setCartOpen(true)} />}<SiteFooter /><CartDrawer isOpen={cartOpen} cart={cart} user={user} currency={currency} navigate={navigate} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onClear={() => setCart([])} /></>;
}

function CartDrawer({ isOpen, cart, user, currency, navigate, onClose, onRemove, onClear }) {
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = event => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen, onClose]);
  const priceOf = game => Number((Number(game.price) * (1 - Number(game.salePercent || 0) / 100)).toFixed(2));
  const formatPrice = game => {
    const price = priceOf(game);
    if (currency === "THB") return `฿${Math.round(game.thbPrice ? Number(game.thbPrice) * price / Number(game.price) : price * 36).toLocaleString()}`;
    return `$${price.toFixed(2)}`;
  };
  const total = cart.reduce((sum, game) => sum + priceOf(game), 0);
  const formattedTotal = currency === "THB" ? `฿${Math.round(cart.reduce((sum, game) => sum + (game.thbPrice ? Number(game.thbPrice) * priceOf(game) / Number(game.price) : priceOf(game) * 36), 0)).toLocaleString()}` : `$${total.toFixed(2)}`;
  const proceedToCheckout = async () => {
    if (!user) { onClose(); navigate("account"); return; }
    const token = localStorage.getItem("portable_track_token");
    if (!token) { onClose(); navigate("account"); return; }
    setCheckingOut(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/account/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gameIds: cart.map(game => game._id), paymentMethod }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to complete checkout");
      setMessage("");
      window.dispatchEvent(new Event("gg:checkout-success"));
    } catch (error) {
      setMessage(error.message);
    } finally { setCheckingOut(false); }
  };
  return <div aria-hidden={!isOpen} className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
    <button tabIndex={isOpen ? 0 : -1} aria-label="Close cart" onClick={onClose} className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-[2px]" />
    <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-white/10 bg-[#17181e] shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b6ec75]">GG MARKET</p><h2 id="cart-title" className="mt-1 text-xl font-semibold">Your cart <span className="text-sm font-normal text-white/45">({cart.length})</span></h2></div><button onClick={onClose} aria-label="Close cart" className="grid h-10 w-10 place-items-center border border-white/10 text-xl text-white/70 hover:border-[#b6ec75] hover:text-[#b6ec75]">×</button></header>
      {cart.length > 0 && <div className="flex items-center justify-between px-6 pt-4"><span className="text-xs text-white/45">{cart.length} {cart.length === 1 ? "game" : "games"}</span><button onClick={onClear} className="text-xs text-white/50 hover:text-white">Clear cart</button></div>}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{cart.length === 0 ? <div className="grid h-full content-center justify-items-center text-center"><span className="grid h-16 w-16 place-items-center border border-white/10 text-[#b6ec75]"><CartIcon /></span><h3 className="mt-5 text-lg font-medium">Your cart is empty</h3><p className="mt-2 max-w-64 text-sm leading-6 text-white/50">Add a game from the store and it will show up here.</p><button onClick={onClose} className="mt-6 bg-[#b6ec75] px-5 py-3 text-sm font-semibold text-[#17210f]">Continue shopping</button></div> : <ul className="divide-y divide-white/10">{cart.map(game => <li key={game._id} className="flex gap-4 py-4 first:pt-1"><img src={assetUrl(game.imageUrl)} alt="" className="h-24 w-[68px] shrink-0 border border-white/10 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{game.title}</p><p className="mt-1 truncate text-xs text-white/45">{game.genre || game.developer}</p><div className="mt-3 flex items-center justify-between"><strong className="text-sm text-[#b6ec75]">{formatPrice(game)}</strong><button onClick={() => onRemove(game._id)} className="text-xs text-white/45 hover:text-red-300">Remove</button></div></div></li>)}</ul>}</div>
      <footer className="border-t border-white/10 bg-[#14151a] p-6"><label className="mb-4 grid gap-2 text-xs text-white/55">Payment method<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="h-11 border border-white/10 bg-[#202127] px-3 text-sm text-white"><option value="wallet">Store wallet</option><option value="promptpay">PromptPay QR</option><option value="card">Credit / debit card</option><option value="truemoney">TrueMoney</option><option value="mobile-banking">Mobile banking</option></select></label><div className="flex items-center justify-between"><span className="text-sm text-white/55">Total</span><strong className="text-xl text-[#b6ec75]">{formattedTotal}</strong></div>{!user && cart.length > 0 && <p className="mt-2 text-xs text-white/45">Sign in is required to continue.</p>}{message && <p role="status" className="mt-3 text-xs leading-5 text-[#b6ec75]">{message}</p>}<button onClick={proceedToCheckout} disabled={!cart.length || checkingOut} className="mt-5 flex min-h-12 w-full items-center justify-center bg-[#b6ec75] px-5 text-sm font-semibold text-[#17210f] transition hover:bg-[#c5f18e] disabled:cursor-not-allowed disabled:opacity-40">{checkingOut ? "Processing…" : "Proceed to Checkout"}</button><p className="mt-3 text-center text-[10px] text-white/35">Secure checkout · Instant delivery</p></footer>
    </aside>
  </div>;
}

function SiteFooter() {
  return <footer className="mt-16 border-t border-white/10 bg-[#14151a]">
    <div className="mx-auto grid w-[min(1320px,calc(100%_-_40px))] gap-8 py-9 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <a href="#home" className="flex w-fit items-center gap-2 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-sm bg-[#b6ec75] text-sm text-[#17210f]">GG</span><span>Market</span></a>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55"><a href="#terms-of-service" className="hover:text-[#b6ec75]">Terms of Service</a><a href="#privacy-policy" className="hover:text-[#b6ec75]">Privacy Policy</a><a href="#support" className="hover:text-[#b6ec75]">Support</a></nav>
      <div className="flex flex-wrap items-center gap-2 md:justify-self-end" aria-label="Accepted payment methods"><span className="mr-1 font-mono text-[9px] text-white/35">PAYMENT</span><span aria-label="Visa" title="Visa" className="grid h-8 min-w-12 place-items-center border border-white/10 px-2 text-[10px] font-black italic text-white/70">VISA</span><span aria-label="Mastercard" title="Mastercard" className="grid h-8 w-12 place-items-center border border-white/10"><svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden="true"><circle cx="12" cy="10" r="7" fill="#e34c50"/><circle cx="20" cy="10" r="7" fill="#f3a73b" fillOpacity=".9"/></svg></span><span aria-label="PromptPay" title="PromptPay" className="grid h-8 place-items-center border border-white/10 px-2 text-[9px] font-bold text-white/70">PromptPay</span><span aria-label="TrueMoney" title="TrueMoney" className="grid h-8 place-items-center border border-white/10 px-2 text-[9px] font-bold text-white/70">TrueMoney</span></div>
      <p className="text-[10px] text-white/35 md:col-span-3">© 2026 GG Market · Secure checkout · Instant delivery</p>
    </div>
  </footer>;
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

function StorefrontV2({ user, navigate, cart, wishlist, currency, setCurrency, addToCart, toggleWishlist, onOpenCart }) {
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
      .then(data => setGames((data.length ? data : sampleGames).map(withOfficialGameArt)))
      .catch(loadError => {
        setGames(sampleGames.map(withOfficialGameArt));
        setError("");
        console.warn("Falling back to sample catalog:", loadError.message || loadError);
      })
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
  const formatPrice = (price, game) => currency === "THB" ? `฿${Math.round(game?.thbPrice ? Number(game.thbPrice) * Number(price) / Number(game.price) : Number(price) * 36).toLocaleString()}` : `$${Number(price).toFixed(2)}`;
  const finalPrice = game => Number((Number(game.price) * (1 - Number(game.salePercent || 0) / 100)).toFixed(2));
  const handleImageError = event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; };
  const searchFromHeader = event => { event.preventDefault(); setQuery(quickSearch); document.querySelector("#discover")?.scrollIntoView({ behavior: "smooth" }); };
  const selectRanking = value => { setRanking(value); setGenre("All games"); };
  const selectGenre = value => { setGenre(value); setRanking("all"); };
  const clearFilters = () => { setQuery(""); setQuickSearch(""); setGenre("All games"); setRanking("all"); setPlatform("All platforms"); setBudget("Any price"); setSort("featured"); };
  return <SteamInspiredStore {...{ user, navigate, cart, wishlist, currency, setCurrency, addToCart, toggleWishlist, onOpenCart, games, query, setQuery, genre, platform, setPlatform, budget, setBudget, sort, setSort, ranking, selectRanking, selectGenre, genres, visibleGames, loading, panel, setPanel, featured, featuredIndex, setFeaturedIndex, showNextGame, showPreviousGame, openGame, finalPrice, formatPrice, handleImageError, clearFilters }} />;

}

function SteamInspiredStore({ user, navigate, cart, wishlist, currency, setCurrency, addToCart, toggleWishlist, onOpenCart, games, query, setQuery, genre, platform, setPlatform, budget, setBudget, sort, setSort, ranking, selectRanking, selectGenre, genres, visibleGames, loading, panel, setPanel, featured, featuredIndex, setFeaturedIndex, showNextGame, showPreviousGame, openGame, finalPrice, formatPrice, handleImageError, clearFilters }) {
  const ranks = [["all", "All games"], ["top", "Top sellers"], ["new", "New releases"], ["upcoming", "Coming soon"]];
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchResults = query.trim() ? games.filter(game => `${game.title} ${game.genre} ${game.developer} ${(game.tags || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6) : [];
  const handleSearchKeyDown = event => {
    if (event.key === "Escape") { setSearchOpen(false); return; }
    if (!searchResults.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveSearchIndex(index => (index + 1) % searchResults.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveSearchIndex(index => (index - 1 + searchResults.length) % searchResults.length); }
    if (event.key === "Enter") { event.preventDefault(); setSearchOpen(false); openGame(searchResults[activeSearchIndex] || searchResults[0]); }
  };
  const card = game => {
    const wished = wishlist.some(item => item._id === game._id);
    const price = Number((Number(game.price) * (1 - Number(game.salePercent || 0) / 100)).toFixed(2));
    return <article key={game._id} className="group overflow-hidden rounded-sm border border-white/10 bg-[#191a20] transition hover:-translate-y-1 hover:border-[#9ce85b]/60">
      <button onClick={() => openGame(game)} className="relative block w-full text-left"><div className="aspect-[.76] overflow-hidden bg-black"><img src={assetUrl(game.imageUrl)} onError={handleImageError} alt={`${game.title} cover`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /></div>{game.salePercent > 0 && <span className="absolute left-2 top-2 bg-[#a4e75d] px-2 py-1 text-[10px] font-bold text-[#182110]">-{game.salePercent}%</span>}<span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-3 pb-3 pt-12"><b className="block truncate text-sm">{game.title}</b><small className="mt-1 block truncate text-white/60">{game.genre} · {game.releaseYear}</small></span></button>
      <div className="flex items-center justify-between gap-2 px-3 py-3"><div className="min-w-0"><small className="block truncate text-white/45">{game.developer}</small><strong className="mt-1 block text-sm text-[#b6ec75]">{formatPrice(price, game)}</strong></div><div className="flex gap-1"><button onClick={() => toggleWishlist(game)} aria-label={`${wished ? "Remove" : "Add"} ${game.title} wishlist`} className="grid h-8 w-8 place-items-center border border-white/10 hover:border-white/40">{wished ? "♥" : "♡"}</button><button onClick={() => addToCart(game)} aria-label={`Add ${game.title} to cart`} className="grid h-8 w-8 place-items-center border border-white/10 text-[#b6ec75] hover:border-[#b6ec75]">+</button></div></div>
    </article>;
  };
  return <main className="min-h-screen bg-[#101116] text-[#ececf0]">
    <div className="border-b border-black/30 bg-[#202127] text-[10px] text-white/55"><div className="mx-auto flex w-[min(1320px,calc(100%_-_40px))] justify-between py-2"><span>GG MARKET · YOUR NEXT FAVORITE STARTS HERE</span><span className="hidden sm:block">PC GAMES · INSTANT DELIVERY · SECURE CHECKOUT</span></div></div>
    <header className="sticky top-0 z-30 border-b border-white/[.08] bg-[#17181e]/95 backdrop-blur"><div className="mx-auto flex w-[min(1320px,calc(100%_-_40px))] flex-wrap items-center gap-3 py-3"><a href="#home" className="mr-2 flex items-center gap-2 text-xl font-bold"><span className="grid h-8 w-8 place-items-center rounded-sm bg-[#b6ec75] text-sm text-[#17210f]">GG</span>Market</a><nav className="hidden gap-5 text-sm text-white/60 md:flex"><a href="#discover" className="text-white">Store</a><a href="#discover">Community picks</a><a href="#deals">Special offers</a></nav><div className="relative order-3 w-full md:order-none md:ml-auto md:w-64"><label className="flex h-10 w-full items-center gap-2 rounded-sm border border-white/10 bg-[#101116] px-3"><span className="text-[#b6ec75]" aria-hidden="true">⌕</span><input value={query} onChange={event => { setQuery(event.target.value); setActiveSearchIndex(0); }} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)} onKeyDown={handleSearchKeyDown} role="combobox" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())} aria-controls="game-search-results" aria-activedescendant={searchOpen && searchResults[activeSearchIndex] ? `game-search-option-${searchResults[activeSearchIndex]._id}` : undefined} autoComplete="off" placeholder="Search games" className="w-full bg-transparent text-sm outline-none" /></label>{searchOpen && query.trim() && <div id="game-search-results" role="listbox" aria-label="Game search results" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto border border-white/10 bg-[#191a20] p-1 shadow-2xl">{searchResults.length ? searchResults.map((game, index) => <button id={`game-search-option-${game._id}`} key={game._id} type="button" role="option" aria-selected={index === activeSearchIndex} onPointerDown={event => event.preventDefault()} onMouseEnter={() => setActiveSearchIndex(index)} onClick={() => { setSearchOpen(false); openGame(game); }} className={`flex w-full items-center gap-3 p-2 text-left transition ${index === activeSearchIndex ? "bg-white/10" : "hover:bg-white/[.06]"}`}><img src={assetUrl(game.imageUrl)} onError={handleImageError} alt="" className="h-14 w-10 shrink-0 border border-white/10 object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{game.title}</strong><small className="mt-1 block truncate text-xs text-white/45">{game.genre || game.developer}</small></span><strong className="shrink-0 text-xs text-[#b6ec75]">{formatPrice(finalPrice(game), game)}</strong></button>) : <p className="px-3 py-4 text-sm text-white/50">No games found.</p>}</div>}</div><div className="ml-auto flex items-center gap-2 md:ml-0"><select value={currency} onChange={event => setCurrency(event.target.value)} className="h-10 border border-white/10 bg-[#202127] px-2 text-xs"><option>USD</option><option>THB</option></select><button onClick={() => setPanel(panel === "wishlist" ? "" : "wishlist")} className="h-10 w-10 border border-white/10">♡{wishlist.length > 0 && ` ${wishlist.length}`}</button><button onClick={onOpenCart} aria-label={`Cart${cart.length ? `, ${cart.length} items` : ""}`} title="Cart" className="grid h-10 w-10 place-items-center border border-white/10 text-white/75 transition hover:border-[#b6ec75] hover:text-[#b6ec75]"><CartIcon />{cart.length > 0 && <span className="ml-0.5 text-[10px]">{cart.length}</span>}</button><button onClick={() => navigate("account")} className="rounded-sm bg-[#b6ec75] px-4 py-2.5 text-sm font-semibold text-[#17210f]">{user?.name || "Sign in"}</button></div></div></header>
    <div className="mx-auto w-[min(1320px,calc(100%_-_40px))]">
      {panel && <div className="my-3 flex flex-wrap items-center gap-2 border border-white/10 bg-[#202127] p-4"><b className="mr-2 text-xs uppercase text-[#b6ec75]">{panel === "cart" ? "Your cart" : "Your wishlist"}</b>{(panel === "cart" ? cart : wishlist).map(game => <button key={game._id} onClick={() => { setPanel(""); openGame(game); }} className="border border-white/10 px-3 py-2 text-sm">{game.title}</button>)}{(panel === "cart" ? cart : wishlist).length === 0 && <span className="text-sm text-white/50">No games here yet.</span>}<button onClick={() => setPanel("")} className="ml-auto">×</button></div>}
      {featured && <section className="relative mt-5 min-h-[350px] overflow-hidden rounded-sm border border-white/10 bg-[#24252a] md:min-h-[410px]"><div className="absolute inset-0">
        {featured.videoUrl ? (
          <video
            key={featured.videoUrl}
            className="h-full w-full object-cover"
            src={featured.videoUrl}
            poster={assetUrl(featured.mediaUrl || featured.imageUrl)}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <img src={assetUrl(featured.mediaUrl || featured.imageUrl)} onError={handleImageError} alt="" className="h-full w-full object-cover" />
        )}
      </div><div className="absolute inset-0 bg-gradient-to-r from-[#101116] via-[#101116]/85 to-[#101116]/10"/><div className="absolute left-7 top-6 flex gap-1.5">{games.map((game, index) => <button key={game._id} aria-label={`Show ${game.title}`} onClick={() => setFeaturedIndex(index)} className={`h-1 rounded-full ${featuredIndex % games.length === index ? "w-8 bg-[#b6ec75]" : "w-3 bg-white/50"}`} />)}</div><div className="relative flex min-h-[350px] max-w-3xl flex-col justify-end p-7 sm:p-10 md:min-h-[410px] md:justify-center"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b6ec75]">Spotlight · {featured.genre}</p><h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[.92] tracking-[-.055em]">{featured.title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/70">{featured.description || `Discover ${featured.title} and find your next favorite.`}</p><div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={() => openGame(featured)} className="rounded-sm bg-[#b6ec75] px-5 py-3 text-sm font-semibold text-[#17210f]">Explore game ↗</button><button onClick={() => addToCart(featured)} className="border border-white/35 bg-black/20 px-4 py-3 text-sm">Add to cart</button><span className="text-sm">From <b>{formatPrice(finalPrice(featured), featured)}</b></span></div></div><div className="absolute bottom-5 right-5 flex gap-2"><button aria-label="Previous spotlight" onClick={showPreviousGame} className="h-10 w-10 bg-black/60">←</button><button aria-label="Next spotlight" onClick={showNextGame} className="h-10 w-10 bg-[#b6ec75] text-[#17210f]">→</button></div></section>}
      <div className="mt-9 grid gap-8 lg:grid-cols-[205px_minmax(0,1fr)]"><aside className="space-y-6 lg:sticky lg:top-[82px] lg:h-fit"><section><h2 className="mb-3 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-widest text-white/40">Browse</h2>{ranks.map(([value, label]) => <button key={value} onClick={() => selectRanking(value)} className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm ${ranking === value ? "bg-[#292c31] text-[#b6ec75]" : "text-white/60 hover:bg-white/[.04]"}`}>{label}</button>)}</section><section><h2 className="mb-3 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-widest text-white/40">Genres</h2><button onClick={() => selectGenre("All games")} className="block w-full px-3 py-2 text-left text-sm text-[#b6ec75]">All genres</button>{genres.map(item => <button key={item} onClick={() => selectGenre(item)} className={`block w-full px-3 py-2 text-left text-sm ${genre === item ? "text-[#b6ec75]" : "text-white/60 hover:text-white"}`}>{item}</button>)}</section><div className="grid gap-3 border-t border-white/10 pt-5"><label className="grid gap-1 text-xs text-white/50">Platform<select value={platform} onChange={event => setPlatform(event.target.value)} className="h-10 border border-white/10 bg-[#202127] px-2 text-sm text-white"><option>All platforms</option>{[...new Set(games.flatMap(game => game.platforms || ["PC"]))].map(item => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1 text-xs text-white/50">Price<select value={budget} onChange={event => setBudget(event.target.value)} className="h-10 border border-white/10 bg-[#202127] px-2 text-sm text-white"><option>Any price</option><option>Under $100</option><option>On sale</option></select></label><label className="grid gap-1 text-xs text-white/50">Sort by<select value={sort} onChange={event => setSort(event.target.value)} className="h-10 border border-white/10 bg-[#202127] px-2 text-sm text-white"><option value="featured">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></aside>
        <section id="discover" className="min-w-0 scroll-mt-24"><div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b6ec75]">The GG collection</p><h2 className="mt-2 text-3xl font-semibold">Discover games</h2></div><span className="text-xs text-white/45">{visibleGames.length} titles</span></div><div className="mb-5 flex flex-wrap gap-2">{ranks.map(([value, label]) => <button key={value} onClick={() => selectRanking(value)} className={`rounded-sm px-3 py-2 text-xs ${ranking === value ? "bg-[#b6ec75] font-semibold text-[#17210f]" : "border border-white/10 text-white/60"}`}>{label}</button>)}</div>{loading && <p className="border-y border-white/10 py-8 text-white/50">Loading games…</p>}{!loading && !visibleGames.length && <div className="border border-white/10 p-8 text-center text-white/60">No games match these filters.<button onClick={clearFilters} className="ml-3 text-[#b6ec75]">Clear filters</button></div>}{visibleGames.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{visibleGames.map(card)}</div>}</section>
      </div>
      <section id="deals" className="my-12 flex flex-col justify-between gap-5 border border-[#b6ec75]/20 bg-gradient-to-r from-[#252e20] to-[#191b20] p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b6ec75]">Build your next collection</p><h2 className="mt-2 text-2xl font-semibold">Great games. Ready when you are.</h2><p className="mt-2 text-sm text-white/55">Secure checkout and instant delivery.</p></div><button onClick={() => navigate("account")} className="w-fit bg-[#b6ec75] px-5 py-3 text-sm font-semibold text-[#17210f]">{user ? "Visit your account" : "Join GG Market"} ↗</button></section>
      
    </div>
  </main>;
}

function GameDetail({ gameId, navigate, addToCart, cart }) {
  const [game, setGame] = useState(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`${API_URL}/games/${gameId}`).then(response => response.ok ? response.json() : Promise.reject(new Error("Game not found"))).then(game => setGame(withOfficialGameArt(game))).catch(error => setError(error.message)); }, [gameId]);
  if (error) return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-16"><button onClick={() => navigate("home")} className="text-muted hover:text-lime">← Back to store</button><p className="mt-10 text-orange-300">{error}</p></main>;
  if (!game) return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-16 text-muted">Loading game…</main>;
  const displayGame = { ...game, basePrice: Number(game.price), price: Number(game.price), sale: game.salePercent ? `${game.salePercent}% OFF` : "FULL PRICE" };
  return <main className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_48px))] py-14"><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><section className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]"><img src={assetUrl(game.imageUrl)} alt={`${game.title} cover`} className="aspect-[2/3] w-full border border-white/15 object-cover object-center" /><div><p className="font-mono text-[11px] text-lime">GAME DETAILS</p><h1 className="mt-4 text-5xl tracking-[-.06em]">{game.title}</h1><p className="mt-3 text-muted">{game.developer} · {game.genre} · {game.releaseYear}</p><p className="mt-8 max-w-2xl leading-relaxed text-muted">{game.description || "Discover your next great adventure."}</p>{game.maturityWarning && <div className="mt-8 border-l-2 border-orange-300 bg-orange-300/10 p-4 text-sm text-orange-100" role="note"><p className="font-mono text-[10px] text-orange-300">CONTENT WARNING</p><p className="mt-2 leading-relaxed">{game.maturityWarning}</p></div>}</div></section><AboutGame game={game} /><SystemRequirements game={game} /><AdditionalFeaturesSidebar game={game} /><ReviewsSection game={game} /><PurchaseSection games={[displayGame]} addToCart={addToCart} cart={cart} /></main>;
}

function AboutGame({ game }) {
  const paragraphs = (game.detailedDescription || game.description || "Discover a carefully crafted world filled with memorable moments.").split(/\n+/).filter(Boolean);
  const features = game.keyFeatures?.length ? game.keyFeatures : ["Explore a world shaped by your choices", "Master a flexible mix of abilities and tools", "Follow a story built around discovery"];
  const mediaUrl = assetUrl(game.mediaUrl || game.imageUrl);
  return <section className="mt-16 border-y border-white/15 py-14" aria-labelledby="about-game-title"><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><div><p className="font-mono text-[11px] text-lime">ABOUT THIS GAME</p><h2 id="about-game-title" className="mt-3 text-4xl tracking-[-.05em]">The full story.</h2><div className="mt-7 grid gap-5 text-[15px] leading-7 text-muted">{paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}</div><div className="mt-10 border-t border-white/15 pt-7"><p className="font-mono text-[10px] text-lime">HOW IT PLAYS</p><p className="mt-3 leading-7 text-muted">{game.gameplayDescription || "Move through each encounter at your own pace, combine your abilities, and let exploration guide the next objective."}</p></div><div className="mt-8 border-t border-white/15 pt-7"><p className="font-mono text-[10px] text-lime">STORY HIGHLIGHTS</p><p className="mt-3 leading-7 text-muted">{game.storyHighlights || "Every discovery adds context to the world and brings you closer to the mystery at its heart."}</p></div></div><aside className="h-fit border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">KEY FEATURES</p><ul className="mt-5 grid gap-4">{features.map(feature => <li key={feature} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-lime" />{feature}</li>)}</ul></aside></div><figure className="mt-12 border border-white/15 bg-black/20"><img src={mediaUrl} alt={`${game.title} gameplay or artwork`} className="block h-auto w-full" /><figcaption className="flex flex-wrap justify-between gap-3 border-t border-white/15 px-4 py-3 font-mono text-[10px] text-muted"><span>{game.mediaUrl ? "GAMEPLAY / MEDIA" : "FEATURED ARTWORK"}</span><span>{game.title.toUpperCase()}</span></figcaption></figure></section>;
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
  return <section className="grid min-w-0 gap-8 border-b border-white/15 py-14 xl:grid-cols-[minmax(0,1fr)_320px]" aria-labelledby="additional-features-title"><div className="min-w-0"><p className="font-mono text-[11px] text-lime">GAME FEATURES</p><h2 id="additional-features-title" className="mt-3 text-4xl tracking-[-.05em]">Built for your setup.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map(feature => <div key={feature.label} className={`flex min-w-0 items-center gap-4 border p-4 ${feature.enabled === false ? "border-white/10 opacity-40" : "border-white/15 bg-white/[.03]"}`}><span className="grid h-9 w-9 shrink-0 place-items-center border border-lime/40 text-lime" aria-hidden="true"><FeatureGlyph label={feature.label} /></span><span className="min-w-0 text-sm">{feature.label}</span><span className="ml-auto text-lime" aria-label={feature.enabled === false ? "Not supported" : "Supported"}>{feature.enabled === false ? "—" : "✓"}</span></div>)}</div></div><aside className="h-fit min-w-0 border border-white/15 bg-emerald-950/35 p-5"><p className="font-mono text-[10px] text-muted">EXTERNAL LINKS</p><div className="mt-4 grid gap-2">{fallbackLinks.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-white/10 py-3 text-sm transition hover:border-lime hover:text-lime"><span>{label}</span><span aria-hidden="true">↗</span></a>)}</div></aside></section>;
}

function FeatureGlyph({ label }) {
  const type = label.toLowerCase();
  if (type.includes("cloud")) return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z" /></svg>;
  if (type.includes("achievement")) return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></svg>;
  if (type.includes("online")) return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 19a6 6 0 0 1 12 0m1-11a3 3 0 0 1 0 6m2 1a5 5 0 0 1 3 4" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 8h10a4 4 0 0 1 3.8 5.2l-.7 2.3a2 2 0 0 1-3.2 1l-2.1-1.6H9.2l-2.1 1.6a2 2 0 0 1-3.2-1l-.7-2.3A4 4 0 0 1 7 8Z" /><path d="M8 11v4m-2-2h4m5-1h.01M17 14h.01" /></svg>;
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

function PurchaseSection({ games, addToCart: addGameToCart, cart: cartItems }) {
  const [selectedId, setSelectedId] = useState("");
  const [edition, setEdition] = useState("standard");
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
  const inCart = cartItems.some(item => item._id === game._id);
  const buyNow = async () => {
    const token = localStorage.getItem("portable_track_token");
    if (!token) { location.hash = "account"; return; }
    setCheckoutMessage("Processing order...");
    try {
      const response = await fetch(`${API_URL}/account/orders/checkout`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ gameIds: [game._id], paymentMethod }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to complete checkout");
      window.dispatchEvent(new Event("gg:checkout-success"));
    } catch (error) { setCheckoutMessage(error.message || "Unable to complete checkout"); }
  };
  return <section className="border-b border-white/15 py-12" aria-labelledby="purchase-title">
    <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><p className="font-mono text-[11px] text-lime">PURCHASE & PROMOTIONS</p><h2 id="purchase-title" className="mt-3 text-3xl tracking-[-.04em]">Get {game.title}</h2><div className="mt-5 flex flex-wrap gap-2">{games.map(item => <button key={item._id} onClick={() => { setSelectedId(item._id); setEdition("standard"); }} className={`border px-3 py-2 text-sm ${item._id === game._id ? "border-lime bg-lime text-moss" : "border-white/15 text-muted hover:border-lime"}`}>{item.title}</button>)}</div><div className="mt-7 grid gap-3">{editions.map(item => <button key={item.id} onClick={() => setEdition(item.id)} className={`flex items-center justify-between border p-4 text-left transition ${edition === item.id ? "border-lime bg-lime/10" : "border-white/15 hover:border-lime/60"}`}><span><b className="block">{item.name}</b><small className="mt-1 block text-muted">{item.detail}</small></span><strong>${item.price.toFixed(2)}</strong></button>)}</div></div>
    <aside className="h-fit border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[11px] text-muted">{choice.name.toUpperCase()}</p>{discount > 0 && <span className="mt-4 inline-block bg-lime px-2 py-1 text-xs font-bold text-moss">-{discount}%</span>}<div className="mt-4 flex items-end gap-3">{discount > 0 && <del className="pb-1 text-muted">${game.basePrice.toFixed(2)}</del>}<strong className="text-4xl text-lime">${choice.price.toFixed(2)}</strong></div><p className="mt-2 text-sm text-muted">Instant Key Delivery · Secure checkout</p><select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="mt-6 min-h-11 w-full border border-white/15 bg-moss px-3 text-sm text-ink"><option value="wallet">Store wallet</option><option value="promptpay">PromptPay QR</option><option value="card">Credit / debit card</option><option value="truemoney">TrueMoney</option><option value="mobile-banking">Mobile banking</option></select><Button onClick={buyNow} className="mt-3 w-full">Get game</Button><Button onClick={() => addGameToCart(displayGame)} className="mt-3 w-full bg-transparent text-lime ring-1 ring-white/15">{inCart ? "Added to cart" : "Add to cart"}</Button><button onClick={() => setWishlist(current => current.includes(game._id) ? current.filter(id => id !== game._id) : [...current, game._id])} className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 border ${isWishlisted ? "border-lime text-lime" : "border-white/15 text-ink hover:border-lime"}`}>{isWishlisted ? "♥ Wishlisted" : "♡ Add to wishlist"}</button><p className="mt-5 min-h-5 text-xs text-lime">{checkoutMessage}</p><p className="mt-2 font-mono text-[10px] text-muted">CART: {cartItems.length} · WISHLIST: {wishlist.length}</p></aside></div>
  </section>;
}

function AccountV2({ user, mode, setMode, setUser, navigate, logout, refreshKey }) {
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
  if (user) return <AccountDashboard user={user} setUser={setUser} navigate={navigate} logout={logout} refreshKey={refreshKey} />;
  return <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%_-_48px))] items-center gap-16 py-14 lg:grid-cols-[1fr_470px]"><section><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><div className="mt-14 grid h-12 w-12 place-items-center -rotate-6 bg-lime font-mono text-sm text-moss">GG</div><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {isLogin ? "WELCOME BACK" : "NEW ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Level up<br /><span className="text-lime">your game.</span></h1><p className="mt-7 max-w-[370px] text-[17px] leading-relaxed text-muted">Your library, orders, wallet, and account security in one place.</p></section><section className="border border-white/15 bg-emerald-950/50 p-7 backdrop-blur sm:p-10"><div className="border-b border-white/15 pb-8"><span className="font-mono text-[11px] text-lime">0{isLogin ? "1" : "2"}</span><h2 className="mt-3 text-2xl">{challengeToken ? "Verify your sign-in" : isLogin ? "Welcome back, gamer" : "Create your gamer account"}</h2><p className="mt-2 text-sm text-muted">{challengeToken ? "A one-time code is required to continue." : isLogin ? "Sign in to access your games and orders." : "Create an account to start shopping."}</p></div>{challengeToken ? <form onSubmit={verifyLogin} className="grid gap-5 pt-8"><Field label="One-time code" name="code" value={otp} onChange={event => setOtp(event.target.value)} inputMode="numeric" placeholder="6-digit code" /><p className="text-sm text-orange-300">{message}{developmentOtp && ` Development code: ${developmentOtp}`}</p><Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify sign-in"}</Button></form> : <form onSubmit={submit} className="grid gap-5 pt-8">{!isLogin && <Field name="name" label="Name" type="text" placeholder="Your name" minLength="2" />}<Field name="email" label="Email" type="email" placeholder="you@example.com" /><Field name="password" label="Password" type="password" placeholder="At least 8 characters" minLength="8" /><p className="min-h-5 text-sm text-orange-300">{message}</p><Button type="submit" disabled={loading}>{loading ? "Connecting..." : isLogin ? "Enter workspace" : "Create account"}</Button></form>}<button onClick={() => { setMode(isLogin ? "register" : "login"); setMessage(""); }} className="mx-auto mt-7 block text-sm text-muted hover:text-lime">{isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

function MockPromptPayQR({ amount }) {
  const size = 29;
  const isFinder = (row, col, left, top) => row >= top && row < top + 7 && col >= left && col < left + 7;
  const cellIsDark = (row, col) => {
    for (const [left, top] of [[0, 0], [22, 0], [0, 22]]) if (isFinder(row, col, left, top)) {
      const r = row - top; const c = col - left;
      return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
    return (row * 17 + col * 31 + row * col * 7) % 11 < 5;
  };
  const cells = [];
  for (let row = 0; row < size; row += 1) for (let col = 0; col < size; col += 1) if (cellIsDark(row, col)) cells.push(<rect key={`${row}-${col}`} x={col * 10} y={row * 10} width="10" height="10" />);
  return <div className="mx-auto w-fit border-8 border-white bg-white p-2 shadow-xl"><svg viewBox="0 0 290 290" role="img" aria-label="Simulated PromptPay QR code" className="h-56 w-56 sm:h-64 sm:w-64" shapeRendering="crispEdges"><rect width="290" height="290" fill="white" />{cells}</svg><p className="mt-2 text-center font-mono text-[9px] font-bold tracking-[.2em] text-black">GG MARKET · DEMO</p><p className="mt-1 text-center text-xs font-semibold text-black">฿{Number(amount).toLocaleString()}</p></div>;
}

function AccountDashboard({ user, setUser, navigate, logout, refreshKey }) {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [otp, setOtp] = useState("");
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [cdKey, setCdKey] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const token = localStorage.getItem("portable_track_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const loadAccount = () => fetch(`${API_URL}/account`, { headers }).then(response => response.ok ? response.json() : Promise.reject(new Error("Unable to load account"))).then(setAccount).catch(error => setMessage(error.message));
  useEffect(() => { loadAccount(); }, [refreshKey]);
  const request2FA = async () => {
    try {
      const response = await fetch(`${API_URL}/account/2fa/request`, { method: "POST", headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to request OTP");
      setMessage(`${result.message}${result.developmentOtp ? ` Development code: ${result.developmentOtp}` : ""}`);
    } catch (error) { setMessage(error.message); }
  };
  const verify2FA = async event => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/account/2fa/verify`, { method: "POST", headers, body: JSON.stringify({ code: otp }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to verify OTP");
      setUser({ ...user, twoFactorEnabled: true }); setMessage("Two-factor authentication enabled."); loadAccount();
    } catch (error) { setMessage(error.message); }
  };
  const topUp = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const amount = Number(new FormData(form).get("amount"));
    setTopUpLoading(true);
    try {
      const request = await fetch(`${API_URL}/account/wallet/top-up`, { method: "POST", headers, body: JSON.stringify({ amount, paymentMethod: "promptpay" }) });
      const requestResult = await request.json();
      if (!request.ok) throw new Error(requestResult.message || "Unable to request top-up");
      const payment = await fetch(`${API_URL}/account/wallet/top-up/simulate-success`, { method: "POST", headers, body: JSON.stringify({ amount }) });
      const paymentResult = await payment.json();
      if (!payment.ok) throw new Error(paymentResult.message || "Unable to complete simulated top-up");
      setAccount(current => ({ ...current, account: paymentResult.account }));
      setMessage(`Wallet topped up by $${Number(paymentResult.creditedAmount).toFixed(2)} (฿${Number(amount).toLocaleString()}).`);
      form.reset();
    } catch (error) { setMessage(error.message); }
    finally { setTopUpLoading(false); }
  };
  const simulatePayment = async () => {
    setTopUpLoading(true);
    try {
      const response = await fetch(`${API_URL}/account/wallet/top-up/simulate-success`, { method: "POST", headers, body: JSON.stringify({ amount: topUpAmount }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to simulate payment");
      setAccount(current => ({ ...current, account: result.account })); setTopUpOpen(false);
      setMessage(`Simulated payment complete: +$${Number(result.creditedAmount).toFixed(2)}.`);
    } catch (error) { setMessage(error.message); }
    finally { setTopUpLoading(false); }
  };
  const redeemKey = async event => {
    event.preventDefault(); setRedeeming(true);
    try {
      const response = await fetch(`${API_URL}/account/redeem`, { method: "POST", headers, body: JSON.stringify({ key: cdKey }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to redeem CD-Key");
      setCdKey(""); setRedeemOpen(false); setMessage(result.message || "Game added to your library."); await loadAccount();
    } catch (error) { setMessage(error.message); }
    finally { setRedeeming(false); }
  };
  const copyKey = async key => {
    try { await navigator.clipboard.writeText(key); setCopiedKey(true); setToast("CD-Key copied to clipboard"); window.setTimeout(() => { setCopiedKey(false); setToast(""); }, 2200); }
    catch { setMessage("Unable to access clipboard. Select and copy the key manually."); }
  };
  if (!account) return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14 text-muted">Loading account...</main>;
  const library = account.orders.flatMap(order => order.items.filter(item => item.key).map(item => ({ ...item, orderNumber: order.orderNumber, deliveredAt: order.deliveredAt })));
  return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14">
    <button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button>
    <div className="mt-12 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[11px] text-lime">PLAYER ACCOUNT</p><h1 className="mt-4 text-5xl tracking-[-.06em]">Welcome, <span className="text-lime">{account.account.name}.</span></h1><p className="mt-3 text-muted">{account.account.email}</p></div><button onClick={logout} className="border border-white/15 px-5 py-3 text-sm">Log out</button></div>
    <section className="mt-12 grid gap-4 md:grid-cols-3"><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">WALLET BALANCE</p><strong className="mt-3 block text-3xl text-lime">${Number(account.account.walletBalance || 0).toFixed(2)}</strong></div><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">LIBRARY ITEMS</p><strong className="mt-3 block text-3xl">{library.length}</strong></div><div className="border border-white/15 bg-white/[.03] p-5"><p className="font-mono text-[10px] text-muted">2FA STATUS</p><strong className="mt-3 block text-3xl text-lime">{account.account.twoFactorEnabled ? "ON" : "OFF"}</strong></div></section>
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[11px] text-lime">YOUR LIBRARY / PURCHASE HISTORY</p><h2 className="mt-3 text-3xl">Owned games and keys.</h2></div><button onClick={() => { setRedeemOpen(open => !open); setMessage(""); }} className="border border-lime/50 px-4 py-2.5 text-sm text-lime hover:bg-lime/10">Redeem CD-Key</button></div>
        {redeemOpen && <form onSubmit={redeemKey} className="mt-5 grid gap-3 border border-white/15 bg-white/[.03] p-4 sm:grid-cols-[1fr_auto]"><label className="grid gap-2 text-xs text-muted">CD-Key<input value={cdKey} onChange={event => setCdKey(event.target.value)} minLength={8} maxLength={80} required autoComplete="off" placeholder="XXXX-XXXX-XXXX-XXXX" className="h-11 border border-white/15 bg-[#101116] px-3 text-sm text-white outline-none focus:border-lime" /></label><button disabled={redeeming} className="self-end bg-lime px-5 py-3 text-sm font-semibold text-moss disabled:opacity-60">{redeeming ? "Redeeming..." : "Redeem game"}</button></form>}
        <div className="mt-6 grid gap-3">{library.length ? library.map(item => <article key={`${item.orderNumber}-${item.game?._id || item.title}`} className="grid gap-4 border border-white/15 bg-white/[.03] p-4 sm:grid-cols-[88px_1fr] sm:p-5"><img src={assetUrl(item.game?.imageUrl || item.imageUrl || fallbackImage)} alt={`${item.title} cover`} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} className="aspect-[.76] w-[88px] border border-white/10 object-cover" /><div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-2"><div><strong>{item.title}</strong><p className="mt-1 text-xs text-muted">{`${item.orderNumber} · Delivered ${item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString() : ""}`}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-2"><code className="max-w-full break-all border border-lime/30 bg-black/20 px-3 py-2 text-xs text-lime">{item.key}</code><button onClick={() => copyKey(item.key)} className="border border-white/15 px-3 py-2 text-xs hover:border-lime">{copiedKey ? "Copied" : "Copy Key"}</button><button onClick={() => setMessage(`${item.title} added to your install queue.`)} className="bg-lime px-3 py-2 text-xs font-semibold text-moss">Install/Play</button></div></div></article>) : <div className="border border-dashed border-white/15 bg-white/[.02] p-8 text-center"><button onClick={() => navigate("home")} className="bg-lime px-5 py-3 text-sm font-semibold text-moss">Browse Store</button></div>}</div>
        <h2 className="mt-12 text-3xl">All orders.</h2><div className="mt-5 grid gap-3">{account.orders.map(order => { const completed = order.paymentStatus === "paid" || order.deliveryStatus === "delivered"; const pending = order.paymentStatus === "pending"; return <article key={order._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-4 text-sm"><div className="min-w-0"><span className="block truncate">{order.orderNumber}</span><span className={`mt-1 inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${completed ? "border-lime/30 bg-lime/10 text-lime" : pending ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : "border-white/15 text-white/50"}`}>{completed ? "Completed" : pending ? "Pending" : order.paymentStatus}</span></div><div className="flex items-center gap-3"><span className="text-muted">{order.paymentMethod}</span><strong>${Number(order.total).toFixed(2)}</strong></div></article>; })}</div>
      </section>
      <aside className="grid h-fit gap-5"><section className="border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[10px] text-lime">ADD TO WALLET</p><form onSubmit={topUp} className="mt-5 grid gap-4"><label className="grid gap-2 text-xs text-muted">Amount (THB)<input name="amount" type="number" min="50" max="50000" step="50" placeholder="Amount" required className="border-b border-white/15 bg-transparent px-0 py-3 text-sm text-ink outline-none focus:border-lime" /></label><p className="text-xs text-muted">Payment method: PromptPay QR</p><button disabled={topUpLoading} className="bg-lime px-4 py-3 font-semibold text-moss disabled:opacity-60">{topUpLoading ? "Preparing QR..." : "Request top-up ↗"}</button></form></section><section className="border border-white/15 bg-emerald-950/40 p-6"><p className="font-mono text-[10px] text-lime">ACCOUNT SECURITY</p>{account.account.twoFactorEnabled ? <p className="mt-4 text-sm text-lime">Two-factor authentication is active.</p> : <form onSubmit={verify2FA} className="mt-4 grid gap-4"><button type="button" onClick={request2FA} className="border border-white/15 px-4 py-3 text-left text-sm">Send OTP</button><input value={otp} onChange={event => setOtp(event.target.value)} placeholder="Enter OTP" className="border-b border-white/15 bg-transparent px-0 py-3 outline-none focus:border-lime" /><button className="bg-lime px-4 py-3 font-semibold text-moss">Enable 2FA</button></form>}</section></aside>
    </div>
    {topUpOpen && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><button aria-label="Close PromptPay modal" onClick={() => setTopUpOpen(false)} className="absolute inset-0 h-full w-full" /><section role="dialog" aria-modal="true" aria-labelledby="promptpay-title" className="relative z-10 my-auto w-full max-w-md border border-white/15 bg-[#17181e] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[.18em] text-lime">WALLET TOP-UP / DEMO</p><h2 id="promptpay-title" className="mt-2 text-2xl">PromptPay QR</h2><p className="mt-2 text-sm text-muted">Scan simulation only. No real payment will be made.</p></div><button onClick={() => setTopUpOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center border border-white/15 text-xl">×</button></div><div className="mt-6 rounded-sm bg-white p-4"><MockPromptPayQR amount={topUpAmount} /></div><p className="mt-5 text-center text-sm text-muted">Top up <strong className="text-lime">฿{Number(topUpAmount).toLocaleString()}</strong> to your wallet</p><button onClick={simulatePayment} disabled={topUpLoading} className="mt-5 min-h-12 w-full bg-lime px-5 text-sm font-semibold text-moss disabled:opacity-60">{topUpLoading ? "Updating wallet..." : "จำลองชำระเงินสำเร็จ"}</button></section></div>}
    {toast && <div role="status" aria-live="polite" className="fixed bottom-6 right-5 z-[70] max-w-[calc(100vw-2.5rem)] border border-lime/40 bg-[#17181e] px-4 py-3 text-sm text-lime shadow-2xl">{toast}</div>}
  </main>;
}
function Account({ user, mode, setMode, setUser, navigate, logout }) {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); const isLogin = mode === "login";
  const submit = async event => { event.preventDefault(); setLoading(true); setMessage(""); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch(`${API_URL}/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Something went wrong"); localStorage.setItem("portable_track_token", result.token); setUser(result.user); } catch (error) { setMessage(error.message.includes("fetch") ? "Cannot connect to the server. Check that the API is running." : error.message); } finally { setLoading(false); } };
  if (user) return <main className="mx-auto min-h-screen w-[min(1120px,calc(100%_-_48px))] py-14"><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {user.role === "admin" ? "ADMIN" : "ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Good to see you,<br /><span className="text-lime">{user.name}.</span></h1><section className="mt-12 flex max-w-[590px] flex-col items-start justify-between gap-5 border-y border-white/15 p-6 sm:flex-row sm:items-center"><div><span className="font-mono text-[11px] text-muted">SIGNED IN AS</span><strong className="mt-2 block font-normal">{user.email}</strong></div><button onClick={logout} className="border border-white/15 px-5 py-3">Log out</button></section>{user.role === "admin" && <AdminDashboard />}</main>;
  return <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%_-_48px))] items-center gap-16 py-14 lg:grid-cols-[1fr_470px]"><section><button onClick={() => navigate("home")} className="text-sm text-muted hover:text-lime">← Back to store</button><div className="mt-14 grid h-12 w-12 place-items-center -rotate-6 bg-lime font-mono text-sm text-moss">GG</div><p className="mt-14 font-mono text-[11px] text-muted">GG MARKET / {isLogin ? "WELCOME BACK" : "NEW ACCOUNT"}</p><h1 className="mt-5 text-[clamp(3.4rem,7vw,5.5rem)] leading-[.92] tracking-[-.06em]">Level up<br /><span className="text-lime">your game.</span></h1><p className="mt-7 max-w-[370px] text-[17px] leading-relaxed text-muted">Discover great games, new releases, and exclusive deals.</p></section><section className="border border-white/15 bg-emerald-950/50 p-7 backdrop-blur sm:p-10"><div className="border-b border-white/15 pb-8"><span className="font-mono text-[11px] text-lime">0{isLogin ? "1" : "2"}</span><h2 className="mt-3 text-2xl">{isLogin ? "Welcome back, gamer" : "Create your gamer account"}</h2><p className="mt-2 text-sm text-muted">{isLogin ? "Sign in to discover your next game." : "Create an account to start shopping."}</p></div><form onSubmit={submit} className="grid gap-5 pt-8">{!isLogin && <Field name="name" label="Name" type="text" placeholder="Your name" minLength="2" />}<Field name="email" label="Email" type="email" placeholder="you@example.com" /><Field name="password" label="Password" type="password" placeholder="At least 8 characters" minLength="8" /><p className="min-h-5 text-sm text-orange-300">{message}</p><Button type="submit" disabled={loading}>{loading ? "Connecting..." : isLogin ? "Enter workspace" : "Create account"}</Button></form><button onClick={() => { setMode(isLogin ? "register" : "login"); setMessage(""); }} className="mx-auto mt-7 block text-sm text-muted hover:text-lime">{isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

function Field({ label, ...props }) { return <label className="grid gap-2 font-mono text-[11px] text-muted">{label}<input {...props} required className="w-full border border-white/10 bg-[#101116] px-3 py-3 text-base outline-none placeholder:text-white/30 focus:border-[#b6ec75]" /></label>; }

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

const mongoose = require("mongoose");
const Game = require("../models/game.model");

const forzaCoverSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0b0d13"/>
        <stop offset="45%" stop-color="#261a11"/>
        <stop offset="100%" stop-color="#0d0d0d"/>
      </linearGradient>
      <linearGradient id="glow" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#ffc44d"/>
        <stop offset="50%" stop-color="#f29e2b"/>
        <stop offset="100%" stop-color="#ff7e32"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="1600" fill="url(#bg)"/>
    <circle cx="925" cy="200" r="190" fill="#f2b141" opacity="0.18"/>
    <circle cx="220" cy="320" r="220" fill="#f9b141" opacity="0.14"/>
    <g transform="translate(130 260)">
      <path d="M90 630 L250 430 L560 410 C630 350 720 350 820 410 L1010 470 L1040 540 L1050 640 L1000 700 L890 725 L850 760 L630 800 L290 800 L150 735 L80 680 Z" fill="url(#glow)"/>
      <path d="M230 520 L330 430 L520 400 L760 420 L860 500 L830 620 L220 620 Z" fill="#f7c867" opacity="0.9"/>
      <path d="M380 430 L510 310 L620 300 L710 360 L760 440 L430 440 Z" fill="#1d1b1a" opacity="0.45"/>
      <path d="M250 640 L430 670 L780 670 L940 640 L1000 700 L1000 760 L80 760 L80 700 Z" fill="#0e0e0e" opacity="0.28"/>
      <circle cx="310" cy="790" r="130" fill="#101112"/>
      <circle cx="310" cy="790" r="60" fill="#272b35"/>
      <circle cx="840" cy="790" r="130" fill="#101112"/>
      <circle cx="840" cy="790" r="60" fill="#272b35"/>
      <path d="M310 780 L370 620 L460 610 L450 780 Z" fill="#1d1d1d" opacity="0.7"/>
      <path d="M770 780 L720 620 L620 610 L630 780 Z" fill="#1d1d1d" opacity="0.7"/>
      <path d="M610 420 L680 500 L760 510 L760 620 L620 620 L560 520 Z" fill="#111213" opacity="0.55"/>
    </g>
    <g fill="#fff" font-family="Arial, Helvetica, sans-serif" font-weight="900" text-anchor="middle">
      <text x="600" y="140" font-size="118" letter-spacing="12">FORZA</text>
      <text x="600" y="250" font-size="140" letter-spacing="4">HORIZON 6</text>
    </g>
    <g fill="#f0f2f6" opacity="0.7" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700">
      <text x="600" y="1360" text-anchor="middle">PLAY ANYWHERE</text>
    </g>
  </svg>
`)}`;

const fallbackGames = [
    {
        _id: "elden-ring",
        title: "ELDEN RING",
        developer: "FromSoftware, Inc.",
        genre: "ACTION RPG / OPEN WORLD",
        releaseYear: 2022,
        price: 59.99,
        salePercent: 20,
        description: "Rise, Tarnished, and be guided by grace across the vast Lands Between in a challenging open-world action RPG.",
        detailedDescription: "ELDEN RING is a dark fantasy action RPG set in the Lands Between, a world shaped by myth, mystery, and the shattered Elden Ring. Explore vast fields, ruined kingdoms, hidden catacombs, and legacy dungeons at your own pace.\n\nBuild a character that feels truly yours by combining weapons, spells, skills, summons, and gear. Every path can reveal a new challenge, a quiet story, or a powerful secret.",
        keyFeatures: ["Explore a vast open world", "Deep character customization", "Challenging action combat", "Discoverable story and lore", "Co-op and competitive multiplayer"],
        gameplayDescription: "Read enemy patterns, choose when to attack, and build your own strategy around timing, positioning, equipment, and exploration. The open world lets you leave a difficult encounter and return with a new approach.",
        storyHighlights: "The Tarnished returns to the Lands Between after the shattering of the Elden Ring. Follow the guidance of grace, uncover the ambitions of the demigods, and decide what the next age will become.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
        maturityWarning: "Fantasy violence, blood and gore, disturbing imagery, and mature themes.",
        systemRequirements: {
            minimum: { os: "Windows 10", cpu: "Intel Core i5-8400 / AMD Ryzen 3 3300X", ram: "12 GB RAM", gpu: "GTX 1060 3 GB / RX 580 4 GB", storage: "60 GB available space" },
            recommended: { os: "Windows 10/11", cpu: "Intel Core i7-8700K / AMD Ryzen 5 3600X", ram: "16 GB RAM", gpu: "GTX 1070 8 GB / RX Vega 56 8 GB", storage: "60 GB SSD space" },
            supportedLanguages: [
                { language: "English", subtitles: true, audio: true, menu: true },
                { language: "Thai", subtitles: false, audio: false, menu: false },
                { language: "Japanese", subtitles: true, audio: true, menu: true },
            ],
        },
        platformFeatures: [
            { label: "Single-player", icon: "◈", enabled: true },
            { label: "Online Co-op", icon: "◎", enabled: true },
            { label: "Achievements", icon: "◆", enabled: true },
            { label: "Full Controller Support", icon: "⌁", enabled: true },
            { label: "Cloud Saves", icon: "☁", enabled: true },
        ],
        externalLinks: {
            website: "https://en.bandainamcoent.eu/elden-ring/elden-ring",
            discord: "https://discord.com",
            social: "https://x.com/ELDENRING",
        },
        featured: true,
        platforms: ["PC", "PlayStation", "Xbox"],
        tags: ["Action", "RPG", "Open World"],
        releaseDate: "2022-02-25T00:00:00.000Z",
        unitsSold: 980000,
    },
    {
        _id: "clair-obscur-expedition-33",
        title: "Clair Obscur: Expedition 33",
        developer: "Sandfall Interactive",
        genre: "TURN-BASED RPG / ADVENTURE",
        releaseYear: 2025,
        price: 49.99,
        salePercent: 15,
        description: "A painterly turn-based RPG where every encounter feels like a living storybook.",
        detailedDescription: "Explore a dreamlike world shaped by art, memory, and sacrifice. Expedition 33 delivers a striking blend of story, tactical combat, and atmospheric exploration.\n\nEvery move matters as you balance party positioning, timing, and character abilities while uncovering the truth behind the fading world.",
        keyFeatures: ["Turn-based combat", "Stylized world design", "Party-based progression", "Atmospheric storytelling"],
        gameplayDescription: "Use timing, positioning, and synergy between party members to shape each encounter. The approach favors careful experimentation and adaptation.",
        storyHighlights: "A group of explorers journeys into a world of memory and fading light, where every encounter leaves a mark on the path ahead.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_600x900.jpg",
        maturityWarning: "Fantasy violence, blood, mature themes, and disturbing imagery.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i5-8400", ram: "8 GB RAM", gpu: "NVIDIA GTX 1060 6 GB", storage: "50 GB available space" },
            recommended: { os: "Windows 11 64-bit", cpu: "Intel Core i7-10700", ram: "16 GB RAM", gpu: "NVIDIA RTX 2060 6 GB", storage: "50 GB SSD space" },
            supportedLanguages: [
                { language: "English", subtitles: true, audio: true, menu: true },
                { language: "Thai", subtitles: true, audio: false, menu: true },
                { language: "Japanese", subtitles: true, audio: true, menu: true },
            ],
        },
        platformFeatures: [
            { label: "Single-player", icon: "◈", enabled: true },
            { label: "Achievements", icon: "◆", enabled: true },
            { label: "Full Controller Support", icon: "⌁", enabled: true },
        ],
        externalLinks: {
            website: "https://www.clairobscur.com",
            discord: "https://discord.com",
            social: "https://x.com/sandfallstudio",
        },
        featured: false,
        platforms: ["PC", "PlayStation", "Xbox"],
        tags: ["RPG", "Adventure", "Story"],
        releaseDate: "2025-04-24T00:00:00.000Z",
        unitsSold: 310000,
    },
    {
        _id: "forza-horizon-6",
        title: "Forza Horizon 6",
        developer: "Playground Games",
        genre: "RACING / OPEN WORLD",
        releaseYear: 2026,
        price: 69.99,
        salePercent: 0,
        description: "The biggest festival yet, packed with high-speed adventures and a living world built for discovery.",
        detailedDescription: "Forza Horizon 6 pushes the festival formula forward with a breathtaking open world, new events, and a soundtrack designed to make every race feel alive.\n\nCruise through scenic roads, craft your own style, and challenge rivals in a world that constantly rewards exploration.",
        keyFeatures: ["Open world driving", "Dynamic events", "Customization", "Festival culture"],
        gameplayDescription: "Drive through diverse environments, build your reputation, and take on the world’s biggest driving challenges at your own pace.",
        storyHighlights: "A new Horizon festival unfolds across a brand-new world filled with speed, spectacle, and endless discovery.",
        mediaUrl: forzaCoverSvg,
        imageUrl: forzaCoverSvg,
        maturityWarning: "No mature content warnings.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i5-8400", ram: "16 GB RAM", gpu: "NVIDIA GTX 1660", storage: "90 GB available space" },
            recommended: { os: "Windows 11 64-bit", cpu: "Intel Core i7-11700K", ram: "24 GB RAM", gpu: "NVIDIA RTX 3070", storage: "90 GB SSD space" },
            supportedLanguages: [
                { language: "English", subtitles: true, audio: true, menu: true },
                { language: "Thai", subtitles: true, audio: false, menu: true },
            ],
        },
        platformFeatures: [
            { label: "Single-player", icon: "◈", enabled: true },
            { label: "Online Multiplayer", icon: "◎", enabled: true },
            { label: "Full Controller Support", icon: "⌁", enabled: true },
        ],
        externalLinks: { website: "https://forza.net", discord: "https://discord.com", social: "https://x.com/forza" },
        featured: true,
        platforms: ["PC", "Xbox"],
        tags: ["Racing", "Open World", "Arcade"],
        releaseDate: "2026-09-15T00:00:00.000Z",
        unitsSold: 650000,
    },
    {
        _id: "resident-evil-requiem",
        title: "Resident Evil Requiem",
        developer: "CAPCOM Co., Ltd.",
        genre: "SURVIVAL HORROR / ACTION",
        releaseYear: 2026,
        price: 69.99,
        salePercent: 0,
        description: "Requiem for the dead. Nightmare for the living. A new era of survival horror from CAPCOM.",
        detailedDescription: "Experience survival horror through FBI analyst Grace Ashcroft and pulse-pounding action with legendary agent Leon S. Kennedy. Their contrasting journeys intertwine in a story set in the world of Resident Evil.",
        keyFeatures: ["Survival horror and action gameplay", "Play as Grace Ashcroft and Leon S. Kennedy", "Switch between first-person and third-person views", "Combat, investigations, puzzles, and resource management"],
        gameplayDescription: "Investigate, solve puzzles, manage resources, and fight to survive. Switch between first-person and third-person views to choose how you face each encounter.",
        storyHighlights: "FBI analyst Grace Ashcroft and DSO agent Leon S. Kennedy follow separate cases that bring them back to Raccoon City.",
        mediaUrl: "https://cdn2.steamgriddb.com/hero_thumb/2908a94a0c74238e4af35e845b0e28b0.jpg",
        imageUrl: "https://cdn2.steamgriddb.com/grid/cc6e7d0c4f62a13d5a51b8fe38b8be28.jpg",
        maturityWarning: "Frequent violence or gore and general mature content.",
        systemRequirements: {
            minimum: { os: "Windows 11 64-bit", cpu: "Intel Core i5-8500 / AMD Ryzen 5 3500", ram: "16 GB RAM", gpu: "GeForce GTX 1660 6 GB / Radeon RX 5500 XT 8 GB", storage: "SSD required" },
            recommended: { os: "Windows 11 64-bit", cpu: "Intel Core i7-8700 / AMD Ryzen 5 5500", ram: "16 GB RAM", gpu: "GeForce RTX 2060 Super 8 GB / Radeon RX 6600 8 GB", storage: "SSD required" },
            supportedLanguages: [{ language: "English", subtitles: true, audio: true, menu: true }, { language: "Thai", subtitles: true, audio: false, menu: true }],
        },
        platformFeatures: [{ label: "Single-player", icon: "â—ˆ", enabled: true }, { label: "Achievements", icon: "â—†", enabled: true }, { label: "Controller Support", icon: "âŒ", enabled: true }, { label: "Cloud Saves", icon: "â˜", enabled: true }],
        externalLinks: { website: "https://www.residentevil.com/requiem/", discord: "https://discord.com", social: "https://x.com/RE_Games" },
        featured: false,
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch 2"],
        tags: ["Survival Horror", "Action", "Zombies", "Single-player"],
        releaseDate: "2026-02-27T00:00:00.000Z",
        unitsSold: 0,
    },
    {
        _id: "hogwarts-legacy",
        title: "Hogwarts Legacy",
        developer: "Avalanche Software",
        genre: "ACTION RPG / OPEN WORLD",
        releaseYear: 2023,
        price: 59.99,
        salePercent: 0,
        description: "Explore Hogwarts and the wizarding world in an open-world action RPG set in the 1800s.",
        detailedDescription: "Hogwarts Legacy is an open-world action RPG set in the world of wizardry. Explore familiar and new locations, discover magical beasts, customize your character, craft potions, master spell casting, and upgrade your talents.\n\nAs a student in the 1800s, you hold the key to an ancient secret that threatens the wizarding world. Make allies, battle dark wizards, and decide the fate of the world around you.",
        keyFeatures: ["Explore Hogwarts and the wider wizarding world", "Learn spells and brew potions", "Discover magical beasts and hidden locations", "Shape your character and story"],
        gameplayDescription: "Attend classes, learn spells, explore the castle and its surroundings, and take on quests at your own pace. Build your skills and gear as you uncover secrets across the wizarding world.",
        storyHighlights: "Live as a student at Hogwarts in the 1800s and uncover an ancient secret with the power to change the wizarding world.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg",
        maturityWarning: "Fantasy violence, strong language, and in-game purchases.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i5-6600 / AMD Ryzen 5 1400", ram: "16 GB RAM", gpu: "NVIDIA GTX 960 4 GB / AMD RX 470 4 GB", storage: "85 GB available space" },
            recommended: { os: "Windows 10 64-bit", cpu: "Intel Core i7-8700 / AMD Ryzen 5 3600", ram: "16 GB RAM", gpu: "NVIDIA GTX 1080 Ti / AMD RX 5700 XT", storage: "85 GB SSD space" },
            supportedLanguages: [{ language: "English", subtitles: true, audio: true, menu: true }],
        },
        platformFeatures: [
            { label: "Single-player", icon: "▣", enabled: true },
            { label: "Steam Achievements", icon: "◆", enabled: true },
            { label: "Steam Cloud", icon: "☁", enabled: true },
            { label: "Controller Support", icon: "⌁", enabled: true },
        ],
        externalLinks: { website: "https://www.hogwartslegacy.com/", discord: "", social: "https://x.com/HogwartsLegacy" },
        featured: false,
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        tags: ["Action", "RPG", "Open World", "Fantasy", "Adventure"],
        releaseDate: "2023-02-10T00:00:00.000Z",
        unitsSold: 0,
    },
    {
        _id: "silent-hill-2",
        title: "SILENT HILL 2",
        developer: "Bloober Team SA",
        genre: "SURVIVAL HORROR / PSYCHOLOGICAL HORROR",
        releaseYear: 2024,
        price: 69.99,
        salePercent: 0,
        description: "A letter from his late wife brings James back to Silent Hill, where memories and monsters wait in the fog.",
        detailedDescription: "After receiving a letter from his deceased wife, James returns to Silent Hill, the place where they shared so many memories. The town is now swallowed by deep fog and filled with disturbing monsters.\n\nExplore the unsettling town, solve puzzles, and search for traces of your wife in this remake of the psychological horror classic.",
        keyFeatures: ["A reimagined psychological horror story", "Explore Silent Hill in an over-the-shoulder perspective", "Solve puzzles and search for clues", "Face monsters with updated combat and timed dodges"],
        gameplayDescription: "Explore fog-covered streets and interiors, gather clues, solve environmental puzzles, and manage your resources. Updated over-the-shoulder controls and combat bring James closer to the dangers around him.",
        storyHighlights: "James Sunderland returns to Silent Hill after receiving a letter from his late wife, hoping to see her one more time.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900.jpg",
        maturityWarning: "Frequent violence or gore and general mature content.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i7-6700K / AMD Ryzen 5 3600", ram: "16 GB RAM", gpu: "NVIDIA GTX 1070 Ti / AMD RX 5700 / Intel Arc A750", storage: "50 GB available space" },
            recommended: { os: "Windows 10 64-bit", cpu: "Intel Core i7-8700K / AMD Ryzen 5 3600X", ram: "16 GB RAM", gpu: "NVIDIA RTX 2080 / AMD RX 6800 XT", storage: "50 GB SSD space" },
            supportedLanguages: [{ language: "English", subtitles: true, audio: true, menu: true }],
        },
        platformFeatures: [
            { label: "Single-player", icon: "▣", enabled: true },
            { label: "Steam Achievements", icon: "◆", enabled: true },
            { label: "Steam Cloud", icon: "☁", enabled: true },
            { label: "Family Sharing", icon: "⌂", enabled: true },
        ],
        externalLinks: { website: "https://www.konami.com/games/silenthill/2r/", discord: "", social: "https://x.com/silenthill_jp" },
        featured: false,
        platforms: ["PC", "PlayStation"],
        tags: ["Survival Horror", "Psychological Horror", "Action", "Adventure", "Single-player"],
        releaseDate: "2024-10-08T00:00:00.000Z",
        unitsSold: 0,
    },
    {
        _id: "red-dead-redemption-2",
        title: "Red Dead Redemption 2",
        developer: "Rockstar Games",
        genre: "ACTION / OPEN WORLD / ADVENTURE",
        releaseYear: 2019,
        price: 59.99,
        salePercent: 0,
        description: "An epic tale of honor and loyalty in the final years of the American Wild West.",
        detailedDescription: "America, 1899. The age of the Wild West is coming to an end. After a robbery goes wrong, Arthur Morgan and the Van der Linde gang are forced to flee.\n\nExplore a vast and atmospheric world, take on missions, and make choices that shape Arthur's journey as the gang struggles to survive.",
        keyFeatures: ["A large, detailed open world", "A story-driven adventure as Arthur Morgan", "Hunting, fishing, and exploration", "Online multiplayer with Red Dead Online"],
        gameplayDescription: "Travel across towns, wilderness, and frontier settlements on horseback. Take on story missions, meet strangers, hunt wildlife, and decide how Arthur handles the people and challenges around him.",
        storyHighlights: "Follow Arthur Morgan and the Van der Linde gang as they evade the law and try to survive while the frontier changes around them.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg",
        maturityWarning: "Violence, strong language, mature themes, and online interactions.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i5-2500K / AMD FX-6300", ram: "8 GB RAM", gpu: "NVIDIA GTX 770 2 GB / AMD Radeon R9 280 3 GB", storage: "150 GB available space" },
            recommended: { os: "Windows 10 64-bit", cpu: "Intel Core i7-4770K / AMD Ryzen 5 1500X", ram: "12 GB RAM", gpu: "NVIDIA GTX 1060 6 GB / AMD Radeon RX 480 4 GB", storage: "150 GB available space" },
            supportedLanguages: [{ language: "English", subtitles: true, audio: true, menu: true }],
        },
        platformFeatures: [
            { label: "Single-player", icon: "▣", enabled: true },
            { label: "Online Co-op", icon: "◎", enabled: true },
            { label: "Steam Achievements", icon: "◆", enabled: true },
            { label: "Steam Cloud", icon: "☁", enabled: true },
        ],
        externalLinks: { website: "https://www.rockstargames.com/reddeadredemption2", discord: "", social: "https://x.com/RockstarGames" },
        featured: false,
        platforms: ["PC", "PlayStation", "Xbox"],
        tags: ["Action", "Open World", "Adventure", "Western", "Story Rich"],
        releaseDate: "2019-12-05T00:00:00.000Z",
        unitsSold: 0,
    },
    {
        _id: "marvels-spider-man-remastered",
        title: "Marvel’s Spider-Man Remastered",
        developer: "Insomniac Games, Nixxes Software",
        genre: "ACTION / ADVENTURE / OPEN WORLD",
        releaseYear: 2022,
        price: 59.99,
        salePercent: 0,
        description: "Swing through Marvel’s New York as an experienced Peter Parker in an original action-packed story.",
        detailedDescription: "Marvel’s Spider-Man Remastered follows an experienced Peter Parker as he fights crime and iconic villains across Marvel’s New York. As Peter and Spider-Man’s worlds collide, he must balance a complicated personal life with the fate of the city.\n\nThe PC version includes the main story and the additional chapters from The City That Never Sleeps.",
        keyFeatures: ["Web-swing through Marvel’s New York", "Fight iconic villains with fluid combat", "Play through Peter Parker’s original story", "Includes The City That Never Sleeps chapters"],
        gameplayDescription: "Move through the city by web-swinging, use gadgets and acrobatic combat against enemies, and complete story missions and side activities across New York.",
        storyHighlights: "Peter Parker faces a new threat to Marvel’s New York while trying to keep his personal life and responsibilities as Spider-Man in balance.",
        mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg",
        imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg",
        maturityWarning: "Violence, strong language, and mild suggestive themes.",
        systemRequirements: {
            minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i3-4160 / AMD equivalent", ram: "8 GB RAM", gpu: "NVIDIA GTX 950 / AMD Radeon RX 470", storage: "75 GB available space" },
            recommended: { os: "Windows 10 64-bit", cpu: "Intel Core i5-4670 / AMD Ryzen 5 1600", ram: "16 GB RAM", gpu: "NVIDIA GTX 1060 6 GB / AMD Radeon RX 580 8 GB", storage: "75 GB SSD space" },
            supportedLanguages: [{ language: "English", subtitles: true, audio: true, menu: true }],
        },
        platformFeatures: [
            { label: "Single-player", icon: "▣", enabled: true },
            { label: "Steam Achievements", icon: "◆", enabled: true },
            { label: "Steam Cloud", icon: "☁", enabled: true },
            { label: "Remote Play", icon: "⌁", enabled: true },
        ],
        externalLinks: { website: "https://www.marvel.com/games/marvels-spider-man-remastered", discord: "", social: "https://x.com/insomniacgames" },
        featured: false,
        platforms: ["PC", "PlayStation"],
        tags: ["Action", "Adventure", "Open World", "Superhero", "Single-player"],
        releaseDate: "2022-08-12T00:00:00.000Z",
        unitsSold: 0,
    },
];

const getFallbackGames = (query = {}) => {
    const search = String(query.search || "").trim().toLowerCase();
    const platform = String(query.platform || "").trim();
    const sale = String(query.sale || "").trim();
    const minPrice = Number(query.minPrice ?? 0);
    const maxPrice = Number(query.maxPrice ?? Number.MAX_SAFE_INTEGER);

    let games = fallbackGames.map((game) => ({
        ...game,
        price: Number(game.price),
        createdAt: new Date(game.releaseDate || "2025-01-01T00:00:00.000Z"),
        releaseDate: game.releaseDate || "2025-01-01T00:00:00.000Z",
    }));

    if (search) {
        games = games.filter((game) => `${game.title} ${game.genre} ${game.developer}`.toLowerCase().includes(search));
    }
    if (platform) {
        games = games.filter((game) => (game.platforms || ["PC"]).includes(platform));
    }
    if (sale === "true") {
        games = games.filter((game) => Number(game.salePercent) > 0);
    }
    if (!Number.isNaN(minPrice) && minPrice > 0) {
        games = games.filter((game) => Number(game.price) >= minPrice);
    }
    if (!Number.isNaN(maxPrice) && Number.isFinite(maxPrice)) {
        games = games.filter((game) => Number(game.price) <= maxPrice);
    }

    return games;
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;
const ensureResidentEvilInDatabase = async () => {
    const fallback = getFallbackGames({}).find((game) => game._id === "resident-evil-requiem");
    const gameData = { ...fallback };
    delete gameData._id;
    delete gameData.createdAt;
    return Game.findOneAndUpdate(
        { title: fallback.title },
        { $setOnInsert: gameData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const ensureHogwartsLegacyInDatabase = async () => {
    const fallback = getFallbackGames({}).find((game) => game._id === "hogwarts-legacy");
    const gameData = { ...fallback };
    delete gameData._id;
    delete gameData.createdAt;
    return Game.findOneAndUpdate(
        { title: fallback.title },
        { $setOnInsert: gameData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const ensureSilentHill2InDatabase = async () => {
    const fallback = getFallbackGames({}).find((game) => game._id === "silent-hill-2");
    const gameData = { ...fallback };
    delete gameData._id;
    delete gameData.createdAt;
    return Game.findOneAndUpdate(
        { title: fallback.title },
        { $setOnInsert: gameData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const ensureRedDeadRedemption2InDatabase = async () => {
    const fallback = getFallbackGames({}).find((game) => game._id === "red-dead-redemption-2");
    const gameData = { ...fallback };
    delete gameData._id;
    delete gameData.createdAt;
    return Game.findOneAndUpdate(
        { title: fallback.title },
        { $setOnInsert: gameData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const ensureSpiderManRemasteredInDatabase = async () => {
    const fallback = getFallbackGames({}).find((game) => game._id === "marvels-spider-man-remastered");
    const gameData = { ...fallback };
    delete gameData._id;
    delete gameData.createdAt;
    return Game.findOneAndUpdate(
        { title: fallback.title },
        { $setOnInsert: gameData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const getGames = async (req, res, next) => {
    try {
        const { platform, tag, minPrice, maxPrice, sale, ranking, search } = req.query;
        if (!isDatabaseReady()) {
            const games = getFallbackGames({ platform, tag, minPrice, maxPrice, sale, ranking, search });
            return res.json(games);
        }

        const filter = {};
        if (platform) filter.platforms = platform;
        if (tag) filter.tags = tag;
        if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { genre: { $regex: search, $options: "i" } }, { developer: { $regex: search, $options: "i" } }];
        if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
        if (sale === "true") filter.salePercent = { $gt: 0 };
        if (ranking === "upcoming") filter.releaseDate = { $gt: new Date() };
        const sort = ranking === "top" ? { unitsSold: -1, featured: -1 } : ranking === "new" ? { releaseDate: -1, createdAt: -1 } : { featured: -1, createdAt: -1 };
        const games = await Game.find(filter).sort(sort);
        const fallbackRequiem = getFallbackGames({ platform, minPrice, maxPrice, sale, search }).find((game) => game._id === "resident-evil-requiem");
        const includeRequiem = fallbackRequiem
            && (!tag || fallbackRequiem.tags.includes(tag))
            && ranking !== "upcoming"
            && !games.some((game) => game.title.toLowerCase() === "resident evil requiem");
        const fallbackHogwarts = getFallbackGames({ platform, minPrice, maxPrice, sale, search }).find((game) => game._id === "hogwarts-legacy");
        const includeHogwarts = fallbackHogwarts
            && (!tag || fallbackHogwarts.tags.includes(tag))
            && ranking !== "upcoming"
            && !games.some((game) => game.title.toLowerCase() === "hogwarts legacy");
        const fallbackSilentHill2 = getFallbackGames({ platform, minPrice, maxPrice, sale, search }).find((game) => game._id === "silent-hill-2");
        const includeSilentHill2 = fallbackSilentHill2
            && (!tag || fallbackSilentHill2.tags.includes(tag))
            && ranking !== "upcoming"
            && !games.some((game) => game.title.toLowerCase() === "silent hill 2");
        const fallbackRedDead = getFallbackGames({ platform, minPrice, maxPrice, sale, search }).find((game) => game._id === "red-dead-redemption-2");
        const includeRedDead = fallbackRedDead
            && (!tag || fallbackRedDead.tags.includes(tag))
            && ranking !== "upcoming"
            && !games.some((game) => game.title.toLowerCase() === "red dead redemption 2");
        const fallbackSpiderMan = getFallbackGames({ platform, minPrice, maxPrice, sale, search }).find((game) => game._id === "marvels-spider-man-remastered");
        const includeSpiderMan = fallbackSpiderMan
            && (!tag || fallbackSpiderMan.tags.includes(tag))
            && ranking !== "upcoming"
            && !games.some((game) => game.title.toLowerCase() === "marvel’s spider-man remastered");
        if (!includeRequiem && !includeHogwarts && !includeSilentHill2 && !includeRedDead && !includeSpiderMan) return res.json(games);
        const additions = [];
        if (includeRequiem) additions.push(await ensureResidentEvilInDatabase());
        if (includeHogwarts) additions.push(await ensureHogwartsLegacyInDatabase());
        if (includeSilentHill2) additions.push(await ensureSilentHill2InDatabase());
        if (includeRedDead) additions.push(await ensureRedDeadRedemption2InDatabase());
        if (includeSpiderMan) additions.push(await ensureSpiderManRemasteredInDatabase());
        res.json([...games, ...additions]);
    } catch (error) { next(error); }
};

const getGame = async (req, res, next) => {
    try {
        if (!isDatabaseReady()) {
            const game = getFallbackGames({}).find((item) => item._id === req.params.id);
            if (!game) return res.status(404).json({ message: "Game not found" });
            return res.json(game);
        }

        const game = req.params.id === "resident-evil-requiem"
            ? await ensureResidentEvilInDatabase()
            : req.params.id === "hogwarts-legacy"
                ? await ensureHogwartsLegacyInDatabase()
                : req.params.id === "silent-hill-2"
                    ? await ensureSilentHill2InDatabase()
                    : req.params.id === "red-dead-redemption-2"
                        ? await ensureRedDeadRedemption2InDatabase()
                        : req.params.id === "marvels-spider-man-remastered"
                            ? await ensureSpiderManRemasteredInDatabase()
                : await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.json(game);
    } catch (error) { next(error); }
};

const createGame = async (req, res, next) => {
    try {
        if (!isDatabaseReady()) return res.status(503).json({ message: "Database is unavailable. Set MONGO_URI to enable writes." });
        res.status(201).json(await Game.create(req.body));
    }
    catch (error) { next(error); }
};

const updateGame = async (req, res, next) => {
    try {
        if (!isDatabaseReady()) return res.status(503).json({ message: "Database is unavailable. Set MONGO_URI to enable writes." });
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.json(game);
    } catch (error) { next(error); }
};

const deleteGame = async (req, res, next) => {
    try {
        if (!isDatabaseReady()) return res.status(503).json({ message: "Database is unavailable. Set MONGO_URI to enable writes." });
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.status(204).end();
    } catch (error) { next(error); }
};

module.exports = { getGames, getGame, createGame, updateGame, deleteGame, getFallbackGames };

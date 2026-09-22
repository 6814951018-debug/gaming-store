require("dotenv").config();

const mongoose = require("mongoose");
const Game = require("../models/game.model");
const Review = require("../models/review.model");

const eldenRing = {
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
    previewUrl: "https://video.akamai.steamstatic.com/store_trailers/1245620/468143/7a6be00f78fb0fd8b419e92cea72cc4a19ec45f8/1750650501/hls_264_master.m3u8?t=1716311566",
    previewPoster: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/256889452/movie.293x165.jpg?t=1716311566",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
    maturityWarning: "Fantasy violence, blood and gore, disturbing imagery, and mature themes.",
    systemRequirements: {
        minimum: { os: "Windows 10", cpu: "Intel Core i5-8400 / AMD Ryzen 3 3300X", ram: "12 GB RAM", gpu: "GTX 1060 3 GB / RX 580 4 GB", storage: "60 GB available space" },
        recommended: { os: "Windows 10/11", cpu: "Intel Core i7-8700K / AMD Ryzen 5 3600X", ram: "16 GB RAM", gpu: "GTX 1070 8 GB / RX Vega 56 8 GB", storage: "60 GB SSD space" },
        supportedLanguages: [
            { language: "English", subtitles: true, audio: true, menu: true },
            { language: "Thai", subtitles: false, audio: false, menu: false },
            { language: "Japanese", subtitles: true, audio: true, menu: true },
            { language: "French", subtitles: true, audio: false, menu: true },
            { language: "German", subtitles: true, audio: false, menu: true },
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
};

const reviews = [
    { authorName: "Mira K.", rating: 5, hoursPlayed: 184, content: "A world that rewards curiosity at every turn. The build variety and sense of discovery are exceptional.", helpfulCount: 218, funnyCount: 21 },
    { authorName: "Jon R.", rating: 5, hoursPlayed: 96, content: "Demanding, strange, and deeply satisfying. Every victory feels earned, especially against the major bosses.", helpfulCount: 167, funnyCount: 12 },
    { authorName: "Ari T.", rating: 4, hoursPlayed: 43, content: "The open world is incredible, though some late-game encounters can feel brutally uneven.", helpfulCount: 89, funnyCount: 18 },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const game = await Game.findOneAndUpdate({ title: eldenRing.title }, eldenRing, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true });
        await Review.deleteMany({ game: game._id });
        await Review.insertMany(reviews.map(review => ({ ...review, game: game._id })));
        console.log(`Elden Ring is ready: ${game._id}`);
    } catch (error) {
        console.error("Unable to seed Elden Ring:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();

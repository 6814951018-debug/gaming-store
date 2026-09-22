require("dotenv").config();

const mongoose = require("mongoose");
const Game = require("../models/game.model");
const Review = require("../models/review.model");

const gameData = {
    title: "Clair Obscur: Expedition 33",
    developer: "Sandfall Interactive",
    genre: "TURN-BASED RPG / ADVENTURE",
    releaseYear: 2025,
    price: 49.99,
    salePercent: 15,
    description: "Lead the final expedition across a breathtaking world and challenge the Paintress before she erases another generation.",
    detailedDescription: "Once a year, the Paintress awakens to paint a number on her monolith and erase everyone of that age. Year after year, the number gets smaller.\n\nJoin Expedition 33 on its desperate journey across a surreal Belle Époque-inspired world. Explore a dying continent, meet unforgettable companions, and uncover the truth behind the Paintress before time runs out.",
    keyFeatures: ["Reactive turn-based combat", "Real-time dodges and parries", "A handcrafted fantasy world", "Companion-driven story", "Deep character builds"],
    gameplayDescription: "Plan every turn with attacks, skills, and status effects, then react in real time with perfectly timed dodges, parries, and counters. Explore branching paths, upgrade your gear, and combine party abilities to overcome impossible odds.",
    storyHighlights: "Follow Gustave, Maelle, and the other members of Expedition 33 as they cross the continent in search of the Paintress. Their final journey is a story about memory, sacrifice, and the meaning of one more year.",
    mediaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_hero.jpg",
    previewUrl: "https://video.akamai.steamstatic.com/store_trailers/1903340/876247/5c4709c3a98d932003a6b85bd5e4bfcd6a777e7a/1748581603/hls_264_master.m3u8?t=1745478082",
    previewPoster: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257129803/movie_600x337.jpg?t=1745478082",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_600x900.jpg",
    maturityWarning: "Fantasy violence, blood, mature themes, and disturbing imagery.",
    systemRequirements: {
        minimum: { os: "Windows 10 64-bit", cpu: "Intel Core i7-8700K / AMD Ryzen 5 1600X", ram: "8 GB RAM", gpu: "NVIDIA GTX 1070 8 GB / AMD RX 5600 XT", storage: "55 GB available space" },
        recommended: { os: "Windows 11 64-bit", cpu: "Intel Core i7-12700K / AMD Ryzen 7 5800X", ram: "16 GB RAM", gpu: "NVIDIA RTX 3070 8 GB / AMD RX 6800 XT", storage: "55 GB SSD space" },
        supportedLanguages: [
            { language: "English", subtitles: true, audio: true, menu: true },
            { language: "French", subtitles: true, audio: true, menu: true },
            { language: "Thai", subtitles: false, audio: false, menu: false },
            { language: "German", subtitles: true, audio: false, menu: true },
            { language: "Japanese", subtitles: true, audio: false, menu: true },
        ],
    },
    platformFeatures: [
        { label: "Single-player", icon: "◈", enabled: true },
        { label: "Achievements", icon: "◆", enabled: true },
        { label: "Controller Support", icon: "⌁", enabled: true },
        { label: "Cloud Saves", icon: "☁", enabled: true },
        { label: "Photo Mode", icon: "▣", enabled: true },
    ],
    externalLinks: {
        website: "https://www.expedition33.com/",
        discord: "https://discord.com",
        social: "https://x.com/expedition33",
    },
    featured: true,
};

const reviews = [
    { authorName: "Nina V.", rating: 5, hoursPlayed: 38, content: "A gorgeous, heartfelt RPG with a combat system that keeps every turn engaging. The world feels like a moving painting.", helpfulCount: 142, funnyCount: 11 },
    { authorName: "Theo M.", rating: 5, hoursPlayed: 27, content: "The real-time reactions make the turn-based battles feel wonderfully immediate. Every companion brings something special.", helpfulCount: 96, funnyCount: 9 },
    { authorName: "Sam P.", rating: 4, hoursPlayed: 16, content: "Beautiful art direction and a strong story. A few encounters spike in difficulty, but the journey is worth it.", helpfulCount: 61, funnyCount: 13 },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const game = await Game.findOneAndUpdate({ title: gameData.title }, gameData, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true });
        await Review.deleteMany({ game: game._id });
        await Review.insertMany(reviews.map(review => ({ ...review, game: game._id })));
        console.log(`Clair Obscur: Expedition 33 is ready: ${game._id}`);
    } catch (error) {
        console.error("Unable to seed Clair Obscur: Expedition 33:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();

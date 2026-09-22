const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        developer: { type: String, required: true, trim: true, maxlength: 120 },
        genre: { type: String, required: true, trim: true, maxlength: 80 },
        releaseYear: { type: Number, required: true, min: 1970, max: 2100 },
        price: { type: Number, required: true, min: 0 },
        salePercent: { type: Number, default: 0, min: 0, max: 100 },
        description: { type: String, trim: true, maxlength: 1000, default: "" },
        detailedDescription: { type: String, trim: true, maxlength: 5000, default: "" },
        keyFeatures: { type: [String], default: [] },
        gameplayDescription: { type: String, trim: true, maxlength: 2000, default: "" },
        storyHighlights: { type: String, trim: true, maxlength: 2000, default: "" },
        mediaUrl: { type: String, trim: true, default: "" },
        previewUrl: { type: String, trim: true, default: "" },
        previewPoster: { type: String, trim: true, default: "" },
        maturityWarning: { type: String, trim: true, maxlength: 500, default: "" },
        systemRequirements: {
            minimum: {
                os: { type: String, default: "Windows 10 64-bit" },
                cpu: { type: String, default: "Intel Core i5-8400" },
                ram: { type: String, default: "8 GB RAM" },
                gpu: { type: String, default: "NVIDIA GTX 1060 6 GB" },
                storage: { type: String, default: "50 GB available space" },
            },
            recommended: {
                os: { type: String, default: "Windows 11 64-bit" },
                cpu: { type: String, default: "Intel Core i7-10700" },
                ram: { type: String, default: "16 GB RAM" },
                gpu: { type: String, default: "NVIDIA RTX 2060 6 GB" },
                storage: { type: String, default: "50 GB SSD space" },
            },
            supportedLanguages: {
                type: [{
                    language: String,
                    subtitles: { type: Boolean, default: true },
                    audio: { type: Boolean, default: false },
                    menu: { type: Boolean, default: true },
                }],
                default: [],
            },
        },
        platformFeatures: {
            type: [{ label: String, icon: String, enabled: { type: Boolean, default: true } }],
            default: [],
        },
        externalLinks: {
            website: { type: String, trim: true, default: "" },
            discord: { type: String, trim: true, default: "" },
            social: { type: String, trim: true, default: "" },
        },
        imageUrl: { type: String, trim: true, default: "" },
        featured: { type: Boolean, default: false },
        platforms: { type: [String], default: ["PC"] },
        tags: { type: [String], default: [] },
        releaseDate: { type: Date, default: null },
        unitsSold: { type: Number, default: 0, min: 0 },
        keyInventory: { type: [String], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);

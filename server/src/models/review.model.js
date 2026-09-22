const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true, index: true },
        authorName: { type: String, required: true, trim: true, maxlength: 80 },
        rating: { type: Number, required: true, min: 1, max: 5 },
        hoursPlayed: { type: Number, required: true, min: 0, default: 0 },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        helpfulCount: { type: Number, default: 0, min: 0 },
        funnyCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

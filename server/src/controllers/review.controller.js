const mongoose = require("mongoose");
const Review = require("../models/review.model");

const fallbackSummary = { average: 0, total: 0, label: "No reviews yet" };

const scoreLabel = average => {
    if (!average) return "No reviews yet";
    if (average >= 4.5) return "Overwhelmingly Positive";
    if (average >= 4) return "Very Positive";
    if (average >= 3) return "Mixed";
    return "Mostly Negative";
};

const getReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid game id" });
        const sort = req.query.sort === "helpful" ? { helpfulCount: -1, createdAt: -1 } : { createdAt: -1 };
        const [reviews, summaryRows] = await Promise.all([
            Review.find({ game: id }).sort(sort).lean(),
            Review.aggregate([{ $match: { game: new mongoose.Types.ObjectId(id) } }, { $group: { _id: null, average: { $avg: "$rating" }, total: { $sum: 1 } } }]),
        ]);
        const summary = summaryRows[0] ? { average: Number(summaryRows[0].average.toFixed(1)), total: summaryRows[0].total, label: scoreLabel(summaryRows[0].average) } : fallbackSummary;
        res.json({ summary, reviews });
    } catch (error) { next(error); }
};

const reactToReview = async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!['helpful', 'funny'].includes(type)) return res.status(400).json({ message: "Reaction must be helpful or funny" });
        const field = type === "helpful" ? "helpfulCount" : "funnyCount";
        const review = await Review.findByIdAndUpdate(req.params.reviewId, { $inc: { [field]: 1 } }, { new: true }).lean();
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json(review);
    } catch (error) { next(error); }
};

module.exports = { getReviews, reactToReview };

const express = require("express");
const { getReviews, reactToReview } = require("../controllers/review.controller");

const router = express.Router();

router.get("/game/:id", getReviews);
router.post("/:reviewId/reactions", reactToReview);

module.exports = router;

const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
const uploadRoutes = require("./routes/upload.routes");
const reviewRoutes = require("./routes/review.routes");
const accountRoutes = require("./routes/account.routes");
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// 1. Global middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/account", accountRoutes);

// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;

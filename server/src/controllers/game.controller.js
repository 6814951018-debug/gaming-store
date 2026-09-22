const Game = require("../models/game.model");

const getGames = async (req, res, next) => {
    try {
        const { platform, tag, minPrice, maxPrice, sale, ranking, search } = req.query;
        const filter = {};
        if (platform) filter.platforms = platform;
        if (tag) filter.tags = tag;
        if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { genre: { $regex: search, $options: "i" } }, { developer: { $regex: search, $options: "i" } }];
        if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
        if (sale === "true") filter.salePercent = { $gt: 0 };
        if (ranking === "upcoming") filter.releaseDate = { $gt: new Date() };
        const sort = ranking === "top" ? { unitsSold: -1, featured: -1 } : ranking === "new" ? { releaseDate: -1, createdAt: -1 } : { featured: -1, createdAt: -1 };
        const games = await Game.find(filter).sort(sort);
        res.json(games);
    } catch (error) { next(error); }
};

const getGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.json(game);
    } catch (error) { next(error); }
};

const createGame = async (req, res, next) => {
    try { res.status(201).json(await Game.create(req.body)); }
    catch (error) { next(error); }
};

const updateGame = async (req, res, next) => {
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.json(game);
    } catch (error) { next(error); }
};

const deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.status(204).end();
    } catch (error) { next(error); }
};

module.exports = { getGames, getGame, createGame, updateGame, deleteGame };

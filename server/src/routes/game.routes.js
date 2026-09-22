const express = require("express");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const { getGames, getGame, createGame, updateGame, deleteGame } = require("../controllers/game.controller");

const router = express.Router();

router.get("/", getGames);
router.get("/:id", getGame);
router.post("/", requireAuth, requireAdmin, createGame);
router.put("/:id", requireAuth, requireAdmin, updateGame);
router.delete("/:id", requireAuth, requireAdmin, deleteGame);

module.exports = router;

const express = require("express");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const { getGames, getAdminGames, getGame, createGame, updateGame, deleteGame } = require("../controllers/game.controller");

const router = express.Router();

router.get("/", getGames);
router.get("/admin", requireAuth, requireAdmin, getAdminGames);
router.get("/:id", getGame);
router.post("/", requireAuth, requireAdmin, createGame);
router.put("/:id", requireAuth, requireAdmin, updateGame);
router.delete("/:id", requireAuth, requireAdmin, deleteGame);

module.exports = router;

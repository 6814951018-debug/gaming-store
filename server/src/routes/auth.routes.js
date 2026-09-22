const express = require("express");
const {
    register,
    login,
    getCurrentUser,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { verifyLoginTwoFactor } = require("../controllers/account.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/2fa/login", verifyLoginTwoFactor);

module.exports = router;

const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getAccount, createOrder, topUpWallet, requestTwoFactor, verifyTwoFactor } = require("../controllers/account.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/", getAccount);
router.post("/orders", createOrder);
router.post("/wallet/top-up", topUpWallet);
router.post("/2fa/request", requestTwoFactor);
router.post("/2fa/verify", verifyTwoFactor);

module.exports = router;
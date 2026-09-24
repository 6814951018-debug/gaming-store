const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getAccount, createOrder, checkoutCart, simulateOrderPayment: simulatePaymentHandler, topUpWallet, simulateTopUpSuccess, redeemCdKey, requestTwoFactor, verifyTwoFactor } = require("../controllers/account.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/", getAccount);
router.post("/orders", createOrder);
router.post("/orders/checkout", checkoutCart);
router.post('/orders/:orderId/simulate-payment', simulatePaymentHandler);
router.post("/wallet/top-up", topUpWallet);
router.post("/wallet/top-up/simulate-success", simulateTopUpSuccess);
router.post("/redeem", redeemCdKey);
router.post("/2fa/request", requestTwoFactor);
router.post("/2fa/verify", verifyTwoFactor);

module.exports = router;

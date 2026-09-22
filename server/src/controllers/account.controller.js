const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Game = require("../models/game.model");
const Order = require("../models/order.model");

const paymentMethods = ["wallet", "promptpay", "card", "truemoney", "mobile-banking"];
const makeOrderNumber = () => `GG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
const makeKey = () => `GG-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
const publicAccount = user => ({ name: user.name, email: user.email, walletBalance: user.walletBalance, twoFactorEnabled: user.twoFactor?.enabled || false });

const getAccount = async (req, res, next) => {
    try {
        const [user, orders] = await Promise.all([
            User.findById(req.user._id).select("name email walletBalance twoFactor"),
            Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.game", "title imageUrl"),
        ]);
        res.json({ account: publicAccount(user), orders });
    } catch (error) { next(error); }
};

const createOrder = async (req, res, next) => {
    try {
        const { gameId, paymentMethod } = req.body;
        if (!gameId || !paymentMethods.includes(paymentMethod)) return res.status(400).json({ message: "Game and a valid payment method are required" });
        const game = await Game.findById(gameId);
        if (!game) return res.status(404).json({ message: "Game not found" });
        const total = Number((game.price * (1 - Number(game.salePercent || 0) / 100)).toFixed(2));
        const user = await User.findById(req.user._id);
        const order = new Order({ orderNumber: makeOrderNumber(), user: user._id, items: [{ game: game._id, title: game.title, price: total }], total, paymentMethod });
        if (paymentMethod === "wallet") {
            if (user.walletBalance < total) return res.status(400).json({ message: "Insufficient wallet balance" });
            user.walletBalance = Number((user.walletBalance - total).toFixed(2));
            order.paymentStatus = "paid";
            order.paidAt = new Date();
            order.items[0].key = game.keyInventory.shift() || makeKey();
            order.deliveryStatus = "delivered";
            order.deliveredAt = new Date();
            game.unitsSold += 1;
            await Promise.all([user.save(), game.save()]);
        }
        await order.save();
        res.status(201).json({ order, account: publicAccount(user), message: paymentMethod === "wallet" ? "ภารกิจเสร็จสิ้น! คีย์เกมของคุณพร้อมใช้งานแล้ว" : "Order created. Complete payment with the selected provider." });
    } catch (error) { next(error); }
};

const topUpWallet = async (req, res, next) => {
    try {
        const amount = Number(req.body.amount);
        const paymentMethod = req.body.paymentMethod;
        if (!Number.isFinite(amount) || amount < 50 || amount > 50000) return res.status(400).json({ message: "Wallet amount must be between 50 and 50,000" });
        if (!paymentMethods.includes(paymentMethod) || paymentMethod === "wallet") return res.status(400).json({ message: "Choose a supported payment method" });
        res.status(202).json({ status: "pending", amount, paymentMethod, message: "Top-up is waiting for payment confirmation from the provider." });
    } catch (error) { next(error); }
};

const requestTwoFactor = async (req, res, next) => {
    try {
        const code = crypto.randomInt(100000, 1000000).toString();
        const user = await User.findById(req.user._id);
        user.twoFactor.otpHash = await bcrypt.hash(code, 10);
        user.twoFactor.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const response = { message: "OTP generated. Deliver this code through your configured email provider." };
        if (process.env.NODE_ENV !== "production") response.developmentOtp = code;
        res.json(response);
    } catch (error) { next(error); }
};

const verifyTwoFactor = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const valid = user.twoFactor.otpHash && user.twoFactor.otpExpiresAt > new Date() && await bcrypt.compare(String(req.body.code || ""), user.twoFactor.otpHash);
        if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });
        user.twoFactor.enabled = true;
        user.twoFactor.otpHash = "";
        user.twoFactor.otpExpiresAt = null;
        await user.save();
        res.json({ account: publicAccount(user) });
    } catch (error) { next(error); }
};

const verifyLoginTwoFactor = async (req, res, next) => {
    try {
        const payload = jwt.verify(req.body.challengeToken, process.env.JWT_SECRET);
        if (payload.purpose !== "2fa") return res.status(401).json({ message: "Invalid 2FA challenge" });
        const user = await User.findById(payload.userId);
        const valid = user?.twoFactor.otpHash && user.twoFactor.otpExpiresAt > new Date() && await bcrypt.compare(String(req.body.code || ""), user.twoFactor.otpHash);
        if (!valid) return res.status(401).json({ message: "Invalid or expired OTP" });
        user.twoFactor.otpHash = "";
        user.twoFactor.otpExpiresAt = null;
        await user.save();
        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { res.status(401).json({ message: "Invalid or expired 2FA challenge" }); }
};

module.exports = { getAccount, createOrder, topUpWallet, requestTwoFactor, verifyTwoFactor, verifyLoginTwoFactor };

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Game = require("../models/game.model");
const Order = require("../models/order.model");

const paymentMethods = ["wallet", "promptpay", "card", "truemoney", "mobile-banking"];
const makeOrderNumber = () => `GG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
const publicAccount = user => ({ name: user.name, email: user.email, walletBalance: user.walletBalance, twoFactorEnabled: user.twoFactor?.enabled || false });

const getAccount = async (req, res, next) => {
    try {
        const [user, orders] = await Promise.all([
            User.findById(req.user._id).select("name email walletBalance twoFactor"),
            Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.game", "title imageUrl downloadUrl platforms"),
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
            order.status = "COMPLETED";
            order.paidAt = new Date();
            order.items[0].key = game.keyInventory.shift() || "";
            order.deliveryStatus = "delivered";
            order.deliveredAt = new Date();
            game.unitsSold += 1;
            await Promise.all([user.save(), game.save()]);
        }
        await order.save();
        res.status(201).json({ order, account: publicAccount(user), message: paymentMethod === "wallet" ? "ภารกิจเสร็จสิ้น! คีย์เกมของคุณพร้อมใช้งานแล้ว" : "Order created. Complete payment with the selected provider." });
    } catch (error) { next(error); }
};

const checkoutCart = async (req, res, next) => {
    try {
        const { gameIds, paymentMethod, edition = "standard" } = req.body;
        if (!Array.isArray(gameIds) || gameIds.length === 0 || gameIds.length > 50 || gameIds.some(id => typeof id !== "string") || new Set(gameIds).size !== gameIds.length) {
            return res.status(400).json({ message: "Choose one or more valid games to checkout" });
        }
        if (!paymentMethods.includes(paymentMethod)) return res.status(400).json({ message: "Choose a valid payment method" });
        const isDemo = process.env.NODE_ENV !== "production";
        if (!isDemo && paymentMethod !== "wallet") return res.status(403).json({ message: "Only Store wallet checkout is available until a payment provider is configured." });
        if (!new Set(["standard", "deluxe", "bundle"]).has(edition) || (edition !== "standard" && gameIds.length !== 1)) return res.status(400).json({ message: "Choose a valid game edition" });

        const userExists = await User.exists({ _id: req.user._id });
        if (!userExists) return res.status(404).json({ message: "Account not found" });
        const games = await Game.find({ _id: { $in: gameIds } });
        if (games.length !== gameIds.length) return res.status(404).json({ message: "One or more games are no longer available" });
        const existingOrder = await Order.exists({ user: req.user._id, paymentStatus: "paid", "items.game": { $in: gameIds } });
        if (existingOrder) return res.status(409).json({ message: "Your library already contains one or more of these games" });

        const gamesById = new Map(games.map(game => [String(game._id), game]));
        const orderedGames = gameIds.map(id => gamesById.get(id));
        const editionExtra = edition === "deluxe" ? 12.99 : edition === "bundle" ? 24.99 : 0;
        const items = orderedGames.map(game => ({
            game: game._id,
            title: game.title,
            edition: gameIds.length === 1 ? edition : "standard",
            price: Number((game.price * (1 - Number(game.salePercent || 0) / 100) + editionExtra).toFixed(2)),
            key: "",
        }));
        const total = Number(items.reduce((sum, item) => sum + item.price, 0).toFixed(2));
        const user = isDemo
            ? await User.findById(req.user._id)
            : await User.findOneAndUpdate(
                { _id: req.user._id, walletBalance: { $gte: total } },
                { $inc: { walletBalance: -total } },
                { new: true }
            );
        if (!user) return res.status(isDemo ? 404 : 400).json({ message: isDemo ? "Account not found" : "Insufficient wallet balance. Add funds to your Store wallet first." });

        try {
            const completedAt = new Date();
            const order = await Order.create({
                orderNumber: makeOrderNumber(),
                user: user._id,
                items,
                total,
                paymentMethod,
                status: "COMPLETED",
                paymentStatus: "paid",
                deliveryStatus: "delivered",
                paidAt: completedAt,
                deliveredAt: completedAt,
            });
            await Game.updateMany({ _id: { $in: gameIds } }, { $inc: { unitsSold: 1 } });
            return res.status(201).json({ order, account: publicAccount(user), simulated: isDemo, message: isDemo ? "Demo checkout complete. No payment was charged." : "Purchase complete. Your game is in your library." });
        } catch (error) {
            if (!isDemo) await User.updateOne({ _id: user._id }, { $inc: { walletBalance: total } });
            throw error;
        }
    } catch (error) { next(error); }
};

const simulateOrderPayment = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === "production") return res.status(403).json({ message: "Simulated payments are disabled in production" });
        const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.paymentStatus !== "pending") return res.status(409).json({ message: "This order is no longer pending" });
        const games = [];
        for (const item of order.items) {
            const game = await Game.findById(item.game);
            if (!game) return res.status(404).json({ message: `Game not found: ${item.title}` });
            item.key = game.keyInventory.shift() || "";
            game.unitsSold += 1;
            games.push(game);
        }
        const completedAt = new Date();
        order.paymentStatus = "paid";
        order.status = "COMPLETED";
        order.deliveryStatus = "delivered";
        order.paidAt = completedAt;
        order.deliveredAt = completedAt;
        await Promise.all([...games.map(game => game.save()), order.save()]);
        res.json({ order, message: "Simulated payment completed. Your game key is ready." });
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

const simulateTopUpSuccess = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === "production") return res.status(403).json({ message: "Simulated payments are disabled in production" });
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount < 50 || amount > 50000) return res.status(400).json({ message: "Wallet amount must be between 50 and 50,000" });
        const creditedAmount = Number((amount / 36).toFixed(2));
        const user = await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: creditedAmount } }, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: "Account not found" });
        res.json({ account: publicAccount(user), amount, creditedAmount, message: "Simulated PromptPay payment completed." });
    } catch (error) { next(error); }
};

const redeemCdKey = async (req, res, next) => {
    try {
        const key = String(req.body.key || "").trim().toUpperCase();
        if (key.length < 8 || key.length > 80) return res.status(400).json({ message: "Enter a valid CD-Key" });
        const game = await Game.findOneAndUpdate({ keyInventory: key }, { $pull: { keyInventory: key } }, { new: true });
        if (!game) {
            const alreadyRedeemed = await Order.exists({ "items.key": key });
            return res.status(alreadyRedeemed ? 409 : 404).json({ message: alreadyRedeemed ? "This CD-Key has already been redeemed" : "CD-Key not found" });
        }
        const redeemedAt = new Date();
        const order = new Order({
            orderNumber: makeOrderNumber(),
            user: req.user._id,
            items: [{ game: game._id, title: game.title, price: 0, key }],
            total: 0,
            paymentMethod: "cd-key",
            paymentStatus: "paid",
            status: "COMPLETED",
            deliveryStatus: "delivered",
            paidAt: redeemedAt,
            deliveredAt: redeemedAt,
        });
        await order.save();
        res.status(201).json({ order, message: `${game.title} added to your library.` });
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

module.exports = { getAccount, createOrder, checkoutCart, simulateOrderPayment, topUpWallet, simulateTopUpSuccess, redeemCdKey, requestTwoFactor, verifyTwoFactor, verifyLoginTwoFactor };

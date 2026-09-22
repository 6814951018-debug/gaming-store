const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    return process.env.JWT_SECRET;
};

const toPublicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

const createToken = (user) => jwt.sign(
    { userId: user._id.toString() },
    getJwtSecret(),
    { expiresIn: "7d" }
);

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "customer",
        });

        res.status(201).json({ token: createToken(user), user: toPublicUser(user) });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        const passwordMatches = user && await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.twoFactor?.enabled) {
            const code = crypto.randomInt(100000, 1000000).toString();
            user.twoFactor.otpHash = await bcrypt.hash(code, 10);
            user.twoFactor.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            const challengeToken = jwt.sign({ userId: user._id.toString(), purpose: "2fa" }, getJwtSecret(), { expiresIn: "10m" });
            const response = { requiresTwoFactor: true, challengeToken };
            if (process.env.NODE_ENV !== "production") response.developmentOtp = code;
            return res.json(response);
        }

        res.json({ token: createToken(user), user: toPublicUser(user) });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        res.json({ user: toPublicUser(req.user) });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getCurrentUser };

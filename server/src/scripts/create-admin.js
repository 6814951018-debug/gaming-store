require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user.model");

const required = ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    console.error("Set them in .env, then run: npm run create-admin");
    process.exit(1);
}

if (process.env.ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
}

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
        const name = process.env.ADMIN_NAME.trim();
        const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

        const admin = await User.findOneAndUpdate(
            { email },
            { $set: { name, password, role: "admin" } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`Admin account is ready: ${admin.email}`);
    } catch (error) {
        console.error("Unable to create admin:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();

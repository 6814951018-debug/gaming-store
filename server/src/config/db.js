const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.warn("MONGO_URI is missing. Starting without MongoDB; local demo catalogue will be served instead.");
        cachedConnection = true;
        return cachedConnection;
    }

    try {
        cachedConnection = mongoose.connect(mongoUri);
        await cachedConnection;
        console.log("MongoDB connected");
        return cachedConnection;
    } catch (error) {
        cachedConnection = null;
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
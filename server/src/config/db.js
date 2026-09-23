const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is missing. Set the MongoDB Atlas connection string in the environment.");
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
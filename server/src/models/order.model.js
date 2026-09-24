const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        items: [{
            game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
            title: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            key: { type: String, default: "" },
        }],
        total: { type: Number, required: true, min: 0 },
        paymentMethod: { type: String, enum: ["wallet", "promptpay", "card", "truemoney", "mobile-banking", "cd-key"], required: true },
        status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING" },
        paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
        deliveryStatus: { type: String, enum: ["pending", "delivered", "unavailable"], default: "pending" },
        paidAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

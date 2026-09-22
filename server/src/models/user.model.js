const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
password: { type: String, required: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
walletBalance: { type: Number, default: 0, min: 0 },
twoFactor: {
	enabled: { type: Boolean, default: false },
	otpHash: { type: String, default: "" },
	otpExpiresAt: { type: Date, default: null },
},
profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" }
}, { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReferralSchema = new Schema(
  {
    referrerID: { type: String, required: true },
    referredID: { type: String, required: true },
    referredUsername: { type: String },
    isReferredPremium: { type: Boolean, default: false },
    status: { type: String, default: "incomplete" },
    pointsAwarded: { type: Number, default: 0 }, //as per your wish
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", ReferralSchema);

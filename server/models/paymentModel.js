// models/paymentModel.js
const mongoose = require("mongoose");

const paymentModelSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  processed: { type: Boolean, default: false },
});

const PaymentModel = mongoose.model("PaymentModel", paymentModelSchema);

module.exports = PaymentModel;

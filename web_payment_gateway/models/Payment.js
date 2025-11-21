// models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  checkoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Checkout",
    required: true 
  },

  midtransOrderId: { type: String, index: true },   // 👈 pastikan tidak unique
  midtransTransactionId: String,
  midtransSnapToken: String,
  midtransSnapUrl: String,

  amount: { type: Number, required: true },

  status: { 
    type: String, 
    default: "PENDING",
    enum: ["PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"]
  },

  paymentMethod: String,
  paymentChannel: String,
  paidAt: Date,
  expiryDate: Date,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
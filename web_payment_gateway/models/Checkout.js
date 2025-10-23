import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema({
  items: [{
    productId: String,
    name: String,
    category: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    image: String
  }],
  totalPrice: Number,
  status: { 
    type: String, 
    default: "PENDING",
    enum: ["PENDING", "PAID", "FAILED", "EXPIRED"]
  },
  customerName: {
    type: String,
    default: "Guest"
  },
  customerEmail: {
    type: String,
    default: "guest@example.com"
  },
  customerPhone: {
    type: String,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paidAt: Date
});

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
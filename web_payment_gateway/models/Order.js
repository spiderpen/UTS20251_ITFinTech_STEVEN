import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  items: [{
    name: String,
    category: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["PENDING", "PAID", "FAILED", "EXPIRED"],
    default: "PENDING" 
  },
  customerName: { 
    type: String, 
    default: "Guest" 
  },
  customerEmail: { 
    type: String, 
    default: "guest@example.com" 
  },
  paymentId: String,
  xenditInvoiceId: String,
  xenditInvoiceUrl: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paidAt: Date
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
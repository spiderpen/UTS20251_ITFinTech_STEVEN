import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  checkoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Checkout",
    required: true,
    // otomatis cast string ke ObjectId jika perlu
  },
  xenditInvoiceId: { type: String, required: true, unique: true },
  xenditInvoiceUrl: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  expiryDate: { type: Date },
}, { timestamps: true });

// Cek model existing, kalau sudah ada gunakan yang sudah ada
export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Invoice ID dari Xendit (unik untuk setiap pembayaran)
    xenditInvoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ID order internal Anda (misalnya order_123)
    externalId: {
      type: String,
      required: true,
    },

    // Jumlah pembayaran
    amount: {
      type: Number,
      required: true,
    },

    // Status pembayaran: default PENDING
    status: {
      type: String,
      enum: ["PENDING", "PAID", "EXPIRED", "FAILED"],
      default: "PENDING",
    },

    // Waktu invoice dibuat
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Waktu terakhir status berubah (diupdate oleh webhook)
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // Info tambahan dari Xendit (misalnya channel pembayaran)
    paymentMethod: {
      type: String,
    },

    // Detail raw response dari Xendit (untuk debugging / log)
    rawResponse: {
      type: Object,
    },
  },
  {
    timestamps: true, // otomatis tambahkan createdAt & updatedAt
  }
);

// Cegah recompile model saat hot-reload (Next.js)
export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

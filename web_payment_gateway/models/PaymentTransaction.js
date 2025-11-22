import mongoose from "mongoose";

const PaymentTransactionSchema = new mongoose.Schema(
  {

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // ubah ke true kalau mau wajib
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    midtransOrderId: {
      type: String,
      required: true,
    },

    transactionId: {
      type: String, 
    },
    paymentType: {
      type: String, 
    },
    grossAmount: {
      type: Number,
    },
    transactionStatus: {
      type: String, // pending, settlement, expire, cancel, dll
    },

    // kalau mau simpan full response Midtrans
    rawResponse: {
      type: Object,
    },
  },
  {
    timestamps: true, // otomatis ada createdAt & updatedAt
  }
);

export default mongoose.models.PaymentTransaction ||
  mongoose.model("PaymentTransaction", PaymentTransactionSchema);

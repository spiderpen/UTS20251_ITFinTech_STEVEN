import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, totalPrice } = req.body;

      if (!items || !totalPrice) {
        return res
          .status(400)
          .json({ success: false, error: "Items and totalPrice required" });
      }

      if (typeof totalPrice !== "number" || totalPrice <= 0) {
        return res
          .status(400)
          .json({ success: false, error: "totalPrice must be a number > 0" });
      }

      // 1️⃣ Buat checkout record
      const checkout = await Checkout.create({
        items,
        totalPrice,
        status: "PENDING",
      });

      // 2️⃣ Buat invoice di Xendit
      const invoiceRes = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id: `checkout-${checkout._id}-${Date.now()}`,
          amount: totalPrice,
          payer_email: "customer@example.com",
          description: `Payment for Millenium Jaya - Order ${checkout._id.toString().slice(-8).toUpperCase()}`,
          currency: "IDR",
          success_redirect_url:
            process.env.SUCCESS_REDIRECT_URL || "http://localhost:3000/success",
          failure_redirect_url:
            process.env.FAILED_REDIRECT_URL || "http://localhost:3000/checkout",
        },
        {
          auth: {
            username: process.env.XENDIT_SECRET_KEY,
            password: "",
          },
        }
      );

      const invoice = invoiceRes.data;

      // 3️⃣ Simpan Payment record
      const payment = await Payment.create({
        checkoutId: checkout._id,
        xenditInvoiceId: invoice.id,
        xenditInvoiceUrl: invoice.invoice_url,
        amount: totalPrice,
        status: invoice.status || "PENDING",
        expiryDate: invoice.expiry_date
          ? new Date(invoice.expiry_date)
          : undefined,
      });

      console.log("✅ Checkout created:", {
        checkoutId: checkout._id,
        invoiceId: invoice.id,
        amount: totalPrice
      });

      return res
        .status(200)
        .json({ success: true, checkout, invoice, payment });
    } catch (err) {
      console.error("❌ Checkout error:", err.response?.data || err.message);
      return res.status(err.response?.status || 500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
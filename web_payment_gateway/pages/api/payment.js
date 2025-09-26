import dbConnect from "../../lib/mongodb.js";
import Payment from "../../models/Payment.js";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { checkoutId, amount } = req.body;

      if (!checkoutId || !amount) {
        return res
          .status(400)
          .json({ success: false, error: "checkoutId and amount are required" });
      }

      // 🔑 Panggil API Xendit langsung
      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id: `checkout-${checkoutId}-${Date.now()}`,
          amount: Number(amount),
          payer_email: "customer@example.com",
          description: `Payment for checkout ${checkoutId}`,
          currency: "IDR",
          success_redirect_url: "http://localhost:3000/success",
          failure_redirect_url: "http://localhost:3000/failed",
        },
        {
          auth: {
            username: process.env.XENDIT_SECRET_KEY, // pakai SECRET KEY
            password: "", // kosong
          },
        }
      );

      const invoice = response.data;

      // ✅ Simpan ke MongoDB
      const payment = await Payment.create({
        checkoutId,
        xenditInvoiceId: invoice.id,
        status: invoice.status, // biasanya "PENDING"
      });

      return res.status(200).json({ success: true, invoice, payment });
    } catch (err) {
      console.error("❌ Error Xendit:", err.response?.data || err.message);
      return res
        .status(500)
        .json({ success: false, error: err.response?.data || err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

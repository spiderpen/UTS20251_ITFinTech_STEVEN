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

      const totalAmount = Number(amount);
      if (isNaN(totalAmount) || totalAmount < 100) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid amount" });
      }

      // 🔑 Request ke Xendit
      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id: `checkout-${checkoutId}-${Date.now()}`,
          amount: totalAmount,
          payer_email: "customer@example.com",
          description: `Payment for checkout ${checkoutId}`,
          currency: "IDR",
          success_redirect_url:
            process.env.SUCCESS_REDIRECT_URL || "http://localhost:3000/success",
          failure_redirect_url:
            process.env.FAILED_REDIRECT_URL || "http://localhost:3000/failed",
        },
        {
          auth: {
            username: process.env.XENDIT_SECRET_KEY,
            password: "",
          },
        }
      );

      const invoice = response.data;

      // ✅ Simpan ke MongoDB sesuai schema
      const payment = await Payment.create({
        checkoutId: checkoutId,              // simpan sebagai string
        xenditInvoiceId: invoice.id,
        xenditInvoiceUrl: invoice.invoice_url,
        amount: totalAmount,
        status: invoice.status || "PENDING",
        expiryDate: invoice.expiry_date
          ? new Date(invoice.expiry_date)
          : undefined,
      });

      return res.status(200).json({ success: true, invoice, payment });
    } catch (err) {
      console.error("❌ Error Xendit:", err.response?.data || err.message);
      return res
        .status(err.response?.status || 500)
        .json({ success: false, error: err.response?.data || err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

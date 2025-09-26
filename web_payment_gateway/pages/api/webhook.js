import dbConnect from "../../lib/mongodb.js";
import Payment from "../../models/Payment.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const event = req.body;

      console.log("📩 Webhook diterima:", event);

      // Data webhook Xendit punya `id` dan `status`
      const { id, status } = event;

      if (!id || !status) { 
        return res.status(400).json({ error: "Invalid webhook payload" });
      }

      // Update status payment di MongoDB
      await Payment.findOneAndUpdate(
        { xenditInvoiceId: id },
        { status: status.toUpperCase() }, // status bisa PAID, PENDING, EXPIRED
        { new: true }
      );

      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (err) {
      console.error("❌ Error webhook:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

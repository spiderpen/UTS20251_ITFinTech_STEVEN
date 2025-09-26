import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { items, totalPrice } = req.body;

    if (!items || !totalPrice) {
      return res.status(400).json({ success: false, error: "Items and totalPrice required" });
    }

    const checkout = await Checkout.create({
      items,
      totalPrice,
      status: "PENDING",
    });

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const successUrl = `${BASE_URL}/success?checkoutId=${checkout._id}`;
    const failureUrl = `${BASE_URL}/checkout`;

    // Buat invoice Xendit
    const invoiceRes = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id: `checkout-${checkout._id}-${Date.now()}`,
        amount: totalPrice,
        payer_email: "customer@example.com",
        description: `Payment for Millenium Jaya - Order ${checkout._id.toString().slice(-8).toUpperCase()}`,
        currency: "IDR",
        success_redirect_url: successUrl,
        failure_redirect_url: failureUrl,
      },
      {
        auth: { username: process.env.XENDIT_SECRET_KEY, password: "" },
      }
    );

    const invoice = invoiceRes.data;

    const payment = await Payment.create({
      checkoutId: checkout._id,
      xenditInvoiceId: invoice.id,
      xenditInvoiceUrl: invoice.invoice_url,
      amount: totalPrice,
      status: invoice.status || "PENDING",
      expiryDate: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
    });

    res.status(200).json({ success: true, checkout, invoice, payment });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data || err.message });
  }
}

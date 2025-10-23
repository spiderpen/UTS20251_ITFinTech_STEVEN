import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") 
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { items, totalPrice } = req.body;

    if (!items || !totalPrice) {
      return res.status(400).json({ success: false, error: "Items and totalPrice required" });
    }

    // ✅ Format items dengan quantity yang benar
    const itemsMap = {};
    
    items.forEach(item => {
      // Gunakan _id sebagai key agar produk yang sama digabung
      const key = item._id || item.name;
      
      if (!itemsMap[key]) {
        itemsMap[key] = {
          productId: item._id,
          name: item.name || "Unnamed Item",
          category: item.category || "Main Course",
          price: Number(item.price) || 0,
          quantity: 0,
          image: item.image || "/placeholder.jpg"
        };
      }
      
      // Increment quantity
      itemsMap[key].quantity += 1;
    });

    // Convert map to array
    const formattedItems = Object.values(itemsMap);

    console.log("✅ Formatted items:", formattedItems); // Debug log

    const checkout = await Checkout.create({
      items: formattedItems,
      totalPrice: Number(totalPrice),
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
        amount: Number(totalPrice),
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
      amount: Number(totalPrice),
      status: invoice.status || "PENDING",
      expiryDate: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
    });

    res.status(200).json({ success: true, checkout, invoice, payment });
  } catch (err) {
    console.error("❌ Checkout error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      success: false, 
      error: err.response?.data || err.message 
    });
  }
}
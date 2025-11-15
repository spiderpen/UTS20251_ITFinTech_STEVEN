import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import axios from "axios";
import { notifyAdminNewOrder, notifyCustomerCheckout } from "../../lib/whatsapp";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") 
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { items, totalPrice, customerName, customerPhone, customerEmail } = req.body;

    console.log("📦 Checkout request received:", {
      itemsCount: items?.length,
      totalPrice,
      customerName,
      customerPhone,
      customerEmail
    });

    // Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid items:", items);
      return res.status(400).json({ 
        success: false, 
        error: "Items is required and must be a non-empty array" 
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      console.error("❌ Invalid totalPrice:", totalPrice);
      return res.status(400).json({ 
        success: false, 
        error: "Total price is required and must be greater than 0" 
      });
    }

    // Format items dengan quantity yang benar
    const itemsMap = {};
    
    items.forEach(item => {
      if (!item._id && !item.name) {
        console.warn("⚠️ Item without _id or name:", item);
        return;
      }

      const key = item._id || item.name;
      
      if (!itemsMap[key]) {
        itemsMap[key] = {
          productId: item._id || "",
          name: item.name || "Unnamed Item",
          category: item.category || "Main Course",
          price: Number(item.price) || 0,
          quantity: 0,
          image: item.image || "/placeholder.jpg"
        };
      }
      
      itemsMap[key].quantity += 1;
    });

    const formattedItems = Object.values(itemsMap);

    if (formattedItems.length === 0) {
      console.error("❌ No valid items after formatting");
      return res.status(400).json({ 
        success: false, 
        error: "No valid items found" 
      });
    }

    console.log("✅ Formatted items:", formattedItems);

    const checkout = await Checkout.create({
      items: formattedItems,
      totalPrice: Number(totalPrice),
      status: "PENDING",
      customerName: customerName || "Guest",
      customerEmail: customerEmail || "guest@example.com",
      customerPhone: customerPhone || null
    });

    console.log("✅ Checkout created:", checkout._id);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const successUrl = `${BASE_URL}/success?checkoutId=${checkout._id}`;
    const failureUrl = `${BASE_URL}/checkout`;

    // Buat invoice Xendit
    console.log("💳 Creating Xendit invoice...");
    
    const invoiceRes = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id: `checkout-${checkout._id}-${Date.now()}`,
        amount: Number(totalPrice),
        payer_email: customerEmail || "customer@example.com",
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
    console.log("✅ Xendit invoice created:", invoice.id);
    console.log("🔗 Payment URL:", invoice.invoice_url);

    const payment = await Payment.create({
      checkoutId: checkout._id,
      xenditInvoiceId: invoice.id,
      xenditInvoiceUrl: invoice.invoice_url,
      amount: Number(totalPrice),
      status: invoice.status || "PENDING",
      expiryDate: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
    });

    console.log("✅ Payment record created:", payment._id);

    // 🔔 KIRIM NOTIFIKASI WHATSAPP
    const orderData = {
      orderId: checkout._id.toString().slice(-8).toUpperCase(),
      items: formattedItems,
      totalPrice: Number(totalPrice),
      customerName: customerName || "Guest",
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || "guest@example.com",
      paymentUrl: invoice.invoice_url // ✅ TAMBAHKAN PAYMENT URL
    };

    console.log("📱 Preparing to send WhatsApp notifications...");

    // Kirim ke admin (non-blocking)
    if (process.env.FONNTE_TOKEN) {
      notifyAdminNewOrder(orderData)
        .then(() => console.log("✅ Admin notified successfully"))
        .catch(err => console.error("❌ Failed to notify admin:", err.message));

      // Kirim ke customer (jika ada nomor)
      if (customerPhone) {
        notifyCustomerCheckout(customerPhone, orderData)
          .then(() => console.log("✅ Customer notified successfully"))
          .catch(err => console.error("❌ Failed to notify customer:", err.message));
      } else {
        console.warn("⚠️ Customer phone not provided, skipping customer notification");
      }
    } else {
      console.warn("⚠️ FONNTE_TOKEN not configured, skipping WhatsApp notifications");
    }

    res.status(200).json({ success: true, checkout, invoice, payment });
  } catch (err) {
    console.error("❌ Checkout error:", err.response?.data || err.message);
    console.error("Error stack:", err.stack);
    
    res.status(err.response?.status || 500).json({ 
      success: false, 
      error: err.response?.data?.message || err.message || "Checkout failed"
    });
  }
}

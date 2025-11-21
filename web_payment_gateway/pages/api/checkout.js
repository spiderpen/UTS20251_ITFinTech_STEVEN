// pages/api/checkout.js
import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import { createMidtransTransaction } from "../../lib/midtrans";
import { notifyAdminNewOrder, notifyCustomerCheckout } from "../../lib/whatsapp";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { items, totalPrice, customerName, customerPhone, customerEmail } = req.body;

    console.log("📦 Checkout request:", {
      itemsCount: items?.length,
      totalPrice,
      customerName,
      customerPhone,
      customerEmail,
    });

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty." });
    }

    if (!totalPrice || Number(totalPrice) <= 0) {
      return res.status(400).json({ success: false, error: "Invalid total price." });
    }

    // -------------------------
    // FORMAT ITEMS → quantity
    // -------------------------
    const itemsMap = {};

    items.forEach((item) => {
      const id = item._id || item.name;
      if (!id) return;

      if (!itemsMap[id]) {
        itemsMap[id] = {
          productId: item._id || "",
          name: item.name,
          category: item.category || "Main Course",
          price: Number(item.price),
          quantity: 0,
          image: item.image || "",
        };
      }

      itemsMap[id].quantity += 1;
    });

    const formattedItems = Object.values(itemsMap);

    console.log("🧾 Formatted items:", formattedItems);

    // -------------------------
    // CREATE CHECKOUT RECORD
    // -------------------------
    const checkout = await Checkout.create({
      items: formattedItems,
      totalPrice: Number(totalPrice),
      status: "PENDING",
      customerName: customerName || "Guest",
      customerEmail: customerEmail || "guest@pudinginaja.com",
      customerPhone: customerPhone || "",
    });

    console.log("📝 Checkout created:", checkout._id);

    // -------------------------
    // UNIQUE ORDER ID (UUID)
    // -------------------------
    const midtransOrderId = `ORDER-${uuidv4()}`;

    console.log("🆔 Generated Order ID:", midtransOrderId);

    // -------------------------
    // MIDTRANS TRANSACTION
    // -------------------------
    let midtransTransaction;
    try {
      midtransTransaction = await createMidtransTransaction({
        orderId: midtransOrderId,
        totalPrice,
        customerName,
        customerEmail,
        customerPhone,
        items: formattedItems,
      });
    } catch (err) {
      console.error("❌ Midtrans error:", err.ApiResponse || err);

      await Checkout.findByIdAndUpdate(checkout._id, { status: "FAILED" });

      return res.status(502).json({
        success: false,
        error:
          err.ApiResponse?.status_message ||
          err.message ||
          "Failed to create Midtrans transaction",
      });
    }

    console.log("💳 Midtrans OK → Redirect:", midtransTransaction.redirectUrl);

    // -------------------------
    // SAVE PAYMENT RECORD
    // -------------------------
    const payment = await Payment.create({
      checkoutId: checkout._id,
      midtransOrderId,
      midtransSnapToken: midtransTransaction.token,
      midtransSnapUrl: midtransTransaction.redirectUrl,
      amount: Number(totalPrice),
      status: "PENDING",
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    console.log("💰 Payment created:", payment._id);

    // -------------------------
    // SEND WHATSAPP (non-blocking)
    // -------------------------
    const orderData = {
      orderId: checkout._id.toString().slice(-8).toUpperCase(),
      items: formattedItems,
      totalPrice,
      customerName,
      customerPhone,
      customerEmail,
      paymentUrl: midtransTransaction.redirectUrl,
    };

    if (process.env.FONNTE_TOKEN) {
      notifyAdminNewOrder(orderData).catch((e) =>
        console.error("WA admin error:", e.message)
      );

      if (customerPhone) {
        notifyCustomerCheckout(customerPhone, orderData).catch((e) =>
          console.error("WA customer error:", e.message)
        );
      }
    }

    // -------------------------
    // SUCCESS RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      checkout,
      payment: {
        snapToken: midtransTransaction.token,
        redirectUrl: midtransTransaction.redirectUrl,
      },
    });
  } catch (err) {
    console.error("❌ API Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Checkout failed",
    });
  }
}
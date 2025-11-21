// pages/api/midtrans-notification.js
import { buffer } from "micro";
import { coreApi } from "../../lib/midtrans";
import dbConnect from "../../lib/mongodb";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";
import {
  notifyAdminPaymentSuccess,
  notifyCustomerPaymentSuccess
} from "../../lib/whatsapp";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    // RAW body → diperlukan Midtrans
    const rawBody = (await buffer(req)).toString();
    const notification = JSON.parse(rawBody);

    console.log("📩 Midtrans Notification:", notification);

    const orderId = notification.order_id;

    // Ambil status dari Midtrans
    const status = await coreApi.transaction.status(orderId);
    console.log("📊 Status:", status);

    let mappedStatus = "PENDING";
    const t = status.transaction_status;

    if (t === "settlement" || t === "capture") mappedStatus = "PAID";
    else if (t === "expire") mappedStatus = "EXPIRED";
    else if (t === "cancel" || t === "deny") mappedStatus = "FAILED";

    // Update PAYMENT
    const payment = await Payment.findOneAndUpdate(
      { midtransOrderId: orderId },
      {
        status: mappedStatus,
        paymentMethod: status.payment_type,
        midtransTransactionId: status.transaction_id,
        paidAt: mappedStatus === "PAID" ? new Date() : null
      },
      { new: true }
    );

    if (!payment) {
      console.log("⚠️ Payment not found");
      return res.status(404).json({ success: false });
    }

    // Update CHECKOUT
    const checkout = await Checkout.findByIdAndUpdate(
      payment.checkoutId,
      { status: mappedStatus },
      { new: true }
    );

    console.log("✅ Updated Checkout + Payment");

    // 🔥 Kirim WA jika berhasil bayar
    if (mappedStatus === "PAID") {
      const orderData = {
        orderId: checkout._id.toString().slice(-8).toUpperCase(),
        items: checkout.items,
        totalPrice: checkout.totalPrice,
        customerName: checkout.customerName,
        customerPhone: checkout.customerPhone
      };

      // WA ke Customer
      if (checkout.customerPhone) {
        notifyCustomerPaymentSuccess(checkout.customerPhone, orderData)
          .then(() => console.log("📱 Customer WA sent"))
          .catch(err => console.error("❌ WA customer error:", err));
      }

      // WA ke Admin
      notifyAdminPaymentSuccess(orderData)
        .then(() => console.log("📱 Admin WA sent"))
        .catch(err => console.error("❌ WA admin error:", err));
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ success: false });
  }
}
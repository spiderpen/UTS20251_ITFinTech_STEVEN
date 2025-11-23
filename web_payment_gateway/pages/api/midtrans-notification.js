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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Ambil rawBody dari Midtrans (WAJIB)
    const rawBody = (await buffer(req)).toString();
    const notification = JSON.parse(rawBody);

    console.log("📩 Midtrans Notification Received:", notification);

    const orderId = notification.order_id;

    // Ambil status terbaru dari Midtrans
    const statusResponse = await coreApi.transaction.status(orderId);
    const { transaction_status, fraud_status } = statusResponse;

    console.log("📊 Midtrans Status Response:", statusResponse);

    // Mapping status
    let mappedStatus = "PENDING";

    if (transaction_status === "capture" && fraud_status === "accept") {
      mappedStatus = "PAID";
    } else if (transaction_status === "settlement") {
      mappedStatus = "PAID";
    } else if (transaction_status === "expire") {
      mappedStatus = "EXPIRED";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      mappedStatus = "FAILED";
    }

    // Update Payment
    const payment = await Payment.findOneAndUpdate(
      { midtransOrderId: orderId },
      {
        status: mappedStatus,
        paymentMethod: statusResponse.payment_type,
        midtransTransactionId: statusResponse.transaction_id,
        paidAt: mappedStatus === "PAID" ? new Date() : null
      },
      { new: true }
    );

    if (!payment) {
      console.log("⚠️ PAYMENT record not found for:", orderId);
      return res.status(404).json({ success: false });
    }

    // Update Checkout
    const checkout = await Checkout.findByIdAndUpdate(
      payment.checkoutId,
      { status: mappedStatus, paidAt: mappedStatus === "PAID" ? new Date() : null },
      { new: true }
    );

    console.log("✅ Payment & Checkout Updated:", mappedStatus);

    // KIRIM WA HANYA JIKA SUDAH BAYAR
    if (mappedStatus === "PAID") {
      const orderData = {
        orderId: checkout._id.toString().slice(-8).toUpperCase(),
        items: checkout.items,
        totalPrice: checkout.totalPrice,
        customerName: checkout.customerName,
        customerPhone: checkout.customerPhone
      };

      // Kirim WA ke Customer
      if (checkout.customerPhone) {
        notifyCustomerPaymentSuccess(checkout.customerPhone, orderData)
          .then(() => console.log("📱 WhatsApp sent to customer"))
          .catch((err) => console.error("❌ WA customer error:", err));
      }

      // Kirim WA ke Admin
      notifyAdminPaymentSuccess(orderData)
        .then(() => console.log("📱 WhatsApp sent to admin"))
        .catch((err) => console.error("❌ WA admin error:", err));
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.status(500).json({ success: false });
  }
}
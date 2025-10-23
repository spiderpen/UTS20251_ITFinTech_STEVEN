import dbConnect from "../../lib/mongodb";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";
import { notifyCustomerPaymentSuccess, notifyAdminPaymentSuccess } from "../../lib/whatsapp";

export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // ✅ Pastikan body diterima
    const event = req.body;
    console.log("✅ Webhook received:", event);

    // Ambil data penting dari payload Xendit
    const invoiceId = event.id || event.data?.id;
    const status = event.status || event.data?.status;

    // Validasi dasar
    if (!invoiceId || !status) {
      console.warn("⚠️ Invalid webhook payload:", event);
      return res.status(400).json({ success: false, error: "Invalid webhook payload" });
    }

    // Cari payment berdasarkan invoice ID
    const payment = await Payment.findOne({ xenditInvoiceId: invoiceId });

    if (!payment) {
      console.warn(`⚠️ Payment not found for invoice ID: ${invoiceId}`);
      return res.status(200).json({ message: "Payment not found, ignored" });
    }

    // Update status pembayaran
    payment.status = status;
    if (status === "PAID") {
      payment.paidAt = event.paid_at || new Date();
      payment.paymentMethod = event.payment_method || event.data?.payment_method;
      payment.paymentChannel = event.payment_channel || event.data?.payment_channel;
    }
    await payment.save();

    // Update juga di Checkout jika ada
    const checkout = await Checkout.findById(payment.checkoutId);
    if (checkout) {
      checkout.status = status;
      if (status === "PAID") checkout.paidAt = new Date();
      await checkout.save();
      console.log(`✅ Checkout ${checkout._id} updated to ${status}`);

      // 🔔 KIRIM NOTIFIKASI WHATSAPP JIKA PAYMENT SUCCESS
      if (status === "PAID") {
        const orderData = {
          orderId: checkout._id.toString().slice(-8).toUpperCase(),
          items: checkout.items || [],
          totalPrice: checkout.totalPrice || 0,
          customerName: checkout.customerName || "Guest",
          customerPhone: checkout.customerPhone || null,
          customerEmail: checkout.customerEmail || "guest@example.com"
        };

        console.log("📱 Sending WhatsApp notifications for order:", orderData.orderId);

        // Kirim notifikasi ke admin (non-blocking)
        notifyAdminPaymentSuccess(orderData)
          .then(() => console.log("✅ Admin notified successfully"))
          .catch(err => console.error("❌ Failed to notify admin:", err.message));

        // Kirim notifikasi ke customer jika ada nomor WA
        if (checkout.customerPhone) {
          notifyCustomerPaymentSuccess(checkout.customerPhone, orderData)
            .then(() => console.log("✅ Customer notified successfully"))
            .catch(err => console.error("❌ Failed to notify customer:", err.message));
        } else {
          console.warn("⚠️ Customer phone not available, skipping customer notification");
        }
      }
    }

    // Beri respons sukses ke Xendit
    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
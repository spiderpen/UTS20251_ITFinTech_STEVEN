import dbConnect from "../../../lib/mongodb";
import Order from "../../../models/Order";
import PaymentTransaction from "../../../models/PaymentTransaction";
import User from "../../../models/User";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "ID pesanan wajib diisi." });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    const user = await User.findById(order.user);

    // Simpan transaksi untuk pelunasan
    await PaymentTransaction.create({
      user: user._id,
      orderId: order._id,
      type: "payment",
      amount: order.totalPrice,
      status: "paid",
    });

    // Kirim notifikasi WA
    const message = `💵 *Pembayaran Diterima!*
Halo ${user.username || "Customer"}, kami telah menerima pembayaran kamu sebesar Rp ${order.totalPrice.toLocaleString()}.
Pesanan kamu sedang kami proses. Terima kasih telah berbelanja di *Millenium Jaya*!`;

    try {
      await axios.post(
        "https://api.fonnte.com/send",
        {
          target: user.phone,
          message,
        },
        {
          headers: {
            Authorization: process.env.FONNTE_TOKEN,
          },
        }
      );
      console.log("✅ Notifikasi pelunasan dikirim via WA");
    } catch (err) {
      console.error("❌ Gagal kirim WA:", err.response?.data || err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Pembayaran dikonfirmasi dan WA dikirim.",
    });
  } catch (error) {
    console.error("❌ Error confirm-transaction:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
}

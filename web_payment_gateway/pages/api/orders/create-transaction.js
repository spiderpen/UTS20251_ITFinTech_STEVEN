import dbConnect from "../../../lib/mongodb";
import Order from "../../../models/Order"; // gunakan model order lama
import PaymentTransaction from "../../../models/PaymentTransaction";
import User from "../../../models/User";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, orderId } = req.body;

    if (!email || !orderId) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan." });
    }

    // Simpan transaksi untuk catatan
    await PaymentTransaction.create({
      user: user._id,
      orderId: order._id,
      type: "checkout",
      amount: order.totalPrice,
      status: "sent",
    });

    // Kirim notifikasi WA via Fonnte
    const message = `🛒 *Checkout Berhasil!*
Halo ${user.username || "Customer"}, terima kasih sudah memesan di *Millenium Jaya*.
Total pesanan kamu: Rp ${order.totalPrice.toLocaleString()}.
Silakan lanjutkan pembayaran untuk konfirmasi.`;

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
      console.log("✅ Notifikasi checkout terkirim via WA");
    } catch (err) {
      console.error("❌ Gagal kirim notifikasi WA:", err.response?.data || err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Checkout berhasil dan notifikasi WA dikirim.",
    });
  } catch (error) {
    console.error("❌ Error create-transaction:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
}

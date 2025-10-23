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
    const { email, cartItems, totalPrice } = req.body;

    if (!email || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // Buat order baru
    const order = await Order.create({
      user: user._id,
      items: cartItems,
      totalPrice,
      status: "pending",
    });

    // Catat transaksi
    await PaymentTransaction.create({
      user: user._id,
      orderId: order._id,
      type: "checkout",
      amount: totalPrice,
      status: "sent",
    });

    // Kirim notifikasi WhatsApp
    const message = `🛒 *Checkout Berhasil!*
Halo ${user.username || "Customer"}, terima kasih sudah memesan di *Millenium Jaya*.
Total pesanan kamu: Rp ${totalPrice.toLocaleString()}.
Silakan lanjutkan pembayaran untuk konfirmasi.`;

    try {
      await axios.post(
        "https://api.fonnte.com/send",
        {
          target: user.phone,
          message,
        },
        {
          headers: { Authorization: process.env.FONNTE_TOKEN },
        }
      );
      console.log("✅ Notifikasi checkout dikirim ke WA");
    } catch (waErr) {
      console.error("❌ Gagal kirim WA:", waErr.response?.data || waErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Checkout berhasil, notifikasi dikirim ke WhatsApp.",
      orderId: order._id,
    });
  } catch (error) {
    console.error("❌ Error checkout:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
}

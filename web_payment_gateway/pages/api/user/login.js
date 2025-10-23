// /pages/api/user/login.js
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password, phone } = req.body;

    // Validasi input
    if (!email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, password, dan nomor WhatsApp wajib diisi.",
      });
    }

    // Cek apakah user terdaftar
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password salah.",
      });
    }

    // Pastikan nomor WhatsApp sesuai dengan yang terdaftar
    if (user.phone !== phone) {
      return res.status(400).json({
        success: false,
        message:
          "Nomor WhatsApp tidak cocok dengan akun ini. Gunakan nomor yang terdaftar.",
      });
    }

    // Buat OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan OTP dan waktu kedaluwarsa (5 menit)
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Kirim OTP via Fonnte API
    try {
      const fonnteRes = await axios.post(
        "https://api.fonnte.com/send",
        {
          target: phone,
          message: `🔐 Halo ${user.username}, kode OTP login kamu adalah *${otp}*. Berlaku selama 5 menit.`,
        },
        {
          headers: {
            Authorization: process.env.FONNTE_TOKEN, // pastikan ada di .env.local
          },
        }
      );

      console.log("✅ OTP terkirim:", fonnteRes.data);
    } catch (sendError) {
      console.error("❌ Gagal kirim OTP:", sendError.response?.data || sendError.message);
      return res.status(500).json({
        success: false,
        message:
          "Tidak dapat mengirim OTP. Periksa kembali nomor WhatsApp atau token Fonnte.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP telah dikirim ke WhatsApp. Silakan verifikasi untuk login.",
      nextStep: "verify-otp", // untuk membantu front-end tahu langkah berikutnya
    });
  } catch (err) {
    console.error("❌ Terjadi kesalahan login user:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
}

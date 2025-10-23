import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User"; // Pastikan sudah dibuat mirip Admin.js
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
    const { username, email, password, phone } = req.body;

    // Validasi field dasar
    if (!username || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Semua field wajib diisi." });
    }

    // Validasi nomor WhatsApp Indonesia (format 62...)
    if (!/^62\d{8,15}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Nomor WhatsApp tidak valid. Gunakan format 62xxxxxxxxxx tanpa + atau 0.",
      });
    }

    // Cek apakah email / username sudah ada
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah terdaftar.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Buat atau update user dengan OTP baru
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000), // berlaku 5 menit
      isVerified: false,
    });

    // Cek token Fonnte
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (!fonnteToken) {
      console.error("❌ Fonnte token belum diset di .env.local");
      return res.status(500).json({
        success: false,
        message: "Konfigurasi Fonnte belum lengkap di server.",
      });
    }

    // Kirim OTP via Fonnte
    try {
      const fonnteRes = await axios.post(
        "https://api.fonnte.com/send",
        {
          target: phone,
          message: `Halo ${username}, kode OTP kamu adalah *${otp}*.\nBerlaku 5 menit. Jangan bagikan ke siapa pun.`,
        },
        {
          headers: {
            Authorization: fonnteToken,
          },
        }
      );

      console.log("✅ Fonnte response:", fonnteRes.data);
    } catch (fonnteErr) {
      console.error("❌ Gagal kirim OTP via Fonnte:", fonnteErr.response?.data);
      return res.status(500).json({
        success: false,
        message:
          "User berhasil dibuat, tapi gagal mengirim OTP ke WhatsApp. Silakan coba lagi.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registrasi berhasil! OTP telah dikirim ke WhatsApp Anda.",
    });
  } catch (error) {
    console.error("❌ Error register user:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
}

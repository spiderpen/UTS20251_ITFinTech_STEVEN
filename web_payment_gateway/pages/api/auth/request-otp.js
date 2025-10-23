import dbConnect from "../../../lib/mongodb";
import Admin from "../../../models/Admin";
import bcrypt from "bcryptjs";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password, phone } = req.body;

  if (!username || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "Username, password, dan nomor WhatsApp wajib diisi.",
    });
  }

  try {
    // Cari admin di database
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Username salah." });
    }

    // Cocokkan password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password salah." });
    }

    // Generate OTP 6 digit dan simpan ke MongoDB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    admin.phone = phone;
    await admin.save();

    // Kirim OTP ke WhatsApp via Fonnte
    try {
      await axios.post(
        "https://api.fonnte.com/send",
        {
          target: phone,
          message: `Kode verifikasi login Anda adalah *${otp}*. Berlaku selama 5 menit.`,
        },
        {
          headers: {
            Authorization: process.env.FONNTE_TOKEN,
          },
        }
      );
    } catch (err) {
      console.error("❌ Gagal kirim OTP via Fonnte:", err.response?.data || err.message);
      return res.status(500).json({
        success: false,
        message: "Gagal mengirim OTP ke WhatsApp. Coba lagi.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP telah dikirim ke WhatsApp Anda.",
    });
  } catch (err) {
    console.error("❌ request-otp error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

import dbConnect from "../../../lib/mongodb";
import Admin from "../../../models/Admin.js";
import { signToken } from "../../../lib/jwt.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        success: false,
        message: "Username dan OTP wajib diisi.",
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan.",
      });
    }

    console.log("🔍 OTP dari DB:", admin.otp);
    console.log("🔍 OTP dari user:", otp);
    console.log("⏰ otpExpires:", admin.otpExpires);

    // Cek apakah ada OTP tersimpan
    if (!admin.otp || !admin.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP tidak ditemukan. Silakan login ulang.",
      });
    }

    // Cek apakah OTP sudah kedaluwarsa
    if (admin.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP sudah kedaluwarsa. Silakan kirim ulang.",
      });
    }

    // Bandingkan OTP secara ketat (string)
    if (admin.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(401).json({
        success: false,
        message: "OTP salah. Silakan periksa kembali.",
      });
    }

    // OTP valid → hapus OTP dari DB
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    // Buat JWT token
    const token = signToken({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
}

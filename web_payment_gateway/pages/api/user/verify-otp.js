// /pages/api/user/verify-otp.js
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, otp } = req.body;

    // Validasi input
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Nomor dan OTP wajib diisi." });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    // Validasi OTP
    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Kode OTP salah." });
    }

    // Cek apakah OTP sudah kadaluarsa
    if (user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Kode OTP telah kedaluwarsa." });
    }

    // OTP valid → hapus OTP agar tidak bisa digunakan lagi
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Buat JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Simpan token ke cookie (agar bisa diakses frontend)
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("userToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 1 hari
        path: "/",
      })
    );

    // Kirim response sukses ke frontend
    return res.status(200).json({
      success: true,
      message: "Verifikasi OTP berhasil! Mengalihkan ke halaman utama...",
      redirect: "/select-items",
      token,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("❌ Error verify OTP user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server." });
  }
}

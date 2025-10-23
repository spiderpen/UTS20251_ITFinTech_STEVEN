// lib/sendOtp.js
import axios from "axios";

const FONNTE_API_URL = "https://api.fonnte.com/send";
const FONNTE_TOKEN = process.env.FONNTE_TOKEN; // pastikan kamu punya .env.local

export async function sendOtpToWhatsApp(phone, otp) {
  try {
    const message = `Kode OTP Anda adalah *${otp}*. Berlaku selama 5 menit. Jangan bagikan kepada siapa pun.`;

    const response = await axios.post(
      FONNTE_API_URL,
      {
        target: phone,
        message,
      },
      {
        headers: {
          Authorization: FONNTE_TOKEN,
        },
      }
    );

    if (response.data && response.data.status === true) {
      console.log("✅ OTP terkirim ke WhatsApp:", phone);
      return true;
    } else {
      console.error("❌ Gagal kirim OTP:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error kirim OTP:", error.response?.data || error.message);
    return false;
  }
}

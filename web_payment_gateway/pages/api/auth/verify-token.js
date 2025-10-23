import { verifyToken } from "../../../lib/jwt.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, message: "Method Not Allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ valid: false, message: "Token required" });
    }

    const decoded = verifyToken(token);
    // ✅ Token valid
    return res.status(200).json({ valid: true, user: decoded });

  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    // ❌ Ubah status jadi 401 agar frontend tahu token invalid
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
}

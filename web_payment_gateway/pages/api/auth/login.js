import dbConnect from "../../lib/mongodb";
import Admin from "../../models/Admin";
import bcrypt from "bcryptjs";
import { signToken } from "../../lib/jwt";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Username and password required" 
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = signToken({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    res.status(200).json({ 
      success: true, 
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
}
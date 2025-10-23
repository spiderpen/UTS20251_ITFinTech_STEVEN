import { requireAuth } from "../../../lib/adminAuth";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // If we reach here, token is valid (checked by requireAuth)
  res.status(200).json({ 
    success: true, 
    admin: req.admin 
  });
}

export default requireAuth(handler);
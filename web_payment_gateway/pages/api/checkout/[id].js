// api/checkout/[id].js
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: "Checkout ID is required" 
        });
      }

      // Find checkout by ID
      const checkout = await Checkout.findById(id);
      
      if (!checkout) {
        return res.status(404).json({ 
          success: false, 
          error: "Checkout not found" 
        });
      }

      // Optionally get payment info as well
      const payment = await Payment.findOne({ checkoutId: checkout._id });

      return res.status(200).json({ 
        success: true, 
        checkout,
        payment: payment || null
      });

    } catch (err) {
      console.error("❌ Get checkout error:", err);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
import dbConnect from "../../lib/mongodb";
import Order from "../../models/Order";
import Checkout from "../../models/Checkout";
import { requireAuth } from "../../lib/adminAuth";

async function handler(req, res) {
  await dbConnect();

  // GET: List all orders
  if (req.method === "GET") {
    try {
      const { status, startDate, endDate } = req.query;

      let query = {};

      // Filter by status if provided
      if (status && status !== "ALL") {
        query.status = status;
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Try to get from Order collection first
      let orders = await Order.find(query).sort({ createdAt: -1 });

      // If no orders in Order collection, try Checkout collection (backward compatibility)
      if (orders.length === 0) {
        const checkouts = await Checkout.find(query).sort({ _id: -1 });
        
        // Map Checkout to Order format
        orders = checkouts.map(checkout => ({
          _id: checkout._id,
          items: checkout.items,
          totalPrice: checkout.totalPrice,
          status: checkout.status,
          customerName: "Guest",
          customerEmail: "guest@example.com",
          createdAt: checkout._id.getTimestamp(),
        }));
      }

      res.status(200).json({ 
        success: true, 
        orders,
        count: orders.length 
      });
    } catch (err) {
      console.error("❌ Get orders error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch orders" 
      });
    }
  }

  // PUT: Update order status
  else if (req.method === "PUT") {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ 
          success: false, 
          error: "orderId and status required" 
        });
      }

      // Try Order collection first
      let order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status,
          ...(status === "PAID" && { paidAt: new Date() })
        },
        { new: true }
      );

      // If not found, try Checkout collection
      if (!order) {
        order = await Checkout.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        );
      }

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: "Order not found" 
        });
      }

      res.status(200).json({ 
        success: true, 
        order 
      });
    } catch (err) {
      console.error("❌ Update order error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update order" 
      });
    }
  }

  else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default requireAuth(handler);
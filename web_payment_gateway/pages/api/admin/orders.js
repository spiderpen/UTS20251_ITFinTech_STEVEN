import dbConnect from "../../../lib/mongodb";
import Order from "../../../models/Order.js";
import Checkout from "../../../models/Checkout.js";
import { requireAuth } from "../../../lib/adminAuth.js";

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

      // ✅ PERBAIKAN: Gabungkan data dari Order dan Checkout
      let allOrders = [];

      // Get from Order collection
      const orders = await Order.find(query).sort({ createdAt: -1 });
      allOrders = orders.map(order => ({
        _id: order._id,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        customerName: order.customerName || "Guest",
        customerEmail: order.customerEmail || "guest@example.com",
        createdAt: order.createdAt,
        paidAt: order.paidAt
      }));

      // Get from Checkout collection
      const checkouts = await Checkout.find(query).sort({ _id: -1 });
      const checkoutOrders = checkouts.map(checkout => ({
        _id: checkout._id,
        items: checkout.items,
        totalPrice: checkout.totalPrice,
        status: checkout.status,
        customerName: "Guest",
        customerEmail: "guest@example.com",
        createdAt: checkout._id.getTimestamp(),
        paidAt: null
      }));

      // Gabungkan dan urutkan berdasarkan tanggal terbaru
      allOrders = [...allOrders, ...checkoutOrders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Filter berdasarkan status jika ada
      if (status && status !== "ALL") {
        allOrders = allOrders.filter(order => order.status === status);
      }

      console.log("✅ Total orders found:", allOrders.length);
      console.log("✅ Sample order:", allOrders[0]);

      res.status(200).json({ 
        success: true, 
        orders: allOrders,
        count: allOrders.length 
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

      console.log(`🔄 Updating order ${orderId} to ${status}`);

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
          { 
            status,
            ...(status === "PAID" && { paidAt: new Date() })
          },
          { new: true }
        );
      }

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: "Order not found" 
        });
      }

      console.log("✅ Order updated:", order);

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
import dbConnect from "../../lib/mongodb";
import Order from "../../models/Order";
import Checkout from "../../models/Checkout";
import { requireAuth } from "../../lib/adminAuth";

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { period = "daily" } = req.query; // daily, weekly, monthly

    // Get all paid orders
    let orders = await Order.find({ status: "PAID" });

    // If no orders in Order collection, try Checkout
    if (orders.length === 0) {
      const checkouts = await Checkout.find({ status: "PAID" });
      orders = checkouts.map(c => ({
        totalPrice: c.totalPrice,
        createdAt: c._id.getTimestamp()
      }));
    }

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Group by period
    const groupedData = {};

    orders.forEach(order => {
      const date = new Date(order.paidAt || order.createdAt);
      let key;

      if (period === "daily") {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, revenue: 0, orders: 0 };
      }

      groupedData[key].revenue += order.totalPrice;
      groupedData[key].orders += 1;
    });

    // Convert to array and sort
    const chartData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Get summary stats
    const stats = {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      chartData
    };

    res.status(200).json({ 
      success: true, 
      stats 
    });
  } catch (err) {
    console.error("❌ Get stats error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch statistics" 
    });
  }
}

export default requireAuth(handler);
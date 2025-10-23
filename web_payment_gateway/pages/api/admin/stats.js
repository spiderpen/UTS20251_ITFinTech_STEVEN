import dbConnect from "../../../lib/mongodb";
import Order from "../../../models/Order.js";
import Checkout from "../../../models/Checkout.js";
import { requireAuth } from "../../../lib/adminAuth.js";

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { period = "daily" } = req.query;

    // Get all paid orders
    let orders = await Order.find({ status: "PAID" });

    // If no orders in Order collection, try Checkout
    if (orders.length === 0) {
      const checkouts = await Checkout.find({ status: "PAID" });
      orders = checkouts.map(c => ({
        totalPrice: c.totalPrice,
        createdAt: c._id.getTimestamp(),
        items: c.items || []
      }));
    }

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Group by period for chart
    const groupedData = {};

    orders.forEach(order => {
      const date = new Date(order.paidAt || order.createdAt);
      let key;

      if (period === "daily") {
        key = date.toISOString().split('T')[0];
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

    const chartData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate Best Selling Products
    const productStats = {};

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // ✅ Ambil nama produk dari field 'name'
          const productName = item.name || "Unknown Product";
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const revenue = quantity * price;

          if (!productStats[productName]) {
            productStats[productName] = {
              name: productName,
              category: item.category || "Unknown",
              totalQuantity: 0,
              totalRevenue: 0,
              image: item.image || "/placeholder.jpg"
            };
          }

          productStats[productName].totalQuantity += quantity;
          productStats[productName].totalRevenue += revenue;
        });
      }
    });

    // Convert to array and sort by revenue
    const bestSellers = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    console.log("✅ Best Sellers:", bestSellers); // Debug log

    const stats = {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      chartData,
      bestSellers
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
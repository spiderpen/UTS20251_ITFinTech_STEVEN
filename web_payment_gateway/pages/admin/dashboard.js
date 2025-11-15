import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [period, setPeriod] = useState("daily");
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchOrders();
      fetchStats();
    }
  }, [filter, period, adminUser]);

  const checkAuth = async () => {
    const token = localStorage.getItem("adminToken");
    const user = JSON.parse(localStorage.getItem("adminUser") || "null");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    try {
      const response = await fetch("/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Auth failed");
      
      setAdminUser(user);
    } catch (err) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const timestamp = new Date().getTime(); // Force refresh
      const response = await fetch(`/api/admin/orders?status=${filter}&_t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      console.log("📦 Orders fetched:", data.orders?.length || 0);
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (response.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin/login";
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "#FFA500", bg: "#FFF4E6", label: "⏳ Waiting Payment" },
      PAID: { color: "#10B981", bg: "#ECFDF5", label: "✅ Lunas" },
      FAILED: { color: "#EF4444", bg: "#FEE2E2", label: "❌ Failed" },
      EXPIRED: { color: "#6B7280", bg: "#F3F4F6", label: "⌛ Expired" }
    };

    const badge = badges[status] || badges.PENDING;

    return (
      <span style={{
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        color: badge.color,
        backgroundColor: badge.bg
      }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #E5E7EB", borderTop: "4px solid #3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "#6B7280" }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      {/* Sidebar */}
      <aside style={{ width: "280px", backgroundColor: "#1F2937", color: "white", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #374151" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "32px" }}>👑</div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>pudinginaja</h2>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px" }}>
          <a href="/admin/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#3B82F6", color: "white", textDecoration: "none", marginBottom: "8px" }}>
            <span>📊</span>
            Dashboard
          </a>
          <a href="/admin/products" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "#D1D5DB", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={(e) => e.target.style.backgroundColor = "#374151"} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
            <span>🍽️</span>
            Products
          </a>
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid #374151" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>{adminUser?.username}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{adminUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "10px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Monitor your orders and revenue</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                💰
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Total Revenue</p>
                <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "4px 0 0 0" }}>Rp {stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                📦
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Total Orders</p>
                <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "4px 0 0 0" }}>{stats.totalOrders}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                📈
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Avg Order Value</p>
                <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "4px 0 0 0" }}>Rp {Math.round(stats.averageOrderValue).toLocaleString()}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {stats && stats.chartData.length > 0 && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>Revenue Overview</h2>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", cursor: "pointer" }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (Rp)" />
                <Bar dataKey="orders" fill="#10B981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Best Selling Products */}
        {stats && stats.bestSellers && stats.bestSellers.length > 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "32px" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>🔥 Best Selling Products</h2>
              <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>Top products by revenue</p>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {stats.bestSellers.slice(0, 5).map((product, index) => (
                  <div key={index} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"} onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: index === 0 ? "#FEF3C7" : index === 1 ? "#E0E7FF" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: index === 0 ? "#F59E0B" : index === 1 ? "#6366F1" : "#6B7280" }}>
                        #{index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h4>
                        <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>{product.category}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #E5E7EB" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Sold</p>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "2px 0 0 0" }}>{product.totalQuantity}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Revenue</p>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#10B981", margin: "2px 0 0 0" }}>Rp {Math.round(product.totalRevenue / 1000)}k</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>Recent Orders</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", cursor: "pointer" }}>
              <option value="ALL">All Orders</option>
              <option value="PENDING">Waiting Payment</option>
              <option value="PAID">Lunas</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#F9FAFB" }}>
                <tr>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Order ID</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Customer</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Items</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Total</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#111827", fontWeight: "600" }}>
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#6B7280" }}>
                      {order.customerName || "Guest"}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#6B7280" }}>
                      <div style={{ position: "relative", cursor: "help" }} title={order.items?.map(item => `${item.name || "Unknown"} (${item.quantity || 1}x)`).join(", ")}>
                        {(() => {
                          const totalQty = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                          return (
                            <>
                              <span style={{ fontWeight: "600", color: "#111827" }}>{totalQty}</span>
                              <span> items</span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#111827", fontWeight: "600" }}>
                      Rp {order.totalPrice?.toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#6B7280" }}>
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {order.status === "PENDING" && (
                        <button onClick={() => updateOrderStatus(order._id, "PAID")} style={{ padding: "6px 12px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <p style={{ color: "#6B7280", fontSize: "16px" }}>No orders found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
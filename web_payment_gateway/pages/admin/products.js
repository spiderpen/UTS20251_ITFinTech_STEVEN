import { useState, useEffect } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    image: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchProducts();
    }
  }, [adminUser]);

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

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");
      
      if (editMode) {
        // Update product
        const response = await fetch("/api/admin/products", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert("Product updated successfully!");
        }
      } else {
        // Create product
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert("Product created successfully!");
        }
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        fetchProducts();
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      category: "",
      price: "",
      image: ""
    });
    setEditMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #E5E7EB", borderTop: "4px solid #3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
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
          <a href="/admin/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "#D1D5DB", textDecoration: "none", marginBottom: "8px" }}>
            <span>📊</span>
            Dashboard
          </a>
          <a href="/admin/products" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#3B82F6", color: "white", textDecoration: "none" }}>
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
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#111827", margin: 0 }}>Products</h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>Manage your menu items</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: "12px 24px", backgroundColor: "#3B82F6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            ➕ Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {products.map((product) => (
            <div key={product._id} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>{product.name}</h3>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 12px 0" }}>{product.category}</p>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#3B82F6", margin: "0 0 16px 0" }}>Rp {product.price.toLocaleString()}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(product)} style={{ flex: 1, padding: "8px", backgroundColor: "#F3F4F6", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} style={{ flex: 1, padding: "8px", backgroundColor: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
            <p style={{ color: "#6B7280", fontSize: "16px" }}>No products yet. Add your first product!</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "90%", maxWidth: "500px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>
                {editMode ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", fontSize: "14px" }}
                  >
                    <option value="">Select Category</option>
                    <option value="Meals">Meals</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Price (Rp)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    style={{ flex: 1, padding: "12px", backgroundColor: "#F3F4F6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: "12px", backgroundColor: "#3B82F6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    {editMode ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
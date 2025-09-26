import { useEffect, useState } from "react";
import axios from "axios";

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const addToCart = (product) => {
    const updated = [...cart, { ...product, quantity: 1 }];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg">Logo</h1>
        <a href="/checkout" className="relative">
          🛒
          <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
            {cart.length}
          </span>
        </a>
      </header>

      {/* Search & Filter Tabs */}
      <input
        type="text"
        placeholder="Search"
        className="w-full border px-3 py-2 rounded mb-3"
      />
      <div className="flex gap-2 mb-4 text-sm overflow-x-auto">
        {["All", "Drinks", "Snacks", "Meals"].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-3 rounded flex flex-col">
            <div className="h-20 bg-gray-200 rounded mb-2" />
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-gray-600">Rp {p.price}</p>
            <button
              className="mt-2 bg-blue-500 text-white py-1 rounded"
              onClick={() => addToCart(p)}
            >
              Add +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

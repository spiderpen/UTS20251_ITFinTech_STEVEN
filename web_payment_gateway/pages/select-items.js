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
    const updated = [...cart, product];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Select Items</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{p.name}</h2>
            <p>Rp {p.price}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => addToCart(p)}
            >
              Add +
            </button>
          </div>
        ))}
      </div>
      <a
        href="/checkout"
        className="mt-6 block text-blue-600 underline font-semibold"
      >
        Go to Checkout →
      </a>
    </div>
  );
}

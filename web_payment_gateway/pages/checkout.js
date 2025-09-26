import { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const taxRate = 0.1; // contoh 10%

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    setSubtotal(stored.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0));
  }, []);

  const updateQty = (i, delta) => {
    const updated = [...cart];
    updated[i].quantity = Math.max(1, (updated[i].quantity || 1) + delta);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setSubtotal(updated.reduce((sum, it) => sum + it.price * it.quantity, 0));
  };

  const handleCheckout = async () => {
    const res = await axios.post("/api/checkout", {
      items: cart,
      totalPrice: subtotal + subtotal * taxRate,
    });
    localStorage.setItem("checkoutId", res.data.checkout._id);
    window.location.href = "/payment";
  };

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="p-4 max-w-md mx-auto">
      <button onClick={() => history.back()} className="text-blue-600 mb-4">
        ← Back
      </button>
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      {cart.map((item, i) => (
        <div key={i} className="flex justify-between items-center mb-3">
          <span>{item.name}</span>
          <div className="flex items-center">
            <button
              onClick={() => updateQty(i, -1)}
              className="px-2 border rounded"
            >
              -
            </button>
            <span className="px-2">{item.quantity || 1}</span>
            <button
              onClick={() => updateQty(i, 1)}
              className="px-2 border rounded"
            >
              +
            </button>
          </div>
          <span>Rp {item.price}</span>
        </div>
      ))}

      <hr className="my-3" />
      <p>Subtotal: Rp {subtotal}</p>
      <p>Tax (10%): Rp {tax}</p>
      <p className="font-bold">Total: Rp {total}</p>

      <button
        onClick={handleCheckout}
        className="mt-4 w-full bg-green-500 text-white py-2 rounded"
      >
        Continue to Payment →
      </button>
    </div>
  );
}

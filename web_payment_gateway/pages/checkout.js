import { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    setTotal(stored.reduce((sum, item) => sum + item.price, 0));
  }, []);

  const handleCheckout = async () => {
    const res = await axios.post("/api/checkout", {
      items: cart,
      totalPrice: total,
    });
    localStorage.setItem("checkoutId", res.data._id);
    window.location.href = "/payment";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name}</span>
              <span>Rp {item.price}</span>
            </div>
          ))}
          <hr className="my-4" />
          <p>Total: Rp {total}</p>
          <button
            onClick={handleCheckout}
            className="mt-4 bg-green-500 text-white px-3 py-1 rounded"
          >
            Continue to Payment →
          </button>
        </>
      )}
    </div>
  );
}

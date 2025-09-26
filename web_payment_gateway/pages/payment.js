import { useEffect, useState } from "react";
import axios from "axios";

export default function Payment() {
  const [method, setMethod] = useState("card");
  const [summary, setSummary] = useState({ subtotal: 0, shipping: 10000 });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const subtotal = stored.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    setSummary((prev) => ({ ...prev, subtotal }));
  }, []);

  const handlePayment = async () => {
    const checkoutId = localStorage.getItem("checkoutId");
    const amount = summary.subtotal + summary.shipping;

    const res = await axios.post("/api/payment", { checkoutId, amount });
    if (res.data.success) {
      window.location.href = res.data.invoice.invoice_url;
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button onClick={() => history.back()} className="text-blue-600 mb-4">
        ← Back
      </button>
      <h1 className="text-xl font-bold mb-4">Secure Checkout</h1>

      <h2 className="font-semibold mb-2">Shipping Address</h2>
      <div className="border p-2 rounded mb-4 text-gray-500">
        Jl. Contoh No. 123<br />
        Jakarta, Indonesia
      </div>

      <h2 className="font-semibold mb-2">Payment Method</h2>
      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            checked={method === "card"}
            onChange={() => setMethod("card")}
          />
          Credit/Debit Card
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            checked={method === "paypal"}
            onChange={() => setMethod("paypal")}
          />
          PayPal
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            checked={method === "other"}
            onChange={() => setMethod("other")}
          />
          Other (E-Wallet, Bank Transfer)
        </label>
      </div>

      <h2 className="font-semibold mb-2">Order Summary</h2>
      <div className="border p-3 rounded mb-4">
        <p>Items: Rp {summary.subtotal}</p>
        <p>Shipping: Rp {summary.shipping}</p>
        <p className="font-bold">Total: Rp {summary.subtotal + summary.shipping}</p>
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Confirm & Pay
      </button>
    </div>
  );
}

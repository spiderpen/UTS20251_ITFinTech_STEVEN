import { useState } from "react";
import axios from "axios";

export default function Payment() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const checkoutId = localStorage.getItem("checkoutId") || "demo-checkout-1";

      const res = await axios.post("/api/payment", {
        checkoutId,
        amount: 20000, // dummy
      });

      if (res.data.success) {
        window.location.href = res.data.invoice.invoice_url; // redirect ke Xendit
      } else {
        alert("Gagal membuat pembayaran: " + res.data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat membuat pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Payment</h1>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Pay with Xendit"}
      </button>
    </div>
  );
}

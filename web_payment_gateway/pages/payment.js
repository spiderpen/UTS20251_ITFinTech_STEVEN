import { useState } from "react";
import axios from "axios";
import styles from "../styles/payment.module.css";

export default function Payment() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const checkoutId = localStorage.getItem("checkoutId") || "demo-checkout-1";
      const res = await axios.post("/api/payment", {
        checkoutId,
        amount: 20000, // sementara masih dummy
      });

      if (res.data.success) {
        window.location.href = res.data.invoice.invoice_url;
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
    <div className={styles.container}>
      <h1 className={styles.title}>Payment</h1>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "Processing..." : "Pay with Xendit"}
      </button>
    </div>
  );
}

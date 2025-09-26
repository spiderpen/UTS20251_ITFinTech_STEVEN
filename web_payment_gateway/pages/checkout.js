import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/checkout.module.css";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    setTotal(stored.reduce((sum, item) => sum + item.price, 0));
  }, []);

  const handleCheckout = async () => {
    try {
      const res = await axios.post("/api/checkout", {
        items: cart,
        totalPrice: total,
      });

      if (res.data.success) {
        localStorage.setItem("checkoutId", res.data.payment.checkoutId);
        window.location.href = res.data.invoice.invoice_url;
      } else {
        alert("Gagal membuat invoice: " + JSON.stringify(res.data.error));
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);
      alert("Terjadi kesalahan saat checkout.");
    }
  };

  return (
    <>
      <div className="header">Millenium Jaya</div> {/* brand di atas */}
      <div className="container">
        <h1>Checkout</h1>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} className={styles.item}>
                <span>{item.name}</span>
                <span>Rp {item.price}</span>
              </div>
            ))}
            <p className={styles.total}>Total: Rp {total}</p>
            <button onClick={handleCheckout} className={styles.checkoutBtn}>
              Continue to Payment →
            </button>
          </>
        )}
      </div>
    </>
  );
}

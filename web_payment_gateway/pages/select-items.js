import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/selectItems.module.css";

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
    <div className={styles.container}>
      <h1 className={styles.title}>Select Items</h1>
      <div className={styles.grid}>
        {products.map((p) => (
          <div key={p._id} className={styles.card}>
            <div>
              <h2 className={styles.name}>{p.name}</h2>
              <p className={styles.price}>Rp {p.price}</p>
            </div>
            <button
              className={styles.button}
              onClick={() => addToCart(p)}
            >
              Add +
            </button>
          </div>
        ))}
      </div>
      <a href="/checkout" className={styles.checkoutLink}>
        Go to Checkout →
      </a>
    </div>
  );
}

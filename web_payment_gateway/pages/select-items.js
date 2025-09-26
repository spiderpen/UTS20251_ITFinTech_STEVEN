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

  const goToCheckout = () => {
    window.location.href = "/checkout";
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>🍽️</div>
            <h1 className={styles.brandName}>Millenium Jaya</h1>
            <span className={styles.brandTagline}>Premium Dining</span>
          </div>
          
          <div className={styles.cartWrapper}>
            <div className={styles.cartIcon}>
              <svg className={styles.cartSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 12.68 3.17a2 2 0 0 1 1.32 2.23l-.84 5a2 2 0 0 1-2 1.6H6"></path>
              </svg>
              {cart.length > 0 && (
                <span className={styles.cartBadge}>{cart.length}</span>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className={styles.container}>
        <div className={styles.titleSection}>
          <h2 className={styles.pageTitle}>Our Menu</h2>
          <p className={styles.subtitle}>Select items to add to your cart</p>
        </div>
        
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product._id} className={styles.card}>
              <div className={styles.imageContainer}>
                <div className={styles.productImage}>
                  {/* Product image placeholder - bisa diganti dengan <img> nantinya */}
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.category}>Main Course</span>
                </div>
                <p className={styles.productPrice}>Rp {product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.checkoutSection}>
          <button className={styles.checkoutButton} onClick={goToCheckout}>
            <div className={styles.checkoutContent}>
              <span className={styles.checkoutIcon}>🛍️</span>
              <div className={styles.checkoutText}>
                <span className={styles.checkoutLabel}>Ready to order?</span>
                <span className={styles.checkoutAction}>Proceed to Checkout</span>
              </div>
              <div className={styles.checkoutArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </main>
    </>
  );
}
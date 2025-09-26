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

  // Function to get appropriate emoji based on category
  const getCategoryEmoji = (category) => {
    if (!category) return "🍽️";
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes("meal") || categoryLower.includes("food") || categoryLower.includes("main")) {
      return "🍽️";
    } else if (categoryLower.includes("drink") || categoryLower.includes("beverage")) {
      return "🥤";
    } else if (categoryLower.includes("snack") || categoryLower.includes("appetizer")) {
      return "🍿";
    } else if (categoryLower.includes("dessert") || categoryLower.includes("sweet")) {
      return "🍰";
    } else {
      return "🍽️"; // default
    }
  };

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

  const goBackToMenu = () => {
    window.location.href = "/select-items";
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
          <h2 className={styles.pageTitle}>Checkout</h2>
          <p className={styles.subtitle}>Review your order before payment</p>
        </div>

        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h3 className={styles.emptyTitle}>Your cart is empty</h3>
            <p className={styles.emptyText}>Add some delicious items to get started!</p>
            <button onClick={goBackToMenu} className={styles.backToMenuBtn}>
              <span className={styles.backIcon}>←</span>
              Back to Menu
            </button>
          </div>
        ) : (
          <div className={styles.checkoutContent}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.itemsList}>
                {cart.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemImage}>{getCategoryEmoji(item.category)}</div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemCategory}>{item.category || "Main Course"}</span>
                      </div>
                    </div>
                    <span className={styles.itemPrice}>Rp {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={styles.totalSection}>
                <div className={styles.finalTotal}>
                  <span className={styles.finalLabel}>Total</span>
                  <span className={styles.finalValue}>Rp {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button onClick={goBackToMenu} className={styles.backButton}>
                <span className={styles.backIcon}>←</span>
                Add More Items
              </button>
              
              <button onClick={handleCheckout} className={styles.paymentButton}>
                <div className={styles.paymentContent}>
                  <span className={styles.paymentIcon}>💳</span>
                  <div className={styles.paymentText}>
                    <span className={styles.paymentLabel}>Continue to</span>
                    <span className={styles.paymentAction}>Payment</span>
                  </div>
                  <div className={styles.paymentArrow}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
import { useEffect, useState } from "react";
import styles from "../styles/success.module.css";

export default function Success() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Ambil data cart dari localStorage sebelum dihapus
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const storedCheckoutId = localStorage.getItem("checkoutId");
    
    if (storedCart.length > 0) {
      const total = storedCart.reduce((sum, item) => sum + item.price, 0);
      
      setOrderDetails({
        _id: storedCheckoutId || Date.now().toString(),
        items: storedCart,
        totalPrice: total,
        status: "COMPLETED"
      });
      
      // Generate order ID yang user friendly
      const shortId = (storedCheckoutId || Date.now().toString()).slice(-8).toUpperCase();
      setOrderId(shortId);
    }
    
    // Clear cart dan checkoutId setelah payment berhasil
    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutId");
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

  const goBackToMenu = () => {
    window.location.href = "/select-items";
  };

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.brandIconWrapper}>
              <img
                src="/pudinginAjaLogo.jpg"
                alt="pudinginajalogo"
                className={styles.logo}
              />
            </div>
            <div>
              <h1 className={styles.brandName}>pudinginaja</h1>
              <span className={styles.brandTagline}>PUDDING CAKE & HAMPERS</span>
            </div>
          </div>

          <div className={styles.cartWrapper}>
            <div className={styles.cartIcon}>
              <svg className={styles.cartSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 12.68 3.17a2 2 0 0 1 1.32 2.23l-.84 5a2 2 0 0 1-2 1.6H6"></path>
              </svg>
              <span className={styles.cartBadge}>0</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className={styles.container}>
        <div className={styles.successWrapper}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <div className={styles.checkmarkCircle}>
                <svg className={styles.checkmark} viewBox="0 0 52 52">
                  <circle className={styles.checkmarkCircleStroke} cx="26" cy="26" r="25" fill="none"/>
                  <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>

            <div className={styles.successContent}>
              <h2 className={styles.successTitle}>Payment Successful!</h2>
              <p className={styles.successMessage}>
                Thank you for your order. Your payment has been processed successfully.
              </p>
              
              {orderDetails ? (
                <div className={styles.orderInfo}>
                  <div className={styles.orderNumber}>
                    <span className={styles.orderLabel}>Order ID:</span>
                    <span className={styles.orderValue}>#{orderId}</span>
                  </div>
                  
                  <div className={styles.orderSummary}>
                    <h3 className={styles.summaryTitle}>Order Summary</h3>
                    
                    <div className={styles.itemsList}>
                      {orderDetails.items?.map((item, i) => (
                        <div key={i} className={styles.item}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemImage}>{getCategoryEmoji(item.category)}</div>
                            <div className={styles.itemDetails}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemCategory}>{item.category || "Main Course"}</span>
                            </div>
                          </div>
                          <span className={styles.itemPrice}>Rp {item.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.totalSection}>
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total Paid</span>
                        <span className={styles.totalValue}>Rp {orderDetails.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.noOrderData}>
                  <p>Order completed successfully!</p>
                </div>
              )}

              <div className={styles.nextSteps}>
                <div className={styles.stepItem}>
                  <div className={styles.stepIcon}>📧</div>
                  <div className={styles.stepText}>
                    <span className={styles.stepTitle}>Email Confirmation</span>
                    <span className={styles.stepDesc}>Receipt sent to your email</span>
                  </div>
                </div>
                
                <div className={styles.stepItem}>
                  <div className={styles.stepIcon}>🍳</div>
                  <div className={styles.stepText}>
                    <span className={styles.stepTitle}>Order Preparation</span>
                    <span className={styles.stepDesc}>Your order is being prepared</span>
                  </div>
                </div>
                
                <div className={styles.stepItem}>
                  <div className={styles.stepIcon}>🚀</div>
                  <div className={styles.stepText}>
                    <span className={styles.stepTitle}>Ready Soon</span>
                    <span className={styles.stepDesc}>Estimated 15-20 minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button onClick={goHome} className={styles.homeButton}>
                <span className={styles.buttonIcon}>🏠</span>
                Go Home
              </button>
              
              <button onClick={goBackToMenu} className={styles.menuButton}>
                <span className={styles.buttonIcon}>🍽️</span>
                Order Again
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
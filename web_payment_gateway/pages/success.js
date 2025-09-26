import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "../styles/success.module.css";

export default function Success() {
  const router = useRouter();
  const { checkoutId } = router.query;

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!checkoutId) return;

    // Ambil data order dari API menggunakan checkoutId
    axios
      .get(`/api/getCheckout?checkoutId=${checkoutId}`)
      .then((res) => {
        const checkout = res.data.checkout;

        if (checkout) {
          setOrderDetails({
            _id: checkout._id,
            items: checkout.items,
            totalPrice: checkout.totalPrice,
            status: checkout.status,
          });

          const shortId = checkout._id.toString().slice(-8).toUpperCase();
          setOrderId(shortId);
        }
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
      });
  }, [checkoutId]);

  // Function to get appropriate emoji based on category
  const getCategoryEmoji = (category) => {
    if (!category) return "🍽️";
    const c = category.toLowerCase();
    if (c.includes("meal") || c.includes("food") || c.includes("main")) return "🍽️";
    if (c.includes("drink") || c.includes("beverage")) return "🥤";
    if (c.includes("snack") || c.includes("appetizer")) return "🍿";
    if (c.includes("dessert") || c.includes("sweet")) return "🍰";
    return "🍽️";
  };

  const goBackToMenu = () => {
    router.push("/select-items");
  };

  const goHome = () => {
    router.push("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>👑</div>
            <div>
              <h1 className={styles.brandName}>Millenium Jaya</h1>
              <span className={styles.brandTagline}>Premium Dining</span>
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
                  <p>Loading order details...</p>
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

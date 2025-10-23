import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/checkout.module.css";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [quantities, setQuantities] = useState({});
  
  // Customer info state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    setTotal(stored.reduce((sum, item) => sum + item.price, 0));

    // Initialize quantities from stored cart
    const storedQuantities = {};
    stored.forEach(item => {
      storedQuantities[item._id] = (storedQuantities[item._id] || 0) + 1;
    });
    setQuantities(storedQuantities);

    // Load customer data from localStorage if logged in
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (userData) {
      setCustomerName(userData.name || "");
      setCustomerEmail(userData.email || "");
      setCustomerPhone(userData.phone || "");
    }
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

  // Update quantity for a product
  const updateQuantity = (product, newQuantity) => {
    const updatedQuantities = { ...quantities };

    if (newQuantity <= 0) {
      delete updatedQuantities[product._id];
    } else {
      updatedQuantities[product._id] = newQuantity;
    }

    setQuantities(updatedQuantities);

    // Update cart based on quantities
    const updatedCart = [];
    Object.entries(updatedQuantities).forEach(([productId, qty]) => {
      const productData = cart.find(item => item._id === productId) || 
                         cart.find(item => item._id === productId);
      
      // If we can't find the product in current cart, get it from the original item
      if (productData) {
        for (let i = 0; i < qty; i++) {
          updatedCart.push(productData);
        }
      }
    });

    setCart(updatedCart);
    setTotal(updatedCart.reduce((sum, item) => sum + item.price, 0));
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (product) => {
    const currentQty = quantities[product._id] || 0;
    updateQuantity(product, currentQty + 1);
  };

  const decreaseQuantity = (product) => {
    const currentQty = quantities[product._id] || 0;
    if (currentQty > 0) {
      updateQuantity(product, currentQty - 1);
    }
  };

  // Get unique items for display
  const getUniqueItems = () => {
    const uniqueItems = {};
    cart.forEach(item => {
      if (!uniqueItems[item._id]) {
        uniqueItems[item._id] = item;
      }
    });
    return Object.values(uniqueItems);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Please add items before checkout.");
      return;
    }

    // Validasi customer info
    if (!customerName || !customerPhone) {
      alert("Please fill in your name and WhatsApp number to continue.");
      return;
    }

    // Validasi format nomor WA
    if (!customerPhone.startsWith("62")) {
      alert("WhatsApp number must start with 62 (e.g., 628123456789)");
      return;
    }

    try {
      const res = await axios.post("/api/checkout", {
        items: cart,
        totalPrice: total,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "guest@example.com"
      });

      if (res.data.success) {
        localStorage.setItem("checkoutId", res.data.checkout._id);
        // Redirect ke success page dengan checkoutId sebagai parameter
        const successUrl = `/success?checkoutId=${res.data.checkout._id}`;
        localStorage.setItem("successUrl", successUrl);
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
            <div className={styles.brandIcon}>👑</div>
            <div>
              <h1 className={styles.brandName}>Millenium Jaya</h1>
              <span className={styles.brandTagline}>Premium Dining</span>
            </div>
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
            {/* Customer Information Form */}
            <div className={styles.customerInfoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon}>📱</div>
                <div>
                  <h3 className={styles.cardTitle}>Contact Information</h3>
                  <p className={styles.cardSubtitle}>We'll send order updates via WhatsApp</p>
                </div>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    WhatsApp Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={styles.formInput}
                    placeholder="628123456789"
                    required
                  />
                  <small className={styles.formHint}>
                    Format: 628xxxxxxxxx (without +)
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={styles.formInput}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className={styles.infoNotice}>
                <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span className={styles.infoText}>
                  You'll receive order confirmation and payment status updates via WhatsApp
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.itemsList}>
                {getUniqueItems().map((item) => (
                  <div key={item._id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemImage}>{getCategoryEmoji(item.category)}</div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemCategory}>{item.category || "Main Course"}</span>
                        <div className={styles.itemPriceInfo}>
                          <span className={styles.unitPrice}>Rp {item.price.toLocaleString()} each</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.itemControls}>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={() => decreaseQuantity(item)}
                          disabled={!quantities[item._id] || quantities[item._id] <= 0}
                        >
                          <svg className={styles.quantityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14"/>
                          </svg>
                        </button>

                        <span className={styles.quantityDisplay}>
                          {quantities[item._id] || 0}
                        </span>

                        <button 
                          className={styles.quantityButton}
                          onClick={() => increaseQuantity(item)}
                        >
                          <svg className={styles.quantityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className={styles.itemTotalPrice}>
                        Rp {((quantities[item._id] || 0) * item.price).toLocaleString()}
                      </div>
                    </div>
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
                    <span className={styles.paymentAction}>Payment ({cart.length} items)</span>
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
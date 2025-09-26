import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/selectItems.module.css";

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);

    // Initialize quantities from stored cart
    const storedQuantities = {};
    stored.forEach(item => {
      storedQuantities[item._id] = (storedQuantities[item._id] || 0) + 1;
    });
    setQuantities(storedQuantities);
  }, []);

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
      const productData = products.find(p => p._id === productId);
      if (productData) {
        for (let i = 0; i < qty; i++) {
          updatedCart.push(productData);
        }
      }
    });

    setCart(updatedCart);
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

  const goToCheckout = () => {
    window.location.href = "/checkout";
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
          <h2 className={styles.pageTitle}>Our Menu</h2>
          <p className={styles.subtitle}>Select items to add to your cart</p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product._id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={styles.productImage} 
                />
              </div>

              <div className={styles.cardContent}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.category}>{product.category}</span>
                </div>
                <p className={styles.productPrice}>Rp {product.price.toLocaleString()}</p>

                <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => decreaseQuantity(product)}
                    disabled={!quantities[product._id] || quantities[product._id] <= 0}
                  >
                    <svg className={styles.quantityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                    </svg>
                  </button>

                  <span className={styles.quantityDisplay}>
                    {quantities[product._id] || 0}
                  </span>

                  <button 
                    className={styles.quantityButton}
                    onClick={() => increaseQuantity(product)}
                  >
                    <svg className={styles.quantityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className={styles.checkoutSection}>
            <button className={styles.checkoutButton} onClick={goToCheckout}>
              <div className={styles.checkoutContent}>
                <span className={styles.checkoutIcon}>🛍️</span>
                <div className={styles.checkoutText}>
                  <span className={styles.checkoutLabel}>Ready to order?</span>
                  <span className={styles.checkoutAction}>Proceed to Checkout ({cart.length} items)</span>
                </div>
                <div className={styles.checkoutArrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>
    </>
  );
}
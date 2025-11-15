import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/selectItems.module.css";

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem("userToken");
    const user = JSON.parse(localStorage.getItem("userData") || "null");

    if (token && user) {
      // Jika sudah login, verifikasi token
      axios
        .post("/api/auth/verify-token", { token })
        .then((res) => {
          if (res.data.valid) {
            setIsLoggedIn(true);
            setUserData(user);
            loadProducts();
          } else {
            // Token invalid, clear dan set guest mode
            localStorage.removeItem("userToken");
            localStorage.removeItem("userData");
            setIsLoggedIn(false);
            loadProducts();
          }
        })
        .catch(() => {
          // Error verifikasi, set guest mode
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          setIsLoggedIn(false);
          loadProducts();
        });
    } else {
      // Tidak ada token, guest mode
      setIsLoggedIn(false);
      loadProducts();
    }
  }, []);

  const loadProducts = () => {
    axios.get("/api/products").then((res) => {
      setProducts(res.data);
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(stored);

      const storedQuantities = {};
      stored.forEach((item) => {
        storedQuantities[item._id] = (storedQuantities[item._id] || 0) + 1;
      });
      setQuantities(storedQuantities);
      setLoading(false);
    });
  };

  const updateQuantity = (product, newQuantity) => {
    const updatedQuantities = { ...quantities };

    if (newQuantity <= 0) {
      delete updatedQuantities[product._id];
    } else {
      updatedQuantities[product._id] = newQuantity;
    }

    setQuantities(updatedQuantities);

    const updatedCart = [];
    Object.entries(updatedQuantities).forEach(([productId, qty]) => {
      const productData = products.find((p) => p._id === productId);
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
    // Kalau belum login, redirect ke login dulu
    if (!isLoggedIn) {
      if (confirm("You need to login first to checkout. Login now?")) {
        window.location.href = "/user/login";
      }
      return;
    }
    window.location.href = "/checkout";
  };

  const goToAdminLogin = () => {
    window.location.href = "/admin/login";
  };

  const goToUserLogin = () => {
    window.location.href = "/user/login";
  };

  const goToUserRegister = () => {
    window.location.href = "/user/register";
  };

  const goToUserDashboard = () => {
    window.location.href = "/user/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserData(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading menu...</p>
      </div>
    );
  }

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

          <div className={styles.navActions}>
            {/* Admin Button */}
            <button onClick={goToAdminLogin} className={styles.adminButton}>
              <svg
                className={styles.adminIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className={styles.adminText}>Admin</span>
            </button>

            {/* User Auth Buttons */}
            {isLoggedIn ? (
              <div className={styles.userMenu}>
                <button onClick={goToUserDashboard} className={styles.userButton}>
                  <div className={styles.userAvatar}>
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className={styles.userText}>{userData?.name || "User"}</span>
                </button>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <svg
                    className={styles.logoutIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <button onClick={goToUserLogin} className={styles.loginButton}>
                  <svg
                    className={styles.loginIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Login</span>
                </button>
                <button onClick={goToUserRegister} className={styles.registerButton}>
                  <svg
                    className={styles.registerIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Cart Icon */}
            <div className={styles.cartWrapper}>
              <div className={styles.cartIcon}>
                <svg
                  className={styles.cartSvg}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
        </div>
      </nav>

      <main className={styles.container}>
        {!isLoggedIn && (
          <div className={styles.guestBanner}>
            <span className={styles.guestIcon}>👋</span>
            <div className={styles.guestText}>
              <span className={styles.guestTitle}>Browsing as Guest</span>
              <span className={styles.guestSubtitle}>
                Login or Register to track your orders
              </span>
            </div>
            <button onClick={goToUserLogin} className={styles.guestLoginBtn}>
              Login Now
            </button>
          </div>
        )}

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
                <p className={styles.productPrice}>
                  Rp {product.price.toLocaleString()}
                </p>

                <div className={styles.quantityControls}>
                  <button
                    className={styles.quantityButton}
                    onClick={() => decreaseQuantity(product)}
                    disabled={
                      !quantities[product._id] || quantities[product._id] <= 0
                    }
                  >
                    <svg
                      className={styles.quantityIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>

                  <span className={styles.quantityDisplay}>
                    {quantities[product._id] || 0}
                  </span>

                  <button
                    className={styles.quantityButton}
                    onClick={() => increaseQuantity(product)}
                  >
                    <svg
                      className={styles.quantityIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
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
                  <span className={styles.checkoutAction}>
                    Proceed to Checkout ({cart.length} items)
                  </span>
                </div>
                <div className={styles.checkoutArrow}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
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
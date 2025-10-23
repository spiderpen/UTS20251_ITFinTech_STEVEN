import { useEffect, useState } from "react";
import styles from "../../styles/dashboard.module.css";

export default function UserDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userData = JSON.parse(localStorage.getItem("userData") || "null");

    if (!token || !userData) {
      window.location.href = "/user/login";
      return;
    }

    setUser(userData);
  }, []);

  const handleStartOrdering = () => {
    window.location.href = "/select-items";
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("cart");
    window.location.href = "/user/login";
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Checking session...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>👑</div>
            <div>
              <h1 className={styles.brandName}>Millenium Jaya</h1>
              <span className={styles.brandTagline}>Premium Dining</span>
            </div>
          </div>

          <div className={styles.navActions}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className={styles.userName}>{user.name || "User"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Welcome back, {user.name || "Customer"}! 👋</h2>
            <p className={styles.heroSubtitle}>
              Ready to explore our delicious menu? Start ordering your favorite meals now.
            </p>
          </div>
          <div className={styles.heroImage}>🍽️</div>
        </div>

        <div className={styles.contentGrid}>
          {/* Account Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{backgroundColor: "#DBEAFE"}}>
                👤
              </div>
              <div>
                <h3 className={styles.cardTitle}>Your Account</h3>
                <p className={styles.cardSubtitle}>Personal information</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>📧 Email</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              {user.phone && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📱 Phone</span>
                  <span className={styles.infoValue}>{user.phone}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>🎫 Member Since</span>
                <span className={styles.infoValue}>
                  {new Date(user.createdAt || Date.now()).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{backgroundColor: "#D1FAE5"}}>
                ⚡
              </div>
              <div>
                <h3 className={styles.cardTitle}>Quick Actions</h3>
                <p className={styles.cardSubtitle}>What would you like to do?</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <button onClick={handleStartOrdering} className={styles.actionButton}>
                <div className={styles.actionButtonContent}>
                  <span className={styles.actionIcon}>🍽️</span>
                  <div className={styles.actionText}>
                    <span className={styles.actionTitle}>Start Ordering</span>
                    <span className={styles.actionSubtitle}>Browse our menu</span>
                  </div>
                  <svg className={styles.actionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <button className={styles.actionButtonSecondary}>
                <div className={styles.actionButtonContent}>
                  <span className={styles.actionIcon}>📦</span>
                  <div className={styles.actionText}>
                    <span className={styles.actionTitle}>Order History</span>
                    <span className={styles.actionSubtitle}>View past orders</span>
                  </div>
                  <svg className={styles.actionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Session Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{backgroundColor: "#FEF3C7"}}>
                🔐
              </div>
              <div>
                <h3 className={styles.cardTitle}>Session & Security</h3>
                <p className={styles.cardSubtitle}>Manage your session</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.sessionInfo}>
                <div className={styles.sessionStatus}>
                  <span className={styles.statusDot}></span>
                  <span className={styles.statusText}>Active Session</span>
                </div>
                <p className={styles.sessionDescription}>
                  You are currently logged in. Click logout to end your session.
                </p>
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <span className={styles.logoutIcon}>🚪</span>
                Logout
              </button>
            </div>
          </div>

          {/* Promo Banner */}
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <span className={styles.promoIcon}>🎉</span>
              <div className={styles.promoText}>
                <h4 className={styles.promoTitle}>Special Offer!</h4>
                <p className={styles.promoSubtitle}>Get 20% off on your first order today</p>
              </div>
            </div>
            <button className={styles.promoButton}>Claim Now</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>© 2025 Millenium Jaya. All rights reserved.</p>
      </footer>
    </div>
  );
}
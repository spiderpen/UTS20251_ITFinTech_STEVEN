import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/admin.module.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password
      });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIcon}>🔐</div>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>Millenium Jaya Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.formInput}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Logging in...
              </>
            ) : (
              <>
                <span>🚀</span>
                Login
              </>
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <a href="/" className={styles.backLink}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
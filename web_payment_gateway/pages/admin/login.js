import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/admin.module.css";

export default function AdminLogin() {
  const [step, setStep] = useState(1); // 1 = login, 2 = verify otp
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  // ✅ Cek token di server (bukan hanya localStorage)
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setCheckingToken(false);
      return;
    }

    axios.post("/api/auth/verify-token", { token })
      .then(res => {
        if (res.data.valid) {
          window.location.href = "/admin/dashboard";
        } else {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      })
      .finally(() => setCheckingToken(false));
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      clearInterval(interval);
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleRequestOtp = async (e, isResend = false) => {
    e?.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/request-otp", {
        username,
        password,
        phone,
      });

      if (res.data.success) {
        setStep(2);
        setMessage(isResend ? "✅ OTP baru telah dikirim!" : "✅ OTP telah dikirim ke WhatsApp Anda.");
        setTimer(300);
        setResendDisabled(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim OTP. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/verify-otp", { username, otp });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verifikasi OTP gagal.");
    } finally {
      setLoading(false);
    }
  };

  // Jangan render form sebelum cek token selesai
  if (checkingToken) return <div className={styles.loadingScreen}>🔍 Memeriksa sesi login...</div>;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIcon}>🔐</div>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>pudinginaja Dashboard</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className={styles.loginForm}>
            {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
            {message && <div className={styles.successAlert}>💬 {message}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.formInput}
                placeholder="Masukkan username"
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
                placeholder="Masukkan password"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nomor WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.formInput}
                placeholder="Contoh: 6281234567890"
                required
              />
            </div>

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Mengirim OTP..." : "Kirim OTP ke WhatsApp"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.loginForm}>
            {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
            {message && <div className={styles.successAlert}>💬 {message}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Masukkan Kode OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.formInput}
                placeholder="6 digit kode"
                required
              />
            </div>

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Memverifikasi..." : "Verifikasi OTP & Login"}
            </button>

            <div className={styles.otpInfo}>
              {timer > 0 ? (
                <p className={styles.countdown}>
                  ⏳ Kode OTP berlaku selama <strong>{formatTime(timer)}</strong>
                </p>
              ) : (
                <p className={styles.countdown}>⚠️ OTP sudah kedaluwarsa</p>
              )}

              <button
                type="button"
                onClick={(e) => handleRequestOtp(e, true)}
                className={styles.resendButton}
                disabled={resendDisabled || loading}
              >
                {resendDisabled
                  ? `Kirim ulang OTP (${formatTime(timer)})`
                  : "🔁 Kirim Ulang OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.backButton}
            >
              ← Ubah Nomor / Login Ulang
            </button>
          </form>
        )}

        <div className={styles.loginFooter}>
          <a href="/" className={styles.backLink}>
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

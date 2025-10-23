import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/user.module.css";

export default function UserLogin() {
  const [step, setStep] = useState(1); // 1 = login, 2 = otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  // 🔍 Cek token user (jika sudah login)
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setCheckingToken(false);
      return;
    }

    axios
      .post("/api/user/verify-token", { token })
      .then((res) => {
        if (res.data.valid) window.location.href = "/select-items";
        else {
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          setCheckingToken(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        setCheckingToken(false);
      });
  }, []);

  // Timer OTP
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

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ✅ Step 1: Kirim OTP
  const handleRequestOtp = async (e, isResend = false) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/user/login", {
        email,
        password,
        phone,
      });

      if (res.data.success) {
        setStep(2);
        setMessage(isResend ? "OTP baru dikirim ke WhatsApp Anda." : "OTP dikirim ke WhatsApp Anda.");
        setTimer(300);
        setResendDisabled(true);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/user/verify-otp", { email, otp });
      if (res.data.success) {
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userData", JSON.stringify(res.data.user));
        window.location.href = "/user/dashboard";
      } else {
        setError(res.data.message || "OTP salah atau kedaluwarsa.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verifikasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken)
    return <div className={styles.loading}>🔍 Memeriksa sesi login...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🔐 Login User</h1>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nomor WhatsApp (62...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Mengirim OTP..." : "Kirim OTP ke WhatsApp"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <input
              type="text"
              placeholder="Masukkan OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Memverifikasi..." : "Verifikasi OTP & Login"}
            </button>

            <div className={styles.timer}>
              {timer > 0 ? (
                <p>⏳ OTP berlaku {formatTime(timer)}</p>
              ) : (
                <p>⚠️ OTP kedaluwarsa</p>
              )}
              <button
                type="button"
                onClick={(e) => handleRequestOtp(e, true)}
                disabled={resendDisabled}
              >
                🔁 Kirim Ulang OTP
              </button>
            </div>

            <button type="button" onClick={() => setStep(1)}>
              ← Ubah Data Login
            </button>
          </form>
        )}

        <p className={styles.link}>
          Belum punya akun? <a href="/user/register">Daftar di sini</a>
        </p>
      </div>
    </div>
  );
}

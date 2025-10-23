import { useState } from "react";
import axios from "axios";
import styles from "../../styles/user.module.css";

export default function UserRegister() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/api/user/register", form);
      if (res.data.success) {
        setMessage("✅ Registrasi berhasil! Silakan login dengan akun Anda.");
        setForm({ username: "", email: "", password: "", phone: "" });
      } else {
        setError(res.data.message || "Registrasi gagal.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>📝 Daftar Akun User</h1>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <input
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            placeholder="Nomor WhatsApp (62...)"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className={styles.link}>
          Sudah punya akun? <a href="/user/login">Login di sini</a>
        </p>
      </div>
    </div>
  );
}

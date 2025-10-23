import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username wajib diisi."],
    unique: true,
    trim: true,
    minlength: [3, "Username minimal 3 karakter."],
  },
  email: {
    type: String,
    required: [true, "Email wajib diisi."],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Format email tidak valid."],
  },
  password: {
    type: String,
    required: [true, "Password wajib diisi."],
    minlength: [6, "Password minimal 6 karakter."],
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "superadmin", "user"], // siap untuk MFA multi-user
  },

  // Nomor WhatsApp untuk OTP
  phone: {
    type: String,
    default: null,
    match: [/^62\d{8,15}$/, "Nomor WhatsApp harus diawali 62 dan valid."],
  },

  // OTP yang dikirim via WhatsApp
  otp: {
    type: String,
    default: null,
  },

  // Waktu kedaluwarsa OTP
  otpExpires: {
    type: Date,
    default: null,
  },

  // Jumlah percobaan OTP gagal
  otpAttempts: {
    type: Number,
    default: 0,
  },

  // Akun dikunci sementara
  lockedUntil: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* 🧩 AUTO UNLOCK FEATURE */
AdminSchema.methods.isLocked = function () {
  if (this.lockedUntil && this.lockedUntil > new Date()) {
    return true;
  }
  return false;
};

/* 🔐 AUTO HASH PASSWORD SEBELUM SAVE */
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // hanya hash jika password berubah
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/* 🔎 METHOD UNTUK CEK PASSWORD LOGIN */
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

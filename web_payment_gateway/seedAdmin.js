import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const AdminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("Username: admin");
      console.log("You can login with existing credentials.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    await Admin.create({
      username: "admin",
      email: "admin@millenniumjaya.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date()
    });

    console.log("✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@millenniumjaya.com");
    console.log("👤 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
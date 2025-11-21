import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Hapus semua data dari collections
    console.log("🗑️  Deleting all orders...");
    await db.collection("orders").deleteMany({});
    
    console.log("🗑️  Deleting all checkouts...");
    await db.collection("checkouts").deleteMany({});
    
    console.log("🗑️  Deleting all payments...");
    await db.collection("payments").deleteMany({});

    // Optional: Hapus produk lama juga
    // console.log("🗑️  Deleting all products...");
    // await db.collection("products").deleteMany({});

    console.log("✅ All data deleted successfully!");
    console.log("\n📊 Summary:");
    console.log("- Orders: CLEARED");
    console.log("- Checkouts: CLEARED");
    console.log("- Payments: CLEARED");
    console.log("- Products: KEPT (uncomment to delete)");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting database:", err);
    process.exit(1);
  }
};

resetDatabase();
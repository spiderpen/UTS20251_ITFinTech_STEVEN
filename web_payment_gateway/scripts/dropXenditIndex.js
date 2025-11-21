import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.db.collection("payments");

    const indexes = await collection.indexes();
    console.log("📌 Existing indexes:", indexes);

    // Cari index bernama xenditInvoiceId_1
    const targetIndex = indexes.find(i => i.name === "xenditInvoiceId_1");

    if (!targetIndex) {
      console.log("ℹ️ Index xenditInvoiceId_1 tidak ditemukan. Aman.");
      process.exit(0);
    }

    // Hapus index lama
    await collection.dropIndex("xenditInvoiceId_1");
    console.log("🗑️ Successfully dropped index: xenditInvoiceId_1");

  } catch (err) {
    console.error("❌ Error dropping index:", err);
  } finally {
    process.exit(0);
  }
}

dropIndex();

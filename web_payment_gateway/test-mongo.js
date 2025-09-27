// test-mongo.js
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI; // make sure .env.local is loaded

async function testConnection() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected successfully!");

    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log("📂 Databases:", dbs.databases.map((db) => db.name));

    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
}

testConnection();

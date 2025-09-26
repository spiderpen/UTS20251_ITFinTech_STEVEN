import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined. Check your .env.local file.");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany();

    const products = [
      { name: "Coca Cola", category: "Drinks", price: 10000, image: "/coca_cola.jpeg" },
      { name: "Sprite", category: "Drinks", price: 9000, image: "/sprite.jpg" },
      { name: "Potato Chips", category: "Snacks", price: 15000, image: "/potatochips.jpg" },
      { name: "Chocolate Bar", category: "Snacks", price: 12000, image: "/choco.jpeg" },
      { name: "Burger", category: "Meals", price: 25000, image: "/burger.jpg" },
      { name: "Fried Rice", category: "Meals", price: 30000, image: "/friedrice.jpg" },
      { name: "Indomie", category: "Meals", price: 5000, image: "/indomie.jpg" }
    ];

    await Product.insertMany(products);
    console.log("🎉 Seed data inserted");
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();

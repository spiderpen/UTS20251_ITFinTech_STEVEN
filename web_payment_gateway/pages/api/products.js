import dbConnect from "../../lib/mongodb";
import Product from "../../models/Product";

export default async function handler(req, res) {
  console.log("➡️ API /products kena hit dengan method:", req.method);

  try {
    await dbConnect();
    console.log("✅ Database connected");

    if (req.method === "GET") {
      console.log("🔍 Fetching products...");
      const products = await Product.find({});
      console.log("✅ Products ditemukan:", products.length);
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      console.log("📝 Payload diterima:", req.body);

      const { name, category, price } = req.body;

      // Validasi data masuk
      if (!name || !category || !price) {
        console.error("❌ Ada field yang kosong!");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const product = await Product.create({ name, category, price });
      console.log("✅ Product berhasil dibuat:", product._id);
      return res.status(201).json(product);
    }

    // Kalau method selain GET/POST
    console.warn("⚠️ Method tidak diizinkan:", req.method);
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (err) {
    console.error("🔥 Error di /api/products:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

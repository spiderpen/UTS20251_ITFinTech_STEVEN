import dbConnect from "../../lib/mongodb";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const products = await Product.find({});
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const { name, category, price } = req.body;
      const product = await Product.create({ name, category, price });
      return res.status(201).json(product);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (err) {
    console.error("API /products error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

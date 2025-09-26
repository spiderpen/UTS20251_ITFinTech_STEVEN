import dbConnect from "../../lib/mongodb";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const products = await Product.find({});
    res.status(200).json(products);
  } else if (req.method === "POST") {
    const { name, category, price } = req.body;
    const product = await Product.create({ name, category, price });
    res.status(201).json(product);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

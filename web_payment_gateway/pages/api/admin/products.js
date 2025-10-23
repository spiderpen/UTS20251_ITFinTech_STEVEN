import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product.js";
import { requireAuth } from "../../../lib/adminAuth.js";

async function handler(req, res) {
  await dbConnect();

  // GET: List all products
  if (req.method === "GET") {
    try {
      const products = await Product.find({}).sort({ _id: -1 });
      
      res.status(200).json({ 
        success: true, 
        products 
      });
    } catch (err) {
      console.error("❌ Get products error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch products" 
      });
    }
  }

  // POST: Create new product
  else if (req.method === "POST") {
    try {
      const { name, category, price, image } = req.body;

      if (!name || !category || !price) {
        return res.status(400).json({ 
          success: false, 
          error: "Name, category, and price are required" 
        });
      }

      const product = await Product.create({
        name,
        category,
        price: Number(price),
        image: image || "/placeholder.jpg"
      });

      res.status(201).json({ 
        success: true, 
        product 
      });
    } catch (err) {
      console.error("❌ Create product error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create product" 
      });
    }
  }

  // PUT: Update product
  else if (req.method === "PUT") {
    try {
      const { id, name, category, price, image } = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: "Product ID required" 
        });
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { 
          name, 
          category, 
          price: Number(price), 
          image 
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      res.status(200).json({ 
        success: true, 
        product 
      });
    } catch (err) {
      console.error("❌ Update product error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update product" 
      });
    }
  }

  // DELETE: Delete product
  else if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: "Product ID required" 
        });
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: "Product deleted successfully" 
      });
    } catch (err) {
      console.error("❌ Delete product error:", err);
      res.status(500).json({ 
        success: false, 
        error: "Failed to delete product" 
      });
    }
  }

  else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default requireAuth(handler);
import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { items, totalPrice } = req.body;
    const checkout = await Checkout.create({
      items,
      totalPrice,
      status: "PENDING",
    });
    res.status(201).json(checkout);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

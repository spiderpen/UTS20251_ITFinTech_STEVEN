import dbConnect from "../../lib/mongodb";
import Checkout from "../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  const { checkoutId } = req.query;
  if (!checkoutId) return res.status(400).json({ error: "checkoutId required" });

  const checkout = await Checkout.findById(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  res.status(200).json({ checkout });
}

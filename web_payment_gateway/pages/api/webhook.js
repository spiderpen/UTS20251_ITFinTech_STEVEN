import dbConnect from "../../lib/mongodb";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const event = req.body;

    if (event.status === "PAID") {
      await Payment.findOneAndUpdate(
        { xenditInvoiceId: event.id },
        { status: "PAID" }
      );

      await Checkout.findOneAndUpdate(
        { _id: event.external_id.replace("checkout-", "") },
        { status: "PAID" }
      );
    }

    res.status(200).json({ received: true });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
    
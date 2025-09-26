import Xendit from "xendit-node";

export default async function handler(req, res) {
  try {
    const { XENDIT_SECRET_KEY } = process.env;
    console.log("Secret Key:", XENDIT_SECRET_KEY);

    const x = new Xendit({ secretKey: XENDIT_SECRET_KEY });
    const { Invoice } = x;

    const invoice = await Invoice.createInvoice({
      data: {
        external_id: `test-${Date.now()}`,
        payer_email: "test@example.com",
        description: "Test invoice",
        amount: 1000,
      }
    });

    res.status(200).json({ message: "OK", invoice });
  } catch (err) {
    console.error("Error in test-xendit:", err);
    res.status(400).json({ message: "Failed", error: err.message });
  }
}

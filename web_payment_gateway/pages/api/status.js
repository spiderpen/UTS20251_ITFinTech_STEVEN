import dbConnect from "../../lib/mongodb";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { checkoutId, paymentId } = req.query;

      let payment;
      
      if (paymentId) {
        payment = await Payment.findById(paymentId);
      } else if (checkoutId) {
        payment = await Payment.findOne({ 
          checkoutId, 
          status: { $in: ["PENDING", "PAID"] } 
        }).sort({ createdAt: -1 });
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "checkoutId or paymentId is required" 
        });
      }

      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          error: "Payment not found" 
        });
      }

      // If payment is still pending, check with Xendit
      if (payment.status === "PENDING") {
        try {
          const response = await axios.get(
            `https://api.xendit.co/v2/invoices/${payment.xenditInvoiceId}`,
            {
              auth: {
                username: process.env.XENDIT_SECRET_KEY,
                password: ""
              }
            }
          );

          const xenditInvoice = response.data;
          
          // Update payment status if changed
          if (xenditInvoice.status !== payment.status) {
            payment.status = xenditInvoice.status;
            if (xenditInvoice.status === "PAID") {
              payment.paidAt = xenditInvoice.paid_at || new Date();
              payment.paymentMethod = xenditInvoice.payment_method;
              payment.paymentChannel = xenditInvoice.payment_channel;
            }
            await payment.save();

            // Update checkout status
            const checkout = await Checkout.findById(payment.checkoutId);
            if (checkout && xenditInvoice.status === "PAID") {
              checkout.status = "PAID";
              await checkout.save();
            }
          }
        } catch (error) {
          console.error("Error checking Xendit status:", error);
        }
      }

      res.status(200).json({ 
        success: true, 
        payment 
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
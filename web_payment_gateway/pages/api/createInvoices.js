import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { checkoutId } = req.body;

      if (!checkoutId) {
        return res.status(400).json({
          success: false,
          error: "checkoutId is required",
        });
      }

      // Pastikan API key ada
      if (!process.env.XENDIT_SECRET_KEY) {
        return res.status(500).json({
          success: false,
          error: "XENDIT_SECRET_KEY is not set in environment variables",
        });
      }

      // Get checkout data
      const checkout = await Checkout.findById(checkoutId);
      if (!checkout) {
        return res.status(404).json({
          success: false,
          error: "Checkout not found",
        });
      }

      // Validasi harga minimal 100
      if (!checkout.totalPrice || checkout.totalPrice < 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid totalPrice. Must be at least 100",
        });
      }

      // Check if payment already exists
      const existingPayment = await Payment.findOne({
        checkoutId,
        status: { $in: ["PENDING", "PAID"] },
      });

      if (existingPayment) {
        return res.status(200).json({
          success: true,
          message: "Payment already exists",
          payment: existingPayment,
        });
      }

      // Build invoice data
      const invoiceData = {
        external_id: `checkout-${checkoutId}-${Date.now()}`,
        amount: checkout.totalPrice,
        description: `Payment for Order #${checkoutId}`,
        invoice_duration: 86400, // 24 hours
        customer: {
          given_names: checkout.customerName || "Customer",
          email: checkout.customerEmail || "customer@example.com",
        },
        customer_notification_preference: {
          invoice_created: ["email"],
          invoice_reminder: ["email"],
          invoice_paid: ["email"],
        },
        success_redirect_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/payment/success?checkoutId=${checkoutId}`,
        failure_redirect_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/payment/failed?checkoutId=${checkoutId}`,
        currency: "IDR",
        items: checkout.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("🔑 Using Xendit key:", process.env.XENDIT_SECRET_KEY ? "SET" : "NOT SET");
      console.log("📦 Creating Xendit invoice with data:", invoiceData);

      // Call Xendit API
      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        invoiceData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          auth: {
            username: process.env.XENDIT_SECRET_KEY,
            password: "",
          },
        }
      );

      const invoice = response.data;
      console.log("✅ Xendit invoice created:", invoice);

      // Save payment record
      const payment = await Payment.create({
        checkoutId,
        xenditInvoiceId: invoice.id,
        xenditInvoiceUrl: invoice.invoice_url,
        amount: invoice.amount,
        status: invoice.status,
        expiryDate: invoice.expiry_date,
        createdAt: new Date(),
      });

      // Update checkout status
      checkout.status = "AWAITING_PAYMENT";
      checkout.paymentId = payment._id;
      await checkout.save();

      return res.status(200).json({
        success: true,
        invoice: {
          id: invoice.id,
          invoice_url: invoice.invoice_url,
          amount: invoice.amount,
          status: invoice.status,
          expiry_date: invoice.expiry_date,
        },
        payment,
      });
    } catch (error) {
      console.error("❌ Error creating Xendit invoice:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        success: false,
        error: error.response?.data || error.message, // kirim error detail ke frontend
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

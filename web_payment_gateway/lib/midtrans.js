import midtransClient from "midtrans-client";
import { v4 as uuidv4 } from "uuid";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

console.log("is production mode :", isProduction);

// Snap instance
export const snap = new midtransClient.Snap({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Core API instance
export const coreApi = new midtransClient.CoreApi({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Create Midtrans transaction — revised & stable version
 */
export async function createMidtransTransaction(orderData) {
  const { totalPrice, customerName, customerEmail, customerPhone, items } =
    orderData;

  // 🟣 Gunakan UUID supaya tidak pernah duplicate
  const orderId = orderData.orderId || `ORDER-${uuidv4()}`;

  // 🟣 Format item sesuai standar Midtrans (integer only)
  const itemDetails = items.map((item) => ({
    id: item.productId || item.name.replace(/\s+/g, "-").toLowerCase(),
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(Number(totalPrice) || 0),
    },

    item_details: itemDetails,

    customer_details: {
      first_name: customerName || "Guest",
      email: customerEmail || "guest@pudinginaja.com",
      phone: customerPhone || "",
    },

    credit_card: {
      secure: true,
    },

    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${orderId}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    return {
      orderId,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error("❌ Midtrans createTransaction ERROR");
    console.error("Message:", error.message);

    if (error.ApiResponse) {
      console.error("Midtrans API Response:", error.ApiResponse);
    }

    throw error;
  }
}

/**
 * Check transaction status — unchanged but stable
 */
export async function checkTransactionStatus(orderId) {
  try {
    const status = await coreApi.transaction.status(orderId);

    console.log("📊 Midtrans Status Response:", status);

    let mappedStatus = "PENDING";
    const { transaction_status, fraud_status } = status;

    if (transaction_status === "capture" && fraud_status === "accept") {
      mappedStatus = "PAID";
    } else if (transaction_status === "settlement") {
      mappedStatus = "PAID";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      mappedStatus = transaction_status.toUpperCase();
    }

    return {
      status: mappedStatus,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status,
      paymentType: status.payment_type,
      transactionTime: status.transaction_time,
      transactionId: status.transaction_id,
      rawResponse: status,
    };
  } catch (error) {
    console.error("❌ Error checking Midtrans status:", error.message);
    throw error;
  }
}

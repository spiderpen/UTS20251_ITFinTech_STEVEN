import axios from "axios";

const FONNTE_URL = "https://api.fonnte.com/send";
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

/**
 * Kirim notifikasi WhatsApp
 * @param {6282249419509} phone - Nomor WhatsApp (format: 62xxx)
 * @param {kamu keren} message - Pesan yang akan dikirim
 */
export async function sendWhatsApp(phone, message) {
  try {
    if (!FONNTE_TOKEN) {
      console.warn("⚠️ FONNTE_TOKEN tidak ditemukan di .env.local");
      return { success: false, error: "Fonnte token not configured" };
    }

    const response = await axios.post(
      FONNTE_URL,
      {
        target: phone,
        message: message,
        countryCode: "62" // Indonesia
      },
      {
        headers: {
          Authorization: FONNTE_TOKEN
        }
      }
    );

    console.log("✅ WhatsApp sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Format pesan notifikasi checkout
 */
export function formatCheckoutMessage(orderData) {
  const { orderId, items, totalPrice, customerName, customerPhone } = orderData;
  
  let itemsList = "";
  items.forEach((item, index) => {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    itemsList += `${index + 1}. ${item.name} (${qty}x) - Rp ${(qty * price).toLocaleString()}\n`;
  });

  return `🔔 *PESANAN BARU - Millenium Jaya*

📋 Order ID: #${orderId}
👤 Customer: ${customerName || "Guest"}
📱 Phone: ${customerPhone || "-"}

🛒 *Detail Pesanan:*
${itemsList}
💰 *Total: Rp ${totalPrice.toLocaleString()}*

⏳ Status: Menunggu Pembayaran

Terima kasih! 🙏`;
}

/**
 * Format pesan notifikasi pembayaran berhasil
 */
export function formatPaymentSuccessMessage(orderData) {
  const { orderId, items, totalPrice, customerName, customerPhone } = orderData;
  
  let itemsList = "";
  items.forEach((item, index) => {
    const qty = item.quantity || 1;
    itemsList += `${index + 1}. ${item.name} (${qty}x)\n`;
  });

  return `✅ *PEMBAYARAN BERHASIL - Millenium Jaya*

📋 Order ID: #${orderId}
👤 Customer: ${customerName || "Guest"}
📱 Phone: ${customerPhone || "-"}

🛒 *Pesanan:*
${itemsList}
💰 *Total Dibayar: Rp ${totalPrice.toLocaleString()}*

✅ Status: LUNAS

Pesanan Anda sedang diproses. Terima kasih! 🎉`;
}

/**
 * Kirim notifikasi ke admin saat ada pesanan baru
 */
export async function notifyAdminNewOrder(orderData) {
  const adminPhone = process.env.ADMIN_WHATSAPP;
  
  if (!adminPhone) {
    console.warn("⚠️ ADMIN_WHATSAPP tidak ditemukan di .env.local");
    return;
  }

  const message = formatCheckoutMessage(orderData);
  return await sendWhatsApp(adminPhone, message);
}

/**
 * Kirim notifikasi ke customer saat checkout
 */
export async function notifyCustomerCheckout(customerPhone, orderData) {
  if (!customerPhone) {
    console.warn("⚠️ Customer phone tidak tersedia");
    return;
  }

  const message = formatCheckoutMessage(orderData);
  return await sendWhatsApp(customerPhone, message);
}

/**
 * Kirim notifikasi ke customer saat pembayaran berhasil
 */
export async function notifyCustomerPaymentSuccess(customerPhone, orderData) {
  if (!customerPhone) {
    console.warn("⚠️ Customer phone tidak tersedia");
    return;
  }

  const message = formatPaymentSuccessMessage(orderData);
  return await sendWhatsApp(customerPhone, message);
}

/**
 * Kirim notifikasi ke admin saat pembayaran berhasil
 */
export async function notifyAdminPaymentSuccess(orderData) {
  const adminPhone = process.env.ADMIN_WHATSAPP;
  
  if (!adminPhone) {
    console.warn("⚠️ ADMIN_WHATSAPP tidak ditemukan di .env.local");
    return;
  }

  const message = `💰 *PEMBAYARAN DITERIMA*

Order #${orderData.orderId} telah dibayar!
Customer: ${orderData.customerName || "Guest"}
Total: Rp ${orderData.totalPrice.toLocaleString()}

Segera proses pesanan! 🚀`;

  return await sendWhatsApp(adminPhone, message);
}
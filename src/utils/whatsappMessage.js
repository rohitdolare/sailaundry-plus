// Builds the pre-filled WhatsApp text sent to a customer when their
// order is marked Completed. Includes the order number, item list, and
// total so the customer can recognize which order this is.
export const buildOrderCompletedMessage = (order) => {
  const orderNo = order.orderNumber ?? order.id;
  const amount = order.totalAmount != null ? `₹${order.totalAmount}` : "";
  const itemsBlock =
    Array.isArray(order.items) && order.items.length
      ? `🧾 ऑर्डर तपशील:\n${order.items.map((i) => `• ${i.quantity} × ${i.item}`).join("\n")}`
      : "";

  const blocks = [
    `नमस्कार! 👋`,
    `आपली ऑर्डर #${orderNo} तयार आहे आणि पिकअपसाठी उपलब्ध आहे.`,
    itemsBlock,
    amount ? `एकूण रक्कम: ${amount}` : "",
    `कृपया ऑर्डर लवकरात लवकर पिकअप करा.`,
    `🕐 पिकअप वेळ:\nसकाळी ७:००–दुपारी १:००\nसायंकाळी ४:००–रात्री ९:००`,
    `SaiLaundry Plus वर विश्वास ठेवल्याबद्दल धन्यवाद! 🙏`,
  ];

  return blocks.filter(Boolean).join("\n\n");
};

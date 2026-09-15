// Builds the pre-filled WhatsApp text sent to a customer when their
// order is marked Completed. Includes the order number, item list, and
// total so the customer can recognize which order this is.
export const buildOrderCompletedMessage = (order) => {
  const name = order.userName || "ग्राहक";
  const orderNo = order.orderNumber ?? order.id;
  const amount = order.totalAmount != null ? `₹${order.totalAmount}` : "";
  const itemsBlock =
    Array.isArray(order.items) && order.items.length
      ? `ऑर्डर तपशील:\n${order.items.map((i) => `• ${i.quantity} × ${i.item}`).join("\n")}`
      : "";

  const blocks = [
    `नमस्कार ${name}! 👋`,
    `तुमचे कपडे तयार झाले आहेत! 🎉\nऑर्डर #${orderNo} आता ✅ पूर्ण झाली आहे.`,
    itemsBlock,
    amount ? `एकूण रक्कम: ${amount} 💰` : "",
    `तुमच्या सोयीनुसार कधीही येऊन कपडे घेऊन जा. 😊`,
    `SaiLaundry Plus वर विश्वास ठेवल्याबद्दल मनःपूर्वक धन्यवाद! 🙏\nतुमची सेवा करण्यात आम्हाला आनंद होतो.`,
  ];

  return blocks.filter(Boolean).join("\n\n");
};

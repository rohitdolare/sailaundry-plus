// Builds the pre-filled WhatsApp text sent to a customer when their
// order is marked Completed. Includes the order number, item list, and
// total so the customer can recognize which order this is.
export const buildOrderCompletedMessage = (order) => {
  const name = order.userName || "there";
  const orderNo = order.orderNumber ?? order.id;
  const amount = order.totalAmount != null ? `₹${order.totalAmount}` : "";
  const itemsLine =
    Array.isArray(order.items) && order.items.length
      ? `\nItems: ${order.items.map((i) => `${i.quantity}x ${i.item}`).join(", ")}`
      : "";

  return (
    `Hi ${name}! 👋 Your SaiLaundry Plus order #${orderNo} is ready and marked *Completed*.` +
    itemsLine +
    (amount ? `\nTotal: ${amount}` : "") +
    `\nThank you for choosing us! 🙏`
  );
};

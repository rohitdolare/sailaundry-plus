import { getOrderDate, isSameMonth } from "./date";

export const ORDER_STATUSES = ["Pending", "Pending Pickup", "In Progress", "Completed"];

/**
 * Derive one customer's contribution from already-loaded orders (no Firestore reads).
 * @param {Array} orders all orders in memory
 * @param {string} uid customer uid
 * @param {Date} [now] reference date for "this month"
 */
export const getCustomerStats = (orders, uid, now = new Date()) => {
  const mine = (orders || [])
    .filter((o) => o && o.uid === uid)
    .sort((a, b) => (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0));

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  const itemMap = {};
  let totalSpend = 0;
  let itemCount = 0;
  let thisMonthSpend = 0;
  let thisMonthOrders = 0;

  mine.forEach((o) => {
    const amount = Number(o.totalAmount) || 0;
    totalSpend += amount;
    const status = o.status || "Pending";
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (isSameMonth(getOrderDate(o), now)) {
      thisMonthSpend += amount;
      thisMonthOrders += 1;
    }

    (o.items || []).forEach((it) => {
      const qty = Number(it.quantity) || 0;
      itemCount += qty;
      const key = `${it.item || "Item"}|${it.service || ""}`;
      if (!itemMap[key]) itemMap[key] = { item: it.item || "Item", service: it.service || "", quantity: 0, spend: 0 };
      itemMap[key].quantity += qty;
      itemMap[key].spend += qty * (Number(it.price) || 0);
    });
  });

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity || b.spend - a.spend)
    .slice(0, 5);

  const orderCount = mine.length;
  return {
    orders: mine,
    orderCount,
    totalSpend,
    itemCount,
    avgOrder: orderCount ? Math.round(totalSpend / orderCount) : 0,
    firstOrderAt: orderCount ? getOrderDate(mine[orderCount - 1]) : null,
    lastOrderAt: orderCount ? getOrderDate(mine[0]) : null,
    statusCounts,
    topItems,
    thisMonthSpend,
    thisMonthOrders,
  };
};

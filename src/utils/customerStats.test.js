import { describe, it, expect } from "vitest";
import { getCustomerStats } from "./customerStats";

const now = new Date(2026, 10, 15); // Nov 15, 2026

const orders = [
  {
    id: "a",
    uid: "u1",
    status: "Completed",
    totalAmount: 100,
    createdAt: new Date(2026, 9, 1),
    items: [{ item: "Shirt", service: "Wash", quantity: 2, price: 50 }],
  },
  {
    id: "b",
    uid: "u1",
    status: "Pending",
    totalAmount: 300,
    createdAt: { toDate: () => new Date(2026, 10, 10) },
    items: [
      { item: "Shirt", service: "Wash", quantity: 3, price: 50 },
      { item: "Saree", service: "Dry Clean", quantity: 1, price: 150 },
    ],
  },
  { id: "c", uid: "u2", status: "Completed", totalAmount: 999, createdAt: new Date(2026, 10, 2), items: [] },
];

describe("getCustomerStats", () => {
  it("returns zeroed stats when the customer has no orders", () => {
    const s = getCustomerStats(orders, "nobody", now);
    expect(s.orderCount).toBe(0);
    expect(s.totalSpend).toBe(0);
    expect(s.avgOrder).toBe(0);
    expect(s.firstOrderAt).toBeNull();
    expect(s.lastOrderAt).toBeNull();
    expect(s.topItems).toEqual([]);
  });

  it("handles missing orders array", () => {
    expect(getCustomerStats(undefined, "u1", now).orderCount).toBe(0);
  });

  it("only counts the given customer's orders, newest first", () => {
    const s = getCustomerStats(orders, "u1", now);
    expect(s.orderCount).toBe(2);
    expect(s.orders.map((o) => o.id)).toEqual(["b", "a"]);
    expect(s.totalSpend).toBe(400);
    expect(s.avgOrder).toBe(200);
    expect(s.itemCount).toBe(6);
  });

  it("computes first/last order dates", () => {
    const s = getCustomerStats(orders, "u1", now);
    expect(s.firstOrderAt).toEqual(new Date(2026, 9, 1));
    expect(s.lastOrderAt).toEqual(new Date(2026, 10, 10));
  });

  it("counts statuses", () => {
    const s = getCustomerStats(orders, "u1", now);
    expect(s.statusCounts.Completed).toBe(1);
    expect(s.statusCounts.Pending).toBe(1);
    expect(s.statusCounts["In Progress"]).toBe(0);
  });

  it("ranks top items by quantity", () => {
    const s = getCustomerStats(orders, "u1", now);
    expect(s.topItems[0]).toEqual({ item: "Shirt", service: "Wash", quantity: 5, spend: 250 });
    expect(s.topItems[1].item).toBe("Saree");
  });

  it("computes this-month totals", () => {
    const s = getCustomerStats(orders, "u1", now);
    expect(s.thisMonthOrders).toBe(1);
    expect(s.thisMonthSpend).toBe(300);
  });
});

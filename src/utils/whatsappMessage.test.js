import { describe, it, expect } from "vitest";
import { buildOrderCompletedMessage } from "./whatsappMessage";

describe("buildOrderCompletedMessage", () => {
  it("includes the customer name, order number, items and amount", () => {
    const msg = buildOrderCompletedMessage({
      userName: "Rohit",
      orderNumber: 42,
      totalAmount: 250,
      items: [{ quantity: 2, item: "Shirt" }],
    });
    expect(msg).toContain("Rohit");
    expect(msg).toContain("#42");
    expect(msg).toContain("₹250");
    expect(msg).toContain("2 × Shirt");
  });

  it("falls back to a generic greeting when userName is missing", () => {
    const msg = buildOrderCompletedMessage({ orderNumber: 1 });
    expect(msg).toContain("ग्राहक");
  });

  it("falls back to the doc id when orderNumber is missing", () => {
    const msg = buildOrderCompletedMessage({ id: "abc123" });
    expect(msg).toContain("#abc123");
  });

  it("omits the amount and items blocks when absent, without leaving blank lines", () => {
    const msg = buildOrderCompletedMessage({ orderNumber: 1 });
    expect(msg).not.toContain("undefined");
    expect(msg).not.toContain("₹");
    expect(msg).not.toContain("\n\n\n");
  });
});

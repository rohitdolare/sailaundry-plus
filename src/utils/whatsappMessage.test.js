import { describe, it, expect } from "vitest";
import { buildOrderCompletedMessage } from "./whatsappMessage";

describe("buildOrderCompletedMessage", () => {
  it("includes the order number, items and amount", () => {
    const msg = buildOrderCompletedMessage({
      userName: "Rohit",
      orderNumber: 42,
      totalAmount: 250,
      items: [{ quantity: 2, item: "Shirt" }],
    });
    expect(msg).toContain("#42");
    expect(msg).toContain("₹250");
    expect(msg).toContain("2 × Shirt");
  });

  it("uses a generic greeting regardless of userName, since a customer-entered name can be misspelled/malformed", () => {
    const withName = buildOrderCompletedMessage({ userName: "R0h1t!!", orderNumber: 1 });
    const withoutName = buildOrderCompletedMessage({ orderNumber: 1 });
    expect(withName).toContain("नमस्कार!");
    expect(withName).not.toContain("R0h1t");
    expect(withoutName).toContain("नमस्कार!");
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

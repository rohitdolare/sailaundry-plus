import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats a positive number with the rupee sign and Indian grouping", () => {
    expect(formatCurrency(1234567)).toBe("₹12,34,567");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("falls back to 0 for null/undefined", () => {
    expect(formatCurrency(null)).toBe("₹0");
    expect(formatCurrency(undefined)).toBe("₹0");
  });
});

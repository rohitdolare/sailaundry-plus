import { describe, it, expect } from "vitest";
import { toWhatsAppNumber } from "./phone";

describe("toWhatsAppNumber", () => {
  it("prefixes a bare 10-digit number with 91", () => {
    expect(toWhatsAppNumber("9876543210")).toBe("919876543210");
  });

  it("strips a leading 0", () => {
    expect(toWhatsAppNumber("09876543210")).toBe("919876543210");
  });

  it("keeps the last 10 digits when a country code is already present", () => {
    expect(toWhatsAppNumber("+91 98765 43210")).toBe("919876543210");
  });

  it("returns null for missing/short numbers", () => {
    expect(toWhatsAppNumber("")).toBeNull();
    expect(toWhatsAppNumber(null)).toBeNull();
    expect(toWhatsAppNumber(undefined)).toBeNull();
    expect(toWhatsAppNumber("12345")).toBeNull();
  });
});

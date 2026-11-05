import { describe, it, expect } from "vitest";
import { buildVCard } from "./contact";

describe("buildVCard", () => {
  it("builds a vCard with name and +91 number", () => {
    const v = buildVCard({ name: "Omkar balu Rathod", mobile: "9822913223" });
    expect(v).toContain("BEGIN:VCARD\r\nVERSION:3.0\r\n");
    expect(v).toContain("FN:Omkar balu Rathod\r\n");
    expect(v).toContain("N:balu Rathod;Omkar;;;\r\n");
    expect(v).toContain("TEL;TYPE=CELL:+919822913223\r\n");
    expect(v.endsWith("END:VCARD\r\n")).toBe(true);
  });

  it("normalizes numbers with country code or leading zero", () => {
    expect(buildVCard({ name: "A", mobile: "+91 98229-13223" })).toContain("TEL;TYPE=CELL:+919822913223");
    expect(buildVCard({ name: "A", mobile: "09822913223" })).toContain("TEL;TYPE=CELL:+919822913223");
  });

  it("omits ADR when there is no address", () => {
    expect(buildVCard({ name: "A", mobile: "9822913223" })).not.toContain("ADR");
  });

  it("escapes special characters in address", () => {
    const v = buildVCard({ name: "A", mobile: "9822913223", address: "Flat 2, Lane; 3\nPune" });
    expect(v).toContain("ADR;TYPE=HOME:;;Flat 2\\, Lane\\; 3\\nPune;;;;");
  });

  it("falls back to the number when name is empty", () => {
    expect(buildVCard({ name: "  ", mobile: "9822913223" })).toContain("FN:+919822913223");
  });

  it("returns null for invalid numbers", () => {
    expect(buildVCard({ name: "A", mobile: "123" })).toBeNull();
    expect(buildVCard({ name: "A", mobile: "" })).toBeNull();
  });
});

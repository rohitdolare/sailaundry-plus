import { describe, it, expect } from "vitest";
import { buildVCard, buildAndroidContactIntent, getPlatform } from "./contact";

describe("buildAndroidContactIntent", () => {
  it("builds an INSERT intent with name, +91 mobile and address", () => {
    const url = buildAndroidContactIntent({ name: "Omkar Rathod", mobile: "9822913223", address: "Lane 3, Pune" });
    expect(url).toBe(
      "intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/contact;" +
        "S.name=Omkar%20Rathod;S.phone=%2B919822913223;i.phone_type=2;S.postal=Lane%203%2C%20Pune;end"
    );
  });

  it("encodes semicolons so they can't break the intent", () => {
    expect(buildAndroidContactIntent({ name: "A;B", mobile: "9822913223" })).toContain("S.name=A%3BB;");
  });

  it("omits empty name and address", () => {
    const url = buildAndroidContactIntent({ name: " ", mobile: "9822913223" });
    expect(url).not.toContain("S.name");
    expect(url).not.toContain("S.postal");
  });

  it("returns null for invalid numbers", () => {
    expect(buildAndroidContactIntent({ name: "A", mobile: "12" })).toBeNull();
  });
});

describe("getPlatform", () => {
  it("detects Android, iPhone and desktop", () => {
    expect(getPlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130")).toBe("android");
    expect(getPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
    expect(getPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130")).toBe("desktop");
  });
});

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

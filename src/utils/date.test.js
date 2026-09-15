import { describe, it, expect } from "vitest";
import { getOrderDate, isSameDay, isSameMonth, getMonthKey, getDayKey, pctChange, formatHour } from "./date";

describe("getOrderDate", () => {
  it("returns null when createdAt is missing", () => {
    expect(getOrderDate({})).toBeNull();
    expect(getOrderDate(null)).toBeNull();
  });

  it("converts a Firestore Timestamp-like value via toDate()", () => {
    const fakeTimestamp = { toDate: () => new Date("2026-01-15T10:00:00Z") };
    expect(getOrderDate({ createdAt: fakeTimestamp })).toEqual(new Date("2026-01-15T10:00:00Z"));
  });

  it("falls back to `new Date()` for a plain string/number", () => {
    expect(getOrderDate({ createdAt: "2026-01-15T10:00:00Z" })).toEqual(new Date("2026-01-15T10:00:00Z"));
  });
});

describe("isSameDay / isSameMonth", () => {
  it("matches same calendar day", () => {
    expect(isSameDay(new Date("2026-03-05T01:00:00"), new Date("2026-03-05T23:00:00"))).toBe(true);
    expect(isSameDay(new Date("2026-03-05"), new Date("2026-03-06"))).toBe(false);
  });

  it("matches same calendar month", () => {
    expect(isSameMonth(new Date("2026-03-01"), new Date("2026-03-31"))).toBe(true);
    expect(isSameMonth(new Date("2026-03-01"), new Date("2026-04-01"))).toBe(false);
  });

  it("is falsy when either date is missing", () => {
    expect(isSameDay(null, new Date())).toBeFalsy();
    expect(isSameMonth(new Date(), undefined)).toBeFalsy();
  });
});

describe("getMonthKey / getDayKey", () => {
  it("pads single-digit months", () => {
    expect(getMonthKey(new Date("2026-01-15"))).toBe("2026-01");
  });

  it("returns empty string for a missing date", () => {
    expect(getMonthKey(null)).toBe("");
    expect(getDayKey(null)).toBe("");
  });
});

describe("pctChange", () => {
  it("computes percentage change", () => {
    expect(pctChange(150, 100)).toBe(50);
    expect(pctChange(50, 100)).toBe(-50);
  });

  it("returns null when there is no previous value to compare against", () => {
    expect(pctChange(100, 0)).toBeNull();
  });
});

describe("formatHour", () => {
  it("formats midnight and noon as 12", () => {
    expect(formatHour(0)).toBe("12 AM");
    expect(formatHour(12)).toBe("12 PM");
  });

  it("formats regular AM/PM hours", () => {
    expect(formatHour(9)).toBe("9 AM");
    expect(formatHour(15)).toBe("3 PM");
  });
});

import { describe, expect, it } from "vitest";

import { ParseOffset } from "@/lib/pagination";

describe("ParseOffset", () => {
  it("accepts a safe non-negative integer", () => {
    expect(ParseOffset("48")).toBe(48);
  });

  it("falls back for negative, non-numeric, or missing input", () => {
    expect(ParseOffset("-1")).toBe(0);
    expect(ParseOffset("not-a-page")).toBe(0);
    expect(ParseOffset(undefined)).toBe(0);
  });

  it("bounds unexpectedly large offsets", () => {
    expect(ParseOffset("999999", 1000)).toBe(1000);
  });
});

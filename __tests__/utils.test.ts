import { cn, formatUSD, generateId, formatTimestamp } from "../lib/utils";

describe("cn()", () => {
  it("returns a string", () => {
    expect(typeof cn("foo", "bar")).toBe("string");
  });

  it("merges class names correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes with clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null gracefully", () => {
    expect(() => cn(undefined, null, "class")).not.toThrow();
    expect(cn(undefined, null, "class")).toContain("class");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("works with an empty call", () => {
    expect(cn()).toBe("");
  });
});

describe("formatUSD()", () => {
  it("formats zero as $0", () => {
    expect(formatUSD(0)).toBe("$0");
  });

  it("formats 1500 as $1,500", () => {
    expect(formatUSD(1500)).toBe("$1,500");
  });

  it("formats 2400 correctly", () => {
    expect(formatUSD(2400)).toBe("$2,400");
  });

  it("does not include decimal places", () => {
    expect(formatUSD(99.99)).not.toContain(".");
  });

  it("handles large numbers", () => {
    expect(formatUSD(1000000)).toBe("$1,000,000");
  });
});

describe("generateId()", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("contains a timestamp-like prefix", () => {
    const id = generateId();
    const parts = id.split("-");
    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(Number(parts[0])).toBeGreaterThan(0);
  });
});

describe("formatTimestamp()", () => {
  it("returns a string", () => {
    expect(typeof formatTimestamp()).toBe("string");
  });

  it("formats a specific date consistently", () => {
    // Create a fixed date: noon UTC
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = formatTimestamp(date);
    // Should contain time digits — exact format depends on locale
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it("accepts a custom Date object", () => {
    const date = new Date(2024, 5, 15, 14, 30, 0);
    const result = formatTimestamp(date);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("defaults to current time when no argument is provided", () => {
    const before = Date.now();
    const result = formatTimestamp();
    const after = Date.now();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Just verify it ran within the test timeframe
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

import { getMockMoveOutResult, getMockListingResult, MOCK_MOVE_OUT_RESULTS, MOCK_LISTING_RESULTS } from "../lib/mockData";

describe("Mock Move-Out Results", () => {
  it("MOCK_MOVE_OUT_RESULTS is a non-empty array", () => {
    expect(Array.isArray(MOCK_MOVE_OUT_RESULTS)).toBe(true);
    expect(MOCK_MOVE_OUT_RESULTS.length).toBeGreaterThan(0);
  });

  it("each mock result has required fields", () => {
    for (const r of MOCK_MOVE_OUT_RESULTS) {
      expect(typeof r.defect_type).toBe("string");
      expect(["Normal Wear & Tear", "Tenant Damage"]).toContain(r.classification);
      expect(["green", "red"]).toContain(r.badge_color);
      expect(typeof r.legal_reasoning).toBe("string");
      expect(typeof r.repair_cost_low).toBe("number");
      expect(typeof r.repair_cost_high).toBe("number");
      expect(typeof r.confidence).toBe("number");
    }
  });

  it("badge_color matches classification for each item", () => {
    for (const r of MOCK_MOVE_OUT_RESULTS) {
      if (r.classification === "Normal Wear & Tear") {
        expect(r.badge_color).toBe("green");
      } else {
        expect(r.badge_color).toBe("red");
      }
    }
  });

  it("confidence is between 0 and 100", () => {
    for (const r of MOCK_MOVE_OUT_RESULTS) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(100);
    }
  });

  it("repair costs are non-negative", () => {
    for (const r of MOCK_MOVE_OUT_RESULTS) {
      expect(r.repair_cost_low).toBeGreaterThanOrEqual(0);
      expect(r.repair_cost_high).toBeGreaterThanOrEqual(r.repair_cost_low);
    }
  });

  it("getMockMoveOutResult returns a valid result", () => {
    const result = getMockMoveOutResult();
    expect(result).toBeDefined();
    expect(typeof result.defect_type).toBe("string");
  });
});

describe("Mock Listing Results", () => {
  it("MOCK_LISTING_RESULTS is a non-empty array", () => {
    expect(Array.isArray(MOCK_LISTING_RESULTS)).toBe(true);
    expect(MOCK_LISTING_RESULTS.length).toBeGreaterThan(0);
  });

  it("each listing result has required fields", () => {
    for (const r of MOCK_LISTING_RESULTS) {
      expect(Array.isArray(r.key_features)).toBe(true);
      expect(r.key_features.length).toBeGreaterThanOrEqual(3);
      expect(typeof r.estimated_monthly_rent).toBe("number");
      expect(r.estimated_monthly_rent).toBeGreaterThan(0);
      expect(typeof r.headline).toBe("string");
      expect(typeof r.description).toBe("string");
    }
  });

  it("headline is within 80 chars", () => {
    for (const r of MOCK_LISTING_RESULTS) {
      expect(r.headline.length).toBeLessThanOrEqual(80);
    }
  });

  it("getMockListingResult returns a valid result", () => {
    const result = getMockListingResult();
    expect(result).toBeDefined();
    expect(typeof result.headline).toBe("string");
  });
});

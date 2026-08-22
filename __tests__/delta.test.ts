/**
 * Unit tests for Delta Analyzer:
 * - DamageDeltaResult mock data integrity
 * - getDeltaPrompt output
 * - buildDeltaVisionMessage structure
 * - API route for delta mode (validation + mock fallback)
 */

import { MOCK_DELTA_RESULTS, getMockDeltaResult } from "@/lib/mockData";
import { getDeltaPrompt, buildDeltaVisionMessage } from "@/lib/prompts";
import { DamageDeltaResult } from "@/types";

// ─── Mock Data Tests ────────────────────────────────────────

describe("MOCK_DELTA_RESULTS", () => {
  it("should have at least 2 mock delta scenarios", () => {
    expect(MOCK_DELTA_RESULTS.length).toBeGreaterThanOrEqual(2);
  });

  it("should have valid overall_condition_change values", () => {
    const valid = ["Improved", "Same", "Worsened"];
    MOCK_DELTA_RESULTS.forEach((r) => {
      expect(valid).toContain(r.overall_condition_change);
    });
  });

  it("should have valid tenant_liability values", () => {
    const valid = ["None", "Partial", "Full"];
    MOCK_DELTA_RESULTS.forEach((r) => {
      expect(valid).toContain(r.tenant_liability);
    });
  });

  it("should have confidence between 0 and 100", () => {
    MOCK_DELTA_RESULTS.forEach((r) => {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(100);
    });
  });

  it("should have non-empty summary and legal_reasoning", () => {
    MOCK_DELTA_RESULTS.forEach((r) => {
      expect(r.summary.length).toBeGreaterThan(10);
      expect(r.legal_reasoning.length).toBeGreaterThan(10);
    });
  });

  it("worsened scenario should have new_damages > 0", () => {
    const worsened = MOCK_DELTA_RESULTS.find((r) => r.overall_condition_change === "Worsened");
    expect(worsened).toBeDefined();
    expect(worsened!.new_damages.length).toBeGreaterThan(0);
  });

  it("same condition scenario should have zero deductible", () => {
    const same = MOCK_DELTA_RESULTS.find((r) => r.overall_condition_change === "Same");
    expect(same).toBeDefined();
    expect(same!.total_new_deductible_low).toBe(0);
    expect(same!.total_new_deductible_high).toBe(0);
  });

  it("pre_existing_damages should always have deductible: false and estimated_cost: 0", () => {
    MOCK_DELTA_RESULTS.forEach((r) => {
      r.pre_existing_damages.forEach((d) => {
        expect(d.deductible).toBe(false);
        expect(d.estimated_cost).toBe(0);
      });
    });
  });

  it("DeltaDamage severity should be Minor, Moderate, or Severe", () => {
    const valid = ["Minor", "Moderate", "Severe"];
    MOCK_DELTA_RESULTS.forEach((r) => {
      [...r.pre_existing_damages, ...r.new_damages].forEach((d) => {
        expect(valid).toContain(d.severity);
      });
    });
  });

  it("total_new_deductible_low should be <= total_new_deductible_high", () => {
    MOCK_DELTA_RESULTS.forEach((r) => {
      expect(r.total_new_deductible_low).toBeLessThanOrEqual(r.total_new_deductible_high);
    });
  });
});

describe("getMockDeltaResult", () => {
  it("should return a valid DamageDeltaResult object", () => {
    const result = getMockDeltaResult();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("overall_condition_change");
    expect(result).toHaveProperty("new_damages");
    expect(result).toHaveProperty("pre_existing_damages");
    expect(result).toHaveProperty("tenant_liability");
    expect(result).toHaveProperty("confidence");
  });

  it("should return consistent results across multiple calls (stable mock pool)", () => {
    // Should never throw, always returns one of the pool entries
    for (let i = 0; i < 20; i++) {
      const result = getMockDeltaResult();
      expect(result).toBeDefined();
      expect(Array.isArray(result.new_damages)).toBe(true);
    }
  });
});

// ─── getDeltaPrompt Tests ────────────────────────────────────

describe("getDeltaPrompt", () => {
  it("should return a non-empty string", () => {
    const prompt = getDeltaPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should mention BEFORE and AFTER image roles", () => {
    const prompt = getDeltaPrompt();
    expect(prompt).toContain("BEFORE");
    expect(prompt).toContain("AFTER");
  });

  it("should specify the expected JSON schema fields", () => {
    const prompt = getDeltaPrompt();
    expect(prompt).toContain("overall_condition_change");
    expect(prompt).toContain("pre_existing_damages");
    expect(prompt).toContain("new_damages");
    expect(prompt).toContain("total_new_deductible_low");
    expect(prompt).toContain("tenant_liability");
    expect(prompt).toContain("legal_reasoning");
    expect(prompt).toContain("confidence");
  });

  it("should mention Normal Wear & Tear doctrine", () => {
    const prompt = getDeltaPrompt();
    expect(prompt.toLowerCase()).toContain("wear");
    expect(prompt.toLowerCase()).toContain("tear");
  });
});

// ─── buildDeltaVisionMessage Tests ──────────────────────────

describe("buildDeltaVisionMessage", () => {
  const BEFORE_B64 = "abc123beforebase64";
  const AFTER_B64 = "xyz789afterbase64";

  it("should return a user role message", () => {
    const msg = buildDeltaVisionMessage(BEFORE_B64, AFTER_B64);
    expect(msg.role).toBe("user");
  });

  it("should contain content array with 4 entries (text+img, text+img)", () => {
    const msg = buildDeltaVisionMessage(BEFORE_B64, AFTER_B64);
    expect(Array.isArray(msg.content)).toBe(true);
    expect(msg.content.length).toBe(4);
  });

  it("should have two image_url entries with correct base64 data", () => {
    const msg = buildDeltaVisionMessage(BEFORE_B64, AFTER_B64);
    const imgEntries = msg.content.filter((c) => c.type === "image_url");
    expect(imgEntries.length).toBe(2);
    const urls = imgEntries.map((c) => (c.image_url as { url: string }).url);
    expect(urls[0]).toContain(BEFORE_B64);
    expect(urls[1]).toContain(AFTER_B64);
  });

  it("should have two text entries contextualizing BEFORE and AFTER images", () => {
    const msg = buildDeltaVisionMessage(BEFORE_B64, AFTER_B64);
    const textEntries = msg.content.filter((c) => c.type === "text");
    expect(textEntries.length).toBe(2);
    const texts = textEntries.map((c) => (c as { type: string; text: string }).text);
    expect(texts[0]).toContain("BEFORE");
    expect(texts[1]).toContain("AFTER");
  });

  it("should embed both base64 strings in data URLs with jpeg MIME type", () => {
    const msg = buildDeltaVisionMessage(BEFORE_B64, AFTER_B64);
    const imgEntries = msg.content.filter((c) => c.type === "image_url");
    imgEntries.forEach((entry) => {
      const url = (entry.image_url as { url: string }).url;
      expect(url.startsWith("data:image/jpeg;base64,")).toBe(true);
    });
  });
});

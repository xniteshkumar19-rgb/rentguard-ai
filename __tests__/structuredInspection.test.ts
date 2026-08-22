import { POST } from "../app/api/inspect/route";
import { getComprehensiveInspectionPrompt } from "../lib/prompts";
import { getMockStructuredInspectionResult } from "../lib/mockData";
import { NextRequest } from "next/server";

function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe("Structured Inspection Backend & Security Deposit Engine", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("API Validation", () => {
    it("returns 400 when beforeImageBase64 is missing in inspection mode", async () => {
      const req = createMockRequest({
        afterImageBase64: "valid_after_image",
        mode: "inspection",
      });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain("Missing or invalid beforeImageBase64");
    });

    it("returns 400 when afterImageBase64 is missing in inspection mode", async () => {
      const req = createMockRequest({
        beforeImageBase64: "valid_before_image",
        mode: "inspection",
      });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain("Missing or invalid afterImageBase64");
    });

    it("returns 413 when payload exceeds maximum size limit", async () => {
      const hugeBase64 = "a".repeat(21 * 1024 * 1024);
      const req = createMockRequest({
        beforeImageBase64: hugeBase64,
        afterImageBase64: "small_base64",
        mode: "inspection",
      });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(413);
      expect(json.error).toContain("too large");
    });
  });

  describe("Security Deposit Deduction & Capping Logic", () => {
    it("returns realistic structured inspection result with mock fallback", async () => {
      const response = await POST(
        createMockRequest({
          beforeImageBase64: "sample_movein_base64",
          afterImageBase64: "sample_moveout_base64",
          room: "Modular Kitchen",
          securityDeposit: 50000,
          mode: "inspection",
        })
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.mode).toBe("inspection");
      expect(json.data).toBeDefined();
      expect(json.data.inspection_id).toBeDefined();
      expect(json.data.room).toBe("Modular Kitchen");
      expect(Array.isArray(json.data.findings)).toBe(true);
      expect(json.data.findings.length).toBeGreaterThan(0);
      expect(json.data.recommended_deposit_deduction).toBeDefined();
      expect(json.data.estimated_refund).toBe(50000 - json.data.recommended_deposit_deduction);
    });

    it("never allows recommended deduction to exceed total security deposit", () => {
      const smallDeposit = 2000;
      const result = getMockStructuredInspectionResult("Modular Kitchen", smallDeposit);

      expect(result.recommended_deposit_deduction).toBeLessThanOrEqual(smallDeposit);
      expect(result.estimated_refund).toBe(Math.max(0, smallDeposit - result.recommended_deposit_deduction));
      expect(result.estimated_refund).toBe(0);
    });

    it("ensures normal wear and tear has zero deposit impact", () => {
      const result = getMockStructuredInspectionResult("Master Bedroom", 50000);
      const normalWearFindings = result.findings.filter((f) => f.classification === "normal_wear");

      normalWearFindings.forEach((finding) => {
        expect(finding.deposit_impact).toBe(0);
      });
    });
  });

  describe("OpenAI Vision Integration & Error Handling", () => {
    it("parses structured findings when OPENAI_API_KEY is configured", async () => {
      process.env.OPENAI_API_KEY = "sk-test-mock-key";

      const mockAiStructuredResponse = {
        inspection_id: "INSP-TEST-99",
        room: "Balcony",
        overall_condition: "Minor Wear",
        findings: [
          {
            finding: "Balcony Railing Scratch",
            classification: "minor_damage",
            confidence: 91,
            description: "Shallow paint scratch on iron railing.",
            evidence: "Pristine baseline vs localized scratch at move-out.",
            repair_cost_low: 500,
            repair_cost_high: 1000,
            deposit_impact: 750,
          },
        ],
        total_repair_cost_low: 500,
        total_repair_cost_high: 1000,
        recommended_deposit_deduction: 750,
        estimated_refund: 49250,
        reasoning: "Isolated railing blemish requiring touchup paint.",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockAiStructuredResponse),
              },
            },
          ],
        }),
      } as unknown as Response);

      const response = await POST(
        createMockRequest({
          beforeImageBase64: "sample_before",
          afterImageBase64: "sample_after",
          room: "Balcony",
          securityDeposit: 50000,
          mode: "inspection",
        })
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.mode).toBe("inspection");
      expect(json.data.inspection_id).toBe("INSP-TEST-99");
      expect(json.data.recommended_deposit_deduction).toBe(750);
      expect(json.data.estimated_refund).toBe(49250);
    });

    it("handles malformed AI response gracefully", async () => {
      process.env.OPENAI_API_KEY = "sk-test-mock-key";

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "NOT_VALID_JSON",
              },
            },
          ],
        }),
      } as unknown as Response);

      const response = await POST(
        createMockRequest({
          beforeImageBase64: "sample_before",
          afterImageBase64: "sample_after",
          mode: "inspection",
        })
      );
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain("invalid JSON");
    });
  });

  describe("AI System Prompt Formatting", () => {
    it("generates prompt with strict wear vs damage rules and security deposit context", () => {
      const prompt = getComprehensiveInspectionPrompt("Living Room", 75000);

      expect(prompt).toContain("Living Room");
      expect(prompt).toContain("75000");
      expect(prompt).toContain("normal_wear");
      expect(prompt).toContain("moderate_damage");
      expect(prompt).toContain("Observable Evidence Only");
      expect(prompt).toContain("recommended_deposit_deduction");
      expect(prompt).toContain("estimated_refund");
    });
  });
});

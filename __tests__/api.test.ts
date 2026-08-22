import { POST } from "../app/api/inspect/route";
import { NextRequest } from "next/server";

function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe("POST /api/inspect", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 400 when imageBase64 is missing", async () => {
    const req = createMockRequest({ mode: "move_out" });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("Missing or invalid imageBase64");
  });

  it("returns 400 when mode is invalid", async () => {
    const req = createMockRequest({ imageBase64: "valid_base64", mode: "invalid_mode" });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("Invalid mode");
  });

  it("returns 413 when imageBase64 exceeds size limit", async () => {
    const hugeBase64 = "a".repeat(21 * 1024 * 1024);
    const req = createMockRequest({ imageBase64: hugeBase64, mode: "move_out" });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(413);
    expect(json.error).toContain("Image too large");
  });

  it("returns mock data for move_out mode when no OPENAI_API_KEY", async () => {
    const response = await POST(createMockRequest({ imageBase64: "sample_base64", mode: "move_out" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.mode).toBe("move_out");
    expect(json.data).toBeDefined();
    expect(json.data.defect_type).toBeDefined();
    expect(json.data.classification).toBeDefined();
    expect(json.data.legal_reasoning).toBeDefined();
  }, 10000);

  it("returns mock data for listing mode when no OPENAI_API_KEY", async () => {
    const response = await POST(createMockRequest({ imageBase64: "sample_base64", mode: "listing" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.mode).toBe("listing");
    expect(json.data).toBeDefined();
    expect(json.data.headline).toBeDefined();
    expect(json.data.estimated_monthly_rent).toBeGreaterThan(0);
    expect(Array.isArray(json.data.key_features)).toBe(true);
  }, 10000);

  it("calls OpenAI API when OPENAI_API_KEY is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-test-key-12345";
    const mockAiResponse = {
      defect_type: "Broken Window Pane",
      classification: "Tenant Damage",
      badge_color: "red",
      legal_reasoning: "Cracked or shattered glass from direct impact.",
      repair_cost_low: 150,
      repair_cost_high: 300,
      confidence: 95,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAiResponse),
            },
          },
        ],
      }),
    } as unknown as Response);

    const response = await POST(createMockRequest({ imageBase64: "sample_base64", mode: "move_out" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.mode).toBe("move_out");
    expect(json.data.defect_type).toBe("Broken Window Pane");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("handles OpenAI API errors gracefully", async () => {
    process.env.OPENAI_API_KEY = "sk-test-key-12345";

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid API key",
    } as unknown as Response);

    const response = await POST(createMockRequest({ imageBase64: "sample_base64", mode: "move_out" }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toContain("OpenAI API error");
  });

  it("returns 400 when beforeImageBase64 is missing in delta mode", async () => {
    const req = createMockRequest({ afterImageBase64: "sample_after", mode: "delta" });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("beforeImageBase64");
  });

  it("returns 400 when afterImageBase64 is missing in delta mode", async () => {
    const req = createMockRequest({ beforeImageBase64: "sample_before", mode: "delta" });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("afterImageBase64");
  });

  it("returns mock delta data when no OPENAI_API_KEY is set", async () => {
    const response = await POST(
      createMockRequest({
        beforeImageBase64: "sample_before_base64",
        afterImageBase64: "sample_after_base64",
        mode: "delta",
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.mode).toBe("delta");
    expect(json.data).toBeDefined();
    expect(json.data.overall_condition_change).toBeDefined();
    expect(Array.isArray(json.data.new_damages)).toBe(true);
    expect(Array.isArray(json.data.pre_existing_damages)).toBe(true);
    expect(json.data).toHaveProperty("tenant_liability");
    expect(json.data).toHaveProperty("confidence");
  }, 10000);
});

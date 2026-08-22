import { getMoveOutPrompt, getListingPrompt, buildVisionMessage } from "../lib/prompts";

describe("getMoveOutPrompt()", () => {
  let prompt: string;

  beforeEach(() => {
    prompt = getMoveOutPrompt();
  });

  it("returns a non-empty string", () => {
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("instructs the model to return JSON", () => {
    expect(prompt.toLowerCase()).toContain("json");
  });

  it("contains both classification categories", () => {
    expect(prompt).toContain("Normal Wear & Tear");
    expect(prompt).toContain("Tenant Damage");
  });

  it("references required JSON fields: defect_type", () => {
    expect(prompt).toContain("defect_type");
  });

  it("references required JSON fields: badge_color", () => {
    expect(prompt).toContain("badge_color");
  });

  it("references required JSON fields: repair_cost_low and repair_cost_high", () => {
    expect(prompt).toContain("repair_cost_low");
    expect(prompt).toContain("repair_cost_high");
  });

  it("references required JSON field: confidence", () => {
    expect(prompt).toContain("confidence");
  });

  it("references required JSON field: legal_reasoning", () => {
    expect(prompt).toContain("legal_reasoning");
  });
});

describe("getListingPrompt()", () => {
  let prompt: string;

  beforeEach(() => {
    prompt = getListingPrompt();
  });

  it("returns a non-empty string", () => {
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("instructs the model to return JSON", () => {
    expect(prompt.toLowerCase()).toContain("json");
  });

  it("contains key_features field reference", () => {
    expect(prompt).toContain("key_features");
  });

  it("contains estimated_monthly_rent field reference", () => {
    expect(prompt).toContain("estimated_monthly_rent");
  });

  it("contains headline field reference", () => {
    expect(prompt).toContain("headline");
  });

  it("contains description field reference", () => {
    expect(prompt).toContain("description");
  });

  it("mentions platforms (Zillow or Facebook)", () => {
    const mentionsPlatform =
      prompt.includes("Zillow") || prompt.includes("Facebook");
    expect(mentionsPlatform).toBe(true);
  });
});

describe("buildVisionMessage()", () => {
  it("builds correct structure for move_out mode", () => {
    const message = buildVisionMessage("mockBase64Data", "move_out");
    expect(message.role).toBe("user");
    expect(Array.isArray(message.content)).toBe(true);
    expect(message.content).toHaveLength(2);
    expect(message.content[0].type).toBe("image_url");
    expect((message.content[0].image_url as { url: string }).url).toBe("data:image/jpeg;base64,mockBase64Data");
    expect(message.content[1].type).toBe("text");
    expect(message.content[1].text).toContain("damage");
  });

  it("builds correct structure for listing mode", () => {
    const message = buildVisionMessage("mockBase64Data", "listing");
    expect(message.role).toBe("user");
    expect(Array.isArray(message.content)).toBe(true);
    expect(message.content).toHaveLength(2);
    expect(message.content[0].type).toBe("image_url");
    expect((message.content[0].image_url as { url: string }).url).toBe("data:image/jpeg;base64,mockBase64Data");
    expect(message.content[1].type).toBe("text");
    expect(message.content[1].text).toContain("rental listing");
  });
});

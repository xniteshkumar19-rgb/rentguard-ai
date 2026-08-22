import { NextRequest, NextResponse } from "next/server";
import {
  AppMode,
  MoveOutResult,
  ListingResult,
  DamageDeltaResult,
  StructuredInspectionResult,
} from "@/types";
import {
  getMoveOutPrompt,
  getListingPrompt,
  getDeltaPrompt,
  getComprehensiveInspectionPrompt,
  buildVisionMessage,
  buildDeltaVisionMessage,
} from "@/lib/prompts";
import {
  getMockMoveOutResult,
  getMockListingResult,
  getMockDeltaResult,
  getMockStructuredInspectionResult,
} from "@/lib/mockData";
import { tagId } from "@/lib/utils";

// ============================================================
// POST /api/inspect
//
// Supports:
// 1. "inspection" mode: 2-image Move-In vs. Move-Out structured audit
// 2. "delta" mode: 2-image DamageDeltaResult comparison
// 3. "move_out" mode: 1-image defect assessment
// 4. "listing" mode: 1-image rental listing copy generator
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = (body.mode || "move_out") as AppMode;

    // --- Validate mode ---
    if (!["move_out", "listing", "delta", "inspection"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'move_out', 'listing', 'delta', or 'inspection'." },
        { status: 400 }
      );
    }

    // --- Comprehensive Inspection / Delta modes (2 Images) ---
    if (mode === "delta" || mode === "inspection") {
      const beforeImageBase64 =
        body.beforeImageBase64 || body.moveInImageBase64 || body.beforeImage;
      const afterImageBase64 =
        body.afterImageBase64 || body.moveOutImageBase64 || body.afterImage;

      if (!beforeImageBase64 || typeof beforeImageBase64 !== "string") {
        return NextResponse.json(
          { error: "Missing or invalid beforeImageBase64 field." },
          { status: 400 }
        );
      }
      if (!afterImageBase64 || typeof afterImageBase64 !== "string") {
        return NextResponse.json(
          { error: "Missing or invalid afterImageBase64 field." },
          { status: 400 }
        );
      }

      if (
        beforeImageBase64.length > 20 * 1024 * 1024 ||
        afterImageBase64.length > 20 * 1024 * 1024
      ) {
        return NextResponse.json(
          { error: "One or both images are too large. Please use images under 10MB." },
          { status: 413 }
        );
      }

      const roomName = body.room || body.roomName || "Living Room";
      const rawDeposit = Number(body.security_deposit ?? body.securityDeposit ?? 50000);
      const securityDeposit = isNaN(rawDeposit) || rawDeposit < 0 ? 50000 : rawDeposit;

      // Mock fallback when API key is unconfigured
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey === "your-api-key-here") {
        await new Promise((r) => setTimeout(r, 600));

        if (mode === "inspection") {
          const data = getMockStructuredInspectionResult(roomName, securityDeposit);
          return NextResponse.json({ data, mode: "inspection" });
        } else {
          const data: DamageDeltaResult = getMockDeltaResult();
          return NextResponse.json({ data, mode: "delta" });
        }
      }

      // Real OpenAI Vision Analysis
      const systemPrompt =
        mode === "inspection"
          ? getComprehensiveInspectionPrompt(roomName, securityDeposit)
          : getDeltaPrompt();

      const userMessage = buildDeltaVisionMessage(beforeImageBase64, afterImageBase64);

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          max_tokens: 2048,
          messages: [{ role: "system", content: systemPrompt }, userMessage],
        }),
      });

      if (!openaiRes.ok) {
        const errBody = await openaiRes.text();
        console.error("OpenAI API error:", openaiRes.status, errBody);
        return NextResponse.json(
          { error: `OpenAI API error: ${openaiRes.statusText}` },
          { status: openaiRes.status }
        );
      }

      const openaiData = await openaiRes.json();
      const rawContent = openaiData.choices?.[0]?.message?.content;
      if (!rawContent) {
        return NextResponse.json({ error: "Empty response from AI model." }, { status: 500 });
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return NextResponse.json(
          { error: "AI returned invalid JSON. Please try again." },
          { status: 500 }
        );
      }

      // If mode is inspection, guarantee calculated bounds and security deposit safety
      if (mode === "inspection") {
        const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
        let totalDeduction = findings.reduce(
          (sum: number, f: any) => sum + (Number(f.deposit_impact) || 0),
          0
        );

        // Security deposit cap: deduction can never exceed deposit
        const cappedDeduction = Math.min(totalDeduction, securityDeposit);
        const estimatedRefund = Math.max(0, securityDeposit - cappedDeduction);

        const structuredResult: StructuredInspectionResult = {
          inspection_id: parsed.inspection_id || tagId("INSP"),
          room: parsed.room || roomName,
          overall_condition: parsed.overall_condition || "Minor Wear",
          findings,
          total_repair_cost_low: Number(parsed.total_repair_cost_low) || 0,
          total_repair_cost_high: Number(parsed.total_repair_cost_high) || 0,
          recommended_deposit_deduction: cappedDeduction,
          estimated_refund: estimatedRefund,
          reasoning: parsed.reasoning || "Forensic image comparison completed.",
          security_deposit: securityDeposit,
          timestamp: new Date().toISOString(),
          property: body.property,
          tenant: body.tenant,
        };

        return NextResponse.json({ data: structuredResult, mode: "inspection" });
      }

      return NextResponse.json({ data: parsed as DamageDeltaResult, mode: "delta" });
    }

    // --- Single Image Modes (move_out / listing) ---
    const { imageBase64 } = body as { imageBase64: string };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid imageBase64 field." },
        { status: 400 }
      );
    }
    if (imageBase64.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Please use an image under 10MB." },
        { status: 413 }
      );
    }

    // Mock fallback
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your-api-key-here") {
      await new Promise((r) => setTimeout(r, 600));
      if (mode === "move_out") {
        const data: MoveOutResult = getMockMoveOutResult();
        return NextResponse.json({ data, mode });
      } else {
        const data: ListingResult = getMockListingResult();
        return NextResponse.json({ data, mode });
      }
    }

    // Real OpenAI Vision call
    const systemPrompt = mode === "move_out" ? getMoveOutPrompt() : getListingPrompt();
    const userMessage = buildVisionMessage(imageBase64, mode);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 1024,
        messages: [{ role: "system", content: systemPrompt }, userMessage],
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error("OpenAI API error:", openaiRes.status, errBody);
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiRes.statusText}` },
        { status: openaiRes.status }
      );
    }

    const openaiData = await openaiRes.json();
    const rawContent = openaiData.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: "Empty response from AI model." }, { status: 500 });
    }

    let parsed: MoveOutResult | ListingResult;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: parsed, mode });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/inspect:", err);
    const message = err instanceof Error ? err.message : "Unknown server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

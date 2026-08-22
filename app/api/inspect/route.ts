import { NextRequest, NextResponse } from "next/server";
import { AppMode, MoveOutResult, ListingResult, DamageDeltaResult } from "@/types";
import {
  getMoveOutPrompt,
  getListingPrompt,
  getDeltaPrompt,
  buildVisionMessage,
  buildDeltaVisionMessage,
} from "@/lib/prompts";
import {
  getMockMoveOutResult,
  getMockListingResult,
  getMockDeltaResult,
} from "@/lib/mockData";

// ============================================================
// POST /api/inspect
// Body (single image): { imageBase64: string, mode: "move_out" | "listing" }
// Body (delta): { beforeImageBase64: string, afterImageBase64: string, mode: "delta" }
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode as AppMode;

    // --- Validate mode ---
    if (!["move_out", "listing", "delta"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'move_out', 'listing', or 'delta'." },
        { status: 400 }
      );
    }

    // --- Delta mode: two images ---
    if (mode === "delta") {
      const { beforeImageBase64, afterImageBase64 } = body as {
        beforeImageBase64: string;
        afterImageBase64: string;
      };
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

      // Mock fallback
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey === "your-api-key-here") {
        await new Promise((r) => setTimeout(r, 1800));
        const data: DamageDeltaResult = getMockDeltaResult();
        return NextResponse.json({ data, mode: "delta" });
      }

      // Real OpenAI call with two images
      const systemPrompt = getDeltaPrompt();
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
          messages: [
            { role: "system", content: systemPrompt },
            userMessage,
          ],
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

      let parsed: DamageDeltaResult;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return NextResponse.json(
          { error: "AI returned invalid JSON. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: parsed, mode: "delta" });
    }

    // --- Single image modes (move_out / listing) ---
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
      await new Promise((r) => setTimeout(r, 1500));
      if (mode === "move_out") {
        const data: MoveOutResult = getMockMoveOutResult();
        return NextResponse.json({ data, mode });
      } else {
        const data: ListingResult = getMockListingResult();
        return NextResponse.json({ data, mode });
      }
    }

    // Real OpenAI Vision call
    const systemPrompt =
      mode === "move_out" ? getMoveOutPrompt() : getListingPrompt();
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
        messages: [
          { role: "system", content: systemPrompt },
          userMessage,
        ],
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

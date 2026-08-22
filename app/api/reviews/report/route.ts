import { NextRequest, NextResponse } from "next/server";
import { reportReview } from "@/lib/reviewsStorage";
import { ReportReviewInput } from "@/types";

// ============================================================
// POST /api/reviews/report
// Body: ReportReviewInput ({ reviewId, reason, details })
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReportReviewInput;

    if (!body.reviewId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: reviewId." },
        { status: 400 }
      );
    }

    const validReasons = ["spam", "offensive", "fake", "irrelevant", "other"];
    if (!body.reason || !validReasons.includes(body.reason)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid report reason. Must be one of: ${validReasons.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const result = reportReview(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Review reported successfully. Our trust & safety team will review it.",
      review: result.review,
    });
  } catch (error: any) {
    console.error("Error in POST /api/reviews/report:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit report." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { moderateReview } from "@/lib/reviewsStorage";
import { ModerateReviewInput } from "@/types";

// ============================================================
// PATCH /api/reviews/moderate
// Body: ModerateReviewInput ({ reviewId, action: 'approve' | 'hide' | 'delete' | 'unflag' })
// ============================================================
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as ModerateReviewInput;

    if (!body.reviewId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: reviewId." },
        { status: 400 }
      );
    }

    const validActions = ["approve", "hide", "delete", "unflag"];
    if (!body.action || !validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid moderation action. Must be one of: ${validActions.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const result = moderateReview(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Review ${body.action} action completed successfully.`,
      review: result.review,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/reviews/moderate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute moderation action." },
      { status: 500 }
    );
  }
}

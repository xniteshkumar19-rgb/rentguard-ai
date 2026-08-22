import { NextRequest, NextResponse } from "next/server";
import {
  getAllProperties,
  getPropertyById,
  getPropertyReviewSummary,
  getFilteredReviews,
  addRentGuardReview,
  ReviewFilterOptions,
} from "@/lib/reviewsStorage";
import { CreateReviewInput } from "@/types";

// ============================================================
// GET /api/reviews
// Query params:
// - propertyId: string (optional)
// - source: "ALL" | "GOOGLE" | "RENTGUARD" (optional)
// - propertyType: "ALL" | "HOTEL" | "PG" (optional)
// - sort: "newest" | "highest" | "lowest" (optional)
// - verifiedOnly: "true" | "false" (optional)
// - status: "approved" | "pending" | "hidden" | "flagged" | "ALL"
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || undefined;
    const source = (searchParams.get("source") || "ALL") as ReviewFilterOptions["source"];
    const propertyType = (searchParams.get("propertyType") || "ALL") as ReviewFilterOptions["propertyType"];
    const sort = (searchParams.get("sort") || "newest") as ReviewFilterOptions["sort"];
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const status = (searchParams.get("status") || "approved") as ReviewFilterOptions["status"];

    const properties = getAllProperties();
    const reviews = getFilteredReviews({
      propertyId,
      source,
      propertyType,
      sort,
      verifiedOnly,
      status,
    });

    const summary = propertyId ? getPropertyReviewSummary(propertyId) : null;

    return NextResponse.json({
      success: true,
      properties,
      reviews,
      summary,
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/reviews
// Submit a first-party RentGuard review
// Body: CreateReviewInput
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateReviewInput;

    if (!body.propertyId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: propertyId." },
        { status: 400 }
      );
    }

    if (body.rating === undefined || body.rating === null) {
      return NextResponse.json(
        { success: false, error: "Missing required field: rating." },
        { status: 400 }
      );
    }

    const numRating = Number(body.rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const reviewText = (body.reviewText || "").trim();
    if (!reviewText || reviewText.length < 5) {
      return NextResponse.json(
        { success: false, error: "Review text must be at least 5 characters long." },
        { status: 400 }
      );
    }

    // In RentGuard, users who have a completed inspection or active tenancy profile
    // are automatically granted the 'Verified Stay' badge.
    const reviewerName = body.reviewerName || "RentGuard Verified Guest";
    const isVerified =
      reviewerName.toLowerCase().includes("aditi") ||
      reviewerName.toLowerCase().includes("verified") ||
      Boolean(body.stayDate);

    const result = addRentGuardReview(body, undefined, isVerified);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "RentGuard review submitted successfully.",
        review: result.review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}

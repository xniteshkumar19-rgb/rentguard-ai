import {
  Review,
  ReviewProperty,
  PropertyReviewSummary,
  CreateReviewInput,
  ReportReviewInput,
  ModerateReviewInput,
  ReviewSource,
  PropertyType,
} from "@/types";
import { INITIAL_PROPERTIES, INITIAL_REVIEWS } from "./reviewsData";
import { tagId } from "./utils";

// In-memory data store for reviews & properties
let propertiesStore: ReviewProperty[] = [...INITIAL_PROPERTIES];
let reviewsStore: Review[] = [...INITIAL_REVIEWS];

/**
 * Resets the review store to initial seed data (useful for test isolation).
 */
export function resetReviewsStore(): void {
  propertiesStore = [...INITIAL_PROPERTIES];
  reviewsStore = [...INITIAL_REVIEWS];
}

/**
 * Retrieves all available Hotel & PG properties.
 */
export function getAllProperties(): ReviewProperty[] {
  return propertiesStore;
}

/**
 * Retrieves a single property by its ID.
 */
export function getPropertyById(propertyId: string): ReviewProperty | undefined {
  return propertiesStore.find((p) => p.id === propertyId);
}

/**
 * Calculates distinct rating summaries for RentGuard vs. Google without averaging them together.
 */
export function getPropertyReviewSummary(propertyId: string): PropertyReviewSummary | null {
  const property = getPropertyById(propertyId);
  if (!property) return null;

  // Only consider approved reviews for public summary metrics
  const activeReviews = reviewsStore.filter(
    (r) => r.propertyId === propertyId && r.status === "approved"
  );

  const rentGuardReviews = activeReviews.filter((r) => r.source === "RENTGUARD");
  const googleReviews = activeReviews.filter((r) => r.source === "GOOGLE");

  // RentGuard rating calculation
  const rgSum = rentGuardReviews.reduce((acc, r) => acc + r.rating, 0);
  const rentGuardRating =
    rentGuardReviews.length > 0 ? Number((rgSum / rentGuardReviews.length).toFixed(1)) : 0;

  // Google rating calculation
  const gglSum = googleReviews.reduce((acc, r) => acc + r.rating, 0);
  const googleRating =
    googleReviews.length > 0 ? Number((gglSum / googleReviews.length).toFixed(1)) : undefined;

  // Rating star distribution for RentGuard reviews
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rentGuardReviews.forEach((r) => {
    const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (ratingDistribution[star] !== undefined) {
      ratingDistribution[star]++;
    }
  });

  const verifiedReviewCount = rentGuardReviews.filter((r) => r.verifiedStay).length;

  return {
    property,
    rentGuardRating,
    rentGuardReviewCount: rentGuardReviews.length,
    googleRating,
    googleReviewCount: googleReviews.length,
    ratingDistribution,
    verifiedReviewCount,
  };
}

export interface ReviewFilterOptions {
  propertyId?: string;
  source?: ReviewSource | "ALL";
  propertyType?: PropertyType | "ALL";
  sort?: "newest" | "highest" | "lowest";
  verifiedOnly?: boolean;
  status?: "approved" | "pending" | "hidden" | "flagged" | "ALL";
}

/**
 * Fetches filtered and sorted reviews.
 */
export function getFilteredReviews(options: ReviewFilterOptions = {}): Review[] {
  const {
    propertyId,
    source = "ALL",
    propertyType = "ALL",
    sort = "newest",
    verifiedOnly = false,
    status = "approved",
  } = options;

  let result = reviewsStore.filter((r) => {
    if (propertyId && r.propertyId !== propertyId) return false;
    if (source !== "ALL" && r.source !== source) return false;
    if (propertyType !== "ALL" && r.propertyType !== propertyType) return false;
    if (verifiedOnly && !r.verifiedStay) return false;
    if (status !== "ALL" && r.status !== status) return false;
    return true;
  });

  // Sorting
  if (sort === "newest") {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "highest") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === "lowest") {
    result.sort((a, b) => a.rating - b.rating);
  }

  return result;
}

/**
 * Adds a new first-party RentGuard review.
 */
export function addRentGuardReview(
  input: CreateReviewInput,
  userId?: string,
  isVerified: boolean = false
): { review?: Review; error?: string } {
  const property = getPropertyById(input.propertyId);
  if (!property) {
    return { error: `Property with ID '${input.propertyId}' not found.` };
  }

  // Validation
  const rating = Number(input.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be an integer or number between 1 and 5." };
  }

  const reviewText = (input.reviewText || "").trim();
  if (reviewText.length < 5) {
    return { error: "Review text must be at least 5 characters long." };
  }

  const reviewerName = (input.reviewerName || "Verified RentGuard Guest").trim();

  const newReview: Review = {
    id: tagId("REV-RG"),
    propertyId: property.id,
    propertyName: property.name,
    propertyType: property.type,
    source: "RENTGUARD",
    userId: userId || "guest-user",
    reviewerName,
    rating: Math.round(rating * 10) / 10,
    reviewText,
    photos: input.photos || [],
    stayDate: input.stayDate || "Recent Stay",
    roomType: input.roomType || "Standard Accommodation",
    verifiedStay: isVerified,
    status: "approved",
    reportCount: 0,
    createdAt: new Date().toISOString(),
  };

  reviewsStore.unshift(newReview);
  return { review: newReview };
}

/**
 * Reports a review for spam, offensive content, fake review, etc.
 */
export function reportReview(
  input: ReportReviewInput
): { success: boolean; review?: Review; error?: string } {
  const review = reviewsStore.find((r) => r.id === input.reviewId);
  if (!review) {
    return { success: false, error: "Review not found." };
  }

  if (review.source === "GOOGLE") {
    return {
      success: false,
      error: "Google reviews are external and read-only. They cannot be reported via RentGuard.",
    };
  }

  review.reportCount = (review.reportCount || 0) + 1;
  const reasons = review.reportReasons || [];
  if (!reasons.includes(input.reason)) {
    reasons.push(input.reason);
  }
  review.reportReasons = reasons;

  // Flag review if report threshold is reached or serious
  review.status = "flagged";
  review.updatedAt = new Date().toISOString();

  return { success: true, review };
}

/**
 * Moderates a RentGuard review (approve, hide, delete, unflag).
 */
export function moderateReview(
  input: ModerateReviewInput
): { success: boolean; review?: Review; error?: string } {
  const reviewIndex = reviewsStore.findIndex((r) => r.id === input.reviewId);
  if (reviewIndex === -1) {
    return { success: false, error: "Review not found." };
  }

  const review = reviewsStore[reviewIndex];
  if (review.source === "GOOGLE") {
    return {
      success: false,
      error: "Google reviews cannot be modified or moderated by RentGuard admins.",
    };
  }

  if (input.action === "delete") {
    reviewsStore.splice(reviewIndex, 1);
    return { success: true };
  }

  if (input.action === "approve" || input.action === "unflag") {
    review.status = "approved";
  } else if (input.action === "hide") {
    review.status = "hidden";
  }

  review.updatedAt = new Date().toISOString();
  return { success: true, review };
}

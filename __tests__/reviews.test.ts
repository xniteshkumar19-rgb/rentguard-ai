import {
  getAllProperties,
  getPropertyById,
  getPropertyReviewSummary,
  getFilteredReviews,
  addRentGuardReview,
  reportReview,
  moderateReview,
  resetReviewsStore,
} from "../lib/reviewsStorage";
import { GET as getReviewsRoute, POST as postReviewsRoute } from "../app/api/reviews/route";
import { POST as reportRoute } from "../app/api/reviews/report/route";
import { PATCH as moderateRoute } from "../app/api/reviews/moderate/route";
import { GET as googleReviewsRoute } from "../app/api/reviews/google/route";
import { NextRequest } from "next/server";

function createMockRequest(body?: unknown, url: string = "http://localhost:3000/api/reviews"): NextRequest {
  return {
    url,
    json: async () => body,
  } as unknown as NextRequest;
}

describe("Hotel & PG Review System", () => {
  beforeEach(() => {
    resetReviewsStore();
    jest.clearAllMocks();
  });

  describe("Property & Storage Lookups", () => {
    it("retrieves all initial seed properties covering both Hotels and PGs", () => {
      const properties = getAllProperties();
      expect(properties.length).toBeGreaterThanOrEqual(4);

      const hasPG = properties.some((p) => p.type === "PG");
      const hasHotel = properties.some((p) => p.type === "HOTEL");
      expect(hasPG).toBe(true);
      expect(hasHotel).toBe(true);
    });

    it("retrieves a single property by ID", () => {
      const property = getPropertyById("PROP-STANZA-01");
      expect(property).toBeDefined();
      expect(property?.name).toContain("Stanza Living");
      expect(property?.type).toBe("PG");
    });
  });

  describe("Review Validation & Submission", () => {
    it("successfully creates a valid RentGuard review", () => {
      const result = addRentGuardReview(
        {
          propertyId: "PROP-STANZA-01",
          rating: 5,
          reviewText: "Outstanding PG accommodation with great Wi-Fi and food.",
          reviewerName: "Aditi Sharma",
          stayDate: "Aug 2025 - Jul 2026",
          roomType: "Single Suite",
        },
        "aditi-sharma",
        true
      );

      expect(result.error).toBeUndefined();
      expect(result.review).toBeDefined();
      expect(result.review?.source).toBe("RENTGUARD");
      expect(result.review?.rating).toBe(5);
      expect(result.review?.verifiedStay).toBe(true);
      expect(result.review?.status).toBe("approved");
    });

    it("rejects review with rating outside 1 to 5 range", () => {
      const resultLow = addRentGuardReview({
        propertyId: "PROP-STANZA-01",
        rating: 0,
        reviewText: "Too low rating test",
      });
      expect(resultLow.error).toContain("between 1 and 5");

      const resultHigh = addRentGuardReview({
        propertyId: "PROP-STANZA-01",
        rating: 6,
        reviewText: "Too high rating test",
      });
      expect(resultHigh.error).toContain("between 1 and 5");
    });

    it("rejects review with text shorter than 5 characters", () => {
      const result = addRentGuardReview({
        propertyId: "PROP-STANZA-01",
        rating: 4,
        reviewText: "Bad",
      });
      expect(result.error).toContain("at least 5 characters");
    });

    it("rejects review for non-existent property", () => {
      const result = addRentGuardReview({
        propertyId: "PROP-INVALID-99",
        rating: 5,
        reviewText: "Great place but property does not exist in ledger.",
      });
      expect(result.error).toContain("not found");
    });
  });

  describe("Dual-Source Provenance & Rating Separation", () => {
    it("maintains separate ratings for Google vs RentGuard without averaging them", () => {
      const summary = getPropertyReviewSummary("PROP-STANZA-01");
      expect(summary).toBeDefined();
      expect(summary?.rentGuardRating).toBeDefined();
      expect(summary?.rentGuardReviewCount).toBeGreaterThan(0);
      expect(summary?.googleRating).toBeDefined();
      expect(summary?.googleReviewCount).toBeGreaterThan(0);

      // Verify that Google and RentGuard reviews are distinctly separated
      const allReviews = getFilteredReviews({ propertyId: "PROP-STANZA-01" });
      const rentGuardReviews = allReviews.filter((r) => r.source === "RENTGUARD");
      const googleReviews = allReviews.filter((r) => r.source === "GOOGLE");

      expect(rentGuardReviews.length).toBe(summary?.rentGuardReviewCount);
      expect(googleReviews.length).toBe(summary?.googleReviewCount);
    });

    it("filters reviews by source", () => {
      const googleOnly = getFilteredReviews({ source: "GOOGLE" });
      expect(googleOnly.every((r) => r.source === "GOOGLE")).toBe(true);

      const rentGuardOnly = getFilteredReviews({ source: "RENTGUARD" });
      expect(rentGuardOnly.every((r) => r.source === "RENTGUARD")).toBe(true);
    });

    it("filters reviews by verified stay status", () => {
      const verifiedReviews = getFilteredReviews({ verifiedOnly: true });
      expect(verifiedReviews.every((r) => r.verifiedStay === true)).toBe(true);
      expect(verifiedReviews.every((r) => r.source === "RENTGUARD")).toBe(true);
    });

    it("sorts reviews correctly", () => {
      const highestFirst = getFilteredReviews({ sort: "highest" });
      for (let i = 0; i < highestFirst.length - 1; i++) {
        expect(highestFirst[i].rating).toBeGreaterThanOrEqual(highestFirst[i + 1].rating);
      }

      const lowestFirst = getFilteredReviews({ sort: "lowest" });
      for (let i = 0; i < lowestFirst.length - 1; i++) {
        expect(lowestFirst[i].rating).toBeLessThanOrEqual(lowestFirst[i + 1].rating);
      }
    });
  });

  describe("Review Reporting & Moderation", () => {
    it("allows reporting a RentGuard review and flags it", () => {
      const reportRes = reportReview({
        reviewId: "REV-RG-101",
        reason: "spam",
        details: "Promotional link included",
      });

      expect(reportRes.success).toBe(true);
      expect(reportRes.review?.status).toBe("flagged");
      expect(reportRes.review?.reportCount).toBe(1);
      expect(reportRes.review?.reportReasons).toContain("spam");
    });

    it("rejects reporting Google reviews (external/read-only)", () => {
      const reportRes = reportReview({
        reviewId: "REV-GGL-103",
        reason: "fake",
      });

      expect(reportRes.success).toBe(false);
      expect(reportRes.error).toContain("Google reviews are external");
    });

    it("allows admin to approve, hide, or delete RentGuard reviews", () => {
      // Hide review
      const hideRes = moderateReview({
        reviewId: "REV-RG-101",
        action: "hide",
      });
      expect(hideRes.success).toBe(true);
      expect(hideRes.review?.status).toBe("hidden");

      // Approve review
      const approveRes = moderateReview({
        reviewId: "REV-RG-101",
        action: "approve",
      });
      expect(approveRes.success).toBe(true);
      expect(approveRes.review?.status).toBe("approved");

      // Delete review
      const deleteRes = moderateReview({
        reviewId: "REV-RG-101",
        action: "delete",
      });
      expect(deleteRes.success).toBe(true);

      const all = getFilteredReviews({ status: "ALL" });
      expect(all.find((r) => r.id === "REV-RG-101")).toBeUndefined();
    });

    it("prevents admin from modifying Google reviews", () => {
      const modRes = moderateReview({
        reviewId: "REV-GGL-103",
        action: "hide",
      });
      expect(modRes.success).toBe(false);
      expect(modRes.error).toContain("Google reviews cannot be modified");
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/reviews returns review list and property summaries", async () => {
      const req = createMockRequest(
        undefined,
        "http://localhost:3000/api/reviews?propertyId=PROP-STANZA-01"
      );
      const res = await getReviewsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.reviews)).toBe(true);
      expect(json.summary).toBeDefined();
      expect(json.summary.rentGuardRating).toBeDefined();
    });

    it("POST /api/reviews submits valid review via endpoint", async () => {
      const req = createMockRequest({
        propertyId: "PROP-BLOOM-04",
        rating: 5,
        reviewText: "Exceptional room service and comfortable cloud mattress.",
        reviewerName: "Aditi Sharma",
        stayDate: "August 2026",
      });

      const res = await postReviewsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.review).toBeDefined();
      expect(json.review.propertyName).toContain("Bloomrooms");
    });

    it("POST /api/reviews rejects invalid payload", async () => {
      const req = createMockRequest({
        propertyId: "PROP-BLOOM-04",
        rating: 10, // Invalid
        reviewText: "Hi", // Too short
      });

      const res = await postReviewsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it("POST /api/reviews/report handles reporting via endpoint", async () => {
      const req = createMockRequest({
        reviewId: "REV-RG-102",
        reason: "fake",
        details: "User never stayed here",
      });

      const res = await reportRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.review.status).toBe("flagged");
    });

    it("PATCH /api/reviews/moderate handles admin moderation via endpoint", async () => {
      const req = createMockRequest({
        reviewId: "REV-RG-102",
        action: "hide",
      });

      const res = await moderateRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.review.status).toBe("hidden");
    });

    it("GET /api/reviews/google returns Google reviews with unconfigured fallback notice", async () => {
      const req = createMockRequest(
        undefined,
        "http://localhost:3000/api/reviews/google?propertyId=PROP-STANZA-01"
      );
      const res = await googleReviewsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.reviews)).toBe(true);
      expect(json.reviews.length).toBeGreaterThan(0);
      expect(json.googleRating).toBeDefined();
    });
  });
});

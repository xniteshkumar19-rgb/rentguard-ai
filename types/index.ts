// ============================================================
// RentGuard AI — Shared TypeScript Interfaces
// ============================================================

export type AppMode = "move_out" | "listing" | "delta" | "inspection" | "admin";

export type UserPersona = "tenant" | "manager";

// ----- Move-Out Audit (Single Image) -------------------------

export interface MoveOutResult {
  defect_type: string;
  classification: "Normal Wear & Tear" | "Tenant Damage";
  badge_color: "green" | "red";
  legal_reasoning: string;
  repair_cost_low: number;
  repair_cost_high: number;
  confidence: number; // 0–100
}

// ----- Listing Mode ------------------------------------------

export interface ListingResult {
  key_features: string[];
  estimated_monthly_rent: number;
  headline: string;
  description: string;
}

// ----- Damage Delta (Before vs After) -----------------------

export interface DeltaDamage {
  area: string; // e.g., "Left wall near window"
  description: string;
  severity: "Minor" | "Moderate" | "Severe";
  deductible: boolean;
  estimated_cost: number;
}

export interface DamageDeltaResult {
  overall_condition_change: "Improved" | "Same" | "Worsened";
  summary: string;
  pre_existing_damages: DeltaDamage[];
  new_damages: DeltaDamage[];
  total_new_deductible_low: number;
  total_new_deductible_high: number;
  tenant_liability: "None" | "Partial" | "Full";
  legal_reasoning: string;
  confidence: number; // 0–100
}

// ----- Comprehensive Structured Inspection Result -----------

export type FindingClassification =
  | "normal_wear"
  | "minor_damage"
  | "moderate_damage"
  | "significant_damage"
  | "Normal Wear & Tear"
  | "Tenant Damage";

export interface StructuredFinding {
  finding: string;
  classification: FindingClassification;
  confidence: number; // 0 - 100
  description: string;
  evidence: string;
  repair_cost_low: number;
  repair_cost_high: number;
  deposit_impact: number;
}

export interface StructuredInspectionResult {
  inspection_id: string;
  room: string;
  overall_condition: "Improved" | "Same" | "Worsened" | "Excellent" | "Good" | "Minor Wear" | "Damages Present";
  findings: StructuredFinding[];
  total_repair_cost_low: number;
  total_repair_cost_high: number;
  recommended_deposit_deduction: number;
  estimated_refund: number;
  reasoning: string;
  security_deposit?: number;
  timestamp?: string;
  property?: string;
  tenant?: string;
}

// ----- Audit Log ---------------------------------------------

export interface AuditLogItem {
  id: string;
  timestamp: string;
  imagePreview: string; // data URL thumbnail
  result: MoveOutResult;
}

// ----- API Payload / Response --------------------------------

export interface InspectRequest {
  imageBase64?: string;
  beforeImageBase64?: string;
  afterImageBase64?: string;
  moveInImageBase64?: string;
  moveOutImageBase64?: string;
  room?: string;
  roomName?: string;
  securityDeposit?: number;
  security_deposit?: number;
  property?: string;
  tenant?: string;
  mode?: AppMode;
}

export interface DeltaInspectRequest {
  beforeImageBase64: string;
  afterImageBase64: string;
  mode: "delta" | "inspection";
  room?: string;
  securityDeposit?: number;
}

export type InspectResponse =
  | { data: MoveOutResult; mode: "move_out" }
  | { data: ListingResult; mode: "listing" }
  | { data: DamageDeltaResult; mode: "delta" }
  | { data: StructuredInspectionResult; mode: "inspection" }
  | { error: string };

// ----- Admin ML Churn Dashboard ------------------------------

export type ChurnRiskLevel = "High" | "Medium" | "Low";

export interface ChurnUser {
  id: string;
  name: string;
  email: string;
  plan: "Free Tier" | "Pro Inspector" | "Landlord Unlimited";
  daysInactive: number;
  supportFrictionScore: number; // Scale 1.0 - 10.0
  deletionRiskScore: number; // Percentage 0 - 100%
  riskLevel: ChurnRiskLevel;
  primaryRiskDriver: string;
  recommendedAction: string;
  status: "Pending Action" | "Intervention Sent" | "Risk Mitigated";
  lastActiveDate: string;
}

export interface ChurnExecutiveMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositiveTrend: boolean;
  subtitle: string;
}

export interface FeatureImportanceItem {
  feature: string;
  weight: number; // 0 - 100%
  category: string;
  description: string;
}

// ----- Hotel & PG Review System ------------------------------

export type PropertyType = "HOTEL" | "PG";

export type ReviewSource = "GOOGLE" | "RENTGUARD";

export type ReviewStatus = "approved" | "pending" | "hidden" | "flagged";

export interface Review {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType: PropertyType;
  source: ReviewSource;
  userId?: string;
  reviewerName: string;
  reviewerImage?: string;
  rating: number; // 1 - 5
  reviewText: string;
  photos?: string[];
  stayDate?: string;
  roomType?: string;
  verifiedStay: boolean;
  status: ReviewStatus;
  reportCount: number;
  reportReasons?: string[];
  createdAt: string;
  updatedAt?: string;
  externalReviewId?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
}

export interface ReviewProperty {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  address: string;
  image: string;
  description: string;
  pricePerMonthOrNight: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  amenities: string[];
}

export interface PropertyReviewSummary {
  property: ReviewProperty;
  rentGuardRating: number;
  rentGuardReviewCount: number;
  googleRating?: number;
  googleReviewCount?: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviewCount: number;
}

export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  reviewText: string;
  reviewerName?: string;
  roomType?: string;
  stayDate?: string;
  photos?: string[];
}

export interface ReportReviewInput {
  reviewId: string;
  reason: "spam" | "offensive" | "fake" | "irrelevant" | "other";
  details?: string;
}

export interface ModerateReviewInput {
  reviewId: string;
  action: "approve" | "hide" | "delete" | "unflag";
}

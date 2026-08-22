// ============================================================
// RentGuard AI — Shared TypeScript Interfaces
// ============================================================

export type AppMode = "move_out" | "listing" | "delta" | "admin";

export type UserPersona = "tenant" | "manager";

// ----- Move-Out Audit ----------------------------------------

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

// ----- Audit Log ---------------------------------------------

export interface AuditLogItem {
  id: string;
  timestamp: string;
  imagePreview: string; // data URL thumbnail
  result: MoveOutResult;
}

// ----- API Payload / Response --------------------------------

export interface InspectRequest {
  imageBase64: string;
  mode: "move_out" | "listing";
}

export interface DeltaInspectRequest {
  beforeImageBase64: string;
  afterImageBase64: string;
  mode: "delta";
}

export type InspectResponse =
  | { data: MoveOutResult; mode: "move_out" }
  | { data: ListingResult; mode: "listing" }
  | { data: DamageDeltaResult; mode: "delta" }
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

import { MoveOutResult, ListingResult, DamageDeltaResult, StructuredInspectionResult } from "@/types";

// ============================================================
// Mock data used when OPENAI_API_KEY is not set
// Enables full UI testing without a real API key
// ============================================================

export const MOCK_MOVE_OUT_RESULTS: MoveOutResult[] = [
  {
    defect_type: "Wall Scuff Mark",
    classification: "Normal Wear & Tear",
    badge_color: "green",
    legal_reasoning:
      "Minor scuff marks at shoulder height are a classic example of normal wear and tear resulting from everyday living activities. Under the implied warranty of habitability and standard landlord-tenant law in most U.S. jurisdictions, landlords cannot deduct from a security deposit for gradual deterioration caused by ordinary use. This type of superficial marking does not diminish the property's value beyond normal aging.",
    repair_cost_low: 0,
    repair_cost_high: 0,
    confidence: 94,
  },
  {
    defect_type: "Large Carpet Stain",
    classification: "Tenant Damage",
    badge_color: "red",
    legal_reasoning:
      "A large, set-in stain on the carpet exceeds what constitutes normal wear and tear under residential tenancy standards. This type of damage is consistent with negligence or accidental spills that were not properly remediated by the tenant, reducing the property's value and requiring professional cleaning or replacement. Per most state security deposit statutes, the landlord is entitled to deduct the pro-rated cost of repair based on the carpet's remaining useful life.",
    repair_cost_low: 180,
    repair_cost_high: 420,
    confidence: 88,
  },
  {
    defect_type: "Chipped Paint (Door Frame)",
    classification: "Tenant Damage",
    badge_color: "red",
    legal_reasoning:
      "Chipping paint on a door frame beyond minor surface abrasion is typically classified as tenant damage when it results from impact or improper furniture movement. While general paint fading after several years is normal wear, structural paint damage from physical impact exceeds the standard threshold. This will require spot priming and repainting, which is a deductible repair cost.",
    repair_cost_low: 75,
    repair_cost_high: 200,
    confidence: 79,
  },
  {
    defect_type: "Faded Paint (Bedroom Wall)",
    classification: "Normal Wear & Tear",
    badge_color: "green",
    legal_reasoning:
      "Paint fading and minor discoloration from sunlight exposure and the passage of time is universally recognized as normal wear and tear. In most jurisdictions, landlords are expected to repaint rental units every 3-7 years as part of routine maintenance. A tenant cannot be held financially responsible for color fading that occurs through ordinary occupancy.",
    repair_cost_low: 0,
    repair_cost_high: 0,
    confidence: 97,
  },
];

export const MOCK_LISTING_RESULTS: ListingResult[] = [
  {
    key_features: [
      "Hardwood floors throughout",
      "Abundant natural light from south-facing windows",
      "Modern kitchen with stainless steel appliances",
      "Open-concept floor plan",
      "Freshly painted neutral walls",
    ],
    estimated_monthly_rent: 2400,
    headline: "Stunning Open-Concept 1BR with Hardwood Floors & Natural Light",
    description:
      "This beautifully maintained apartment features gleaming hardwood floors and a sun-drenched open layout perfect for modern living. The contemporary kitchen with stainless steel appliances and freshly painted interiors make this a move-in ready gem in a prime location.",
  },
  {
    key_features: [
      "Granite countertops",
      "Updated bathroom with subway tile",
      "Large bedroom with walk-in closet",
      "In-unit washer/dryer hookups",
    ],
    estimated_monthly_rent: 1950,
    headline: "Charming Updated Unit | Granite Kitchen + Walk-In Closet",
    description:
      "Experience elevated rental living with premium granite countertops and a beautifully updated bathroom featuring classic subway tile. The spacious bedroom with walk-in closet and convenient in-unit laundry hookups offer the practicality and comfort you deserve.",
  },
];

// ============================================================
// Mock Delta (Before vs After) Results
// ============================================================
export const MOCK_DELTA_RESULTS: DamageDeltaResult[] = [
  {
    overall_condition_change: "Worsened",
    summary:
      "Comparison of move-in and move-out images reveals the property's overall condition has worsened during the tenancy. Two new damage incidents were identified that were not present in the move-in documentation — a significant wall gouge near the hallway and a cracked bathroom tile. Pre-existing minor scuff marks remain unchanged.",
    pre_existing_damages: [
      {
        area: "Living room — east wall",
        description: "Minor scuff marks at shoulder height from prior tenancy",
        severity: "Minor",
        deductible: false,
        estimated_cost: 0,
      },
    ],
    new_damages: [
      {
        area: "Hallway — north wall",
        description:
          "Large impact gouge approximately 3-inch diameter, likely caused by furniture movement during tenancy",
        severity: "Moderate",
        deductible: true,
        estimated_cost: 185,
      },
      {
        area: "Bathroom — floor tile near vanity",
        description:
          "Single cracked ceramic floor tile with visible hairline fracture extending across full tile width",
        severity: "Moderate",
        deductible: true,
        estimated_cost: 120,
      },
    ],
    total_new_deductible_low: 250,
    total_new_deductible_high: 380,
    tenant_liability: "Partial",
    legal_reasoning:
      "The tenant is partially liable for the two new damages identified in the move-out inspection. The wall gouge exceeds normal wear and tear thresholds as it results from impact rather than gradual deterioration. The cracked bathroom tile similarly constitutes tenant damage under standard residential tenancy law. The pre-existing scuff marks documented in the move-in report are explicitly excluded from the tenant's liability. Total deductible range reflects labor costs in the applicable market.",
    confidence: 84,
  },
  {
    overall_condition_change: "Same",
    summary:
      "The property's overall condition is substantively the same between move-in and move-out. No new damages were identified in the move-out image that were not present at move-in. The pre-existing minor wear visible in the move-in image remains consistent with normal occupancy.",
    pre_existing_damages: [
      {
        area: "Kitchen — backsplash grout",
        description: "Faded and slightly discolored grout lines from normal use and age",
        severity: "Minor",
        deductible: false,
        estimated_cost: 0,
      },
    ],
    new_damages: [],
    total_new_deductible_low: 0,
    total_new_deductible_high: 0,
    tenant_liability: "None",
    legal_reasoning:
      "The tenant has no financial liability for deposit deductions based on this delta analysis. All observed conditions in the move-out image were either pre-existing at move-in or constitute normal wear and tear. Standard landlord-tenant law requires landlords to return the full security deposit when a tenant returns the property in the same condition as received, accounting for ordinary wear.",
    confidence: 91,
  },
];

// ============================================================
// Mock Structured Comprehensive Inspection Results
// ============================================================
export const MOCK_STRUCTURED_INSPECTIONS: StructuredInspectionResult[] = [
  {
    inspection_id: "INSP-7F2A1",
    room: "Modular Kitchen",
    overall_condition: "Minor Wear",
    findings: [
      {
        finding: "Chipped Granite Countertop Edge",
        classification: "moderate_damage",
        confidence: 88,
        description: "Impact fracture measuring 3.2cm along the perimeter edge near sink.",
        evidence: "Move-in photo shows pristine counter edge; move-out photo shows fresh sharp chip.",
        repair_cost_low: 3500,
        repair_cost_high: 5500,
        deposit_impact: 4500,
      },
      {
        finding: "Cabinet Hinge Surface Wear",
        classification: "normal_wear",
        confidence: 96,
        description: "Slight loosening of upper cabinet hinge consistent with daily opening.",
        evidence: "Normal wear pattern across 12-month occupancy; standard adjustment needed.",
        repair_cost_low: 0,
        repair_cost_high: 300,
        deposit_impact: 0,
      },
    ],
    total_repair_cost_low: 3500,
    total_repair_cost_high: 5800,
    recommended_deposit_deduction: 4500,
    estimated_refund: 45500,
    reasoning:
      "The granite countertop chip represents accidental impact damage that exceeds normal wear and tear, warranting a ₹4,500 repair deduction. The cabinet hinge friction is ordinary wear and tear with ₹0 tenant liability under the Model Tenancy Act.",
    security_deposit: 50000,
    timestamp: "2026-08-22T18:30:00Z",
    property: "Tower 4, Flat 1204, CyberCity",
    tenant: "Aditi Sharma",
  },
  {
    inspection_id: "INSP-9E110",
    room: "Master Bedroom",
    overall_condition: "Same",
    findings: [
      {
        finding: "Window Aperture Paint Sun-Fading",
        classification: "normal_wear",
        confidence: 97,
        description: "Gradual UV discoloration of paint adjacent to south window.",
        evidence: "Direct comparison confirms even fading from daylight exposure.",
        repair_cost_low: 0,
        repair_cost_high: 0,
        deposit_impact: 0,
      },
      {
        finding: "Baseboard Vacuum Scuff",
        classification: "normal_wear",
        confidence: 94,
        description: "Superficial surface rub at baseboard level without timber indentation.",
        evidence: "Non-structural cosmetic mark from routine domestic vacuuming.",
        repair_cost_low: 0,
        repair_cost_high: 250,
        deposit_impact: 0,
      },
    ],
    total_repair_cost_low: 0,
    total_repair_cost_high: 250,
    recommended_deposit_deduction: 0,
    estimated_refund: 50000,
    reasoning:
      "All findings constitute normal wear and tear resulting from routine residential occupancy. Full 100% security deposit refund of ₹50,000 is recommended.",
    security_deposit: 50000,
    timestamp: "2026-08-22T18:35:00Z",
    property: "Tower 4, Flat 1204, CyberCity",
    tenant: "Aditi Sharma",
  },
];

// Helper to get a random mock result for demo variety
export function getMockMoveOutResult(): MoveOutResult {
  const idx = Math.floor(Math.random() * MOCK_MOVE_OUT_RESULTS.length);
  return MOCK_MOVE_OUT_RESULTS[idx];
}

export function getMockListingResult(): ListingResult {
  const idx = Math.floor(Math.random() * MOCK_LISTING_RESULTS.length);
  return MOCK_LISTING_RESULTS[idx];
}

export function getMockDeltaResult(): DamageDeltaResult {
  const idx = Math.floor(Math.random() * MOCK_DELTA_RESULTS.length);
  return MOCK_DELTA_RESULTS[idx];
}

export function getMockStructuredInspectionResult(
  room: string = "Living Room",
  securityDeposit: number = 50000
): StructuredInspectionResult {
  const match = MOCK_STRUCTURED_INSPECTIONS.find(
    (i) => i.room.toLowerCase() === room.toLowerCase()
  ) || MOCK_STRUCTURED_INSPECTIONS[0];

  const deduction = Math.min(match.recommended_deposit_deduction, securityDeposit);
  const refund = Math.max(0, securityDeposit - deduction);

  return {
    ...match,
    room,
    security_deposit: securityDeposit,
    recommended_deposit_deduction: deduction,
    estimated_refund: refund,
  };
}

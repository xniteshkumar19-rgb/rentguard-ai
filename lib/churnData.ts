import { ChurnUser, ChurnExecutiveMetric, FeatureImportanceItem } from "@/types";

// ============================================================
// Executive Overview Metrics for ML Churn Dashboard
// ============================================================

export const MOCK_CHURN_METRICS: ChurnExecutiveMetric[] = [
  {
    id: "active_users",
    title: "Total Active Users",
    value: "1,248",
    change: "+8.4%",
    isPositiveTrend: true,
    subtitle: "Active in past 30 days",
  },
  {
    id: "high_risk_rate",
    title: "High Churn Risk Accounts",
    value: "14.0%",
    change: "-2.1%",
    isPositiveTrend: true, // Dropping churn risk is positive
    subtitle: "175 accounts above 75% risk threshold",
  },
  {
    id: "predicted_deletions",
    title: "Predicted 30-Day Deletions",
    value: "18 users",
    change: "-3 vs last mo",
    isPositiveTrend: true,
    subtitle: "Based on XGBoost churn classifier",
  },
  {
    id: "model_accuracy",
    title: "Model ROC-AUC / Accuracy",
    value: "94.2%",
    change: "+1.3%",
    isPositiveTrend: true,
    subtitle: "Trained on 14,200 property audit sessions",
  },
];

// ============================================================
// ML Model Telemetry & Feature Importance Weights
// ============================================================

export const MOCK_FEATURE_IMPORTANCE: FeatureImportanceItem[] = [
  {
    feature: "Inactivity Duration",
    weight: 42,
    category: "Engagement",
    description: "Days elapsed since the user last initiated a damage audit or room listing scan.",
  },
  {
    feature: "Scan Error Frequency",
    weight: 28,
    category: "Technical Friction",
    description: "Repeated blurry photo uploads, lighting rejections, or camera permission failures.",
  },
  {
    feature: "Unresolved App Friction",
    weight: 18,
    category: "Support & Sentiment",
    description: "Open customer support tickets or negative inspection feedback flags.",
  },
  {
    feature: "Disputed Deposit Flag",
    weight: 12,
    category: "Dispute Friction",
    description: "Landlord counter-claim without resolution in move-out deposit arbitration.",
  },
];

// ============================================================
// Interactive User Risk Mock Data
// ============================================================

export const MOCK_CHURN_USERS: ChurnUser[] = [
  {
    id: "usr-001",
    name: "Alex Mercer",
    email: "alex@example.com",
    plan: "Pro Inspector",
    daysInactive: 18,
    supportFrictionScore: 8.8,
    deletionRiskScore: 88,
    riskLevel: "High",
    primaryRiskDriver: "3 Failed Scans + Support Ticket",
    recommendedAction: "Trigger 20% Discount Email",
    status: "Pending Action",
    lastActiveDate: "4 days ago",
  },
  {
    id: "usr-002",
    name: "Sarah Lin",
    email: "sarah.lin@rentalhub.org",
    plan: "Landlord Unlimited",
    daysInactive: 24,
    supportFrictionScore: 7.4,
    deletionRiskScore: 79,
    riskLevel: "High",
    primaryRiskDriver: "Unresolved Deposit Dispute Arbitration",
    recommendedAction: "Dispatch Legal Template Concierge",
    status: "Pending Action",
    lastActiveDate: "24 days ago",
  },
  {
    id: "usr-003",
    name: "Marcus Vance",
    email: "m.vance@propstone.com",
    plan: "Pro Inspector",
    daysInactive: 12,
    supportFrictionScore: 5.4,
    deletionRiskScore: 54,
    riskLevel: "Medium",
    primaryRiskDriver: "Listing Mode Zero Exports",
    recommendedAction: "Send Listing Optimization Tip Guide",
    status: "Pending Action",
    lastActiveDate: "12 days ago",
  },
  {
    id: "usr-004",
    name: "Elena Rostova",
    email: "elena.r@bayapartments.io",
    plan: "Free Tier",
    daysInactive: 9,
    supportFrictionScore: 4.1,
    deletionRiskScore: 42,
    riskLevel: "Medium",
    primaryRiskDriver: "Low Scan Session Frequency",
    recommendedAction: "Trigger Feature Highlight Push Notification",
    status: "Pending Action",
    lastActiveDate: "9 days ago",
  },
  {
    id: "usr-005",
    name: "David Kim",
    email: "david.k@urbanliving.co",
    plan: "Landlord Unlimited",
    daysInactive: 2,
    supportFrictionScore: 1.2,
    deletionRiskScore: 8,
    riskLevel: "Low",
    primaryRiskDriver: "Regular Active Inspections",
    recommendedAction: "None — Healthy & Engaged",
    status: "Risk Mitigated",
    lastActiveDate: "Yesterday",
  },
];

import {
  MOCK_CHURN_METRICS,
  MOCK_FEATURE_IMPORTANCE,
  MOCK_CHURN_USERS,
} from "../lib/churnData";

describe("Admin ML Churn Dashboard - Metrics", () => {
  it("contains 4 executive metric entries", () => {
    expect(MOCK_CHURN_METRICS).toHaveLength(4);
  });

  it("contains required metric fields", () => {
    for (const metric of MOCK_CHURN_METRICS) {
      expect(typeof metric.id).toBe("string");
      expect(typeof metric.title).toBe("string");
      expect(typeof metric.value).toBe("string");
      expect(typeof metric.change).toBe("string");
      expect(typeof metric.subtitle).toBe("string");
      expect(typeof metric.isPositiveTrend).toBe("boolean");
    }
  });

  it("includes expected active user and accuracy metrics", () => {
    const activeUsers = MOCK_CHURN_METRICS.find((m) => m.id === "active_users");
    expect(activeUsers).toBeDefined();
    expect(activeUsers?.value).toBe("1,248");

    const accuracy = MOCK_CHURN_METRICS.find((m) => m.id === "model_accuracy");
    expect(accuracy).toBeDefined();
    expect(accuracy?.value).toBe("94.2%");
  });
});

describe("Admin ML Churn Dashboard - Feature Importance", () => {
  it("contains all key predictive drivers", () => {
    expect(MOCK_FEATURE_IMPORTANCE.length).toBeGreaterThanOrEqual(4);
    const featureNames = MOCK_FEATURE_IMPORTANCE.map((f) => f.feature);
    expect(featureNames).toContain("Inactivity Duration");
    expect(featureNames).toContain("Scan Error Frequency");
    expect(featureNames).toContain("Unresolved App Friction");
  });

  it("feature weights sum to 100%", () => {
    const totalWeight = MOCK_FEATURE_IMPORTANCE.reduce(
      (sum, item) => sum + item.weight,
      0
    );
    expect(totalWeight).toBe(100);
  });

  it("each feature has descriptive explanation", () => {
    for (const item of MOCK_FEATURE_IMPORTANCE) {
      expect(item.description.length).toBeGreaterThan(15);
      expect(typeof item.category).toBe("string");
    }
  });
});

describe("Admin ML Churn Dashboard - Mock Users", () => {
  it("contains mock users with valid risk scores", () => {
    expect(MOCK_CHURN_USERS.length).toBeGreaterThanOrEqual(5);

    for (const user of MOCK_CHURN_USERS) {
      expect(user.deletionRiskScore).toBeGreaterThanOrEqual(0);
      expect(user.deletionRiskScore).toBeLessThanOrEqual(100);
      expect(user.supportFrictionScore).toBeGreaterThanOrEqual(0);
      expect(user.supportFrictionScore).toBeLessThanOrEqual(10);
      expect(["High", "Medium", "Low"]).toContain(user.riskLevel);
      expect(["Pending Action", "Intervention Sent", "Risk Mitigated"]).toContain(
        user.status
      );
    }
  });

  it("classifies high risk scores correctly", () => {
    const alex = MOCK_CHURN_USERS.find((u) => u.email === "alex@example.com");
    expect(alex).toBeDefined();
    expect(alex?.riskLevel).toBe("High");
    expect(alex?.deletionRiskScore).toBe(88);
    expect(alex?.primaryRiskDriver).toContain("3 Failed Scans");
    expect(alex?.recommendedAction).toContain("20% Discount");
  });

  it("includes Low risk healthy benchmark user", () => {
    const lowRiskUser = MOCK_CHURN_USERS.find((u) => u.riskLevel === "Low");
    expect(lowRiskUser).toBeDefined();
    expect(lowRiskUser?.deletionRiskScore).toBeLessThan(20);
  });
});

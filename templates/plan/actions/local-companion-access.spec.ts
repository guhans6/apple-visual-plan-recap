import { describe, expect, it } from "vitest";

const getCompanionPlan = (await import("./get-companion-plan.js")).default;
const getCompanionFeedback = (await import("./get-companion-feedback.js"))
  .default;
const listCompanionDashboard = (
  await import("./list-companion-dashboard.js")
).default;

describe("local companion action access", () => {
  it("marks local companion read actions as anonymous HTTP actions", () => {
    expect(getCompanionPlan.requiresAuth).toBe(false);
    expect(getCompanionFeedback.requiresAuth).toBe(false);
    expect(listCompanionDashboard.requiresAuth).toBe(false);
  });
});

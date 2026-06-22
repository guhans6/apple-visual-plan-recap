import { describe, expect, it } from "vitest";

const getCompanionPlan = (await import("./get-companion-plan.js")).default;
const getCompanionFeedback = (await import("./get-companion-feedback.js"))
  .default;
const listCompanionDashboard = (
  await import("./list-companion-dashboard.js")
).default;
const updateCompanionFeedback = (
  await import("./update-companion-feedback.js")
).default;
const resolveCompanionFeedback = (
  await import("./resolve-companion-feedback.js")
).default;
const consumeCompanionFeedback = (
  await import("./consume-companion-feedback.js")
).default;

describe("local companion action access", () => {
  it("marks local companion actions as anonymous HTTP actions", () => {
    expect(getCompanionPlan.requiresAuth).toBe(false);
    expect(getCompanionFeedback.requiresAuth).toBe(false);
    expect(listCompanionDashboard.requiresAuth).toBe(false);
    expect(updateCompanionFeedback.requiresAuth).toBe(false);
    expect(resolveCompanionFeedback.requiresAuth).toBe(false);
    expect(consumeCompanionFeedback.requiresAuth).toBe(false);
  });
});

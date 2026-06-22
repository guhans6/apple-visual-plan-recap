import { describe, expect, it } from "vitest";
import {
  navigationPathForCommand,
  type NavigationState,
} from "./use-navigation-state";

describe("use-navigation-state helpers", () => {
  it("routes local artifact navigation commands to companion routes", () => {
    expect(
      navigationPathForCommand({
        view: "plan",
        localPlanSlug: "checkout-flow",
        localPlanPath: "docs/visual-companion/plans/checkout-flow",
      }),
    ).toBe(
      "/companion/plans/checkout-flow?path=docs%2Fvisual-companion%2Fplans%2Fcheckout-flow",
    );
  });

  it("falls back to the dashboard for legacy generic plan ids", () => {
    expect(
      navigationPathForCommand({
        view: "plan",
        planId: "plan_123",
      } satisfies NavigationState),
    ).toBe("/");
  });
});

import { describe, expect, it } from "vitest";
import {
  companionPathForLocalArtifact,
  isCompanionDetailPath,
  routeStateForLocation,
  viewForPath,
} from "./navigation-paths";

describe("navigation paths", () => {
  it("treats companion artifact routes as detail views", () => {
    expect(isCompanionDetailPath("/companion/plans/checkout-flow")).toBe(true);
    expect(isCompanionDetailPath("/companion/recaps/checkout-flow")).toBe(true);
    expect(viewForPath("/companion/plans/checkout-flow")).toBe("plan");
    expect(viewForPath("/")).toBe("plans");
  });

  it("derives local companion navigation state from companion routes", () => {
    expect(
      routeStateForLocation(
        "/companion/recaps/checkout-flow",
        "?path=docs/visual-companion/recaps/checkout-flow",
      ),
    ).toEqual({
      view: "plan",
      planId: "local-checkout-flow",
      localPlanSlug: "checkout-flow",
      localPlanPath: "docs/visual-companion/recaps/checkout-flow",
    });
  });

  it("maps local artifact navigation commands back to companion routes", () => {
    expect(companionPathForLocalArtifact("checkout-flow")).toBe(
      "/companion/plans/checkout-flow",
    );
    expect(
      companionPathForLocalArtifact(
        "checkout-flow-recap",
        "docs/visual-companion/recaps/checkout-flow-recap",
      ),
    ).toBe(
      "/companion/recaps/checkout-flow-recap?path=docs%2Fvisual-companion%2Frecaps%2Fcheckout-flow-recap",
    );
  });

  it("does not treat legacy review routes as supported companion detail routes", () => {
    expect(isCompanionDetailPath("/review/plan_123")).toBe(false);
    expect(viewForPath("/review/plan_123")).toBe("plans");
    expect(routeStateForLocation("/review/plan_123", "")).toEqual({
      view: "plans",
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useActionMutation: vi.fn(),
  useActionQuery: vi.fn(),
}));

vi.mock("@agent-native/core/client", () => ({
  useActionMutation: mocks.useActionMutation,
  useActionQuery: mocks.useActionQuery,
}));

import {
  companionPlanQueryKey,
  useCompanionFeedback,
  useCompanionDashboard,
  useCompanionPlan,
  useConsumeCompanionFeedback,
  useResolveCompanionFeedback,
  useUpdateCompanionFeedback,
} from "./use-companion-plan";

describe("use companion plan hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useActionQuery.mockReturnValue({ data: undefined });
    mocks.useActionMutation.mockReturnValue({ mutate: vi.fn() });
  });

  it("uses clean companion action names", () => {
    useCompanionPlan("settings-flow", "plan", "plans/settings-flow");
    useCompanionFeedback("settings-flow");
    useCompanionDashboard();
    useUpdateCompanionFeedback();
    useResolveCompanionFeedback();
    useConsumeCompanionFeedback();

    expect(companionPlanQueryKey("settings-flow", "plan")).toEqual([
      "action",
      "get-companion-plan",
      { slug: "settings-flow", kind: "plan" },
    ]);
    expect(mocks.useActionQuery).toHaveBeenCalledWith(
      "get-companion-plan",
      { slug: "settings-flow", kind: "plan", path: "plans/settings-flow" },
      expect.objectContaining({ enabled: true }),
    );
    expect(mocks.useActionQuery).toHaveBeenCalledWith(
      "get-companion-feedback",
      { slug: "settings-flow" },
      expect.objectContaining({ enabled: true }),
    );
    expect(mocks.useActionQuery).toHaveBeenCalledWith(
      "list-companion-dashboard",
      { includeAdditionalSources: false },
      expect.objectContaining({ enabled: true }),
    );
    expect(mocks.useActionMutation).toHaveBeenCalledWith(
      "update-companion-feedback",
      {},
    );
    expect(mocks.useActionMutation).toHaveBeenCalledWith(
      "resolve-companion-feedback",
      {},
    );
    expect(mocks.useActionMutation).toHaveBeenCalledWith(
      "consume-companion-feedback",
      {},
    );
  });
});

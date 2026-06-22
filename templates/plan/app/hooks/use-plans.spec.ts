import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  useActionMutation: vi.fn(),
  useActionQuery: vi.fn(),
}));

vi.mock("@agent-native/core/client", () => ({
  useActionMutation: mocks.useActionMutation,
  useActionQuery: mocks.useActionQuery,
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

import * as planHooks from "./use-plans";

describe("usePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useActionQuery.mockReturnValue({ data: undefined });
  });

  it("keeps legacy HTML in detail reads while skipping MDX export", () => {
    planHooks.usePlan("plan_123");

    expect(mocks.useActionQuery).toHaveBeenCalledWith(
      "get-visual-plan",
      { id: "plan_123", includeMdx: false, includeHtml: true },
      expect.objectContaining({
        enabled: true,
        refetchInterval: expect.any(Function),
      }),
    );
  });

  it("does not expose the removed hosted plan hook surface", () => {
    expect("useUpdatePlanComments" in planHooks).toBe(false);
    expect("useDeletePlanComment" in planHooks).toBe(false);
    expect("useDeletePlan" in planHooks).toBe(false);
    expect("usePlanVersions" in planHooks).toBe(false);
    expect("usePlanVersion" in planHooks).toBe(false);
    expect("useRestorePlanVersion" in planHooks).toBe(false);
    expect("useImportPlanSource" in planHooks).toBe(false);
    expect("useExportPlan" in planHooks).toBe(false);
  });
});

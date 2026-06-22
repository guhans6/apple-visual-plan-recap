// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const hookMocks = vi.hoisted(() => ({
  usePlanVersions: vi.fn(),
  usePlanVersion: vi.fn(),
  useRestorePlanVersion: vi.fn(),
}));

vi.mock("@/hooks/use-plans", () => ({
  usePlanVersions: hookMocks.usePlanVersions,
  usePlanVersion: hookMocks.usePlanVersion,
  useRestorePlanVersion: hookMocks.useRestorePlanVersion,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: unknown }) => <>{children}</>,
  SheetContent: ({ children }: { children: unknown }) => <>{children}</>,
  SheetDescription: ({ children }: { children: unknown }) => <>{children}</>,
  SheetHeader: ({ children }: { children: unknown }) => <>{children}</>,
  SheetTitle: ({ children }: { children: unknown }) => <>{children}</>,
}));

import { HostedPlanHistorySheet } from "./HostedPlanHistorySheet";

describe("HostedPlanHistorySheet", () => {
  it("renders the hosted plan history surface from isolated version hooks", () => {
    hookMocks.usePlanVersions.mockReturnValue({
      data: { versions: [] },
      isLoading: false,
    });
    hookMocks.usePlanVersion.mockReturnValue({
      data: null,
      isLoading: false,
    });
    hookMocks.useRestorePlanVersion.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });

    const html = renderToStaticMarkup(
      <HostedPlanHistorySheet
        planId="plan-123"
        open
        onOpenChange={() => {}}
        canRestore
      />,
    );

    expect(html).toContain("Plan history");
    expect(html).toContain("No saved versions yet");
  });
});

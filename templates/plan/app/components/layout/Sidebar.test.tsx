import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Sidebar } from "./Sidebar";

const hookMocks = vi.hoisted(() => ({
  useCompanionDashboard: vi.fn(),
}));

vi.mock("@/hooks/use-companion-plan", () => ({
  useCompanionDashboard: hookMocks.useCompanionDashboard,
}));

describe("Sidebar", () => {
  it("lists companion plans and recaps from the dashboard model", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        currentProject: {
          plans: [
            {
              slug: "checkout-flow",
              title: "Checkout Flow",
              routePath: "/companion/plans/checkout-flow",
              repoPath: "docs/visual-companion/plans/checkout-flow",
              updatedAt: "2026-06-22T10:00:00.000Z",
            },
          ],
          recaps: [
            {
              slug: "checkout-flow-recap",
              title: "Checkout Flow Recap",
              routePath: "/companion/recaps/checkout-flow-recap",
              repoPath: "docs/visual-companion/recaps/checkout-flow-recap",
              updatedAt: "2026-06-22T10:30:00.000Z",
            },
          ],
        },
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/companion/plans/checkout-flow"]}>
        <Sidebar collapsed={false} />
      </MemoryRouter>,
    );

    expect(html).toContain("Artifacts");
    expect(html).toContain("Checkout Flow");
    expect(html).toContain("Checkout Flow Recap");
    expect(html).toContain("/companion/plans/checkout-flow");
    expect(html).toContain("/companion/recaps/checkout-flow-recap");
    expect(html).toContain("Recap");
    expect(html).not.toContain("New plan");
  });

  it("shows a companion-specific empty state", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        currentProject: {
          plans: [],
          recaps: [],
        },
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Sidebar collapsed={false} />
      </MemoryRouter>,
    );

    expect(html).toContain("No companion artifacts yet.");
  });

  it("keeps a query-backed companion artifact highlighted when opened from a repo path", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        currentProject: {
          plans: [
            {
              slug: "external-plan",
              title: "External Plan",
              routePath:
                "/companion/plans/external-plan?path=docs%2Fvisual-companion%2Fplans%2Fexternal-plan",
              repoPath: "docs/visual-companion/plans/external-plan",
              updatedAt: "2026-06-22T10:00:00.000Z",
            },
          ],
          recaps: [],
        },
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter
        initialEntries={[
          "/companion/plans/external-plan?path=docs%2Fvisual-companion%2Fplans%2Fexternal-plan",
        ]}
      >
        <Sidebar collapsed={false} />
      </MemoryRouter>,
    );

    expect(html).toContain(
      'href="/companion/plans/external-plan?path=docs%2Fvisual-companion%2Fplans%2Fexternal-plan"',
    );
    expect(html).toContain(
      "bg-sidebar-accent text-sidebar-accent-foreground",
    );
  });
});

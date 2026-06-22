import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";

const hookMocks = vi.hoisted(() => ({
  useCompanionDashboard: vi.fn(),
}));

vi.mock("@/hooks/use-companion-plan", () => ({
  useCompanionDashboard: hookMocks.useCompanionDashboard,
}));

import { CompanionHomePage } from "./CompanionHomePage";

describe("CompanionHomePage", () => {
  it("renders current-project plans and recaps from the dashboard model", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        companionRuntime: true,
        currentProject: {
          repoRoot: "/repo",
          companionRoot: "/repo/docs/visual-companion",
          planRoot: "/repo/docs/visual-companion/plans",
          recapRoot: "/repo/docs/visual-companion/recaps",
          plans: [
            {
              slug: "checkout-flow",
              title: "Checkout Flow",
              kind: "plan",
              routePath: "/companion/plans/checkout-flow",
              repoPath: "docs/visual-companion/plans/checkout-flow",
              updatedAt: null,
            },
          ],
          recaps: [
            {
              slug: "checkout-flow-recap",
              title: "Checkout Flow Recap",
              kind: "recap",
              routePath: "/companion/recaps/checkout-flow-recap",
              repoPath: "docs/visual-companion/recaps/checkout-flow-recap",
              updatedAt: null,
            },
          ],
        },
        additionalSources: [],
        additionalSourcesAvailable: false,
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionHomePage />
      </MemoryRouter>,
    );

    expect(html).toContain("Current project");
    expect(html).toContain("Checkout Flow");
    expect(html).toContain("Checkout Flow Recap");
    expect(html).toContain("/companion/plans/checkout-flow");
    expect(html).toContain("/companion/recaps/checkout-flow-recap");
    expect(html).toContain("/repo/docs/visual-companion");
  });

  it("shows a project-local empty state when no artifacts exist yet", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        companionRuntime: true,
        currentProject: {
          repoRoot: "/repo",
          companionRoot: "/repo/docs/visual-companion",
          planRoot: "/repo/docs/visual-companion/plans",
          recapRoot: "/repo/docs/visual-companion/recaps",
          plans: [],
          recaps: [],
        },
        additionalSources: [],
        additionalSourcesAvailable: false,
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionHomePage />
      </MemoryRouter>,
    );

    expect(html).toContain("No companion artifacts yet");
    expect(html).toContain("/repo/docs/visual-companion");
  });

  it("keeps other sources behind an explicit collapsed section by default", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: {
        companionRuntime: true,
        currentProject: {
          repoRoot: "/repo",
          companionRoot: "/repo/docs/visual-companion",
          planRoot: "/repo/docs/visual-companion/plans",
          recapRoot: "/repo/docs/visual-companion/recaps",
          plans: [],
          recaps: [],
        },
        additionalSources: [
          {
            id: "shared",
            label: "Shared workspace",
            plans: [],
            recaps: [],
          },
        ],
        additionalSourcesAvailable: true,
      },
      isLoading: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionHomePage />
      </MemoryRouter>,
    );

    expect(html).toContain("Other sources");
    expect(html).not.toContain("Shared workspace");
  });

  it("shows an explicit error state when the dashboard query fails", () => {
    hookMocks.useCompanionDashboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Invalid action parameters"),
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionHomePage />
      </MemoryRouter>,
    );

    expect(html).toContain("Couldn&#x27;t load the companion dashboard");
    expect(html).toContain("Invalid action parameters");
  });
});

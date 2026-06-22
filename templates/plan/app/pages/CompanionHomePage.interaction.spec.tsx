// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => ({
  useCompanionDashboard: vi.fn(),
}));

vi.mock("@/hooks/use-companion-plan", () => ({
  useCompanionDashboard: hookMocks.useCompanionDashboard,
}));

import { CompanionHomePage } from "./CompanionHomePage";

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
});

function render() {
  act(() =>
    root.render(
      <MemoryRouter>
        <CompanionHomePage />
      </MemoryRouter>,
    ),
  );
}

describe("CompanionHomePage interactions", () => {
  it("reveals other-source plans and recaps only after toggling the section open", () => {
    hookMocks.useCompanionDashboard.mockImplementation(
      (includeAdditionalSources: boolean) => ({
        data: {
          companionRuntime: true,
          currentProject: {
            repoRoot: "/repo",
            companionRoot: "/repo/docs/visual-companion",
            planRoot: "/repo/docs/visual-companion/plans",
            recapRoot: "/repo/docs/visual-companion/recaps",
            plans: [],
            recaps: [],
            starterArtifacts: [],
          },
          additionalSources: includeAdditionalSources
            ? [
                {
                  id: "other-repo",
                  label: "other-repo",
                  plans: [
                    {
                      slug: "external-plan",
                      title: "External Plan",
                      kind: "plan",
                      routePath: "/companion/plans/external-plan?path=docs%2Fvisual-companion%2Fplans%2Fexternal-plan",
                      repoPath: "docs/visual-companion/plans/external-plan",
                      updatedAt: null,
                    },
                  ],
                  recaps: [
                    {
                      slug: "external-recap",
                      title: "External Recap",
                      kind: "recap",
                      routePath: "/companion/recaps/external-recap?path=docs%2Fvisual-companion%2Frecaps%2Fexternal-recap",
                      repoPath: "docs/visual-companion/recaps/external-recap",
                      updatedAt: null,
                    },
                  ],
                },
              ]
            : [],
          additionalSourcesAvailable: includeAdditionalSources,
        },
        isLoading: false,
        error: undefined,
      }),
    );

    render();

    expect(container.textContent).not.toContain("External Plan");
    expect(container.textContent).not.toContain("External Recap");

    const button = container.querySelector("button") as HTMLButtonElement;
    act(() => button.click());

    expect(container.textContent).toContain("other-repo");
    expect(container.textContent).toContain("External Plan");
    expect(container.textContent).toContain("External Recap");
  });
});

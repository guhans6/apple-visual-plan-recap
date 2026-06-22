import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PlanContent } from "../../shared/plan-content.js";
import { writePlanLocalFolder } from "./local-plan-files.js";
import { listLocalCompanionDashboard } from "./local-companion-dashboard.js";

function sampleContent(title: string): PlanContent {
  return {
    version: 2,
    title,
    brief: `${title} brief`,
    blocks: [
      {
        id: "summary",
        type: "rich-text",
        title: "Summary",
        data: { markdown: `Review ${title}.` },
      },
    ],
  };
}

describe("local-companion-dashboard", () => {
  let tmpDir: string;
  let savedRepoRoot: string | undefined;
  let savedPlanLocalDir: string | undefined;
  let siblingRoots: string[];

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "local-dashboard-"));
    siblingRoots = [];
    savedRepoRoot = process.env.PLAN_REPO_ROOT;
    savedPlanLocalDir = process.env.PLAN_LOCAL_DIR;
    process.env.PLAN_REPO_ROOT = tmpDir;
    delete process.env.PLAN_LOCAL_DIR;
  });

  afterEach(async () => {
    if (savedRepoRoot === undefined) delete process.env.PLAN_REPO_ROOT;
    else process.env.PLAN_REPO_ROOT = savedRepoRoot;
    if (savedPlanLocalDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedPlanLocalDir;
    await Promise.all(
      siblingRoots.map((root) => fs.rm(root, { recursive: true, force: true })),
    );
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns the current project companion roots even before artifacts exist", async () => {
    await writeStarterArtifact(tmpDir, "generic-workflow-demo", {
      title: "Generic Service Rollout Plan",
      brief: "Generic demo brief",
      kind: "plan",
    });
    await writeStarterArtifact(tmpDir, "apple-workflow-recap-demo", {
      title: "Apple Settings Sync Recap",
      brief: "Apple recap brief",
      kind: "recap",
    });

    const result = await listLocalCompanionDashboard();

    expect(result.companionRuntime).toBe(true);
    expect(result.currentProject.repoRoot).toBe(tmpDir);
    expect(result.currentProject.companionRoot).toBe(
      path.join(tmpDir, "docs", "visual-companion"),
    );
    expect(result.currentProject.planRoot).toBe(
      path.join(tmpDir, "docs", "visual-companion", "plans"),
    );
    expect(result.currentProject.recapRoot).toBe(
      path.join(tmpDir, "docs", "visual-companion", "recaps"),
    );
    expect(result.currentProject.plans).toEqual([]);
    expect(result.currentProject.recaps).toEqual([]);
    expect(result.currentProject.starterArtifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "generic-workflow-demo",
          title: "Generic Service Rollout Plan",
          kind: "plan",
          repoPath: "templates/plan/plans/generic-workflow-demo",
        }),
        expect.objectContaining({
          slug: "apple-workflow-recap-demo",
          title: "Apple Settings Sync Recap",
          kind: "recap",
          repoPath: "templates/plan/plans/apple-workflow-recap-demo",
        }),
      ]),
    );
    expect(result.additionalSources).toEqual([]);
    expect(result.additionalSourcesAvailable).toBe(false);
  });

  it("lists current-project plans and recaps with local companion open paths", async () => {
    await writePlanLocalFolder({
      planId: "plan_checkout",
      slug: "checkout-flow",
      title: "Checkout Flow",
      brief: "Plan the checkout flow",
      content: sampleContent("Checkout Flow"),
      path: "docs/visual-companion/plans/checkout-flow",
      url: "/companion/plans/checkout-flow",
    });
    await writePlanLocalFolder({
      planId: "recap_checkout",
      slug: "checkout-flow-recap",
      title: "Checkout Flow Recap",
      brief: "Recap the checkout flow",
      content: sampleContent("Checkout Flow Recap"),
      path: "docs/visual-companion/recaps/checkout-flow-recap",
      url: "/companion/recaps/checkout-flow-recap",
    });

    const result = await listLocalCompanionDashboard();

    expect(result.currentProject.plans).toEqual([
      expect.objectContaining({
        slug: "checkout-flow",
        title: "Checkout Flow",
        kind: "plan",
        routePath: "/companion/plans/checkout-flow",
        repoPath: "docs/visual-companion/plans/checkout-flow",
      }),
    ]);
    expect(result.currentProject.recaps).toEqual([
      expect.objectContaining({
        slug: "checkout-flow-recap",
        title: "Checkout Flow Recap",
        kind: "recap",
        routePath: "/companion/recaps/checkout-flow-recap",
        repoPath: "docs/visual-companion/recaps/checkout-flow-recap",
      }),
    ]);
    expect(result.currentProject.starterArtifacts).toEqual([]);
  });

  it("skips malformed local artifact folders without failing the dashboard", async () => {
    await fs.mkdir(
      path.join(tmpDir, "docs", "visual-companion", "plans", "broken-flow"),
      { recursive: true },
    );
    await writePlanLocalFolder({
      planId: "plan_valid",
      slug: "valid-flow",
      title: "Valid Flow",
      brief: "Plan the valid flow",
      content: sampleContent("Valid Flow"),
      path: "docs/visual-companion/plans/valid-flow",
      url: "/companion/plans/valid-flow",
    });

    const result = await listLocalCompanionDashboard();

    expect(result.currentProject.plans).toEqual([
      expect.objectContaining({
        slug: "valid-flow",
        title: "Valid Flow",
      }),
    ]);
  });

  it("uses PLAN_LOCAL_DIR as the active plan root when the companion directory is explicitly overridden", async () => {
    process.env.PLAN_LOCAL_DIR = "plans";
    await writePlanLocalFolder({
      planId: "plan_override",
      slug: "override-flow",
      title: "Override Flow",
      brief: "Plan the override flow",
      content: sampleContent("Override Flow"),
      path: "plans/override-flow",
      url: "/companion/plans/override-flow",
    });

    const result = await listLocalCompanionDashboard();

    expect(result.currentProject.planRoot).toBe(path.join(tmpDir, "plans"));
    expect(result.currentProject.recapRoot).toBe(path.join(tmpDir, "recaps"));
    expect(result.currentProject.plans).toEqual([
      expect.objectContaining({
        slug: "override-flow",
        title: "Override Flow",
        repoPath: "plans/override-flow",
      }),
    ]);
  });

  it("keeps sibling repo companion artifacts hidden until explicitly requested", async () => {
    const siblingRoot = path.join(path.dirname(tmpDir), "sibling-hidden");
    siblingRoots.push(siblingRoot);
    await writeStaticCompanionPlan(siblingRoot, "plans", "sibling-flow", {
      title: "Sibling Flow",
      brief: "Sibling Flow brief",
    });

    const result = await listLocalCompanionDashboard();

    expect(result.additionalSources).toEqual([]);
    expect(result.additionalSourcesAvailable).toBe(false);
  });

  it("lists sibling repo companion artifacts when explicitly requested", async () => {
    const siblingRoot = path.join(path.dirname(tmpDir), "sibling-visible");
    siblingRoots.push(siblingRoot);
    await writeStaticCompanionPlan(siblingRoot, "plans", "sibling-flow", {
      title: "Sibling Flow",
      brief: "Sibling Flow brief",
    });
    await writeStaticCompanionPlan(siblingRoot, "recaps", "sibling-recap", {
      title: "Sibling Recap",
      brief: "Sibling Recap brief",
      kind: "recap",
    });

    const result = await listLocalCompanionDashboard({
      includeAdditionalSources: true,
    });

    expect(result.additionalSourcesAvailable).toBe(true);
    expect(result.additionalSources).toEqual([
      expect.objectContaining({
        label: "sibling-visible",
        plans: [
          expect.objectContaining({
            slug: "sibling-flow",
            title: "Sibling Flow",
          }),
        ],
        recaps: [
          expect.objectContaining({
            slug: "sibling-recap",
            title: "Sibling Recap",
          }),
        ],
      }),
    ]);
  });
});

async function writeStaticCompanionPlan(
  repoRoot: string,
  kind: "plans" | "recaps",
  slug: string,
  input: { title: string; brief: string; kind?: "plan" | "recap" },
) {
  await fs.mkdir(path.join(repoRoot, ".git"), { recursive: true });
  const folder = path.join(
    repoRoot,
    "docs",
    "visual-companion",
    kind,
    slug,
  );
  await fs.mkdir(folder, { recursive: true });
  const frontmatter =
    input.kind === "recap"
      ? `---\ntitle: ${input.title}\nbrief: ${input.brief}\nkind: recap\n---\n`
      : `---\ntitle: ${input.title}\nbrief: ${input.brief}\n---\n`;
  await fs.writeFile(
    path.join(folder, "plan.mdx"),
    `${frontmatter}\n# ${input.title}\n`,
    "utf-8",
  );
}

async function writeStarterArtifact(
  repoRoot: string,
  slug: string,
  input: { title: string; brief: string; kind: "plan" | "recap" },
) {
  const folder = path.join(repoRoot, "templates", "plan", "plans", slug);
  await fs.mkdir(folder, { recursive: true });
  const frontmatter =
    input.kind === "recap"
      ? `---\ntitle: ${input.title}\nbrief: ${input.brief}\nkind: recap\n---\n`
      : `---\ntitle: ${input.title}\nbrief: ${input.brief}\n---\n`;
  await fs.writeFile(
    path.join(folder, "plan.mdx"),
    `${frontmatter}\n# ${input.title}\n`,
    "utf-8",
  );
}

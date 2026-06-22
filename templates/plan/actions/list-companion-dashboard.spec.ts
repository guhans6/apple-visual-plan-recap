import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanContent } from "../shared/plan-content.js";
import { writePlanLocalFolder } from "../server/lib/local-plan-files.js";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const action = (
  await import("./list-companion-dashboard.js")
).default as {
  run: (args: { includeAdditionalSources?: boolean }) => Promise<{
    companionRuntime: boolean;
    currentProject: {
      plans: Array<{ slug: string; title: string }>;
      recaps: Array<{ slug: string; title: string }>;
      starterArtifacts: Array<{
        slug: string;
        title: string;
        kind: "plan" | "recap";
      }>;
    } | null;
  }>;
};

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

describe("list-companion-dashboard action", () => {
  let tmpDir: string;
  let savedRepoRoot: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dashboard-action-"));
    savedRepoRoot = process.env.PLAN_REPO_ROOT;
    savedNodeEnv = process.env.NODE_ENV;
    process.env.PLAN_REPO_ROOT = tmpDir;
    process.env.NODE_ENV = "test";
  });

  afterEach(async () => {
    if (savedRepoRoot === undefined) delete process.env.PLAN_REPO_ROOT;
    else process.env.PLAN_REPO_ROOT = savedRepoRoot;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns the current project dashboard model by default in companion runtime", async () => {
    await writePlanLocalFolder({
      planId: "plan_settings",
      slug: "settings-flow",
      title: "Settings Flow",
      brief: "Plan the settings flow",
      content: sampleContent("Settings Flow"),
      path: "docs/visual-companion/plans/settings-flow",
      url: "/companion/plans/settings-flow",
    });

    const result = await action.run({});

    expect(result.companionRuntime).toBe(true);
    expect(result.currentProject?.plans).toEqual([
      expect.objectContaining({
        slug: "settings-flow",
        title: "Settings Flow",
      }),
    ]);
    expect(result.currentProject?.recaps).toEqual([]);
    expect(result.currentProject?.starterArtifacts).toEqual([]);
  });

  it("returns repo-local starter artifacts when the current project has no companion folders yet", async () => {
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

    const result = await action.run({});

    expect(result.currentProject?.plans).toEqual([]);
    expect(result.currentProject?.recaps).toEqual([]);
    expect(result.currentProject?.starterArtifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "generic-workflow-demo",
          kind: "plan",
        }),
        expect.objectContaining({
          slug: "apple-workflow-recap-demo",
          kind: "recap",
        }),
      ]),
    );
  });

  it("accepts boolean query-string values for includeAdditionalSources", () => {
    expect(action.schema.parse({ includeAdditionalSources: "false" })).toEqual({
      includeAdditionalSources: false,
    });
    expect(action.schema.parse({ includeAdditionalSources: "true" })).toEqual({
      includeAdditionalSources: true,
    });
  });
});

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

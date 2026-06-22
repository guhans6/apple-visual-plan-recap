import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function assertMissing(relativePath) {
  await assert.rejects(access(path.join(root, relativePath)));
}

test("old root prototype files are removed", async () => {
  const obsoletePaths = [
    "src/local-plan-server.js",
    "src/local-feedback.js",
    "examples/apple-settings-pane",
    "skills/visual-plan",
    "skills/visual-recap",
    "test/local-plan-server.test.mjs",
    "test/local-feedback.test.mjs",
    "scripts/serve-local-plan.mjs",
    "scripts/check-skills.mjs",
    "scripts/validate-sample-plan.mjs",
  ];

  for (const relativePath of obsoletePaths) {
    await assertMissing(relativePath);
  }
});

test("imported upstream trees are removed after promotion", async () => {
  const importedTrees = [
    "BuilderIO-agent-native",
    "BuilderIO-agent-native-restructure",
    "BuilderIO-skills",
  ];

  for (const relativePath of importedTrees) {
    await assertMissing(relativePath);
  }
});

test("legacy apple and hosted-era root docs are removed", async () => {
  const obsoleteDocs = [
    "docs/feedback/local-feedback-contract.md",
    "docs/issues/apple-visual-plan-recap-issues.md",
    "docs/issues/agent-native-generic-apple-visual-workflow-issues.md",
    "docs/prd/apple-visual-plan-recap-prd.md",
    "docs/prd/agent-native-generic-apple-visual-workflow-prd.md",
    "docs/reviews/apple-visual-gatekeeper-review.md",
    "docs/reviews/apple-visual-implementation-gatekeeper-review.md",
    "docs/reviews/agent-native-generic-apple-gatekeeper-review.md",
    "docs/self-hosting.md",
    "docs/superpowers/specs/2026-06-18-agent-native-generic-apple-visual-workflow-design.md",
    "docs/superpowers/plans/2026-06-17-apple-visual-plan-recap.md",
  ];

  for (const relativePath of obsoleteDocs) {
    await assertMissing(relativePath);
  }
});

test("orphaned hosted plan app surfaces are removed after companion extraction", async () => {
  const obsoleteAppPaths = [
    "templates/plan/app/pages/PlansPage.tsx",
    "templates/plan/app/pages/PlansPage.comments.test.ts",
    "templates/plan/app/pages/HostedPlanHistorySheet.tsx",
    "templates/plan/app/pages/HostedPlanHistorySheet.test.tsx",
  ];

  for (const relativePath of obsoleteAppPaths) {
    await assertMissing(relativePath);
  }
});

test("promoted skill catalog keeps only the retained companion entries", async () => {
  const catalogRoot = path.join(root, "packages/skills/catalog");
  const entries = (await readdir(catalogRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(entries, ["quick-recap", "visual-plan", "visual-recap"]);
});

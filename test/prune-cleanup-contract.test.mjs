import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
    "templates/plan/app/hooks/use-plans.ts",
    "templates/plan/app/hooks/use-plans.spec.ts",
  ];

  for (const relativePath of obsoleteAppPaths) {
    await assertMissing(relativePath);
  }
});

test("hosted generic plan actions are removed", async () => {
  const obsoleteActionPaths = [
    "templates/plan/actions/list-visual-plans.ts",
    "templates/plan/actions/get-visual-plan.ts",
    "templates/plan/actions/get-plan-feedback.ts",
    "templates/plan/actions/reply-to-plan-comment.ts",
    "templates/plan/actions/resolve-plan-comment.ts",
    "templates/plan/actions/delete-plan-comment.ts",
    "templates/plan/actions/consume-plan-feedback.ts",
    "templates/plan/actions/update-visual-plan.ts",
    "templates/plan/actions/list-plan-versions.ts",
    "templates/plan/actions/get-plan-version.ts",
    "templates/plan/actions/restore-plan-version.ts",
    "templates/plan/actions/delete-visual-plan.ts",
    "templates/plan/actions/export-visual-plan.ts",
    "templates/plan/actions/delete-visual-plan.spec.ts",
    "templates/plan/actions/get-plan-feedback.spec.ts",
    "templates/plan/actions/update-visual-plan.spec.ts",
    "templates/plan/actions/update-visual-plan-comment-flow.spec.ts",
    "templates/plan/actions/plan-comment-actions.spec.ts",
    "templates/plan/actions/plan-versions.spec.ts",
  ];

  for (const relativePath of obsoleteActionPaths) {
    await assertMissing(relativePath);
  }
});

test("live operator docs do not route local companion edits through hosted actions", async () => {
  const docs = [
    "templates/plan/AGENTS.md",
    "templates/plan/CLAUDE.md",
    "templates/plan/.agents/skills/visual-plan/SKILL.md",
    "templates/plan/.agents/skills/visual-recap/SKILL.md",
  ];
  const banned =
    /get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan|reply-to-plan-comment|delete-plan-comment|update-visual-plan/;

  for (const relativePath of docs) {
    const source = await readFile(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(
      source,
      banned,
      `${relativePath} still routes agents through hosted plan actions`,
    );
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

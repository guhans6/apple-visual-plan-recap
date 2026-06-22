import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function readRepoFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("root package metadata describes the visual companion product", async () => {
  const pkg = JSON.parse(await readRepoFile("package.json"));

  assert.equal(pkg.name, "visual-companion");
  assert.match(pkg.description, /visual companion/i);
  assert.doesNotMatch(pkg.description, /Apple-focused/i);
});

test("root README presents one companion product identity", async () => {
  const readme = await readRepoFile("README.md");

  assert.match(readme, /^# Visual Companion$/m);
  assert.match(readme, /Private review desk for coding-agent artifacts\./);
  assert.match(readme, /This repo started from `BuilderIO\/agent-native`/);
  assert.doesNotMatch(readme, /# Apple Visual Plan\/Recap/);
  assert.doesNotMatch(readme, /Apple-focused visual planning and recap workflow/);
});

test("root ignore rules exclude imported upstream trees and local package store state", async () => {
  const gitignore = await readRepoFile(".gitignore");

  assert.match(gitignore, /^\.pnpm-store\/$/m);
  assert.match(gitignore, /^BuilderIO-agent-native-restructure\/$/m);
  assert.match(gitignore, /^BuilderIO-agent-native\/$/m);
  assert.match(gitignore, /^BuilderIO-skills\/$/m);
});

test("root baseline ADR and prune audit are tracked", async () => {
  const adrPath = "docs/adr/2026-06-22-root-visual-companion-baseline.md";
  const reviewPath = "docs/reviews/2026-06-22-root-prune-audit.md";

  await access(path.join(root, adrPath));
  await access(path.join(root, reviewPath));

  const adr = await readRepoFile(adrPath);
  const review = await readRepoFile(reviewPath);

  assert.match(adr, /only canonical home/i);
  assert.match(adr, /local companion/i);
  assert.match(review, /split identity/i);
  assert.match(review, /7\.1G/i);
});

test("root companion documentation references resolve to tracked files", async () => {
  const expectedPaths = [
    "docs/prd/2026-06-18-local-visual-companion.md",
    "docs/prd/2026-06-20-project-local-visual-companion-bootstrap.md",
    "docs/prd/2026-06-20-local-companion-home-dashboard.md",
    "docs/visual-companion/README.md",
  ];

  for (const relativePath of expectedPaths) {
    await access(path.join(root, relativePath));
  }
});

test("promoted skill catalog framing is no longer Apple-only", async () => {
  const visualPlan = await readRepoFile("packages/skills/catalog/visual-plan/SKILL.md");
  const visualRecap = await readRepoFile("packages/skills/catalog/visual-recap/SKILL.md");

  assert.doesNotMatch(visualPlan, /^# Apple Visual Plan$/m);
  assert.doesNotMatch(visualRecap, /^# Apple Visual Recap$/m);
  assert.doesNotMatch(visualPlan, /Apple-platform development work/);
  assert.doesNotMatch(visualRecap, /Apple-platform branches, commits, PRs, or working-tree diffs/);
});

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function readRepoFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("root workspace defines the retained companion packages", async () => {
  const workspace = await readRepoFile("pnpm-workspace.yaml");

  assert.match(workspace, /packages\/core/);
  assert.match(workspace, /packages\/skills/);
  assert.match(workspace, /templates\/plan/);
});

test("root contains the promoted companion workspace surfaces", async () => {
  const requiredPaths = [
    "templates/plan/package.json",
    "templates/plan/app/routes/companion.plans.$slug.tsx",
    "templates/plan/app/routes/companion.recaps.$slug.tsx",
    "templates/plan/docs/visual-companion-workflow.md",
    "packages/core/package.json",
    "packages/skills/package.json",
  ];

  for (const relativePath of requiredPaths) {
    await access(path.join(root, relativePath));
  }
});

test("promoted companion app drops legacy compatibility routes", async () => {
  const blockedPaths = [
    "templates/plan/app/routes/local-plans.$slug.tsx",
    "templates/plan/app/routes/recaps.tsx",
    "templates/plan/app/routes/recaps.$id.tsx",
  ];

  for (const relativePath of blockedPaths) {
    await assert.rejects(access(path.join(root, relativePath)));
  }
});

test("root package delegates dev and test flows to the promoted workspace", async () => {
  const pkg = JSON.parse(await readRepoFile("package.json"));

  assert.equal(pkg.engines.node, ">=26 <27");
  assert.match(pkg.scripts.dev, /pnpm --filter plan dev/);
  assert.match(pkg.scripts.dev, /node scripts\/ensure-node\.mjs/);
  assert.match(pkg.scripts.test, /pnpm --filter plan/);
  assert.match(pkg.scripts.test, /node scripts\/ensure-node\.mjs/);
  assert.match(pkg.scripts.test, /vitest --run/);
  assert.match(pkg.scripts.test, /node --test test\/\*\.test\.mjs/);
  assert.match(pkg.scripts.typecheck, /pnpm --filter plan typecheck/);
  assert.match(pkg.scripts.typecheck, /node scripts\/ensure-node\.mjs/);
});

test("promoted plan dev server ignores generated runtime artifacts", async () => {
  const viteConfig = await readRepoFile("templates/plan/vite.config.ts");

  assert.match(viteConfig, /\.react-router/);
  assert.match(viteConfig, /\.deploy-tmp/);
  assert.match(viteConfig, /test-results/);
  assert.match(viteConfig, /\bdata\b/);
});

test("promoted plan dev script does not auto-open a browser", async () => {
  const pkg = JSON.parse(await readRepoFile("templates/plan/package.json"));

  assert.equal(pkg.engines.node, ">=26 <27");
  assert.match(pkg.scripts.dev, /node \.\.\/\.\.\/scripts\/ensure-node\.mjs && agent-native dev/);
});

test("workspace pins one Node major for root and promoted packages", async () => {
  const rootPkg = JSON.parse(await readRepoFile("package.json"));
  const corePkg = JSON.parse(await readRepoFile("packages/core/package.json"));
  const skillsPkg = JSON.parse(await readRepoFile("packages/skills/package.json"));
  const planPkg = JSON.parse(await readRepoFile("templates/plan/package.json"));
  const nvmrc = (await readRepoFile(".nvmrc")).trim();
  const nodeVersion = (await readRepoFile(".node-version")).trim();

  for (const pkg of [rootPkg, corePkg, skillsPkg, planPkg]) {
    assert.equal(pkg.engines.node, ">=26 <27");
  }

  assert.equal(nvmrc, "26");
  assert.equal(nodeVersion, "26");
});

test("root README points at promoted companion workspace paths", async () => {
  const readme = await readRepoFile("README.md");

  assert.match(readme, /templates\/plan\/docs\/visual-companion-workflow\.md/);
  assert.doesNotMatch(readme, /BuilderIO-agent-native-restructure\/templates\/plan/);
});

test("root packages directory contains only the retained runtime packages", async () => {
  const packageDirs = await readFile(path.join(root, "pnpm-workspace.yaml"), "utf8");

  assert.match(packageDirs, /packages\/core/);
  assert.match(packageDirs, /packages\/skills/);
  assert.doesNotMatch(packageDirs, /packages\/desktop-app/);
  assert.doesNotMatch(packageDirs, /packages\/mobile-app/);
});

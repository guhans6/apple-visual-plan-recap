import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;

function repoPath(relativePath) {
  return join(repoRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(repoPath(relativePath), "utf8");
}

function assertExists(relativePath) {
  assert.equal(
    existsSync(repoPath(relativePath)),
    true,
    `${relativePath} must exist`,
  );
}

test("retained local companion routes and artifact surfaces exist", () => {
  [
    "templates/plan/app/routes/_index.tsx",
    "templates/plan/app/routes/companion.plans.$slug.tsx",
    "templates/plan/app/routes/companion.recaps.$slug.tsx",
    "templates/plan/app/pages/CompanionArtifactPage.tsx",
    "templates/plan/app/pages/CompanionArtifactEditor.tsx",
    "templates/plan/app/components/plan/PlanContentRenderer.tsx",
    "templates/plan/actions/get-companion-plan.ts",
    "templates/plan/actions/get-companion-feedback.ts",
    "templates/plan/actions/update-companion-feedback.ts",
    "templates/plan/actions/resolve-companion-feedback.ts",
    "templates/plan/actions/consume-companion-feedback.ts",
    "templates/plan/actions/export-companion-selection.ts",
    "templates/plan/actions/import-companion-result.ts",
    "templates/plan/server/lib/companion-feedback.ts",
    "templates/plan/server/lib/companion-manifest.ts",
    "templates/plan/server/lib/companion-recap-coverage.ts",
  ].forEach(assertExists);
});

test("active companion shell files do not import broad hosted core barrels", () => {
  const shellFiles = [
    "templates/plan/app/root.tsx",
    "templates/plan/app/components/layout/Sidebar.tsx",
    "templates/plan/app/hooks/use-companion-plan.ts",
    "templates/plan/app/lib/utils.ts",
  ];

  for (const relativePath of shellFiles) {
    const source = read(relativePath);
    assert.doesNotMatch(
      source,
      /from ["']@agent-native\/core\/client["']/,
      `${relativePath} must not import the broad core client barrel`,
    );
    assert.doesNotMatch(
      source,
      /from ["']@agent-native\/core["']/,
      `${relativePath} must not import the broad core root barrel`,
    );
  }
});

test("default local companion shell does not wire non-companion startup surfaces", () => {
  const root = read("templates/plan/app/root.tsx");
  for (const banned of [
    "CommandMenu",
    "configureTracking",
    "useDbSync",
    "useNavigationState",
    "useCommandMenuShortcut",
  ]) {
    assert.equal(
      root.includes(banned),
      false,
      `root.tsx still wires ${banned}`,
    );
  }

  const sidebar = read("templates/plan/app/components/layout/Sidebar.tsx");
  assert.equal(
    sidebar.includes("DevDatabaseLink"),
    false,
    "Sidebar still renders the db admin link",
  );
});

test("companion block rendering does not dispatch to built-in chat", () => {
  const source = read("templates/plan/app/components/plan/planBlocks.tsx");
  assert.equal(
    source.includes("sendToAgentChat"),
    false,
    "plan block rendering still dispatches to built-in chat",
  );
  assert.doesNotMatch(
    source,
    /from ["']@agent-native\/core\/client["']/,
    "plan block rendering must not import the broad core client barrel",
  );
});

test("default artifact renderer does not boot editor or collaboration modules", () => {
  const rendererFiles = [
    "templates/plan/app/components/plan/PlanContentRenderer.tsx",
    "templates/plan/app/components/plan/DocumentArea.tsx",
    "templates/plan/app/components/plan/planBlocks.tsx",
  ];

  for (const relativePath of rendererFiles) {
    const source = read(relativePath);
    for (const banned of [
      "PlanDocumentEditor",
      "PlanMarkdownEditor",
      "useCollaborativeDoc",
      "sendToAgentChat",
    ]) {
      assert.equal(
        source.includes(banned),
        false,
        `${relativePath} still references ${banned}`,
      );
    }
    assert.doesNotMatch(
      source,
      /from ["']@agent-native\/core\/client["']/,
      `${relativePath} must not import the broad core client barrel`,
    );
  }
});

test("local companion vite optimization excludes non-startup database packages", () => {
  const source = read("templates/plan/vite.config.ts");
  for (const excluded of [
    "@libsql/client",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/sqlite-core",
  ]) {
    assert.equal(
      source.includes(excluded),
      true,
      `vite.config.ts must exclude ${excluded} from startup optimization`,
    );
  }
});

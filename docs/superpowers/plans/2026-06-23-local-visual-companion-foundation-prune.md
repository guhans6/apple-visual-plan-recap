# Local Visual Companion Foundation Prune Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repo into the simple local visual artifact companion it is meant to be: open local plans/recaps/diffs/evidence, render diagrams and visual blocks, let the developer comment on exact targets, and expose structured feedback for coding agents, while removing hosted/chat/org/db/terminal/collab surfaces from the active app and dependency graph.

**Architecture:** Preserve the companion workflow as the product kernel and put it behind a small local companion shell interface. The shell should import only routing/path helpers, React Query/action helpers, theme/provider helpers, and the retained visual renderer; hosted agent chat, telemetry, SQL admin, terminal, org/share/settings, and realtime collaboration must not be reachable from the default app root or Vite startup graph. Pruning happens in protected passes: add contracts first, narrow imports second, delete unused surfaces third, measure memory after each pass.

**Tech Stack:** Node 26, pnpm workspace, React Router, React Query, Vite, TypeScript, Vitest, Node test runner, local MDX/JSONL companion artifacts, Mermaid/Excalidraw/Shiki visual rendering, optional Tiptap editing only where retained.

---

## User Intent And Product Boundary

The user wants a simple local artifact companion, not the inherited upstream product.

Keep these capabilities:

- `/` companion dashboard listing local artifacts.
- `/companion/plans/:slug` and `/companion/recaps/:slug`.
- Local artifact folders under `docs/visual-companion/` and explicit `PLAN_LOCAL_DIR` overrides.
- Visual plans and recaps with Markdown/MDX, diagrams, wireframes/canvas, code/file-tree blocks, evidence, and recap coverage.
- Comment/review mode where the developer annotates exact visible targets.
- Git-friendly sidecars: `feedback.jsonl`, evidence files, manifest/target metadata, recap coverage.
- Agent-readable actions: `get-companion-plan`, `get-companion-feedback`, `update-companion-feedback`, `resolve-companion-feedback`, `consume-companion-feedback`, `export-companion-selection`, `import-companion-result`.
- Visual creation commands/skills only if they create or update local companion artifacts and point back to companion routes.

Remove these from the active app and default dependency graph:

- Built-in chat UI and Assistant UI.
- Hosted auth, org/team, sharing, public distribution, email, and remote-service framing.
- SQL/db admin UI and hosted generic plan CRUD/version history.
- Terminal UI and `node-pty`/xterm surfaces.
- Realtime collaboration/Yjs/collab cursors from the local V1 path.
- Sentry/Amplitude telemetry from the local default app.
- Command menu and settings panels unless they become companion-owned features later.
- Any docs/skills that tell agents to use removed hosted actions.

## Current Evidence

- `README.md` says the product is a private review desk for coding-agent artifacts and excludes remote-service positioning, share/public paths, embedded chat, org features, and multi-template workspace positioning.
- `docs/prd/2026-06-18-local-visual-companion.md` defines the product as local-first artifact review with readable local files.
- `templates/plan/docs/visual-companion-workflow.md` says V1 does not require SQL, account login, team collaboration, email, realtime collaboration, or built-in agent chat.
- Current Vite cache records 113 optimized deps, including Assistant UI, Sentry, Amplitude, xterm, SQL libraries, Yjs/collab, Tiptap collaboration, Mermaid, Excalidraw, and Shiki.
- The last live memory measurement showed the high Activity Monitor `node` process belongs to the plan Vite dev server; stopping the server removes the high-memory process.

## Execution Rules

- Do not delete visual renderer features until a test proves the retained plan/recap fixtures still render.
- Do not delete an action until a contract proves it is outside the retained companion flow.
- Do not commit during execution unless the user explicitly asks for commits.
- Every pass must end with focused verification plus a fresh memory measurement.
- If a task discovers that a supposedly unused surface is still required for the comment/visual artifact loop, keep it temporarily and move it behind a companion-owned adapter.

## File Map

- Create: `test/local-companion-foundation-contract.test.mjs`
  Repo-level contract for retained product files, banned hosted files, banned active imports, and dependency cleanup.
- Modify: `package.json`
  Ensure root `pnpm test` runs the new contract.
- Create: `packages/core/src/client/local-shell.ts`
  Narrow local companion shell interface exported from core.
- Modify: `packages/core/package.json`
  Add `./client/local-shell` export.
- Modify: `templates/plan/app/root.tsx`
  Replace broad shell imports and remove default chat/telemetry/db-sync/command-menu wiring.
- Modify: `templates/plan/app/components/layout/Sidebar.tsx`
  Remove `DevDatabaseLink`; use narrow `appPath`.
- Modify: `templates/plan/app/hooks/use-companion-plan.ts`
  Import action hooks from the narrow shell.
- Modify: `templates/plan/app/lib/utils.ts`
  Stop re-exporting `cn` from the broad core root.
- Modify: `templates/plan/app/components/plan/planBlocks.tsx`
  Remove `sendToAgentChat` AI-field path from the V1 companion route or move it behind an inert companion hook.
- Modify: `templates/plan/app/components/plan/PlanContentRenderer.tsx`
  Keep visual rendering; split editor loading so read-only artifact review does not import collab/editor code by default.
- Modify: `templates/plan/app/components/plan/DocumentArea.tsx`
  Keep Shiki lazy loading for code surfaces.
- Modify: `templates/plan/app/components/editor/PlanDocumentEditor.tsx`
  Retain only if edit mode remains active; remove realtime collab dependency from local mode.
- Modify: `templates/plan/app/components/plan/PlanMarkdownEditor.tsx`
  Retain only if inline editing remains active; remove realtime collab dependency from local mode.
- Delete: hosted generic action files listed in Task 6 after contracts pass.
- Modify: `templates/plan/AGENTS.md`, `templates/plan/CLAUDE.md`, `templates/plan/.agents/skills/visual-plan/SKILL.md`, `templates/plan/.agents/skills/visual-recap/SKILL.md`
  Keep instructions aligned to local companion actions.
- Modify: `templates/plan/package.json`
  Remove unused runtime dependencies after import graph proves they are gone.
- Modify: `templates/plan/vite.config.ts`
  Add only targeted dependency optimization exclusions if narrowing imports does not sufficiently reduce startup memory.

## Retained Verification Commands

Use these commands as the baseline gate:

```bash
pnpm --filter plan test \
  server/lib/companion-manifest.spec.ts \
  server/lib/companion-recap-coverage.spec.ts \
  server/lib/companion-feedback-selectors.spec.ts \
  server/lib/local-companion-dashboard.spec.ts \
  actions/companion-actions.spec.ts \
  server/plugins/auth.local-companion.spec.ts \
  app/hooks/use-companion-plan.spec.ts \
  app/pages/companion-shell.spec.ts \
  app/pages/CompanionPage.test.tsx \
  app/pages/CompanionHomePage.test.tsx \
  app/pages/CompanionHomePage.interaction.spec.tsx \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts
node --test test/local-companion-foundation-contract.test.mjs
```

Manual browser gate:

- Start with `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan dev`.
- Open `http://localhost:8080/`.
- Confirm dashboard loads.
- Open `/companion/plans/generic-workflow-demo?path=templates/plan/plans/generic-workflow-demo`.
- Open `/companion/recaps/apple-workflow-recap-demo?path=templates/plan/plans/apple-workflow-recap-demo`.
- Add a comment in review mode, reload, confirm it persists.
- Run `pnpm --filter plan action get-companion-feedback -- --slug generic-workflow-demo --path templates/plan/plans/generic-workflow-demo` or the repo's equivalent action invocation and confirm the new comment appears as structured feedback.

Memory gate:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan dev
du -sh templates/plan/node_modules/.vite/deps
node -e "const fs=require('fs');const p='templates/plan/node_modules/.vite/deps/_metadata.json';const m=JSON.parse(fs.readFileSync(p,'utf8'));console.log(Object.keys(m.optimized||{}).sort().join('\n'))"
```

Use Activity Monitor or `top` outside the sandbox to record the peak plan Vite `node` memory before and after each pass.

---

### Task 1: Add the local companion foundation contract

**Files:**
- Create: `test/local-companion-foundation-contract.test.mjs`
- Modify: `package.json`
- Test: `test/local-companion-foundation-contract.test.mjs`

- [ ] **Step 1: Write the failing contract**

Create `test/local-companion-foundation-contract.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;

function path(relativePath) {
  return join(repoRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(path(relativePath), "utf8");
}

function assertExists(relativePath) {
  assert.equal(existsSync(path(relativePath)), true, `${relativePath} must exist`);
}

function assertMissing(relativePath) {
  assert.equal(existsSync(path(relativePath)), false, `${relativePath} must be removed`);
}

test("retained companion product files exist", () => {
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
    "templates/plan/docs/visual-companion-workflow.md",
  ].forEach(assertExists);
});

test("local companion shell does not import broad hosted client barrels", () => {
  const files = [
    "templates/plan/app/root.tsx",
    "templates/plan/app/components/layout/Sidebar.tsx",
    "templates/plan/app/hooks/use-companion-plan.ts",
    "templates/plan/app/lib/utils.ts",
  ];

  for (const relativePath of files) {
    const source = read(relativePath);
    assert.doesNotMatch(source, /from ["']@agent-native\/core\/client["']/);
    assert.doesNotMatch(source, /from ["']@agent-native\/core["']/);
  }
});

test("hosted-only action surface is gone from the retained app", () => {
  [
    "templates/plan/actions/list-visual-plans.ts",
    "templates/plan/actions/get-visual-plan.ts",
    "templates/plan/actions/get-plan-feedback.ts",
    "templates/plan/actions/reply-to-plan-comment.ts",
    "templates/plan/actions/delete-plan-comment.ts",
    "templates/plan/actions/list-plan-versions.ts",
    "templates/plan/actions/get-plan-version.ts",
    "templates/plan/actions/restore-plan-version.ts",
    "templates/plan/actions/delete-visual-plan.ts",
    "templates/plan/actions/export-visual-plan.ts",
  ].forEach(assertMissing);
});

test("live operator docs point agents at companion actions", () => {
  const files = [
    "templates/plan/AGENTS.md",
    "templates/plan/CLAUDE.md",
    "templates/plan/.agents/skills/visual-plan/SKILL.md",
    "templates/plan/.agents/skills/visual-recap/SKILL.md",
  ];
  const banned = /get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan/;

  for (const relativePath of files) {
    const source = read(relativePath);
    assert.doesNotMatch(source, banned, `${relativePath} still mentions hosted actions`);
  }
});

test("plan package does not keep removed startup dependencies", () => {
  const pkg = JSON.parse(read("templates/plan/package.json"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  for (const dep of [
    "@xterm/xterm",
    "@xterm/addon-fit",
    "@xterm/addon-web-links",
    "node-pty",
    "@libsql/client",
    "drizzle-orm",
    "cmdk",
    "recharts",
  ]) {
    assert.equal(allDeps[dep], undefined, `${dep} should not be a plan dependency after pruning`);
  }
});
```

- [ ] **Step 2: Run the contract to verify RED**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
```

Expected: FAIL because broad imports, hosted actions, stale docs, and unused deps still exist.

- [ ] **Step 3: Add the contract to root verification**

Modify the root `package.json` test script so it includes the new contract at the end:

```json
"test": "pnpm --filter @agent-native/skills test && pnpm --filter plan test && node --test test/*.test.mjs"
```

If the existing root script is already equivalent, leave it unchanged.

- [ ] **Step 4: Do not make the contract pass yet**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
```

Expected: still FAIL. This is the guard for the following tasks.

### Task 2: Create the narrow local companion shell interface

**Files:**
- Create: `packages/core/src/client/local-shell.ts`
- Modify: `packages/core/package.json`
- Test: `packages/core/src/client/create-query-client.spec.ts`
- Test: `test/local-companion-foundation-contract.test.mjs`

- [ ] **Step 1: Create the narrow shell module**

Create `packages/core/src/client/local-shell.ts`:

```ts
export {
  appApiPath,
  appBasePath,
  appPath,
  agentNativePath,
} from "./api-path.js";
export {
  callAction,
  serializeActionQueryParams,
  useActionMutation,
  useActionQuery,
  type ClientActionCallOptions,
} from "./use-action.js";
export {
  createAgentNativeQueryClient,
} from "./create-query-client.js";
export {
  AppProviders,
  type AppProvidersProps,
} from "./app-providers.js";
export {
  getThemeInitScript,
  themeInitScript,
  type ThemePreference,
} from "./theme.js";
export {
  ErrorBoundary,
} from "./ErrorBoundary.js";
export {
  cn,
} from "./utils.js";
```

- [ ] **Step 2: Export the shell module from the package**

Modify `packages/core/package.json` under `exports`:

```json
"./client/local-shell": "./dist/client/local-shell.js",
```

Place it next to the existing `./client/api-path` and `./client/application-state` exports.

- [ ] **Step 3: Run a focused package check**

Run:

```bash
pnpm --filter @agent-native/core typecheck
```

Expected: PASS.

- [ ] **Step 4: Run the contract**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
```

Expected: still FAIL because the app has not been migrated to the new shell yet.

### Task 3: Replace broad app shell imports and remove non-companion startup UI

**Files:**
- Modify: `templates/plan/app/root.tsx`
- Modify: `templates/plan/app/components/layout/Sidebar.tsx`
- Modify: `templates/plan/app/hooks/use-companion-plan.ts`
- Modify: `templates/plan/app/lib/utils.ts`
- Test: `test/local-companion-foundation-contract.test.mjs`
- Test: `templates/plan/app/hooks/use-companion-plan.spec.ts`
- Test: `templates/plan/app/pages/companion-shell.spec.ts`

- [ ] **Step 1: Update `root.tsx` imports**

Replace the broad imports in `templates/plan/app/root.tsx` with:

```ts
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { useState } from "react";
import {
  AppProviders,
  appPath,
  createAgentNativeQueryClient,
  getThemeInitScript,
} from "@agent-native/core/client/local-shell";
import { Toaster } from "@/components/ui/sonner";
import { Layout as AppLayout } from "@/components/layout/Layout";
import { APP_TITLE } from "@/lib/app-config";
import type { LinksFunction } from "react-router";
import stylesheet from "./global.css?url";
```

Remove all of this from `root.tsx`:

```ts
import { useCallback, useState } from "react";
import { useNavigationState } from "@/hooks/use-navigation-state";
import { useQueryClient } from "@tanstack/react-query";
import { useDbSync } from "@agent-native/core";
import {
  AppProviders,
  CommandMenu,
  appPath,
  createAgentNativeQueryClient,
  getThemeInitScript,
  useCommandMenuShortcut,
} from "@agent-native/core/client";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { TAB_ID } from "@/lib/tab-id";
import { configureTracking } from "@agent-native/core/client";
configureTracking({
  getDefaultProps: (_name, properties) => ({
    ...properties,
    app: "plan",
  }),
});
```

- [ ] **Step 2: Remove DB sync and command menu setup from `root.tsx`**

Delete the `DbSyncSetup` function and replace `AppContent` with:

```tsx
function AppContent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
```

Update the export to:

```ts
export { ErrorBoundary } from "@agent-native/core/client/local-shell";
```

- [ ] **Step 3: Update `Sidebar.tsx`**

Replace:

```ts
import {
  DevDatabaseLink,
  appPath,
} from "@agent-native/core/client";
```

with:

```ts
import { appPath } from "@agent-native/core/client/local-shell";
```

Delete the footer block that renders `<DevDatabaseLink />`:

```tsx
{!collapsed && (
  <>
    <div className="space-y-2 border-t border-border px-3 py-2">
      <DevDatabaseLink />
    </div>
  </>
)}
```

- [ ] **Step 4: Update companion hooks**

In `templates/plan/app/hooks/use-companion-plan.ts`, replace:

```ts
import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client";
```

with:

```ts
import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/local-shell";
```

- [ ] **Step 5: Update local class-name helper**

In `templates/plan/app/lib/utils.ts`, replace:

```ts
export { cn } from "@agent-native/core";
```

with:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Run focused verification**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
pnpm --filter plan test \
  app/hooks/use-companion-plan.spec.ts \
  app/pages/companion-shell.spec.ts
```

Expected: contract still FAILS only for later deletion/dependency checks; focused plan tests PASS.

### Task 4: Remove built-in chat and collab hooks from the companion review path

**Files:**
- Modify: `templates/plan/app/components/plan/planBlocks.tsx`
- Modify: `templates/plan/app/components/plan/PlanContentRenderer.tsx`
- Modify: `templates/plan/app/components/plan/DocumentArea.tsx`
- Modify: `templates/plan/app/components/editor/PlanDocumentEditor.tsx`
- Modify: `templates/plan/app/components/plan/PlanMarkdownEditor.tsx`
- Test: visual/component specs that cover plan rendering and comments.

- [ ] **Step 1: Probe current chat/collab usage**

Run:

```bash
rg -n "sendToAgentChat|useCollaborativeDoc|RichMarkdownCollabUser|collabUser|ydoc|awareness|@agent-native/core/client" templates/plan/app/components
```

Expected: matches in plan block AI actions and editor/collab code.

- [ ] **Step 2: Remove AI-field chat actions from block rendering**

In `templates/plan/app/components/plan/planBlocks.tsx`, remove:

```ts
import {
  sendToAgentChat,
  type RichMarkdownCollabUser,
} from "@agent-native/core/client";
```

Replace it with:

```ts
import type { RichMarkdownCollabUser } from "@/components/plan/local-editor-types";
```

Create `templates/plan/app/components/plan/local-editor-types.ts`:

```ts
export type RichMarkdownCollabUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  color?: string | null;
};
```

Replace `renderAiFieldAction: (props) => <PlanAiFieldAction {...props} />` with:

```ts
renderAiFieldAction: undefined,
```

Delete the `PlanAiFieldAction` implementation if it only sends to chat.

- [ ] **Step 3: Keep editor code lazy and local-only**

In `PlanContentRenderer.tsx`, keep `LazyPlanDocumentEditor` and `LazyNestedPlanBlocksEditor` lazy. Ensure no top-level import from `../editor/PlanDocumentEditor` exists except:

```ts
const loadPlanDocumentEditor = () => import("../editor/PlanDocumentEditor");
```

If `RichMarkdownCollabUser` is imported from core, replace it with the local type:

```ts
import type { RichMarkdownCollabUser } from "./local-editor-types";
```

- [ ] **Step 4: Remove realtime collab from local editor default**

In `PlanMarkdownEditor.tsx` and `PlanDocumentEditor.tsx`, replace `useCollaborativeDoc` usage with local editor state for the local companion route. The retained local editor must autosave through existing `onSave`, `onContentChange`, or `onContentPatch`; it must not require Yjs, awareness, or websocket collab.

The minimal retained local editor shape is:

```ts
const collab = undefined;
```

and pass no `ydoc` or `awareness` into shared editor extensions unless a future explicit collaborative mode is added.

- [ ] **Step 5: Run focused verification**

Run:

```bash
pnpm --filter plan test \
  app/pages/CompanionPage.test.tsx \
  app/pages/CompanionHomePage.test.tsx \
  app/pages/CompanionHomePage.interaction.spec.tsx \
  app/pages/companion-shell.spec.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts
```

Expected: PASS. If inline editor specs fail, keep Tiptap editor behavior but keep Yjs/collab out of local mode.

### Task 5: Measure startup dependency graph after shell narrowing

**Files:**
- Modify only if needed: `templates/plan/vite.config.ts`
- Test: memory/dependency measurement notes in command output.

- [ ] **Step 1: Clear Vite optimized cache**

Run:

```bash
rm -rf templates/plan/node_modules/.vite
```

- [ ] **Step 2: Start dev server**

Run:

```bash
PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan dev
```

Expected: server starts at `http://localhost:8080/`.

- [ ] **Step 3: Record optimized dependencies**

In another terminal, run:

```bash
du -sh templates/plan/node_modules/.vite/deps
node -e "const fs=require('fs');const p='templates/plan/node_modules/.vite/deps/_metadata.json';const m=JSON.parse(fs.readFileSync(p,'utf8'));console.log(Object.keys(m.optimized||{}).sort().join('\n'))"
```

Expected after Tasks 2-4: Assistant UI, Sentry, Amplitude, xterm, Yjs, and SQL/db admin libraries should be absent unless still reachable from a retained visual/editor route.

- [ ] **Step 4: Record memory**

Use Activity Monitor or unsandboxed `top` to capture the plan Vite `node` memory.

Expected: lower than the previous ~2.2 GB `top` / ~1.3 GB RSS measurement. If it is not lower, inspect the optimized dependency list before deleting more code.

- [ ] **Step 5: Stop server**

Stop the `pnpm --filter plan dev` process with Ctrl-C. Confirm:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Expected: no output.

### Task 6: Delete hosted generic actions and stale hosted docs

**Files:**
- Delete hosted-only action files and tests listed in the older plan `docs/superpowers/plans/2026-06-23-companion-thorough-prune.md`.
- Modify: `templates/plan/AGENTS.md`
- Modify: `templates/plan/CLAUDE.md`
- Modify: `templates/plan/.agents/skills/visual-plan/SKILL.md`
- Modify: `templates/plan/.agents/skills/visual-recap/SKILL.md`
- Modify: `templates/plan/server/plans.spec.ts`
- Modify: `templates/plan/server/ui-plan-html.ts`
- Modify/Delete: `templates/plan/docs/commenting-ux-plan.md`
- Test: `test/local-companion-foundation-contract.test.mjs`

- [ ] **Step 1: Probe hosted action references**

Run:

```bash
rg -n "get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan|PlansPage\\.tsx" templates/plan docs README.md
```

Expected: matches exist before cleanup.

- [ ] **Step 2: Delete hosted-only action files**

Delete:

```text
templates/plan/actions/list-visual-plans.ts
templates/plan/actions/get-visual-plan.ts
templates/plan/actions/get-plan-feedback.ts
templates/plan/actions/reply-to-plan-comment.ts
templates/plan/actions/resolve-plan-comment.ts
templates/plan/actions/delete-plan-comment.ts
templates/plan/actions/consume-plan-feedback.ts
templates/plan/actions/list-plan-versions.ts
templates/plan/actions/get-plan-version.ts
templates/plan/actions/restore-plan-version.ts
templates/plan/actions/delete-visual-plan.ts
templates/plan/actions/export-visual-plan.ts
templates/plan/actions/delete-visual-plan.spec.ts
templates/plan/actions/get-plan-feedback.spec.ts
templates/plan/actions/plan-comment-actions.spec.ts
templates/plan/actions/plan-versions.spec.ts
```

- [ ] **Step 3: Rewrite live operator docs**

Replace hosted instructions with:

```md
- Read artifacts through `get-companion-plan`.
- Read pending developer feedback through `get-companion-feedback`.
- Append developer-visible feedback with `update-companion-feedback`.
- Mark work consumed with `consume-companion-feedback`.
- Mark lifecycle state with `resolve-companion-feedback`.
- Use `export-companion-selection` and `import-companion-result` for external-agent handoff.
- Do not use hosted plan CRUD, hosted version history, hosted export, hosted delete, or embedded chat.
```

- [ ] **Step 4: Update stale examples/specs**

Replace active references to `PlansPage.tsx` with retained files:

```text
CompanionArtifactPage.tsx
CompanionArtifactEditor.tsx
PlanContentRenderer.tsx
```

Remove hosted action names from active docs. Historical docs may keep them only if clearly archived and not used as current execution guidance.

- [ ] **Step 5: Run verification**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
pnpm --filter plan test \
  server/lib/companion-manifest.spec.ts \
  server/lib/companion-recap-coverage.spec.ts \
  server/lib/companion-feedback-selectors.spec.ts \
  server/lib/local-companion-dashboard.spec.ts \
  actions/companion-actions.spec.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts
```

Expected: contract still may fail for package dependency removal; focused companion tests PASS.

### Task 7: Remove unused dependencies only after imports are gone

**Files:**
- Modify: `templates/plan/package.json`
- Modify: root lockfile after `pnpm install --lockfile-only` or the repo's package-manager equivalent.
- Test: root and plan verification.

- [ ] **Step 1: Prove each dependency is unused by source imports**

Run:

```bash
rg -n "@xterm|node-pty|@libsql/client|drizzle-orm|cmdk|recharts|@assistant-ui/react|@amplitude/analytics-browser|@sentry/browser|yjs|@tiptap/extension-collaboration|@tiptap/extension-collaboration-caret" templates/plan packages/core/src/client
```

Expected: no matches in the retained companion path. Matches inside archived docs/specs must be removed before dependency deletion.

- [ ] **Step 2: Remove plan-level unused dependencies**

From `templates/plan/package.json`, remove dependencies/devDependencies that are no longer imported by the retained plan app:

```json
"@libsql/client": "...",
"drizzle-orm": "...",
"node-pty": "...",
"@xterm/addon-fit": "...",
"@xterm/addon-web-links": "...",
"@xterm/xterm": "...",
"cmdk": "...",
"recharts": "..."
```

Do not remove these unless their imports are still retained:

```json
"@excalidraw/excalidraw": "...",
"@excalidraw/mermaid-to-excalidraw": "...",
"mermaid": "...",
"roughjs": "...",
"shiki": "...",
"react-markdown": "...",
"remark-gfm": "...",
"remark-mdx": "...",
"unified": "...",
"zod": "..."
```

Keep Tiptap packages only if inline artifact editing remains supported after Task 4. If editing is deferred to a later explicit feature, remove Tiptap from the plan app and keep read-only artifact review plus feedback.

- [ ] **Step 3: Refresh lockfile**

Run:

```bash
pnpm install --lockfile-only
```

Expected: lockfile updates without installing unrelated packages.

- [ ] **Step 4: Run verification**

Run:

```bash
node --test test/local-companion-foundation-contract.test.mjs
pnpm test
```

Expected: PASS.

### Task 8: Final browser and memory verification

**Files:**
- No planned source edits.
- Optional: update `docs/visual-companion/current-verification-checklist.md` with fresh evidence if the user wants the evidence recorded.

- [ ] **Step 1: Start the server**

Run:

```bash
rm -rf templates/plan/node_modules/.vite
PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan dev
```

Expected: server starts at `http://localhost:8080/`.

- [ ] **Step 2: Verify browser workflow**

Open:

```text
http://localhost:8080/
http://localhost:8080/companion/plans/generic-workflow-demo?path=templates/plan/plans/generic-workflow-demo
http://localhost:8080/companion/recaps/apple-workflow-recap-demo?path=templates/plan/plans/apple-workflow-recap-demo
```

Expected:

- Dashboard shows companion artifacts.
- Plan route renders rich artifact content.
- Recap route renders recap-specific status/evidence.
- Diagram/wireframe/code surfaces still render.
- Review/comment mode works.
- A new comment persists after reload.

- [ ] **Step 3: Verify agent feedback queue**

Run the companion feedback action through the repo's action command. If the command syntax is:

```bash
pnpm --filter plan action get-companion-feedback -- --slug generic-workflow-demo --path templates/plan/plans/generic-workflow-demo
```

Expected: response includes the newly added actionable comment with stable target metadata or an explicit unanchored/detached status.

If the CLI syntax differs, run:

```bash
pnpm --filter plan action --help
```

Then invoke `get-companion-feedback` with the same slug/path values.

- [ ] **Step 4: Verify dependency graph**

Run:

```bash
du -sh templates/plan/node_modules/.vite/deps
node -e "const fs=require('fs');const p='templates/plan/node_modules/.vite/deps/_metadata.json';const m=JSON.parse(fs.readFileSync(p,'utf8'));console.log(Object.keys(m.optimized||{}).sort().join('\n'))"
```

Expected: optimized dependencies do not include Assistant UI, Sentry, Amplitude, xterm, SQL/db admin, or Yjs/collab packages.

- [ ] **Step 5: Verify memory**

Use Activity Monitor or unsandboxed `top` to identify the plan Vite `node` process and record memory.

Expected: the plan Vite process is materially lower than the previous observed high-memory state. If it remains near the old value, inspect the optimized dependency list and use `rg` to find remaining imports before deleting more code.

- [ ] **Step 6: Stop server**

Stop the dev server and confirm:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Expected: no listener.

## Decision Gate After This Plan

If Tasks 1-8 pass and the app is still too heavy or hard to work on, then create a new minimal app. Do not start greenfield before this plan, because the current repo already has the working artifact contracts, fixtures, feedback sidecars, and visual renderer. After this prune, a new app would have a small kernel to import instead of a large upstream product to copy from.

## Done Definition

- The active app still opens local companion artifacts.
- Diagrams/visual blocks/code surfaces still render.
- Developer comments persist and are readable by agents as structured feedback.
- Root and focused companion tests pass.
- Active docs and skills point only to companion-owned actions.
- Plan app startup no longer optimizes or loads hosted chat, telemetry, SQL admin, xterm, org/share/settings, or realtime collab packages.
- Fresh memory measurement confirms the dev server is no longer behaving like the full upstream product.

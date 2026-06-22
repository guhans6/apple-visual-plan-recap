# Visual Companion Final Hosted Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining generic hosted Plan product layer so this repo behaves as a companion-only local artifact review app.

**Architecture:** Keep the current companion shell, dashboard, local-folder reader, and companion feedback flows. Delete the generic hosted review/editor/history/comment/version surface in thin vertical slices, starting by removing stale route semantics (`/review/...`), then extracting companion-owned UI, then deleting unreachable actions/hooks/tests/docs.

**Tech Stack:** React Router, React Query, Vitest, H3/Agent-Native server actions, local MDX plan folders.

---

## File Map

- `templates/plan/app/pages/CompanionArtifactPage.tsx`
  Current companion route entry, but still delegates to the old `PlansPage`.
- `templates/plan/app/pages/PlansPage.tsx`
  Large mixed page that still contains generic hosted editor/history/delete/comment behavior.
- `templates/plan/app/hooks/use-plans.ts`
  Generic hosted plan CRUD/history/comment/version client hooks.
- `templates/plan/server/plans.ts`
  Generic plan helpers and event payload path generation.
- `templates/plan/server/db/index.ts`
  Shareable-resource registration still points generic plans at legacy public paths.
- `templates/plan/server/plan-mdx.ts`
  MDX export helper still falls back to stale hosted visual URLs.
- `templates/plan/server/lib/comment-notifications.ts`
  Comment email CTA still points at stale hosted review URLs.
- `templates/plan/server/lib/local-plan-files.ts`
  Local mirror export still has one stale hosted fallback path.
- `templates/plan/server/lib/plan-connector-catalog.ts`
  Public connector catalog that must eventually expose only companion-owned tools.
- `templates/plan/AGENTS.md`
  Old hosted-plan operator guidance that must be rewritten after code deletion.

## End-State Boundary

Keep:

- `/`
- `/companion/plans/:slug`
- `/companion/recaps/:slug`
- `docs/visual-companion/plans/<slug>/`
- `docs/visual-companion/recaps/<slug>/`
- companion dashboard, artifact reader/editor shell, feedback queue, evidence/import/export/result loop

Remove:

- `/review/:id`
- the generic hosted plan route model
- generic DB-backed list/delete/history/comment/version UI and hooks
- old hosted action exposure where the companion no longer needs the behavior
- `PLAN_LOCAL_MODE` compatibility once no retained runtime path depends on it

### Task 1: Remove stale `/review` route semantics from remaining helper layers

**Files:**
- Modify: `templates/plan/server/plans.ts`
- Modify: `templates/plan/server/db/index.ts`
- Modify: `templates/plan/server/plan-mdx.ts`
- Modify: `templates/plan/server/lib/comment-notifications.ts`
- Modify: `templates/plan/server/lib/local-plan-files.ts`
- Test: `templates/plan/server/plans.events.spec.ts`
- Test: `templates/plan/server/plan-mdx.spec.ts`
- Test: `templates/plan/server/lib/comment-notifications.spec.ts`
- Test: `templates/plan/server/lib/local-plan-files.spec.ts`

- [ ] **Step 1: Write/adjust the failing tests**

```ts
expect(payload.path).toBe("/plans/plan-abc");
expect(payload.path).toBe("/recaps/recap-xyz");
expect(folder["plan.mdx"]).toContain(
  'visualUrl: "https://plan.agent-native.com/plans/plan_test"',
);
expect(renderEmailMock).toHaveBeenCalledWith(
  expect.objectContaining({
    cta: expect.objectContaining({
      url: "https://plans.example.test/plans/plan_1",
    }),
  }),
);
```

- [ ] **Step 2: Run focused tests to verify RED**

Run:
```bash
pnpm --filter plan test server/plans.events.spec.ts server/lib/comment-notifications.spec.ts server/plan-mdx.spec.ts server/lib/local-plan-files.spec.ts
```

Expected: failing assertions showing `/review/...` is still emitted.

- [ ] **Step 3: Write the minimal implementation**

```ts
export function planPath(id: string, kind: PlanKind = "plan"): string {
  const prefix = kind === "recap" ? "/recaps" : "/plans";
  return `${prefix}/${encodeURIComponent(id)}`;
}
```

Also update the MDX fallback URL, comment-notification CTA, shareable-resource path, and local-file fallback to use `/plans` or `/recaps` instead of `/review`.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run:
```bash
pnpm --filter plan test server/plans.events.spec.ts server/lib/comment-notifications.spec.ts server/plan-mdx.spec.ts server/lib/local-plan-files.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-06-22-companion-final-hosted-removal.md \
  templates/plan/server/plans.ts \
  templates/plan/server/db/index.ts \
  templates/plan/server/plan-mdx.ts \
  templates/plan/server/lib/comment-notifications.ts \
  templates/plan/server/lib/local-plan-files.ts \
  templates/plan/server/plans.events.spec.ts \
  templates/plan/server/plan-mdx.spec.ts \
  templates/plan/server/lib/comment-notifications.spec.ts \
  templates/plan/server/lib/local-plan-files.spec.ts
git commit -m "refactor: remove stale review route semantics"
```

### Task 2: Extract a companion-owned artifact page and stop routing through generic `PlansPage`

**Files:**
- Create: `templates/plan/app/pages/CompanionArtifactEditor.tsx`
- Modify: `templates/plan/app/pages/CompanionArtifactPage.tsx`
- Modify: `templates/plan/app/pages/PlansPage.tsx`
- Modify: `templates/plan/app/hooks/use-companion-plan.ts`
- Test: `templates/plan/app/pages/CompanionPage.test.tsx`
- Test: `templates/plan/app/pages/companion-shell.spec.ts`

- [ ] **Step 1: Write one failing companion route test**

```tsx
it("renders the companion artifact editor without the hosted plan history controls", () => {
  render(<CompanionPage slug="checkout-flow" kind="plan" />);
  expect(screen.queryByText(/Version history/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the single test to verify RED**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/companion-shell.spec.ts
```

Expected: FAIL because the route still renders `PlansPage`.

- [ ] **Step 3: Implement the companion-owned page split**

```tsx
export function CompanionArtifactEditor(props: CompanionArtifactEditorProps) {
  return <PlanContentRenderer ... />;
}
```

Move only companion-supported behavior into the new component. Do not carry over generic history/delete/export/comment-thread admin UI unless the companion still needs it.

- [ ] **Step 4: Run the focused page tests to verify GREEN**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/companion-shell.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/app/pages/CompanionArtifactEditor.tsx \
  templates/plan/app/pages/CompanionArtifactPage.tsx \
  templates/plan/app/pages/PlansPage.tsx \
  templates/plan/app/hooks/use-companion-plan.ts \
  templates/plan/app/pages/CompanionPage.test.tsx \
  templates/plan/app/pages/companion-shell.spec.ts
git commit -m "refactor: split companion artifact editor from hosted plans page"
```

### Task 3: Delete unreachable generic client hooks and action wiring

**Files:**
- Modify: `templates/plan/app/hooks/use-plans.ts`
- Modify: `templates/plan/app/pages/PlansPage.tsx`
- Delete: hosted-only action callers once no code references remain
- Test: `templates/plan/app/hooks/use-plans.spec.ts`
- Test: `templates/plan/app/pages/PlansPage.comments.test.ts`

- [ ] **Step 1: Write one failing dead-surface test**

```ts
expectTypeOf(usePlans).not.toHaveProperty("usePlanVersions");
```

Or, if direct type assertions are awkward, replace with a runtime-focused test proving the companion route no longer requests `list-plan-versions`.

- [ ] **Step 2: Run the targeted tests to verify RED**

Run:
```bash
pnpm --filter plan test app/hooks/use-plans.spec.ts app/pages/PlansPage.comments.test.ts
```

Expected: FAIL while generic hooks/actions remain wired.

- [ ] **Step 3: Remove the unused hosted hook surface**

Delete or stop exporting:

- `usePlanVersions`
- `useDeletePlan`
- `useDeletePlanComment`
- `useUpdatePlanComments`
- `useExportPlan`
- `useImportPlanSource`

Then remove the corresponding UI usage from `PlansPage.tsx`.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run:
```bash
pnpm --filter plan test app/hooks/use-plans.spec.ts app/pages/PlansPage.comments.test.ts
```

Expected: PASS after the tests are rewritten around the retained companion surface.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/app/hooks/use-plans.ts \
  templates/plan/app/pages/PlansPage.tsx \
  templates/plan/app/hooks/use-plans.spec.ts \
  templates/plan/app/pages/PlansPage.comments.test.ts
git commit -m "refactor: prune hosted client plan hooks"
```

### Task 4: Delete hosted-only actions, tests, and connector exposure

**Files:**
- Modify: `templates/plan/server/lib/plan-connector-catalog.ts`
- Modify: `templates/plan/AGENTS.md`
- Delete: hosted-only action files/tests once references are gone
- Test: `templates/plan/server/lib/public-action-paths.spec.ts`

- [ ] **Step 1: Write a failing exposure test**

```ts
expect(PLAN_CONNECTOR_CATALOG).not.toContain("create-visual-plan");
expect(PLAN_CONNECTOR_CATALOG).not.toContain("list-plan-versions");
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:
```bash
pnpm --filter plan test server/lib/public-action-paths.spec.ts
```

Expected: FAIL until the old connector/documentation surface is pruned.

- [ ] **Step 3: Delete unreachable hosted actions and rewrite docs**

Candidate deletions once references are gone:

- `templates/plan/actions/delete-visual-plan.ts`
- `templates/plan/actions/delete-plan-comment.ts`
- `templates/plan/actions/reply-to-plan-comment.ts`
- `templates/plan/actions/resolve-plan-comment.ts`
- `templates/plan/actions/list-plan-versions.ts`
- `templates/plan/actions/get-plan-version.ts`
- `templates/plan/actions/restore-plan-version.ts`

- [ ] **Step 4: Run verification to confirm the public surface is companion-only**

Run:
```bash
pnpm --filter plan test server/lib/public-action-paths.spec.ts
rg -n "create-visual-plan|list-plan-versions|delete-visual-plan|resolve-plan-comment" templates/plan
```

Expected: tests pass; grep hits only in intentionally retained migration/docs files, or zero results.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/server/lib/plan-connector-catalog.ts \
  templates/plan/AGENTS.md \
  templates/plan/server/lib/public-action-paths.spec.ts \
  templates/plan/actions
git commit -m "refactor: remove hosted plan action surface"
```

### Task 5: Remove `PLAN_LOCAL_MODE` compatibility and finish the final sweep

**Files:**
- Modify: `templates/plan/server/lib/local-identity.ts`
- Modify: remaining tests that still toggle `PLAN_LOCAL_MODE`
- Test: `templates/plan/server/plugins/auth.local-companion.spec.ts`
- Test: `templates/plan/server/plugins/db.local-companion.spec.ts`
- Test: companion-focused regression batch

- [ ] **Step 1: Write one failing runtime test**

```ts
delete process.env.PLAN_LOCAL_MODE;
expect(isLocalPlanRuntime()).toBe(true);
process.env.NODE_ENV = "production";
expect(isLocalPlanRuntime()).toBe(false);
```

- [ ] **Step 2: Run the focused tests to verify RED**

Run:
```bash
pnpm --filter plan test server/plugins/auth.local-companion.spec.ts server/plugins/db.local-companion.spec.ts
```

Expected: FAIL while legacy toggle assumptions remain.

- [ ] **Step 3: Remove the compatibility branch**

Delete the `PLAN_LOCAL_MODE` branches and update the tests to assert the companion-only runtime contract directly.

- [ ] **Step 4: Run the final focused companion regression batch**

Run:
```bash
pnpm --filter plan test \
  app/pages/CompanionPage.test.tsx \
  app/pages/CompanionHomePage.test.tsx \
  app/components/layout/Sidebar.test.tsx \
  app/lib/navigation-paths.test.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts \
  actions/update-local-plan-folder.spec.ts \
  actions/promote-local-plan-folder.spec.ts \
  server/lib/local-companion-dashboard.spec.ts \
  server/lib/local-plan-files.spec.ts \
  server/plugins/auth.local-companion.spec.ts \
  server/plugins/db.local-companion.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/server/lib/local-identity.ts \
  templates/plan/server/plugins/auth.local-companion.spec.ts \
  templates/plan/server/plugins/db.local-companion.spec.ts \
  templates/plan/actions \
  templates/plan/server/lib \
  templates/plan/app
git commit -m "refactor: finalize companion-only runtime"
```

## Verification Gates

- No `/review/` references remain in live code.
- Companion routes still load from `/` and `/companion/...`.
- The companion dashboard and artifact pages do not depend on generic hosted list/history/delete/version UI.
- Public connector/catalog/documentation surface names only companion-supported behaviors.
- Focused companion regression tests pass after each slice.

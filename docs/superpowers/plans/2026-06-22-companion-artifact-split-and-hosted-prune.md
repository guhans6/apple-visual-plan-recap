# Companion Artifact Split And Hosted Prune Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the companion artifact route off `PlansPage` and then delete the remaining generic hosted plan actions that no longer belong to the visual companion product.

**Architecture:** Keep the companion dashboard, companion shell, local artifact reader, local feedback flow, and evidence model. Move the artifact rendering/editing path behind a companion-owned page component, then shrink `PlansPage` down to only the remaining hosted surface until the old delete/history/comment/version/export/import path can be removed safely.

**Tech Stack:** React Router, React Query, Vitest, Agent Native client actions, local MDX-backed companion artifacts.

---

## File Map

- `templates/plan/app/pages/CompanionArtifactPage.tsx`
  Current route entry for `/companion/plans/:slug` and `/companion/recaps/:slug`; still renders `PlansPage`.
- `templates/plan/app/pages/CompanionPage.tsx`
  Route adapter that passes the slug, kind, and repo path into the artifact page.
- `templates/plan/app/pages/PlansPage.tsx`
  Large mixed page that still owns local artifact rendering plus old hosted controls.
- `templates/plan/app/pages/CompanionWorkspaceShell.tsx`
  Companion chrome that must stay around the extracted artifact editor.
- `templates/plan/app/pages/companion-shell.ts`
  Builds the shell model from companion plan, feedback, evidence, and recap data.
- `templates/plan/app/hooks/use-companion-plan.ts`
  Companion-only queries and mutations that should remain after the split.
- `templates/plan/app/hooks/use-plans.ts`
  Generic hosted plan CRUD/history/comment/version/export/import hooks that should be pruned after the route no longer depends on them.
- `templates/plan/app/pages/CompanionPage.test.tsx`
  Main route-level proof for error state and companion workspace behavior.
- `templates/plan/app/pages/companion-shell.spec.ts`
  Companion shell model proof that should keep passing through the refactor.
- `templates/plan/app/pages/PlansPage.comments.test.ts`
  Current comment/annotation behavior checks; use it to preserve only the companion-needed pieces.
- `templates/plan/app/hooks/use-plans.spec.ts`
  Minimal hook coverage that will need to be rewritten or reduced when hosted hooks disappear.

## End-State Boundary

Keep:

- `/`
- `/companion/plans/:slug`
- `/companion/recaps/:slug`
- companion dashboard
- companion workspace shell
- local artifact rendering
- local feedback and resolution flow
- evidence/imported-result/recap coverage model

Remove:

- companion route dependence on `PlansPage`
- hosted delete plan flow
- hosted version history flow
- hosted comment delete/update API wiring that only exists for DB-backed plans
- hosted import/export action wiring
- leftover tests that only protect the removed hosted surface

### Task 1: Prove the companion route no longer renders `PlansPage`

**Files:**
- Create: `templates/plan/app/pages/CompanionArtifactEditor.tsx`
- Modify: `templates/plan/app/pages/CompanionArtifactPage.tsx`
- Modify: `templates/plan/app/pages/CompanionPage.test.tsx`
- Test: `templates/plan/app/pages/companion-shell.spec.ts`

- [ ] **Step 1: Write the failing route-level test**

```tsx
it("renders the companion artifact editor instead of the generic plans page", () => {
  hookMocks.useCompanionPlan.mockReturnValue({
    data: {
      plan: {
        title: "Checkout Flow",
        content: { blocks: [{ id: "overview", type: "markdown", data: {} }] },
      },
      summary: { openCommentCount: 0 },
      events: [],
      companionManifest: { targets: [] },
    },
  });
  hookMocks.useCompanionFeedback.mockReturnValue({ data: { pending: [] } });

  const html = renderToStaticMarkup(
    <MemoryRouter>
      <CompanionPage slug="checkout-flow" kind="plan" />
    </MemoryRouter>,
  );

  expect(html).toContain("Plan workspace");
  expect(html).not.toContain("data-testid=\"plans-page\"");
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/companion-shell.spec.ts
```

Expected: FAIL because `CompanionArtifactPage` still renders `PlansPage`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
export function CompanionArtifactEditor({
  slug,
  kind,
  repoPath,
}: CompanionArtifactEditorProps) {
  const plan = useCompanionPlan(slug, kind, repoPath);
  const feedback = useCompanionFeedback(slug, repoPath);
  return (
    <CompanionWorkspaceShell model={buildCompanionWorkspaceModel(...)}>
      <main data-testid="companion-artifact-editor">{/* companion-owned content */}</main>
    </CompanionWorkspaceShell>
  );
}
```

The first extraction only needs to own the companion path. It should render the current local artifact content and shell, but it must not call `PlansPage`.

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/companion-shell.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-06-22-companion-artifact-split-and-hosted-prune.md \
  templates/plan/app/pages/CompanionArtifactEditor.tsx \
  templates/plan/app/pages/CompanionArtifactPage.tsx \
  templates/plan/app/pages/CompanionPage.test.tsx \
  templates/plan/app/pages/companion-shell.spec.ts
git commit -m "refactor: split companion artifact route from plans page"
```

### Task 2: Move only companion-needed annotation and local editing behavior behind the new artifact editor

**Files:**
- Modify: `templates/plan/app/pages/CompanionArtifactEditor.tsx`
- Modify: `templates/plan/app/pages/PlansPage.tsx`
- Modify: `templates/plan/app/pages/PlansPage.comments.test.ts`
- Modify: `templates/plan/app/hooks/use-companion-plan.ts`

- [ ] **Step 1: Write one failing behavior test for retained companion interaction**

```ts
it("keeps inline companion annotations available without hosted popover-only mode", () => {
  expect(
    shouldOpenNativeSelectionCommentInline({
      companionShell: true,
      activeAnnotationId: "comment_1",
      selectionCollapsed: false,
    }),
  ).toBe(true);
});
```

- [ ] **Step 2: Run the focused tests to verify RED**

Run:
```bash
pnpm --filter plan test app/pages/PlansPage.comments.test.ts app/pages/CompanionPage.test.tsx
```

Expected: FAIL once the route split lands but companion-only comment behavior has not been fully migrated.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// Keep the companion-only helpers in the extracted editor.
// Leave hosted-only menus, delete flows, and version controls in PlansPage
// until Task 3 removes them completely.
```

Move only the companion-owned reader/editor behaviors:

- local artifact load/refetch
- companion feedback draft/resolve/consume flow
- annotation marker rendering
- native selection comment affordance
- companion shell side panels

Do not move hosted-only delete/history/export/import UI.

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run:
```bash
pnpm --filter plan test app/pages/PlansPage.comments.test.ts app/pages/CompanionPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/app/pages/CompanionArtifactEditor.tsx \
  templates/plan/app/pages/PlansPage.tsx \
  templates/plan/app/pages/PlansPage.comments.test.ts \
  templates/plan/app/hooks/use-companion-plan.ts \
  templates/plan/app/pages/CompanionPage.test.tsx
git commit -m "refactor: move companion artifact interactions out of plans page"
```

### Task 3: Remove the remaining hosted hook surface once the companion route is independent

**Files:**
- Modify: `templates/plan/app/hooks/use-plans.ts`
- Modify: `templates/plan/app/hooks/use-plans.spec.ts`
- Modify: `templates/plan/app/pages/PlansPage.tsx`
- Modify: `templates/plan/app/pages/HostedPlanHistorySheet.tsx`
- Modify: `templates/plan/app/pages/HostedPlanHistorySheet.test.tsx`

- [ ] **Step 1: Write a failing proof that the companion path no longer needs hosted hooks**

```tsx
it("does not reach hosted version history from the companion route", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <CompanionPage slug="checkout-flow" kind="plan" />
    </MemoryRouter>,
  );

  expect(html).not.toContain("Version history");
  expect(html).not.toContain("Delete plan");
});
```

- [ ] **Step 2: Run the focused tests to verify RED**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/hooks/use-plans.spec.ts app/pages/HostedPlanHistorySheet.test.tsx
```

Expected: FAIL while the route still relies on hosted hook wiring or while dead hosted exports remain under test.

- [ ] **Step 3: Write the minimal implementation**

Delete or stop exporting the hosted-only hooks that are no longer reachable:

```ts
useUpdatePlanComments
useDeletePlanComment
useDeletePlan
usePlanVersions
useExportPlan
useImportPlanSource
```

Also remove their last call sites from `PlansPage.tsx` and the hosted history sheet if those surfaces are no longer part of the product.

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run:
```bash
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/hooks/use-plans.spec.ts app/pages/HostedPlanHistorySheet.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/app/hooks/use-plans.ts \
  templates/plan/app/hooks/use-plans.spec.ts \
  templates/plan/app/pages/PlansPage.tsx \
  templates/plan/app/pages/HostedPlanHistorySheet.tsx \
  templates/plan/app/pages/HostedPlanHistorySheet.test.tsx \
  templates/plan/app/pages/CompanionPage.test.tsx
git commit -m "refactor: remove hosted plan action surface"
```

### Task 4: Delete stale hosted-only tests and do the final prune pass

**Files:**
- Modify: `templates/plan/AGENTS.md`
- Delete: hosted-only specs and helpers once no code references remain
- Test: remaining `templates/plan/app/pages/*` and `templates/plan/app/hooks/*` companion-focused suite

- [ ] **Step 1: Write the final failing cleanup proof**

```bash
rg -n "delete-visual-plan|restore-plan-version|export-visual-plan|import-plan-source|usePlanVersions|useDeletePlan" templates/plan/app templates/plan/server
```

Expected: matches still exist before the final prune.

- [ ] **Step 2: Run the cleanup probe and focused suite**

Run:
```bash
rg -n "delete-visual-plan|restore-plan-version|export-visual-plan|import-plan-source|usePlanVersions|useDeletePlan" templates/plan/app templates/plan/server
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/CompanionHomePage.test.tsx app/pages/companion-shell.spec.ts app/pages/PlansPage.comments.test.ts app/hooks/use-companion-plan.ts app/hooks/use-plans.spec.ts
```

Expected: the grep still finds stale symbols or the focused suite still encodes hosted assumptions.

- [ ] **Step 3: Write the minimal implementation**

Delete the last hosted-only tests and guidance that no longer match the product. Keep only companion-focused tests and operator docs.

- [ ] **Step 4: Run the cleanup probe and focused suite to verify GREEN**

Run:
```bash
rg -n "delete-visual-plan|restore-plan-version|export-visual-plan|import-plan-source|usePlanVersions|useDeletePlan" templates/plan/app templates/plan/server
pnpm --filter plan test app/pages/CompanionPage.test.tsx app/pages/CompanionHomePage.test.tsx app/pages/companion-shell.spec.ts app/pages/PlansPage.comments.test.ts app/hooks/use-plans.spec.ts app/pages/HostedPlanHistorySheet.test.tsx
```

Expected: the grep is empty for removed symbols, and the retained companion-focused tests PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/AGENTS.md \
  templates/plan/app/pages \
  templates/plan/app/hooks
git commit -m "test: prune stale hosted companion coverage"
```

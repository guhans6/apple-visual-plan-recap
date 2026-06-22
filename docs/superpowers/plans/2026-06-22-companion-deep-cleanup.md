# Visual Companion Deep Cleanup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:writing-plans` for any revision to this document, `superpowers:systematic-debugging` for breakages discovered during cleanup, and `tdd` for each implementation slice. Steps use checkbox syntax for tracking.

**Goal:** Finish the companion split in one coordinated cleanup pass so the retained product is a local visual companion only, with no remaining runtime dependence on the old generic hosted `plans` surface.

**Non-goal:** This plan does not redesign companion behavior. It removes inherited generic route, hook, action, test, and doc surfaces that still interfere with the local-first companion artifact workflow.

**Success condition:** A fresh developer can run `pnpm --filter plan dev`, land on `/`, open a companion plan or recap, annotate/review it, and never touch or reason about generic hosted `/plans` product concepts.

## Why Another Cleanup Pass Is Required

The public route surface has already been narrowed, but the implementation boundary is still mixed:

- `templates/plan/app/pages/CompanionPage.tsx` still renders `PlansPage`.
- `templates/plan/app/pages/PlansPage.tsx` still owns both companion mode and generic DB-backed plan mode.
- `templates/plan/app/hooks/use-plans.ts` still exports the generic plan query/mutation surface used by old hosted flows.
- `templates/plan/app/components/layout/Sidebar.tsx` still uses `usePlans()` for its listing model.
- `templates/plan/app/routes/review.$id.tsx` still routes through the old generic `PlansPage`.
- `templates/plan/actions/` and `templates/plan/server/plans.ts` still expose generic list/view/edit/comment/version flows that are no longer the target product.

This means the companion currently works partly by de-exposing old behavior, not by deleting it. That is the remaining source of confusion, accidental regressions, and test noise.

## Final Product Boundary

### Keep

- Root dashboard route:
  - `/`
- Companion artifact routes:
  - `/companion/plans/:slug`
  - `/companion/recaps/:slug`
- Local artifact roots:
  - `docs/visual-companion/plans/<slug>/`
  - `docs/visual-companion/recaps/<slug>/`
- Companion-specific actions:
  - dashboard listing
  - companion plan/recap loading
  - local folder read/update/promote
  - feedback read/update/resolve/consume
  - evidence, recap coverage, result import/export
- Shared low-level MDX/document rendering internals that are still required by the retained companion UX

### Remove

- Generic hosted `/plans` product concepts as first-class runtime dependencies
- Generic DB-backed plan list/view/edit/delete/version/comment action surface where the companion no longer needs it
- Generic route wrappers that exist only for the old product model
- Tests that only protect deleted generic behavior
- Docs and AGENTS guidance that still describe the repo as a generic hosted plans app

## Audit Summary

### Runtime Coupling That Must Be Broken First

- `templates/plan/app/pages/CompanionPage.tsx`
  - still imports `PlansPage`
- `templates/plan/app/pages/PlansPage.tsx`
  - still mixes:
    - overview listing
    - companion mode
    - generic DB mode
    - comment mutation flow
    - version history flow
    - import/export flow
    - delete flow
- `templates/plan/app/components/layout/Sidebar.tsx`
  - still reads plan list state via `usePlans()`
- `templates/plan/app/routes/review.$id.tsx`
  - still points generic review route at `PlansPage`

### Generic Surface Still Present In Actions

These are the main likely deletion candidates after the split:

- `templates/plan/actions/list-visual-plans.ts`
- `templates/plan/actions/get-visual-plan.ts`
- `templates/plan/actions/update-visual-plan.ts`
- `templates/plan/actions/delete-visual-plan.ts`
- `templates/plan/actions/reply-to-plan-comment.ts`
- `templates/plan/actions/resolve-plan-comment.ts`
- `templates/plan/actions/delete-plan-comment.ts`
- `templates/plan/actions/consume-plan-feedback.ts`
- `templates/plan/actions/list-plan-versions.ts`
- `templates/plan/actions/get-plan-version.ts`
- `templates/plan/actions/restore-plan-version.ts`
- `templates/plan/actions/export-visual-plan.ts`
- `templates/plan/actions/import-visual-plan-source.ts`

### Generic Surface Still Present In Tests And Docs

These need rewrite-or-delete review after the runtime split:

- `templates/plan/app/hooks/use-plans.spec.ts`
- `templates/plan/app/pages/PlansPage.comments.test.ts`
- `templates/plan/actions/delete-visual-plan.spec.ts`
- `templates/plan/actions/update-visual-plan.spec.ts`
- `templates/plan/actions/update-visual-plan-comment-flow.spec.ts`
- `templates/plan/actions/plan-comment-actions.spec.ts`
- `templates/plan/actions/plan-versions.spec.ts`
- `templates/plan/server/plans.events.spec.ts`
- `templates/plan/server/plan-mdx.spec.ts`
- `templates/plan/server/lib/public-action-paths.spec.ts`
- `templates/plan/docs/commenting-ux-plan.md`
- `templates/plan/AGENTS.md`

## Cleanup Strategy

Do this in dependency order. The key rule is:

- extract companion-owned runtime first
- migrate shared internals second
- delete generic wrappers third
- delete generic actions/tests/docs last

If deletion starts before the companion is fully detached from `PlansPage` and `usePlans`, the cleanup will stall halfway and leave a harder-to-understand hybrid.

## Task 1: Freeze The Retained Companion Contract

**Files:**

- Modify: `docs/visual-companion/current-verification-checklist.md`
- Modify: `templates/plan/docs/visual-companion-workflow.md`
- Modify: `templates/plan/AGENTS.md`

- [ ] Document the retained runtime contract as companion-only:
  - `/`
  - `/companion/plans/:slug`
  - `/companion/recaps/:slug`
  - local artifact roots under `docs/visual-companion/`
- [ ] Remove or rewrite instructions that still imply `PLAN_LOCAL_MODE=1` or a generic hosted plans product.
- [ ] Mark any remaining generic route or action compatibility as temporary and internal-only.

## Task 2: Extract A Companion-Owned Viewer Surface

**Files:**

- Add: `templates/plan/app/pages/CompanionArtifactPage.tsx`
- Add: companion-specific child components/hooks as needed under:
  - `templates/plan/app/pages/`
  - `templates/plan/app/components/plan/`
  - `templates/plan/app/hooks/`
- Modify: `templates/plan/app/pages/CompanionPage.tsx`
- Modify: `templates/plan/app/pages/PlansPage.tsx`

- [ ] Move the retained companion artifact view logic out of `PlansPage` into a companion-owned page component.
- [ ] Keep only the rendering behavior actually needed for:
  - local plan loading
  - local recap loading
  - annotation display
  - comment/review UI
  - evidence/context/history cards
- [ ] Make `CompanionPage` render the new companion-owned page directly.
- [ ] Reduce `PlansPage` to either:
  - a temporary generic compatibility page for `review.$id`, or
  - a thin wrapper around shared presentation pieces that are still truly reused

**Exit gate:** `CompanionPage.tsx` no longer imports `PlansPage`.

## Task 3: Split Companion Data Hooks From Generic Plan Hooks

**Files:**

- Add or extend companion-specific hooks:
  - `templates/plan/app/hooks/use-companion-plan.ts`
  - new companion dashboard/list hooks if needed
- Modify: `templates/plan/app/hooks/use-plans.ts`
- Modify: `templates/plan/app/components/layout/Sidebar.tsx`
- Modify: `templates/plan/app/components/layout/Header.tsx`
- Modify: `templates/plan/app/hooks/use-navigation-state.ts`

- [ ] Remove companion runtime dependence on `usePlans()` for dashboard/sidebar state.
- [ ] Give the sidebar a companion-native listing source, likely based on `list-companion-dashboard`.
- [ ] Keep `use-plans.ts` only if a temporary compatibility route still genuinely needs it.
- [ ] Delete companion-unneeded generic mutations from the live import graph.

**Exit gate:** no companion route or layout component imports `usePlans()`.

## Task 4: Collapse Generic Routes To The Minimum Compatibility Surface

**Files:**

- Modify/Delete: `templates/plan/app/routes/review.$id.tsx`
- Review for deletion if unused:
  - `templates/plan/app/routes/companion.plans.$slug.tsx`
  - `templates/plan/app/routes/companion.recaps.$slug.tsx`
  - route helpers in `templates/plan/app/routes.ts`
- Modify: `templates/plan/server/plans.ts`
- Modify: `templates/plan/server/lib/local-plan-files.ts`
- Modify: `templates/plan/server/plan-mdx.ts`

- [ ] Decide whether `review.$id` remains as a compatibility route or is deleted entirely.
- [ ] If it remains temporarily, isolate it so it does not pull companion runtime back through generic product code.
- [ ] Remove old `/plans` and `/recaps` path semantics from server helpers where the companion no longer needs them.
- [ ] Standardize all retained deep-link generation on the companion route model.

**Exit gate:** there is no public runtime path that requires the old generic `/plans` page model.

## Task 5: Delete Generic Plan Actions

**Files:**

- Delete or retire after import-graph proof:
  - `templates/plan/actions/list-visual-plans.ts`
  - `templates/plan/actions/get-visual-plan.ts`
  - `templates/plan/actions/update-visual-plan.ts`
  - `templates/plan/actions/delete-visual-plan.ts`
  - `templates/plan/actions/reply-to-plan-comment.ts`
  - `templates/plan/actions/resolve-plan-comment.ts`
  - `templates/plan/actions/delete-plan-comment.ts`
  - `templates/plan/actions/consume-plan-feedback.ts`
  - `templates/plan/actions/list-plan-versions.ts`
  - `templates/plan/actions/get-plan-version.ts`
  - `templates/plan/actions/restore-plan-version.ts`
  - `templates/plan/actions/export-visual-plan.ts`
  - `templates/plan/actions/import-visual-plan-source.ts`
- Modify:
  - `templates/plan/server/lib/public-action-paths.ts`
  - `templates/plan/server/lib/plan-connector-catalog.ts`

- [ ] Remove generic action exports from the public connector/action catalog.
- [ ] Delete generic action implementations once no retained route or hook imports them.
- [ ] Preserve only companion-specific action surface plus low-level helpers still used by retained companion flows.

**Exit gate:** the public action list describes companion actions only, not a general hosted plans CRUD API.

## Task 6: Prune Generic Server Internals That Become Dead

**Files:**

- Review and delete or narrow if unused:
  - `templates/plan/server/plans.ts`
  - `templates/plan/server/lib/public-plans.ts`
  - `templates/plan/server/lib/plan-versions.ts`
  - generic comment notification helpers if no longer needed outside companion flow
  - generic DB helpers tied only to removed routes/actions

- [ ] Run import/reference checks after action and route deletion.
- [ ] Move still-needed shared helpers into narrower companion-neutral utility files.
- [ ] Delete the rest instead of leaving dormant generic internals behind.

**Exit gate:** remaining server internals have an obvious reason to exist in a companion-only product.

## Task 7: Rewrite Or Delete Legacy Tests

**Files:**

- Delete or replace tests that only cover removed generic behavior
- Add/keep companion-focused tests for:
  - dashboard loading
  - companion route loading
  - invalid path/error state
  - annotation marker display
  - text-selection comment initiation
  - feedback persistence flows

- [ ] Remove test suites whose only subject is deleted generic plan CRUD/version/comment behavior.
- [ ] Port any still-valuable behavior expectations into companion-focused specs.
- [ ] Add regression coverage for the current known weak areas:
  - missing/invalid path should fail explicitly, not hang on skeleton
  - right sidebar/comment thread visibility
  - text-selection comment creation

**Exit gate:** the test suite describes the retained product, not the removed fork ancestry.

## Task 8: Rewrite Docs And Naming

**Files:**

- Modify: `templates/plan/README.md`
- Modify: `templates/plan/DEVELOPING.md`
- Modify: `templates/plan/docs/visual-companion-workflow.md`
- Modify/Delete: `templates/plan/docs/commenting-ux-plan.md`
- Modify: `docs/visual-companion/current-verification-checklist.md`

- [ ] Remove language that frames the app as a generic hosted plans product.
- [ ] Remove “local mode” wording unless it is strictly an internal implementation detail.
- [ ] Make companion verification steps the primary workflow in docs.
- [ ] Call out any temporary compatibility surface still intentionally retained.

## Verification Gates

Run these before calling the cleanup complete.

### Reference Gates

- [ ] `rg -n "import .*PlansPage|<PlansPage|usePlans\\(" templates/plan/app`
  - companion-owned routes/components should no longer hit these generic dependencies
- [ ] `rg -n "/plans|/recaps" templates/plan`
  - remaining matches should be intentional companion routes, fixture content, or explicitly documented compatibility
- [ ] `rg -n "PLAN_LOCAL_MODE" .`
  - should return no user-facing usage

### Focused Test Gates

- [ ] Run companion-focused app/action/plugin tests
- [ ] Add and run tests covering:
  - dashboard route
  - companion plan route
  - companion recap route
  - invalid path error state
  - sidebar/comment visibility
  - text-selection comment creation entrypoint

### Manual Verification Gates

- [ ] Start with `pnpm --filter plan dev`
- [ ] Open `/`
- [ ] Open a plan from the current project dashboard
- [ ] Open a recap from the current project dashboard
- [ ] Verify the right-side review surface is visible and usable
- [ ] Verify selecting text can start a new comment flow
- [ ] Verify no user-facing “local mode” language remains

## Recommended Execution Order

1. Freeze docs and product boundary
2. Extract companion artifact page
3. Split companion hooks/sidebar data
4. Collapse compatibility routes
5. Delete generic actions
6. Delete dead server internals
7. Rewrite tests
8. Run focused verification and manual checklist

## Risks

- `PlansPage.tsx` is large and currently mixes several concerns, so extraction work should be done in small TDD slices even if the overall cleanup is one pass.
- Some shared rendering logic inside `PlansPage` may still be worth keeping, but it must move under clearly named companion or neutral components rather than remain inside a generic page shell.
- Deleting old action files too early will break runtime imports in subtle ways. Prove import-graph detachment first, then delete.
- Old tests currently provide some incidental documentation. If deleted, replacement companion tests must land in the same pass.

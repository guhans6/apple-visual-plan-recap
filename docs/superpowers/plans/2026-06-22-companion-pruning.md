# Visual Companion Pruning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove leftover generic Plan app surfaces that are not part of the local visual companion and isolate the companion from inherited hosted-mode routes and tests.

**Architecture:** Prune in layers. First remove dead generated artifacts and clearly hosted-only routes/tests. Then split the companion entry path away from generic route wrappers. Finally replace the remaining `PlansPage` dependency with a companion-owned viewer surface so generic plan routes/actions can be deleted safely.

**Tech Stack:** React Router, React Query, Agent-Native actions, Vitest, Playwright

---

### Task 1: Remove dead generated artifacts and redirect-only routes

**Files:**
- Delete: `templates/plan/build/**`
- Delete: `templates/plan/e2e/.auth/**`
- Delete: `templates/plan/e2e/.report.json`
- Delete: `templates/plan/app/routes/extensions.tsx`
- Delete: `templates/plan/app/routes/extensions._index.tsx`
- Delete: `templates/plan/app/routes/extensions.$id.tsx`
- Delete: `templates/plan/app/routes/extensions.$id.$slug.tsx`

- [ ] Remove the generated build/e2e artifact files from the template.
- [ ] Remove the extension redirect routes that only bounce to `/plans`.
- [ ] Run a focused route/unit test batch.

### Task 2: Remove clearly hosted-only auth/realtime e2e suites

**Files:**
- Delete: `templates/plan/e2e/auth-first-paint.guest.spec.ts`
- Delete: `templates/plan/e2e/auth-state.ts`
- Delete: `templates/plan/e2e/global-setup.ts`
- Delete: `templates/plan/e2e/guest-mode.guest.spec.ts`
- Delete: `templates/plan/e2e/realtime-collab.spec.ts`

- [ ] Delete the hosted-auth guest/realtime e2e files that no longer match the companion contract.
- [ ] Confirm no remaining test imports reference the deleted auth helpers.

### Task 3: Isolate the companion route surface from generic wrappers

**Files:**
- Modify: `templates/plan/app/routes/plans.tsx`
- Modify: `templates/plan/app/routes/plans.$id.tsx`
- Modify: `templates/plan/app/pages/CompanionPage.tsx`
- Modify: `templates/plan/app/pages/PlansPage.tsx`

- [ ] Audit which pieces of `PlansPage` are still required in local companion mode.
- [ ] Move route-level generic `/plans` behavior behind explicit compatibility wrappers or retire it.
- [ ] Prepare a companion-owned viewer boundary so `CompanionPage` stops depending on generic route semantics.

### Task 4: Delete generic plan surfaces after the viewer split

**Files:**
- Modify/Delete: `templates/plan/actions/list-visual-plans.ts`
- Modify/Delete: `templates/plan/actions/get-visual-plan.ts`
- Modify/Delete: `templates/plan/actions/update-visual-plan.ts`
- Modify/Delete: `templates/plan/actions/*plan-comment*.ts`
- Modify/Delete: `templates/plan/e2e/*` remaining generic plan-editor suites

- [ ] Remove generic plan list/view/edit surfaces only after the companion viewer no longer depends on them.
- [ ] Keep only shared internals that the local companion truly reuses.

### Task 5: Verify and document remaining shared internals

**Files:**
- Modify: `templates/plan/docs/visual-companion-workflow.md`

- [ ] Run targeted Vitest coverage for the pruned surfaces.
- [ ] Update docs to describe what remains intentionally shared versus what was removed.

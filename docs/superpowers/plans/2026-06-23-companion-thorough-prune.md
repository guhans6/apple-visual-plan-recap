# Companion Thorough Prune Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining hosted/generic Plan product surface so this repository behaves as a local-first visual companion workspace with only companion-owned artifact creation, reading, feedback, and source-patching flows.

**Architecture:** Keep the companion dashboard, companion artifact routes, local feedback pipeline, local-folder reads/writes, source patching, companion import/export helpers, and recap usage tracking. Delete the hosted DB review surface in three layers: dead client/server actions, stale agent/operator guidance, and stale example/spec references that still describe the old hosted product. Where a retained companion action still depends on hosted internals, move that logic behind a companion-owned helper instead of preserving the old public action surface.

**Tech Stack:** React Router, React Query, Vitest, Node test runner, H3/Agent-Native actions, local MDX companion artifacts.

---

## File Map

- `package.json`
  Root verification entrypoint. Must run only retained companion-focused suites and prune contracts.
- `test/prune-cleanup-contract.test.mjs`
  Repo-level deletion contract. Extend it to fail if removed hosted action files or dead docs reappear.
- `templates/plan/app/hooks/use-companion-plan.ts`
  Retained companion client hooks.
- `templates/plan/app/hooks/use-plans.ts`
  Legacy generic hook file. Keep only the pieces still used by retained local-folder flows.
- `templates/plan/actions/create-visual-plan.ts`
  Retained creation surface, but still emits hosted-style fallback/link copy that must be aligned to companion reality.
- `templates/plan/actions/create-visual-recap.ts`
  Retained recap creation surface; currently calls `import-visual-plan-source` action internals and needs companion-owned import plumbing.
- `templates/plan/actions/import-visual-plan-source.ts`
  Candidate to extract into a non-public helper if the recap flow still needs the import logic after hosted action removal.
- `templates/plan/actions/`
  Hosted-only generic surface to prune:
  `list-visual-plans.ts`, `get-visual-plan.ts`, `get-plan-feedback.ts`,
  `reply-to-plan-comment.ts`, `resolve-plan-comment.ts`,
  `delete-plan-comment.ts`, `consume-plan-feedback.ts`,
  `list-plan-versions.ts`, `get-plan-version.ts`,
  `restore-plan-version.ts`, `delete-visual-plan.ts`,
  `export-visual-plan.ts`, plus their now-stale tests.
- `templates/plan/server/plans.ts`
  Shared plan path/deeplink helpers and authoring copy. Must stop implying missing hosted routes.
- `templates/plan/server/ui-plan-html.ts`
  Static example HTML still names `PlansPage.tsx`; update or remove stale hosted labels.
- `templates/plan/server/plans.spec.ts`
  Example/spec text still references deleted `PlansPage.tsx`; update to retained companion files.
- `templates/plan/AGENTS.md`
  Template operator instructions. Must stop pointing future agents at deleted hosted actions.
- `templates/plan/CLAUDE.md`
  Same guidance surface as `AGENTS.md`; keep them aligned.
- `templates/plan/.agents/skills/visual-plan/SKILL.md`
  Still steers agents into hosted `get-visual-plan`, `get-plan-feedback`, and export flows.
- `templates/plan/.agents/skills/visual-recap/SKILL.md`
  Same hosted-era assumptions as `visual-plan`.
- `templates/plan/docs/commenting-ux-plan.md`
  Historical design doc with direct `PlansPage.tsx` references. Either archive or rewrite to retained companion terminology.

## Retained Product Boundary

Keep:

- companion dashboard `/`
- `/companion/plans/:slug`
- `/companion/recaps/:slug`
- local folder reads and writes
- companion feedback queue, resolve, consume, and evidence
- source patching and import-result flows
- visual plan / recap creation only if they end in companion-owned local artifact flows

Remove:

- hosted generic plan read/list routes by DB id
- hosted comment-thread CRUD surface
- hosted version history / restore surface
- hosted hard/soft delete surface
- hosted export action surface
- operator docs/skills that still instruct agents to use the removed hosted actions
- stale code/spec/example references to `PlansPage.tsx` and the deleted hosted UI

### Task 1: Add a repo-wide prune contract for the remaining hosted action surface

**Files:**
- Modify: `test/prune-cleanup-contract.test.mjs`
- Modify: `package.json`
- Test: `test/prune-cleanup-contract.test.mjs`

- [ ] **Step 1: Write the failing prune contract**

```js
test("hosted generic plan actions are removed", async () => {
  const obsoleteActionPaths = [
    "templates/plan/actions/list-visual-plans.ts",
    "templates/plan/actions/get-visual-plan.ts",
    "templates/plan/actions/get-plan-feedback.ts",
    "templates/plan/actions/reply-to-plan-comment.ts",
    "templates/plan/actions/resolve-plan-comment.ts",
    "templates/plan/actions/delete-plan-comment.ts",
    "templates/plan/actions/consume-plan-feedback.ts",
    "templates/plan/actions/list-plan-versions.ts",
    "templates/plan/actions/get-plan-version.ts",
    "templates/plan/actions/restore-plan-version.ts",
    "templates/plan/actions/delete-visual-plan.ts",
    "templates/plan/actions/export-visual-plan.ts",
  ];

  for (const relativePath of obsoleteActionPaths) {
    await assertMissing(relativePath);
  }
});
```

- [ ] **Step 2: Run the contract to verify RED**

Run:
```bash
node --test test/prune-cleanup-contract.test.mjs
```

Expected: FAIL because those hosted action files still exist.

- [ ] **Step 3: Update the root verification command for retained suites**

```json
"test": "pnpm --filter @agent-native/skills test && pnpm --filter plan exec vitest --run server/lib/companion-manifest.spec.ts server/lib/companion-recap-coverage.spec.ts server/lib/companion-feedback-selectors.spec.ts server/lib/local-companion-dashboard.spec.ts actions/companion-actions.spec.ts server/plugins/auth.local-companion.spec.ts app/hooks/use-companion-plan.spec.ts app/hooks/use-plans.spec.ts app/pages/companion-shell.spec.ts app/pages/CompanionPage.test.tsx app/pages/CompanionHomePage.test.tsx app/pages/CompanionHomePage.interaction.spec.tsx actions/get-companion-plan.fixture.spec.ts actions/get-companion-generic.fixture.spec.ts actions/get-companion-recap.fixture.spec.ts actions/list-companion-dashboard.spec.ts && node --test test/*.test.mjs"
```

- [ ] **Step 4: Run the contract again after the implementation tasks below**

Run:
```bash
node --test test/prune-cleanup-contract.test.mjs
```

Expected: PASS once the hosted action files are actually removed.

- [ ] **Step 5: Commit**

```bash
git add package.json test/prune-cleanup-contract.test.mjs
git commit -m "test: add hosted surface prune contract"
```

### Task 2: Rewrite live operator surfaces to companion-only guidance

**Files:**
- Modify: `templates/plan/AGENTS.md`
- Modify: `templates/plan/CLAUDE.md`
- Modify: `templates/plan/.agents/skills/visual-plan/SKILL.md`
- Modify: `templates/plan/.agents/skills/visual-recap/SKILL.md`
- Test: `pnpm test`

- [ ] **Step 1: Write a failing text-level probe**

```bash
rg -n "get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan" \
  templates/plan/AGENTS.md \
  templates/plan/CLAUDE.md \
  templates/plan/.agents/skills/visual-plan/SKILL.md \
  templates/plan/.agents/skills/visual-recap/SKILL.md
```

Expected: matches exist before cleanup.

- [ ] **Step 2: Run the probe to verify RED**

Run the `rg` command above.

Expected: non-empty output showing hosted instructions are still present.

- [ ] **Step 3: Rewrite the guidance to the retained companion actions**

Replace hosted guidance with companion-owned guidance, for example:

```md
- Before edits on a local artifact, read pending feedback with `get-companion-feedback`.
- Read the artifact with `get-companion-plan` or `get-local-plan-folder`.
- Use `update-local-plan-folder`, `patch-visual-plan-source`, `resolve-local-plan-feedback`, and `consume-local-plan-feedback` for the local loop.
- Do not instruct agents to use hosted plan history, hosted export, hosted delete, or hosted comment-thread CRUD.
```

- [ ] **Step 4: Re-run the probe and retained test suite**

Run:
```bash
rg -n "get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan" \
  templates/plan/AGENTS.md \
  templates/plan/CLAUDE.md \
  templates/plan/.agents/skills/visual-plan/SKILL.md \
  templates/plan/.agents/skills/visual-recap/SKILL.md
pnpm test
```

Expected: the `rg` output is empty or reduced to deliberate historical docs outside the live operator surfaces; `pnpm test` PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/AGENTS.md templates/plan/CLAUDE.md \
  templates/plan/.agents/skills/visual-plan/SKILL.md \
  templates/plan/.agents/skills/visual-recap/SKILL.md
git commit -m "docs: align operator guidance to companion flows"
```

### Task 3: Remove hosted-only generic actions and their tests

**Files:**
- Delete: `templates/plan/actions/list-visual-plans.ts`
- Delete: `templates/plan/actions/get-visual-plan.ts`
- Delete: `templates/plan/actions/get-plan-feedback.ts`
- Delete: `templates/plan/actions/reply-to-plan-comment.ts`
- Delete: `templates/plan/actions/resolve-plan-comment.ts`
- Delete: `templates/plan/actions/delete-plan-comment.ts`
- Delete: `templates/plan/actions/consume-plan-feedback.ts`
- Delete: `templates/plan/actions/list-plan-versions.ts`
- Delete: `templates/plan/actions/get-plan-version.ts`
- Delete: `templates/plan/actions/restore-plan-version.ts`
- Delete: `templates/plan/actions/delete-visual-plan.ts`
- Delete: `templates/plan/actions/export-visual-plan.ts`
- Delete: `templates/plan/actions/delete-visual-plan.spec.ts`
- Delete: `templates/plan/actions/get-plan-feedback.spec.ts`
- Delete: `templates/plan/actions/plan-comment-actions.spec.ts`
- Delete: `templates/plan/actions/plan-versions.spec.ts`
- Modify: `templates/plan/app/hooks/use-plans.ts`
- Modify: `templates/plan/app/hooks/use-plans.spec.ts`
- Test: `test/prune-cleanup-contract.test.mjs`
- Test: `pnpm test`

- [ ] **Step 1: Use the prune contract from Task 1 as the failing test**

```bash
node --test test/prune-cleanup-contract.test.mjs
```

Expected: FAIL until the hosted action files are removed.

- [ ] **Step 2: Run the contract to verify RED**

Run the same command above.

Expected: failure naming the still-present hosted actions.

- [ ] **Step 3: Delete the hosted-only actions/tests and trim the client hook file**

Delete the listed action and spec files. In `templates/plan/app/hooks/use-plans.ts`, keep only the still-used local-folder/generic helper surface:

```ts
export function usePlans(...) { ... }
export function usePlan(...) { ... }
export function useUpdatePlan(...) { ... }
export function useUpdatePlanStatus(...) { ... }
export function useUpdateLocalPlan(...) { ... }
export function usePromoteLocalPlan(...) { ... }
export function useUpdateLocalPlanFeedback(...) { ... }
export function useResolveLocalPlanFeedback(...) { ... }
```

And keep the hook spec proving the removed hosted exports do not exist.

- [ ] **Step 4: Run verification**

Run:
```bash
node --test test/prune-cleanup-contract.test.mjs
pnpm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add test/prune-cleanup-contract.test.mjs \
  templates/plan/actions \
  templates/plan/app/hooks/use-plans.ts \
  templates/plan/app/hooks/use-plans.spec.ts
git commit -m "refactor: remove hosted generic plan actions"
```

### Task 4: Remove stale code/spec/example references to deleted hosted UI and actions

**Files:**
- Modify: `templates/plan/server/plans.spec.ts`
- Modify: `templates/plan/server/ui-plan-html.ts`
- Modify/Delete: `templates/plan/docs/commenting-ux-plan.md`
- Modify: `docs/superpowers/plans/2026-06-22-companion-*.md` only if they are still active guidance
- Test: `pnpm test`

- [ ] **Step 1: Write the failing text probe**

```bash
rg -n "PlansPage\\.tsx|get-plan-feedback|list-plan-versions|restore-plan-version|delete-visual-plan" \
  templates/plan/server/plans.spec.ts \
  templates/plan/server/ui-plan-html.ts \
  templates/plan/docs/commenting-ux-plan.md
```

Expected: matches exist before cleanup.

- [ ] **Step 2: Run the probe to verify RED**

Run the `rg` command above.

Expected: non-empty output.

- [ ] **Step 3: Rewrite or remove stale references**

Examples:

```ts
expect(html).toContain("CompanionArtifactEditor.tsx");
expect(html).not.toContain("PlansPage.tsx:210");
```

And update static HTML tabs to companion-owned labels such as:

```html
<strong>CompanionArtifactEditor.tsx</strong><span>Companion artifact reader and review shell</span>
```

If `commenting-ux-plan.md` is now only historical hosted design debt, move or remove the hosted-only sections rather than preserving broken file references.

- [ ] **Step 4: Run verification**

Run:
```bash
rg -n "PlansPage\\.tsx|get-plan-feedback|list-plan-versions|restore-plan-version|delete-visual-plan" \
  templates/plan/server/plans.spec.ts \
  templates/plan/server/ui-plan-html.ts \
  templates/plan/docs/commenting-ux-plan.md
pnpm test
```

Expected: probe is empty or limited to intentional archived history outside the active runtime docs; `pnpm test` PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/server/plans.spec.ts \
  templates/plan/server/ui-plan-html.ts \
  templates/plan/docs/commenting-ux-plan.md
git commit -m "docs: remove stale hosted UI references"
```

### Task 5: Move retained creation flows off hosted link semantics

**Files:**
- Modify: `templates/plan/actions/create-visual-plan.ts`
- Modify: `templates/plan/actions/create-ui-plan.ts`
- Modify: `templates/plan/actions/create-prototype-plan.ts`
- Modify: `templates/plan/actions/create-plan-design.ts`
- Modify: `templates/plan/actions/create-visual-questions.ts`
- Modify: `templates/plan/actions/create-visual-recap.ts`
- Modify: `templates/plan/actions/import-visual-plan-source.ts`
- Create or Modify: companion-owned server helper under `templates/plan/server/lib/`
- Test: retained action fixture/spec suites that exercise companion creation paths

- [ ] **Step 1: Write one failing link/copy assertion**

```ts
expect(result.fallbackInstructions).not.toContain("get-plan-feedback");
expect(result.path).toContain("/companion/");
expect(result.url).toContain("/companion/");
```

- [ ] **Step 2: Run focused creation tests to verify RED**

Run:
```bash
pnpm --filter plan test \
  actions/companion-actions.spec.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts
```

Expected: FAIL once the assertions are added because the retained creation flows still emit hosted-style links/copy or still depend on hosted action entrypoints.

- [ ] **Step 3: Write the minimal implementation**

Move the import logic used by `create-visual-recap` behind a companion-owned helper, then update retained creation actions to return companion-owned local artifact paths and instructions, for example:

```ts
fallbackInstructions:
  "Open the companion artifact, review the local blocks and evidence, then resolve or consume companion feedback from the local queue before continuing."
```

Do not keep `planDeepLink(plan.id)` if the live UI no longer has a matching hosted route.

- [ ] **Step 4: Run focused creation tests and full verification**

Run:
```bash
pnpm --filter plan test \
  actions/companion-actions.spec.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts
pnpm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/plan/actions/create-visual-plan.ts \
  templates/plan/actions/create-ui-plan.ts \
  templates/plan/actions/create-prototype-plan.ts \
  templates/plan/actions/create-plan-design.ts \
  templates/plan/actions/create-visual-questions.ts \
  templates/plan/actions/create-visual-recap.ts \
  templates/plan/actions/import-visual-plan-source.ts \
  templates/plan/server/lib
git commit -m "refactor: align creation flows to companion routes"
```

# Visual Companion Repo Prune Root Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the root `VisualDesign` repo to one coherent local visual companion product by promoting the real companion slice, deleting imported legacy trees and generated artifacts, and removing Apple-only or hosted-era residue that would interfere with future feature work.

**Architecture:** Treat the current tracked root as a small prototype, not the final product. Promote only the retained companion implementation from `BuilderIO-agent-native-restructure/templates/plan` plus the minimal supporting `packages/core` and `packages/skills` surface into the root repo, then delete the nested imported trees and all non-companion packages, routes, tests, and docs. The final repo should have one identity: a private, local-first artifact review desk for plans, recaps, diffs, evidence, imports, and feedback.

**Tech Stack:** Node 22, pnpm workspace, React Router plan app, TypeScript, Vitest, MDX local artifacts, JSONL sidecars, local feedback/evidence actions.

---

## Audit Summary

The current tree has three competing identities:

- The tracked root is an Apple-specific prototype:
  - `README.md`
  - `package.json`
  - `skills/visual-plan/SKILL.md`
  - `skills/visual-recap/SKILL.md`
  - `examples/apple-settings-pane/*`
  - `src/local-plan-server.js`
  - `src/local-feedback.js`
  - `test/local-plan-server.test.mjs`
  - `test/local-feedback.test.mjs`
- The untracked `BuilderIO-agent-native-restructure/` tree contains the real companion-oriented implementation and planning artifacts:
  - `templates/plan/app/routes/companion.plans.$slug.tsx`
  - `templates/plan/app/routes/companion.recaps.$slug.tsx`
  - `templates/plan/app/hooks/use-companion-plan.ts`
  - `templates/plan/actions/get-companion-feedback.ts`
  - `templates/plan/actions/import-companion-result.ts`
  - `templates/plan/server/lib/companion-*.ts`
  - `templates/plan/server/lib/local-companion-dashboard.ts`
  - `templates/plan/docs/local-visual-companion-workflow.md`
  - `docs/prd/2026-06-18-local-visual-companion.md`
  - `docs/adr/2026-06-22-visual-companion-repo-prune.md`
- Two imported upstream trees still exist locally and are massive sources of noise:
  - `BuilderIO-agent-native/` about `3.7G` with about `2493` spec/test files
  - `BuilderIO-agent-native-restructure/` about `3.4G` with about `2220` spec/test files

Recommendation:

- Canonical product source of truth becomes the retained companion slice from `BuilderIO-agent-native-restructure/`.
- The current tracked root prototype is either deleted or rewritten around that slice.
- Imported trees, generated outputs, old Apple-only fixtures, and hosted-era docs/tests are removed after promotion.

## Final Product Boundary

### Keep

- One root app workspace for the local companion.
- Local companion routes:
  - `/`
  - `/companion/plans/:slug`
  - `/companion/recaps/:slug`
- Local artifact contracts:
  - `docs/visual-companion/plans/<slug>/`
  - `docs/visual-companion/recaps/<slug>/`
- Companion actions and sidecar helpers:
  - plan folder read/update
  - feedback read/update/resolve/consume
  - evidence and recap coverage helpers
  - export/import result loop
- Only the skill catalog entries that materially support this repo:
  - `visual-plan`
  - `visual-recap`
  - `quick-recap` if still used by the companion workflow
- One short upstream provenance note in top-level docs.

### Remove

- Apple-only repo positioning.
- Hosted, public, team, login, guest, share, publish, and embedded chat positioning.
- Imported upstream working copies as permanent repo neighbors.
- Generated build output checked into local working state:
  - `.react-router/`
  - `.output/`
  - `build/`
  - `node_modules/`
  - `.pnpm-store/`
- Broad multi-template workspace sprawl.
- Non-companion packages, routes, tests, workflows, and docs.

## File Map

### Root files that must change

- Modify: `README.md`
- Modify: `package.json`
- Create or replace: `pnpm-workspace.yaml`
- Modify: `docs/`
- Modify: `skills/`
- Modify: `scripts/`
- Delete: `DESIGN.md`
- Delete: `examples/apple-settings-pane/*`
- Delete: `src/local-plan-server.js`
- Delete: `src/local-feedback.js`
- Delete: `test/local-plan-server.test.mjs`
- Delete: `test/local-feedback.test.mjs`

### Nested files to promote into the root repo

- Promote: `BuilderIO-agent-native-restructure/templates/plan/**`
- Promote: `BuilderIO-agent-native-restructure/packages/core/**` only for imports actually used by `templates/plan`
- Promote: `BuilderIO-agent-native-restructure/packages/skills/**` only for the retained skill install/runtime path
- Promote selectively: `BuilderIO-agent-native-restructure/docs/prd/2026-06-18-local-visual-companion.md`
- Promote selectively: `BuilderIO-agent-native-restructure/docs/prd/2026-06-20-project-local-visual-companion-bootstrap.md`
- Promote selectively: `BuilderIO-agent-native-restructure/docs/prd/2026-06-20-local-companion-home-dashboard.md`
- Promote selectively: `BuilderIO-agent-native-restructure/templates/plan/docs/local-visual-companion-workflow.md`
- Promote selectively: `BuilderIO-agent-native-restructure/docs/adr/2026-06-22-visual-companion-repo-prune.md`

### Nested files and trees to delete after promotion

- Delete: `BuilderIO-agent-native-restructure/`
- Delete: `BuilderIO-agent-native/`
- Delete: `BuilderIO-skills/`

## Task 1: Freeze The Canonical Baseline

**Files:**
- Modify: `.gitignore`
- Create: `docs/adr/2026-06-22-root-visual-companion-baseline.md`
- Create: `docs/reviews/2026-06-22-root-prune-audit.md`

- [ ] **Step 1: Record the keep/remove decision in the tracked root**

Create `docs/adr/2026-06-22-root-visual-companion-baseline.md` with:

```md
# ADR: Root Visual Companion Baseline

## Status

Accepted

## Decision

The tracked root repo is the only canonical home.

The retained implementation baseline comes from the companion-specific slice of
the untracked `BuilderIO-agent-native-restructure/` import, not from the
Apple-only root prototype and not from the full upstream worktrees.

The final repo keeps:

- local companion app routes
- local artifact folders
- feedback, evidence, and recap coverage sidecars
- bundled visual companion skills

The final repo removes:

- Apple-only product framing
- hosted and public workflow framing
- imported upstream repo copies
- non-companion packages and templates
```

- [ ] **Step 2: Prevent accidental recommit of imported worktrees while pruning is in progress**

Update `.gitignore` so the temporary local-only imports and package store are ignored during migration:

```gitignore
.pnpm-store/
BuilderIO-agent-native-restructure/
BuilderIO-agent-native/
BuilderIO-skills/
```

- [ ] **Step 3: Capture the pre-prune audit evidence**

Create `docs/reviews/2026-06-22-root-prune-audit.md` summarizing:

```md
- root tracked product is Apple-specific and too small
- `BuilderIO-agent-native-restructure/` contains the desired companion routes/actions/docs
- imported trees contribute about 7.1G and about 4713 spec/test files
- future feature work should happen only after the root identity is made single-source
```

## Task 2: Promote The Real Companion App Into The Root

**Files:**
- Create or replace: `app/**`
- Create or replace: `server/**`
- Create or replace: `actions/**`
- Create or replace: `shared/**`
- Create or replace: `docs/visual-companion/**`
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Promote the plan app as the root application instead of keeping it nested**

Copy the retained app surface out of `BuilderIO-agent-native-restructure/templates/plan/` into root-owned paths. The promoted surface must include:

```text
app/
server/
actions/
shared/
public/
components.json
playwright.config.ts
react-router.config.ts
tsconfig.json
vite.config.ts
vitest.config.ts
```

- [ ] **Step 2: Keep companion-only routes and remove legacy route carryover during promotion**

The promoted route set must keep:

```text
app/routes/_index.tsx
app/routes/companion.plans.$slug.tsx
app/routes/companion.recaps.$slug.tsx
```

Delete or do not promote route files whose purpose is hosted or legacy-local compatibility:

```text
app/routes/local-plans.$slug.tsx
app/routes/recaps.$id.tsx
app/routes/recaps.tsx
```

The approved workflow doc already uses `/companion/plans/:slug` and
`/companion/recaps/:slug`, so these compatibility routes should be removed from
the final root app.

- [ ] **Step 3: Promote only the companion server/actions layer**

Keep and wire these modules into root:

```text
actions/get-companion-plan.ts
actions/get-companion-feedback.ts
actions/update-local-plan-feedback.ts
actions/resolve-companion-feedback.ts
actions/consume-companion-feedback.ts
actions/export-companion-selection.ts
actions/import-companion-result.ts
actions/list-local-companion-dashboard.ts
server/lib/companion-feedback.ts
server/lib/companion-feedback-selectors.ts
server/lib/companion-manifest.ts
server/lib/companion-recap-coverage.ts
server/lib/companion-evidence.ts
server/lib/companion-targeting.ts
server/lib/local-plan-files.ts
server/lib/local-plan-feedback.ts
server/lib/local-companion-dashboard.ts
```

Do not promote hosted-only actions such as:

```text
create-visual-plan
update-visual-plan
get-visual-plan
publish-visual-plan
```

If a retained local route currently imports one of these, replace that route
dependency rather than promoting the hosted action.

## Task 3: Reduce Supporting Packages To The Minimum Runtime

**Files:**
- Create or replace: `packages/core/**`
- Create or replace: `packages/skills/**`
- Modify: `pnpm-workspace.yaml`
- Modify: root `package.json`

- [ ] **Step 1: Promote only `packages/core` modules that the root app imports**

Before copying, generate the import list:

```bash
rg -n "from '@agent-native/core|from \"@agent-native/core|from '../|from \"../" app server actions shared packages
```

Only keep the `packages/core` source paths needed by those imports. Based on the current nested app, expect to keep a subset around:

```text
packages/core/src/blocks/**
packages/core/src/client/**
packages/core/src/db/**
packages/core/src/server/**
packages/core/src/file-upload/**
packages/core/src/local-artifacts/**
packages/core/src/workspace-files/**
```

- [ ] **Step 2: Drop irrelevant packages entirely**

Delete:

```text
packages/code-agents-ui/
packages/desktop-app/
packages/dispatch/
packages/docs/
packages/embedding/
packages/frame/
packages/migrate/
packages/mobile-app/
packages/pinpoint/
packages/scheduling/
packages/shared-app-config/
packages/vscode-extension/
```

- [ ] **Step 3: Keep only the skill runtime and the companion-relevant catalog entries**

Retain:

```text
packages/skills/src/**
packages/skills/catalog/visual-plan/**
packages/skills/catalog/visual-recap/**
packages/skills/catalog/quick-recap/**
```

Delete or do not promote:

```text
packages/skills/catalog/agent-watchdog/**
packages/skills/catalog/efficient-fable/**
packages/skills/catalog/efficient-frontier/**
packages/skills/catalog/plan-arbiter/**
packages/skills/catalog/plow-ahead/**
packages/skills/catalog/read-the-damn-docs/**
packages/skills/catalog/stay-within-limits/**
```

after removing any remaining imports from the promoted root app.

## Task 4: Rewrite The Root Product Identity

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `docs/**`
- Modify: `skills/visual-plan/SKILL.md`
- Modify: `skills/visual-recap/SKILL.md`
- Create: `docs/visual-companion/README.md`

- [ ] **Step 1: Replace Apple-only metadata and naming**

Change the root package metadata to:

```json
{
  "name": "visual-companion-local",
  "description": "Private local visual companion workspace for reviewing plans, recaps, diffs, evidence, and feedback."
}
```

Remove:

```text
apple-visual-plan-recap
Apple Visual Plan/Recap
apple-settings-pane
```

from product identity strings. Apple may remain only inside one retained domain
pack example fixture, not in repo-wide naming.

- [ ] **Step 2: Rewrite the root README to one product story**

The opening section should look like:

```md
# Visual Companion

Private local-first review desk for coding-agent artifacts.

This repo opens local plans, recaps, diffs, evidence, and imported results,
lets a developer leave structured feedback on exact targets, and keeps the
review trail in readable local files.

This repo started from `BuilderIO/agent-native` and now maintains a narrowed
local companion product boundary.
```

- [ ] **Step 3: Replace old Apple prototype docs with companion docs**

Keep or create:

```text
docs/visual-companion/README.md
docs/prd/2026-06-18-local-visual-companion.md
docs/prd/2026-06-20-project-local-visual-companion-bootstrap.md
docs/prd/2026-06-20-local-companion-home-dashboard.md
docs/adr/2026-06-22-visual-companion-repo-prune.md
docs/reviews/2026-06-22-root-prune-audit.md
```

Delete:

```text
docs/prd/apple-visual-plan-recap-prd.md
docs/issues/apple-visual-plan-recap-issues.md
docs/prd/agent-native-generic-apple-visual-workflow-prd.md
docs/issues/agent-native-generic-apple-visual-workflow-issues.md
docs/reviews/apple-visual-gatekeeper-review.md
docs/reviews/apple-visual-implementation-gatekeeper-review.md
docs/reviews/agent-native-generic-apple-gatekeeper-review.md
docs/self-hosting.md
docs/superpowers/specs/2026-06-18-agent-native-generic-apple-visual-workflow-design.md
docs/superpowers/plans/2026-06-17-apple-visual-plan-recap.md
```

once their retained content has been folded into the companion docs.

## Task 5: Remove Legacy Fixtures, Scripts, And Tests That Disturb Future Work

**Files:**
- Delete: `examples/apple-settings-pane/**`
- Delete: `src/**`
- Delete: `test/**`
- Modify: `scripts/**`
- Delete: generated folders under promoted app

- [ ] **Step 1: Delete the root prototype implementation once the promoted app covers its use cases**

Remove:

```text
src/local-plan-server.js
src/local-feedback.js
test/local-plan-server.test.mjs
test/local-feedback.test.mjs
scripts/serve-local-plan.mjs
scripts/check-skills.mjs
scripts/validate-sample-plan.mjs
examples/apple-settings-pane/
```

after the promoted companion app can:

```text
- serve a local dashboard
- open plan and recap routes
- read/write feedback sidecars
- show evidence and recap coverage
```

- [ ] **Step 2: Remove generated and duplicate nested artifacts before final verification**

Delete any promoted generated output and imported-build leftovers:

```text
.react-router/
.output/
build/
node_modules/
.pnpm-store/
BuilderIO-agent-native/
BuilderIO-agent-native-restructure/
BuilderIO-skills/
```

- [ ] **Step 3: Narrow the verification suite to companion scope**

Keep tests around:

```text
app/hooks/use-companion-plan.spec.ts
app/pages/companion-shell.spec.ts
server/lib/companion-manifest.spec.ts
server/lib/companion-recap-coverage.spec.ts
server/lib/companion-feedback-selectors.spec.ts
server/lib/local-companion-dashboard.spec.ts
actions/companion-actions.spec.ts
actions/get-companion-plan.fixture.spec.ts
actions/get-companion-generic.fixture.spec.ts
actions/get-companion-recap.fixture.spec.ts
actions/list-local-companion-dashboard.spec.ts
```

Delete or stop running tests for:

```text
guest/auth/share/publish/collab/chat/email/team/public/extension/mobile/desktop flows
```

## Task 6: Run The Final Coherence Gate

**Files:**
- Modify as needed: root docs, route files, tests, package metadata
- Create: `docs/reviews/2026-06-22-root-prune-gatekeeper.md`

- [ ] **Step 1: Run repo-identity grep checks**

Run:

```bash
rg -n "apple-visual|Apple Visual|agent-native generic apple|hosted|publish|share|team|login|guest|collab|chat|realtime|workspace of apps" README.md docs package.json skills app server actions packages
```

Expected:

```text
Only intentional provenance, historical ADR references, or explicitly retained domain-pack examples remain.
```

- [ ] **Step 2: Run focused verification only for the retained companion product**

Run:

```bash
pnpm install
pnpm --filter plan test app/hooks/use-companion-plan.spec.ts app/pages/companion-shell.spec.ts server/lib/companion-manifest.spec.ts server/lib/companion-recap-coverage.spec.ts server/lib/companion-feedback-selectors.spec.ts server/lib/local-companion-dashboard.spec.ts actions/companion-actions.spec.ts actions/get-companion-plan.fixture.spec.ts actions/get-companion-generic.fixture.spec.ts actions/get-companion-recap.fixture.spec.ts actions/list-local-companion-dashboard.spec.ts
pnpm --filter plan typecheck
git diff --check
```

- [ ] **Step 3: Record the final gatekeeper verdict honestly**

Create `docs/reviews/2026-06-22-root-prune-gatekeeper.md` with:

```md
- what was promoted into the root repo
- what legacy trees were deleted
- which old docs/tests/routes were removed
- which verification commands passed
- what remains intentionally deferred
```

## Spec Coverage Check

- Single repo identity: covered by Tasks 1, 2, and 4.
- Old code should not interfere with future feature work: covered by Tasks 3 and 5.
- Old tests should not disturb implementation: covered by Task 5.
- Keep the useful companion product and remove old hosted or Apple-only residue: covered by Tasks 2, 3, and 4.
- Honest final verification instead of optimistic cleanup claims: covered by Task 6.

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6

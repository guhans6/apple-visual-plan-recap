# PRD: Companion Hosted Surface Removal

## Problem Statement

After the root repo was narrowed toward Visual Companion, hosted-era action files, docs, examples, and skill instructions still describe the old generic Plan product. They point agents at hosted actions such as generic plan read/list, hosted feedback CRUD, export, delete, version history, and restore flows. This creates confusion and makes future agents preserve or rebuild features that are outside the local artifact companion.

From the developer's perspective, this is wasted time. The product should only keep local artifact review, visual plans/recaps, feedback sidecars, evidence, and agent-readable companion actions.

## Solution

Remove hosted-only generic actions, tests, docs, and operator guidance after the retained companion shell and artifact workflow are protected by contracts. Creation flows that remain useful must end in local companion artifacts and companion routes. Live instructions must point agents only to companion-owned actions and local files.

The outcome should be a repo that presents one product: a local visual companion review desk. Anything unrelated to that product should be deleted, not hidden behind compatibility language.

## User Stories

1. As a developer, I want hosted generic plan actions removed, so that future work does not accidentally target dead product paths.
2. As a developer, I want hosted comment CRUD removed, so that feedback behavior is centered on companion sidecars.
3. As a developer, I want hosted export/delete/version history removed, so that local artifact review does not inherit unrelated product responsibilities.
4. As a developer, I want skill instructions to name companion actions, so that coding agents read the correct feedback queue.
5. As a coding agent, I want a single action contract for pending feedback, so that I can act on comments without guessing which legacy action to call.
6. As a coding agent, I want imported results tied to companion feedback IDs and evidence, so that completed work stays auditable.
7. As a developer, I want visual creation commands to produce local artifacts and companion links, so that generated plans and recaps open in the right UI.
8. As a developer, I want stale `PlansPage` examples removed, so that docs describe the actual companion screens.
9. As a maintainer, I want deletion contracts for hosted files, so that removed surfaces cannot silently return.
10. As a maintainer, I want root verification focused on retained companion suites, so that tests reflect the product boundary.
11. As a maintainer, I want docs and PRDs to agree on the active product boundary, so that future planning does not reintroduce hosted behavior.
12. As a developer, I want unnecessary package dependencies removed after references are deleted, so that the plan app stays small and local-first.

## Implementation Decisions

- Delete hosted-only generic action files and their tests once the retained companion flow is protected by the foundation contract.
- Rewrite live operator docs and bundled visual plan/recap skill instructions to use `get-companion-plan`, `get-companion-feedback`, `update-companion-feedback`, `resolve-companion-feedback`, `consume-companion-feedback`, `export-companion-selection`, and `import-companion-result`.
- Remove stale active references to hosted UI files and old action names from examples/specs. Historical docs may remain only if they are clearly not current execution guidance.
- Align visual plan, UI plan, prototype plan, plan design, visual questions, and visual recap creation flows so their links and fallback instructions point to companion routes and local artifact review.
- Move any retained import logic behind companion-owned helpers. Do not preserve public hosted action entrypoints just because a retained flow needs internal logic.
- Remove unused plan-level dependencies only after source import probes show they are no longer used by the retained companion workflow.

## Testing Decisions

- Extend the repo-level contract to assert hosted-only files are missing and live operator docs do not mention removed hosted actions.
- Run focused tests for companion actions, plan/recap fixtures, feedback selectors, local dashboard, auth-local companion behavior, and creation flows.
- Use source probes to prove removed action names are absent from live docs and active code.
- Use dependency probes to prove package removals are backed by absent imports.
- Browser verification from the shell PRD remains the final product-level check: dashboard, artifact routes, visuals, comments, persistence, and agent-readable feedback must still work.

## Out of Scope

- Recreating hosted plan CRUD, hosted comment thread UI, hosted export, hosted delete, hosted version history, hosted restore, org/team behavior, sharing/public distribution, or built-in chat.
- Maintaining compatibility routes for deleted hosted actions.
- Building new artifact features beyond correcting creation flows to target the local companion.

## Further Notes

This PRD implements the second half of `docs/superpowers/plans/2026-06-23-local-visual-companion-foundation-prune.md`: after the shell is narrowed and protected, delete hosted-era action/docs residue and remove unused dependencies.

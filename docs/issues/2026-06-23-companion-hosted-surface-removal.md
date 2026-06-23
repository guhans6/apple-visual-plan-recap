# Issue: Delete hosted Plan surfaces after the local companion shell is protected

Labels: `ready-for-agent`, `enhancement`

## Parent

PRD: #39, `docs/prd/2026-06-23-companion-hosted-surface-removal.md`

Plan: `docs/superpowers/plans/2026-06-23-local-visual-companion-foundation-prune.md`

## What to build

Remove hosted-era generic Plan actions, tests, examples, and live operator guidance once the retained local companion workflow is protected by contracts. Creation flows that still matter must produce local companion artifacts and companion links. Active docs and bundled skills must point agents only to companion-owned actions and local files.

This slice deletes unneeded hosted behavior rather than hiding it behind compatibility language.

## Acceptance criteria

- [ ] Hosted generic plan read/list, hosted feedback CRUD, hosted export, hosted delete, and hosted version-history action files and tests are removed.
- [ ] Live operator docs and bundled visual plan/recap skills use only companion actions: `get-companion-plan`, `get-companion-feedback`, `update-companion-feedback`, `resolve-companion-feedback`, `consume-companion-feedback`, `export-companion-selection`, and `import-companion-result`.
- [ ] Active docs/spec examples no longer point at stale hosted UI or deleted hosted action names.
- [ ] Visual plan, UI plan, prototype plan, plan design, visual questions, and visual recap creation flows return companion-owned local artifact paths and instructions.
- [ ] Any retained import logic is moved behind companion-owned helpers; public hosted action entrypoints are not preserved just to reuse internal logic.
- [ ] Source probes prove deleted hosted action names are absent from active code and live docs.
- [ ] Plan-level dependencies for removed surfaces are deleted only after import probes prove they are unused by the retained companion workflow.
- [ ] Root verification and focused companion tests pass.

## Blocked by

Blocked by #40 because deletion should happen after retained artifact routes, comments, visuals, and feedback are protected.

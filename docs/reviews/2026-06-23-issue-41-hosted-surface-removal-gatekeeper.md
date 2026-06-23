# Gatekeeper Review: Issue #41 Hosted Plan Surface Removal

Date: 2026-06-23
Status: PASS

## Scope Reviewed

- Issue #41: delete hosted Plan surfaces after the local companion shell is protected.
- Reviewed action files, live operator docs, bundled visual-plan/visual-recap skills, source probes, retained companion tests, and plan typecheck.

## Acceptance Check

PASS: Hosted generic action files and tests are removed.

- Confirmed absent: `list-visual-plans`, `get-visual-plan`, `get-plan-feedback`, `reply-to-plan-comment`, `resolve-plan-comment`, `delete-plan-comment`, `consume-plan-feedback`, `update-visual-plan`, `list-plan-versions`, `get-plan-version`, `restore-plan-version`, `delete-visual-plan`, and `export-visual-plan`.
- Confirmed absent focused tests for deleted hosted actions, including the hosted update/comment-flow tests.

PASS: Live operator docs and bundled skills route through companion-owned local flows.

- `templates/plan/AGENTS.md` and `templates/plan/CLAUDE.md` now describe the companion browser as review/read/comment first.
- `visual-plan` and `visual-recap` skills no longer route plan edits through hosted update actions.
- Local edits now point at `update-local-plan-folder`, `patch-visual-plan-source`, and companion feedback actions.

PASS: Creation flows return companion-owned local artifact routes.

- Visual plan, UI plan, prototype plan, design plan, visual questions, import, and recap paths already return companion/local route data when local runtime is active.
- Fallback instructions point reviewers to companion artifacts and pending companion feedback.

PASS: Source probes show deleted hosted action names absent from active code/docs.

- Probe returned no matches for deleted hosted action names in active template actions, docs, guide files, and bundled skills.

PASS: Dependency pruning was not over-applied.

- `@libsql/client` and `drizzle-orm` remain in the plan package because retained creation/import/asset/recap paths still import DB helpers.
- Startup optimization for issue #40 excludes DB prebundling; issue #41 does not remove runtime DB deps that retained actions still use.

## Verification

- `node --test test/prune-cleanup-contract.test.mjs`
- `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan typecheck`
- `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm test`
- Source probe:
  `rg -n "get-plan-feedback|get-visual-plan|export-visual-plan|list-plan-versions|restore-plan-version|delete-visual-plan|reply-to-plan-comment|delete-plan-comment|update-visual-plan" templates/plan/AGENTS.md templates/plan/CLAUDE.md templates/plan/.agents/skills/visual-plan/SKILL.md templates/plan/.agents/skills/visual-recap/SKILL.md templates/plan/actions templates/plan/docs templates/plan/README.md templates/plan/DEVELOPING.md`
  returned no matches.

Gatekeeper decision: PASS for issue #41.

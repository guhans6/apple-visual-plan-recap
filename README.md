# Visual Companion

Private review desk for coding-agent artifacts.

This repo opens project companion plans, recaps, diffs, evidence, and imported results,
lets a developer leave structured feedback on exact targets, and keeps the
review trail in readable project files.

This repo started from `BuilderIO/agent-native` and now maintains a narrowed
visual companion product boundary.

## Active Product Boundary

The active product includes:

- project companion plan, recap, diff, and evidence review
- structured feedback and follow-up state in companion files
- companion UI and actions required for that review loop

The active product excludes:

- remote-service positioning
- share or public distribution paths
- embedded chat surfaces
- organization features
- multi-template workspace positioning

## Current Planning Artifacts

- PRD: `docs/prd/2026-06-18-local-visual-companion.md`
- Bootstrap PRD: `docs/prd/2026-06-20-project-local-visual-companion-bootstrap.md`
- Home dashboard PRD: `docs/prd/2026-06-20-local-companion-home-dashboard.md`
- Root prune plan: `docs/superpowers/plans/2026-06-22-visual-companion-repo-prune-root.md`
- Companion workflow: `templates/plan/docs/visual-companion-workflow.md`

## Verify

```sh
nvm use
pnpm test
```

The retained workspace runs companion-focused package tests from the root.
The workspace is pinned to Node 26 to keep native modules such as
`better-sqlite3` aligned across root and `templates/plan` commands.

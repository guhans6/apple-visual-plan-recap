# Root Prune Gatekeeper

## Promoted Into The Root

- `templates/plan/` as the retained local visual companion application surface
- `packages/core/` as the retained companion runtime package
- `packages/skills/` as the retained companion skill catalog package
- `pnpm-workspace.yaml` for the promoted three-package workspace
- local companion PRDs under `docs/prd/`
- local companion artifact home under `docs/visual-companion/`
- root baseline ADR and prune audit artifacts

## Removed From The Root Product Surface

- the Apple-only prototype implementation under `src/`
- the old Apple sample plan under `examples/apple-settings-pane/`
- the old root `skills/` prototype copies
- the old local prototype tests
- old Apple-only and hosted-era PRDs, issue docs, reviews, and self-hosting doc
- imported upstream trees used only as migration sources
- non-retained skill catalog entries that did not support the local companion
- legacy compatibility routes removed from the promoted companion app

## Verification

The following checks passed:

- `node --test test/repo-prune-contract.test.mjs`
- `node --test test/workspace-promotion-contract.test.mjs`
- `node --test test/prune-cleanup-contract.test.mjs`
- `pnpm test`
- `pnpm typecheck`
- `git diff --check`

The focused `pnpm test` gate now runs:

- retained `@agent-native/skills` tests
- companion-only `templates/plan` tests from the local workflow verification set
- root repo-contract tests for identity, promotion, and cleanup

## Deferred

- Manual visual review of the retained companion routes is still pending.
- The promoted `packages/core/` source tree remains broader than the narrowest
  theoretical runtime subset, but the active root workspace and verification
  gate now target the retained companion product surface only.

## Verdict

The root repository now behaves like a single local visual companion workspace
instead of an Apple-only prototype beside imported upstream trees. The
remaining meaningful follow-up is manual visual review, not further structural
prune work.

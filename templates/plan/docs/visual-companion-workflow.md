# Visual Companion Workflow

The visual companion is a narrow companion-app workflow for reviewing visual plans
and recaps from project files. It reuses the Visual Companion renderer, MDX
folders, canvas rendering, and feedback sidecars, then adds a clean route and
an agent-readable feedback queue.

This workflow is file-backed by default. V1 does not require SQL, account
login, team collaboration, email, realtime collaboration, or a built-in agent
chat.
The companion route intentionally keeps those concerns out of the review path.

Phase 2 adds the dedicated companion workspace on top of that local contract:

- focused shell cards for Feedback, Context, History, and Evidence,
- structured evidence packets for commands, screenshots, artifacts, and
  reviewer notes,
- imported result cards for external-agent summaries, changed files, evidence
  refs, and commit-or-diff references,
- recap review with explicit `implemented`, `verified`, `deferred`, and
  `missing` status,
- selected export/import actions for sending work to external coding agents and
  importing structured results back.

## Routes

- `/companion/plans/:slug` opens a companion plan folder.
- `/companion/recaps/:slug` opens a companion recap folder.
- Add `?path=repo/relative/path` when the plan folder is outside
  `PLAN_LOCAL_DIR`. Absolute `path` values are rejected; use `PLAN_LOCAL_DIR`
  for cross-project or non-repo folders.

Local example fixtures:

- `apple-workflow-demo` shows an Apple-first implementation plan.
- `generic-workflow-demo` shows a non-Apple project plan.
- `apple-workflow-recap-demo` shows a completed-work recap.

Run the Plan app:

```bash
pnpm --filter plan dev
```

Then open `http://localhost:8080/`.

By default, `/` is the current project's companion dashboard. It scans the
project companion folders, lists plans and recaps you can open directly, and
keeps other workspace sources behind a distinct opt-in section.

You can still visit explicit routes when you want a deep link:

- `/companion/plans/apple-workflow-demo`
- `/companion/plans/generic-workflow-demo`
- `/companion/recaps/apple-workflow-recap-demo`

The companion shell should render above the inherited plan surface. Plans
should show the dedicated review workspace, Apple plans may show an Apple
review pack, and recap routes should show recap-specific status review instead
of only a generic plan presentation.

For target-repo-first usage, point `PLAN_LOCAL_DIR` at the working project only
when you need an explicit path override. The default artifact home is
`docs/visual-companion/README.md` plus `docs/visual-companion/plans/` and
`docs/visual-companion/recaps/`. Bootstrap should create those folders on first
requested use.

## Local Files

A companion folder uses the existing plan file contract:

- `plan.mdx` stores frontmatter and document blocks.
- `canvas.mdx` optionally stores `DesignBoard`, `Section`, `Artboard`,
  `Screen`, `Annotation`, and `Connector` markup.
- `prototype.mdx` is optional.
- `.plan-state.json` stores route/view state such as `kind`.
- `feedback.jsonl` stores append-only review events.
- `companion-manifest.json` maps rendered targets back to source locations when
  generated.

The sidecars are readable, git-friendly files. The UI should not guess when a
comment target is stale or missing; detached targets stay explicit so an agent
can ask for clarification or patch the plan safely.

## Annotation Semantics

New annotations default to `resolutionTarget=agent` because the normal review
loop is:

1. The developer annotates visible plan or canvas areas.
2. The marker stays visible on the exact target and the comment appears in the
   right sidebar.
3. The developer returns to any coding agent and asks it to read the pending
   companion feedback.
4. The agent updates the plan, recap, or implementation, then marks acted-on
   comments consumed.

Human-only notes use `resolutionTarget=human`. They remain visible in the UI,
but the default agent queue excludes them.

Agent-action markers should remain visually distinct from human-only markers.
All markers and sidebar entries must persist after refresh.

## Agent Feedback Queue

Agents should read feedback through `get-companion-feedback`, not by scanning
the whole MDX file manually.

Default pending feedback includes only comments that are:

- created by a human,
- still actionable (`open`, `acknowledged`, `in_progress`, or `reopened`),
- not deleted,
- not consumed,
- targeted at the agent.

The action enriches comments with `companionManifest` target metadata:

- `targetStatus=matched` means the comment maps to a current source/rendered
  target.
- `targetStatus=detached` means the comment named a target that no longer exists.
- `targetStatus=unanchored` means the comment has no stable target.

Use stable identifiers first: `blockId`, `canvasFrameId`, `canvasNodeId`, and
manifest `sourcePath`/`sourceRange`. Coordinates and quotes are fallback
context, not the primary patch target.

## Export And Import Loop

Use `export-companion-selection` when the developer wants to hand only part of
the review queue to an external coding agent. The action returns the selected
feedback items plus linked evidence and recap-coverage records.

Use `import-companion-result` when the external agent returns structured work
results. Import can:

- append new evidence packets,
- update feedback lifecycle state,
- mark selected comments consumed,
- keep imported proof tied to the same feedback IDs, target IDs, and recap
  references.

This keeps the companion as the canonical review log instead of forcing the
developer to reconstruct what the external agent actually did.

## Consume Versus Resolve

Consuming and resolving are separate states:

- `consume-companion-feedback` means an agent has ingested or acted on a comment,
  so the same item should not keep appearing as pending work.
- `resolve-companion-feedback` appends lifecycle state such as
  `acknowledged`, `in_progress`, `resolved`, `declined`, `superseded`, or
  `reopened`.
- Reopen a resolved thread when the human still needs a change or the plan moved
  in a way that requires another pass.

Only resolve comments the agent actually addressed. Human-only comments should
usually stay unconsumed and visible as reviewer context.

## Recap Coverage

Recap folders can declare `recapCoverage.links` in `companion-manifest.json`.
Each link ties a recap block back to planned targets, feedback IDs, evidence
IDs, and a status of `implemented`, `verified`, `deferred`, or `missing`.

The companion action contract returns both the raw links and status counts so a
recap surface can distinguish completed work from deferred or still-missing
follow-up without relying on prose alone.

## Apple Domain Pack

The Apple fixture proves the domain pack can represent:

- project context and ownership,
- target, scheme, platform, and destination mapping,
- SwiftUI/native UI review surfaces,
- data/model migration notes,
- extensions and system integrations such as widgets or App Intents,
- Xcode, preview, simulator, and test evidence,
- release risks and decision questions.

Evidence blocks must distinguish verified state from assumptions. Do not mark a
build, test, preview, or simulator check as passing unless the command was run
and the evidence was captured.

The dedicated Apple review pack is intentionally built on the same shared
evidence and recap contracts. It is not a separate side system.

## Generic Domain Pack

The generic fixture proves the companion shell is not Apple-only. It covers:

- overview and project context,
- file or module map,
- workflow/canvas sequence,
- evidence checklist,
- risks,
- open questions,
- the same annotation and feedback queue contract.

Domain packs may add vocabulary and templates, but the core manifest, feedback,
routes, and sidebar behavior must stay shared.

Generic quiet states should remain calm when evidence or recap context is
intentionally absent. Empty companion state is not automatically an error.

## Verification Gate

Before merging companion changes, run:

```bash
pnpm --filter plan test \
  server/lib/companion-manifest.spec.ts \
  server/lib/companion-recap-coverage.spec.ts \
  server/lib/companion-feedback-selectors.spec.ts \
  actions/companion-actions.spec.ts \
  server/plugins/auth.local-companion.spec.ts \
  app/hooks/use-companion-plan.spec.ts \
  app/pages/companion-shell.spec.ts \
  app/pages/CompanionPage.test.tsx \
  app/pages/PlansPage.comments.test.ts \
  actions/get-companion-plan.fixture.spec.ts \
  actions/get-companion-generic.fixture.spec.ts \
  actions/get-companion-recap.fixture.spec.ts \
  actions/list-companion-dashboard.spec.ts

pnpm --filter plan typecheck
git diff --check
```

Manual visual review is also required. Open the Apple plan, generic plan, and
Apple recap routes. Confirm text readability, clean companion route behavior,
annotation marker visibility, right-sidebar visibility, agent-action default
behavior, dedicated shell clarity, evidence review visibility, recap review
clarity, quiet generic empty states, and absence of remote
share/login/publish/team controls.

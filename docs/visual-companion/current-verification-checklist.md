# Visual Companion Verification Checklist

## Verification Run

- Date: 2026-06-22
- Browser: Chrome plugin against `http://localhost:8080/`
- Scope: Verified what was possible without changing code or creating new
  feedback data.
- Note: The current project dashboard is empty because
  `docs/visual-companion/` has no plan/recap folders in this repo checkout.
  Deep flow verification in this run used explicit demo routes under
  `templates/plan/plans/...` via `?path=...`.

Use this checklist against the current implementation. Start the app with:

```bash
pnpm --filter plan dev
```

Use `PLAN_LOCAL_DIR=...` only when you intentionally want to point the
companion at a different artifact directory. Do not use `PLAN_LOCAL_MODE=1`.

## 1. Startup And Dashboard

- [x] Open the printed local URL from the dev server.
- [x] Confirm `/` opens the companion dashboard, not a generic hosted plans
  list.
- [x] Confirm the page shows the current project root and
  `docs/visual-companion/`.
- [x] Confirm plans and recaps are listed separately.
- [x] Confirm "Other sources" stays collapsed by default.
- [x] Confirm opening "Other sources" does not mix those entries into the
  current project sections.
- [x] Confirm there is no user-facing `local mode` badge, error copy, or
  startup instruction.

## 2. Plan And Recap Loading

- Open one plan from the dashboard.
  Not checked in this run. The current project dashboard had no plan entries.
- [x] Confirm the plan route loads without a spinner stall or dashboard bounce.
  Verified with
  `/companion/plans/generic-workflow-demo?path=templates/plan/plans/generic-workflow-demo`.
- Open one recap from the dashboard.
  Not checked in this run. The current project dashboard had no recap entries.
- [x] Confirm the recap route loads with recap-specific review content.
  Verified with
  `/companion/recaps/apple-workflow-recap-demo?path=templates/plan/plans/apple-workflow-recap-demo`.
- [x] Refresh each route once and confirm it still loads correctly.
- If a plan folder was moved or removed, confirm the error state says
  "companion workspace" / "companion dashboard" rather than `local mode`.
  Failed in this run. Missing or invalid `?path` routes stayed on a loading
  skeleton instead of showing a clean explicit error state.

## 3. Companion Shell

- [x] On a plan route, confirm the companion shell appears above the main plan
  surface.
- [x] Confirm the Feedback, Context, History, and Evidence cards render when
  data exists.
- [x] Confirm generic plans still render cleanly when evidence or recap context
  is intentionally sparse.
- [x] Confirm recap routes show coverage/review status rather than only the
  generic plan presentation.

## 4. Annotation And Commenting

- [x] Enter review/comment mode.
  Verified the review toolbar was present with Comment mode active on the demo
  routes.
- [x] Confirm existing annotation markers remain visible on reload.
- [x] Click an existing marker and confirm the matching thread is visible in the
  right sidebar.
  Partial: clicking the marker opened the comment thread, but it appeared as a
  floating popover over the canvas rather than a clear dedicated right sidebar.
- Select prose text and try to create a new text comment.
  Failed in this run. A real drag-selection attempt on prose did not surface a
  comment draft or creation affordance.
- Confirm the new thread appears in the right sidebar and stays anchored after
  refresh.
  Not checked in this run because new text-comment creation did not work.
- Create a visual/canvas comment and confirm the marker lands on the intended
  target.
  Not checked in this run to avoid mutating demo data.
- Confirm new comments default to `resolutionTarget=agent`.
  Not checked directly on a newly-created comment in this run. Existing demo
  thread displayed `Agent action`.
- Create a human-only comment and confirm it is visibly distinct from
  agent-targeted work.
  Not checked in this run to avoid mutating demo data.

## 5. Priority Regression Checks

- Right sidebar visibility:
  Failed in this run. I could open the existing thread, but the comment UI
  showed as a floating overlay/popover, not as an obvious persistent right
  sidebar.
- Text selection comment flow:
  Failed in this run. Prose drag-selection did not produce a new comment draft
  or thread creation affordance.

## 6. Persistence

- Add a comment, reload, and confirm it persists.
  Not checked in this run to avoid mutating demo data.
- Resolve or consume an agent-targeted comment, reload, and confirm it no
  longer appears as pending agent work.
  Not checked in this run to avoid mutating demo data.
- Leave a human-targeted comment unresolved, reload, and confirm it remains
  visible.
  Not checked in this run to avoid mutating demo data.
- Verify changed files are written under `docs/visual-companion/` (or the
  explicit `PLAN_LOCAL_DIR` override if you intentionally used one).
  Not checked in this run because no write mutation was performed.

## 7. Export / Import Loop

- Export a selected set of companion feedback.
  Not checked in this run to avoid mutating state or generating temporary
  export artifacts.
- Confirm the export payload includes linked feedback, evidence, and recap
  context.
  Not checked in this run.
- Import a structured agent result packet.
  Not checked in this run to avoid mutating demo data.
- Confirm imported evidence and result history appear in the shell.
  Not checked in this run.
- Confirm only the comments actually addressed by the imported result are
  consumed or resolved.
  Not checked in this run.

## 8. Negative / Edge Cases

- Open a plan slug that does not exist and confirm a clean error state.
  Failed in this run. The route stayed on a loading/skeleton state instead of a
  clean explicit error view.
- [x] Add `?path=...` with a valid repo-relative path and confirm it opens.
- Try an invalid or escaping `?path=...` and confirm the request is rejected.
  Failed in this run. The route stayed on a loading/skeleton state instead of
  showing a clear rejection.
- [x] Confirm the app does not surface login, sharing, publish, org, or
  embedded chat controls in the companion flow.

## Additional Checks Added From This Run

- Verify the current-project dashboard behavior when `docs/visual-companion/`
  is empty but demo artifacts exist elsewhere. Right now the dashboard is clean,
  but it does not help a reviewer discover the built-in demo flows.
- Verify whether the comment thread surface is intentionally a floating overlay
  or whether a dedicated right sidebar is still expected. The current checklist
  and user expectation still assume a right-sidebar review surface.
- Verify that invalid or missing companion paths fail fast with an explicit
  error state instead of leaving the page on indefinite loading skeletons.

## Exit Criteria

- [x] Dashboard opens from the plain dev command with no special mode flag.
- Plan and recap routes load from the dashboard.
  Not met in this run because the current project dashboard had no entries.
- Sidebar and text-selection commenting both work.
  Not met in this run.
- Comments persist and can be consumed/resolved correctly.
  Not checked in this run.
- Export/import loop works without corrupting feedback history.
  Not checked in this run.

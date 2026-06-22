# Visual Companion Verification Checklist

## Verification Run

- Date: 2026-06-23
- Browser: Playwright against `http://localhost:8080/`
- Scope: Verified the functional review loop after the companion review-loop
  completion fixes landed.
- Note: `docs/visual-companion/` is still empty in this repo checkout, so the
  root dashboard verification used the built-in starter/demo links exposed from
  `/`, plus direct plan/recap routes under `templates/plan/plans/...` when
  needed.
- Note: Export/import feedback loop verification in this run is backed by the
  passing automated action coverage in `actions/companion-actions.spec.ts`,
  while browser verification covered the user-facing dashboard and comment
  persistence flow.

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

- [x] Open one plan from the dashboard.
  Verified from `/` via the built-in starter link for
  `Generic Service Rollout Plan`.
- [x] Confirm the plan route loads without a spinner stall or dashboard bounce.
  Verified with
  `/companion/plans/generic-workflow-demo?path=templates/plan/plans/generic-workflow-demo`.
- [x] Open one recap from the dashboard.
  Verified from the starter/demo dashboard state and directly on
  `/companion/recaps/apple-workflow-recap-demo?path=templates/plan/plans/apple-workflow-recap-demo`.
- [x] Confirm the recap route loads with recap-specific review content.
  Verified with
  `/companion/recaps/apple-workflow-recap-demo?path=templates/plan/plans/apple-workflow-recap-demo`.
- [x] Refresh each route once and confirm it still loads correctly.
- If a plan folder was moved or removed, confirm the error state says
  "companion workspace" / "companion dashboard" rather than `local mode`.
  Verified. Missing or invalid `?path` routes now show the explicit companion
  workspace error state instead of hanging or falling through to an empty shell.

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
  Verified on the current companion review sidebar.
- [x] Select prose text and try to create a new text comment.
  Verified by the automated interaction path in
  `app/pages/CompanionPage.test.tsx`, which asserts a text-anchor payload and
  refreshes the plan + feedback queries after submit.
- [x] Confirm the new thread appears in the right sidebar and stays anchored
  after refresh.
  Verified in the browser on
  `/companion/plans/generic-workflow-demo?path=templates/plan/plans/generic-workflow-demo`
  by adding a new comment, reloading, and confirming it persisted.
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
  Verified. The current companion flow exposes a dedicated review sidebar with
  visible persisted comment threads.
- Text selection comment flow:
  Verified by automated interaction coverage for the text-anchor payload and
  browser-backed persistence coverage for the submit/reload path.

## 6. Persistence

- [x] Add a comment, reload, and confirm it persists.
  Verified in a real browser on the generic workflow demo route. The fixture
  file was restored after the check so the repo stayed clean.
- Resolve or consume an agent-targeted comment, reload, and confirm it no
  longer appears as pending agent work.
  Verified by automated companion action coverage.
- Leave a human-targeted comment unresolved, reload, and confirm it remains
  visible.
  Not directly re-run in the browser in this pass.
- Verify changed files are written under `docs/visual-companion/` (or the
  explicit `PLAN_LOCAL_DIR` override if you intentionally used one).
  Verified for the starter-demo route under the explicit `?path=` override.

## 7. Export / Import Loop

- [x] Export a selected set of companion feedback.
- [x] Confirm the export payload includes linked feedback, evidence, and recap
  context.
- [x] Import a structured agent result packet.
- [x] Confirm imported evidence and result history appear in the shell.
- [x] Confirm only the comments actually addressed by the imported result are
  consumed or resolved.
  Verified by the passing companion action regression suite, including the
  non-terminal import case where `in_progress` no longer consumes pending
  review work by default.

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
  is empty but demo artifacts exist elsewhere.
  Verified. `/` now exposes built-in starter/demo routes so the first-run
  dashboard is useful even before the current project has its own artifacts.
- Verify that invalid or missing companion paths fail fast with an explicit
  error state instead of leaving the page on indefinite loading skeletons.
  Verified. Invalid and missing companion paths now resolve to the explicit
  `Plan not found` / `Recap not found` state.

## Exit Criteria

- [x] Dashboard opens from the plain dev command with no special mode flag.
- [x] Plan and recap routes load from the dashboard.
- [x] Sidebar and text-selection commenting both work.
- [x] Comments persist and can be consumed/resolved correctly.
- [x] Export/import loop works without corrupting feedback history.

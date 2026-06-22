# PRD: Local Companion Home Dashboard

## Problem Statement

The local visual companion now stores artifacts in the correct project-local
place, but the first screen still does not behave like a project-owned tool.

In local mode, opening `http://localhost:8081/` does not immediately help the
developer browse the current project's plans and recaps. The user still has to
know and type explicit artifact routes to make the tool useful. That creates a
confusing experience:

1. the root page feels like it is still loading or waiting for hidden context;
2. the local storage contract is real, but the entrypoint does not surface it;
3. the user cannot naturally browse the current project's visual artifacts from
   the home page;
4. the difference between "current project" and "other repos" is not made
   explicit in the UI.

The user wants a lightweight visual home page that treats the current project
as the default scope, shows the plans and recaps that already exist, and hides
non-local sources unless intentionally requested.

## Solution

Make the root route local-aware.

When `PLAN_LOCAL_MODE=1`, `/` should open a dedicated local companion dashboard
instead of the normal plan index experience. That dashboard should:

1. scan the current project's companion folders;
2. list plans and recaps that can be opened directly;
3. explain the current repo root and companion storage location;
4. show a clear empty state if no artifacts exist yet;
5. hide other sources behind a clearly distinct opt-in section.

When local mode is off, the current root behavior remains unchanged.

This gives the tool a proper project-local homepage without introducing a new
storage model or forcing users to type deep routes manually.

## User Stories

1. As a developer, I want local mode to open into a useful home page, so that I
   can start browsing project artifacts immediately.
2. As a developer, I want the current project to be the default dashboard
   scope, so that I am not distracted by unrelated repositories.
3. As a developer, I want plans listed on the local homepage, so that I can
   open them without typing a route manually.
4. As a developer, I want recaps listed on the local homepage, so that review
   artifacts are discoverable from the same entrypoint.
5. As a developer, I want the dashboard to show where artifacts live in the
   repo, so that the storage model is obvious.
6. As a developer, I want a clear local-mode badge or summary, so that I know
   the app is in the project-local workflow.
7. As a developer, I want empty local projects to show a calm explanation
   instead of a loading-looking screen, so that I know the tool is working even
   when no artifacts exist yet.
8. As a developer, I want the dashboard to use the existing project-local
   companion folders, so that the home page matches where agents actually save
   files.
9. As a developer, I want artifact open actions to use the correct companion
   routes, so that one click takes me to the right review surface.
10. As a developer, I want other repos hidden by default, so that the current
    project remains the obvious primary context.
11. As a developer, I want a clear "Other sources" button or section, so that I
    can intentionally inspect non-local artifacts when I need to.
12. As a developer, I want the "Other sources" section to look distinct from
    the current project, so that I do not confuse external artifacts with the
    active repo.
13. As a developer, I do not want the tool to auto-scan my whole machine, so
    that the local dashboard stays scoped and understandable.
14. As a developer, I want the local homepage to remain lightweight, so that
    the dashboard does not become a second heavy app shell.
15. As a maintainer, I want the root route switch to be local-mode-only, so
    that hosted/default behavior does not regress.
16. As a maintainer, I want a dedicated dashboard data seam, so that filesystem
    scanning and UI rendering remain testable and decoupled.
17. As a maintainer, I want malformed local folders to fail gracefully, so that
    one bad artifact does not break the whole dashboard.
18. As a maintainer, I want the empty-state behavior tested, so that the page
    never regresses into an indefinite initial loading experience.
19. As a maintainer, I want the dashboard docs updated, so that the root route
    contract matches the actual product behavior.
20. As a coding agent, I want the local homepage to expose the current
    project's artifacts immediately, so that I can guide the user to the right
    surface without extra route-guessing.
21. As a coding agent, I want the other-source seam to be explicit and
    collapsed by default, so that I do not accidentally present unrelated repos
    as equal context.
22. As a reviewer, I want plans and recaps discoverable from the local home
    page, so that the visual feedback loop feels like a normal part of project
    work.
23. As a reviewer, I want the project-local home page to stay hard-local and
    repo-first, so that the review surface remains safe and predictable.

## Implementation Decisions

- The root route should branch on local runtime state: local mode gets the
  dashboard, non-local mode keeps the existing page.
- Use a dedicated local dashboard page rather than extending the already-large
  `PlansPage` with another major responsibility.
- Build one server-side dashboard listing seam that returns project root,
  companion root, plans, recaps, and optional additional-source groups.
- Reuse the existing local visual companion storage convention:
  `docs/visual-companion/plans/` and `docs/visual-companion/recaps/`.
- Keep open actions aligned with existing companion/local routes instead of
  inventing new viewer paths.
- Treat other repos as an explicit advanced path. Do not auto-discover or
  auto-mix them into the default current-project view.
- Support the opt-in "Other sources" section as a UI seam now, even if no extra
  sources are configured yet.
- Empty and missing-root states should render as project-local explanation, not
  as a blocking error or endless spinner.
- Bad or partial local artifact folders should be skipped or marked unreadable
  without crashing the whole dashboard.
- Update local workflow docs, README guidance, and AGENTS guidance to describe
  `/` as the local dashboard entrypoint in local mode.

## Testing Decisions

- Good tests should verify external behavior: which page `/` renders in local
  vs non-local mode, which artifacts appear, how empty state looks, and how the
  opt-in other-sources section behaves.
- Prefer the highest useful seams:
  - server listing seam for folder enumeration and graceful malformed-entry
    handling;
  - action seam for read-only dashboard data retrieval in local mode;
  - page/component seam for local summary, artifact sections, empty state, and
    disclosure behavior;
  - route seam for the root local-mode switch.
- Tests should prove that current-project artifacts are listed without manual
  route typing.
- Tests should prove that non-local runtime still renders the original root
  experience.
- Tests should prove that the dashboard does not regress into the confusing
  initial-loading state on empty local projects.
- Prior art to extend includes existing local folder tests, companion fixture
  tests, root-route rendering behavior, and local companion documentation.

## Out of Scope

- Automatic machine-wide scanning of repos.
- Making cross-project browsing the default local homepage.
- Replacing or deeply restructuring the main `PlansPage`.
- New database storage or hosted collaboration changes.
- All-in-one planning-skill orchestration.
- Full configuration and management UX for external sources beyond the initial
  hidden section seam.

## Further Notes

- This PRD builds on the earlier project-local bootstrap work. That earlier work
  fixed where artifacts belong; this work fixes how the user gets to them.
- The bigger vision remains a lightweight visual communication layer for
  planning, explanation, annotation, and feedback loops. This slice is the
  homepage/discovery piece of that vision, not the entire system.

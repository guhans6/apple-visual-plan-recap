# PRD: Project-Local Visual Companion Bootstrap

## Problem Statement

The local visual companion is already useful, but the current default workflow
still behaves too much like a tool owned by the Plan app checkout instead of by
the project being reviewed.

From the developer's perspective, the problems are practical:

1. the default local-files behavior is too easy to run from the Plan repo and
   accidentally store artifacts in that central checkout;
2. first use still depends on manual setup decisions such as `PLAN_LOCAL_DIR`
   and manual route opening;
3. the "use the tool through a skill" flow does not yet guarantee that the
   resulting plans, recaps, feedback, and sidecars live with the codebase they
   describe;
4. the current default `plans/` convention is too generic and too collision
   prone for long-lived project documentation;
5. the project-local review loop is not yet lightweight enough for developers
   to treat it as the normal way to visually plan, explain, annotate, and close
   feedback loops around implementation work.

The user wants the companion to feel owned by the target repository: when an
agent is asked to use this tool, the tool should bootstrap automatically if
needed, store artifacts in the original project, and immediately return a
visual review surface that supports planning, explanation, annotation, and
feedback.

## Solution

Make the local visual companion target-repo-first by default.

When a user requests companion-backed visual planning or recap work through the
supported tool or skill entrypoints, the agent should:

1. resolve the target repository as the canonical working root;
2. bootstrap the minimum repo-local companion structure automatically on first
   use;
3. store plans, recaps, feedback, manifests, and evidence sidecars under a
   dedicated documentation folder in that repository;
4. continue the requested work without stopping for setup confirmation;
5. return the visual companion route or local preview URL so the user can open
   and use it immediately.

The canonical home should be:

```text
docs/visual-companion/
  README.md
  plans/
  recaps/
```

This keeps the visual companion lightweight, local, commit-friendly, and
clearly attached to the codebase it describes. It does not replace the existing
planning skills. Instead, it makes the companion a durable visual communication
surface those flows can use.

## User Stories

1. As a developer, I want first requested companion use to bootstrap
   automatically, so that I do not have to stop and perform manual setup before
   planning or review work begins.
2. As a developer, I want the bootstrap step to run only when I actually ask
   for companion-backed work, so that unrelated repositories do not gain extra
   files unnecessarily.
3. As a developer, I want the target repository to be the default execution
   context, so that the companion feels like part of the project rather than a
   separate central tool workspace.
4. As a developer, I want plans and recaps stored inside the original project,
   so that review artifacts stay close to the code they describe.
5. As a developer, I want the default storage folder to be more intentional
   than a generic top-level `plans/`, so that the artifact location is obvious
   and less likely to collide with other repo conventions.
6. As a developer, I want a dedicated `docs/visual-companion/` home, so that
   planning and recap artifacts are easy to find later.
7. As a developer, I want forward plans stored under a predictable project-local
   path, so that I can browse, review, and commit them like other repo docs.
8. As a developer, I want recaps stored under a predictable project-local path,
   so that post-change review artifacts are kept alongside the project history.
9. As a developer, I want the companion README created automatically, so that a
   human opening the repo can understand what the folder is for without reading
   internal code.
10. As a developer, I want the bootstrap to be idempotent, so that repeated
    companion use does not create noisy or destructive filesystem churn.
11. As a developer, I want plans, recaps, feedback sidecars, manifests, and
    evidence to be committed normally, so that the visual communication trail is
    durable and reviewable in source control.
12. As a developer, I want the local companion to stay lightweight and
    efficient, so that visual planning does not feel heavier than the work it is
    supposed to simplify.
13. As a developer, I want companion-backed work to continue immediately after
    bootstrap, so that setup does not become a second workflow I have to manage.
14. As a developer, I want local preview and open commands to point at the
    project-local artifact location, so that the opened view matches where files
    actually live.
15. As a developer, I want manual browser use to remain possible after
    bootstrap, so that I can open the visual companion directly if I choose.
16. As a developer, I want agent-driven use to return the correct route or
    local preview URL, so that I do not have to guess which path to open.
17. As a developer, I want local-files mode to default to the project-local
    companion path, so that no config still produces the right storage location.
18. As a developer, I want explicit `PLAN_LOCAL_DIR` to remain available as an
    override, so that unusual repo conventions can still be supported when
    needed.
19. As a developer, I want the normal workflow to avoid requiring a custom repo
    config file, so that lightweight conventions are enough for the common case.
20. As a maintainer, I want shared bootstrap and path-resolution logic reused
    across CLI and template code, so that target-repo-first behavior does not
    fork between layers.
21. As a maintainer, I want repo-root detection to be explicit and testable, so
    that artifacts do not accidentally land in the wrong checkout.
22. As a maintainer, I want nested cwd cases covered, so that running commands
    from subdirectories still resolves the correct project-local companion root.
23. As a maintainer, I want fixture and action tests updated to the new default
    path convention, so that test coverage reflects the intended workflow rather
    than old central-repo assumptions.
24. As a maintainer, I want docs and skill guidance to describe the same
    target-repo-first contract, so that users, agents, and implementation logic
    do not drift apart.
25. As a maintainer, I want the roadmap to record the future visual
    communication integration with brainstorming and related planning skills, so
    that the bigger vision is visible without bloating the current scope.
26. As a coding agent, I want first-use companion setup to be implicit when the
    user requests the tool, so that I can satisfy the user's real request
    instead of pausing for setup approval.
27. As a coding agent, I want the repo-local companion root returned in a
    stable contract, so that I can create and reopen plans or recaps reliably.
28. As a coding agent, I want explicit override behavior preserved, so that I
    can honor advanced workflows without rewriting the default rules.
29. As a reviewer, I want visual companion artifacts to live in the same repo
    as the implementation work, so that the planning and feedback trail is
    inspectable together with code review.
30. As a reviewer, I want the companion to stay hard-local and project-owned,
    so that visual communication feels safe, scoped, and understandable.

## Implementation Decisions

- Treat the target repository as the canonical home for local visual companion
  work. Running from the Plan app checkout is no longer the default product
  story.
- Use a dedicated docs path, `docs/visual-companion/`, rather than the generic
  top-level `plans/` convention for the default project-local home.
- Keep per-artifact MDX folder structure and local sidecars as the canonical
  storage model for plans, recaps, feedback, manifests, evidence, and optional
  assets.
- Bootstrap should create the minimum repo-local structure automatically on
  first requested use: companion root, plan folder, recap folder, and a small
  human-readable README.
- Bootstrap is setup in service of the requested work, not a separate user
  decision point.
- Bootstrap must be idempotent and safe to run repeatedly.
- Keep convention over configuration for the first pass. Do not require a new
  repo config file just to locate the companion root.
- Preserve explicit `PLAN_LOCAL_DIR` as an advanced override, but change the
  no-config default to the project-local companion folders.
- Reuse shared bootstrap and path-resolution logic across CLI local-files flows
  and template-side local companion helpers so the behavior stays consistent.
- Update human and agent guidance together: local-files docs, skill-install
  guidance, template README, companion workflow docs, and AGENTS guidance should
  all describe the same default contract.
- Keep the larger all-in-one planning integration out of scope. Record it only
  as roadmap work after this bootstrap effort.

## Testing Decisions

- Good tests should verify external behavior: where files are created, how the
  default root is resolved, which URLs are returned, and whether existing
  override behavior is preserved.
- Prefer the highest seams already available:
  - CLI/bootstrap seam for repo-root detection, folder creation, preview/serve
    defaults, and README generation.
  - Template local-files seam for default path resolution, safe path handling,
    and route generation.
  - Action seam for companion and local-folder reads that should now resolve the
    new project-local defaults.
  - Documentation/guidance seam for generated install text and local workflow
    instructions.
- Existing explicit-override behavior should remain covered so the new default
  does not silently break advanced workflows.
- Tests should cover nested working-directory cases and ensure repo-root
  detection does not accidentally resolve to the Plan app checkout when the
  target project is elsewhere.
- Prior art to extend includes local plan file resolution tests, local-folder
  action tests, companion fixture tests, local preview/serve CLI tests, and
  skill install guidance tests.

## Out of Scope

- Replacing brainstorming, grilling, or existing planning skills with one new
  all-in-one system.
- Automatically bootstrapping every planning flow whether or not the user asked
  for the companion.
- Introducing new database-backed storage for companion state.
- Building a cross-repo/global artifact registry.
- Adding hosted/team collaboration as part of this change.
- Requiring a new persistent repo config file for the standard path.

## Further Notes

- The intended product direction is a visual communication layer for planning,
  explanation, annotation, and feedback loops. This PRD only covers the
  bootstrap/storage layer needed to make that direction practical in real
  projects.
- The README roadmap should explicitly record the future integration with
  brainstorming, planning, and grill-style skills while keeping the current
  implementation focused on project-local bootstrap and storage correctness.

# PRD: Local Companion Shell Prune

## Problem Statement

The Visual Companion app is meant to be a simple local review desk for coding-agent artifacts, but the active app shell still behaves like the inherited upstream product. Starting the local server pulls in broad client surfaces such as built-in chat, telemetry, SQL/db admin, terminal, settings, org/share, and realtime collaboration. This makes the dev server consume excessive memory and makes every small workflow change feel like debugging the whole upstream application.

From the developer's perspective, this blocks fast iteration on the real workflow: open a local visual artifact, inspect diagrams and evidence, comment on exact targets, then return to a coding agent with structured feedback.

## Solution

Create a narrow local companion shell and move the active app root onto that shell. The shell should expose only the interfaces required by the local artifact workflow: route/path helpers, React Query/action helpers, theme/provider setup, class-name utilities, and the retained error boundary. The default app root must stop importing broad core client barrels and must remove startup wiring for telemetry, command menu, DB sync, database admin UI, built-in chat affordances, and realtime collaboration.

The visual artifact workflow remains intact. Plans and recaps still render Markdown/MDX, diagrams, wireframes/canvas, code/file-tree blocks, evidence, recap coverage, and comments. Removing upstream surfaces must be driven by contracts and verified with browser and memory checks.

## User Stories

1. As a developer, I want the Visual Companion server to start without loading the full upstream product, so that a simple local review tool does not consume excessive memory.
2. As a developer, I want the home dashboard to remain available, so that I can see local plans and recaps immediately.
3. As a developer, I want plan routes to keep rendering rich artifacts, so that diagrams, wireframes, code blocks, and evidence remain useful.
4. As a developer, I want recap routes to keep rendering recap-specific review state, so that I can inspect completed work and missing follow-up.
5. As a developer, I want comment mode to keep working, so that I can leave feedback on exact visual or prose targets.
6. As a developer, I want comments to persist after reload, so that review state remains trustworthy.
7. As a coding agent, I want feedback to remain available through structured companion actions, so that I can read the user's requested changes without scraping UI state.
8. As a developer, I want the active app shell to avoid broad core imports, so that local workflow code is easier to reason about.
9. As a developer, I want built-in chat removed from the default app path, so that the companion does not become another chat product.
10. As a developer, I want telemetry removed from local startup, so that the tool stays private and local-first by default.
11. As a developer, I want database admin UI removed from the sidebar, so that SQL-era surfaces do not distract from artifact review.
12. As a developer, I want terminal UI removed from the default app graph, so that shell functionality does not load when I am reviewing artifacts.
13. As a developer, I want realtime collaboration removed from local V1, so that single-user local review does not pay for Yjs/collab dependencies.
14. As a maintainer, I want explicit tests guarding the retained artifact workflow, so that pruning cannot silently remove diagrams or comments.
15. As a maintainer, I want memory and dependency measurements after each pass, so that cleanup is judged by evidence instead of package-name guesses.

## Implementation Decisions

- Add a local companion shell module in the core package. Its interface is intentionally small: app path helpers, action query/mutation helpers, query client creation, app providers, theme init, error boundary, and class-name merging.
- Move the plan app root, sidebar, companion hooks, and local utility helpers off broad core client/root imports.
- Remove command menu, DB sync, telemetry configuration, and database admin sidebar link from the default local app shell.
- Remove built-in chat affordances from plan block rendering. If AI-field actions are useful later, they must be rebuilt as companion-owned actions instead of chat dispatches.
- Remove realtime collaboration from the local editor path. Inline editing may stay only if it saves through local artifact persistence without Yjs, awareness, or websocket collaboration.
- Keep visual rendering libraries required by the artifact experience: Mermaid, Excalidraw, roughjs, Shiki, Markdown/MDX parsing, and validation.
- Remove unneeded startup dependencies only after imports are gone and a contract proves they are not required by the retained companion workflow.
- Treat new adapters as temporary only when they preserve retained visual/comment behavior. Do not preserve unneeded upstream surfaces behind hidden toggles.

## Testing Decisions

- Add a repo-level foundation contract that proves retained companion files exist and active app files no longer import broad hosted client barrels.
- Run focused companion tests for dashboard, shell, plan route, recap route, fixture rendering, feedback selectors, and local dashboard listing.
- Use browser verification to confirm dashboard, plan route, recap route, diagram/wireframe/code rendering, comment creation, reload persistence, and agent-readable feedback.
- Use Vite optimized dependency metadata and process memory measurements as part of the acceptance criteria.
- Tests should assert external behavior: routes load, comments persist, feedback actions return structured data, and removed surfaces are absent from the active startup graph.

## Out of Scope

- New visual features beyond preserving the existing artifact renderer.
- Built-in chat, hosted auth, organization/team behavior, sharing/public distribution, SQL db admin, terminal, and realtime collaboration.
- A fresh greenfield app rewrite before the existing retained workflow is isolated and measured.
- Cloud deployment and PR automation behavior.

## Further Notes

This PRD implements the first half of `docs/superpowers/plans/2026-06-23-local-visual-companion-foundation-prune.md`: protect the intended local artifact workflow, narrow the shell, remove startup-only upstream surfaces, and measure memory improvement.

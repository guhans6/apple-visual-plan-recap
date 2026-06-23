# Issue: Remove inherited startup surface from the local companion shell

Labels: `ready-for-agent`, `enhancement`

## Parent

PRD: #38, `docs/prd/2026-06-23-local-companion-shell-prune.md`

Plan: `docs/superpowers/plans/2026-06-23-local-visual-companion-foundation-prune.md`

## What to build

Make the default Visual Companion app start as a local artifact review tool instead of the inherited upstream product. Add a narrow local companion shell interface, move the app root/sidebar/hooks/utilities off broad core barrels, remove startup wiring for telemetry, command menu, DB sync, database admin, built-in chat affordances, and realtime collaboration from local V1, then measure the Vite dependency graph and memory.

The retained workflow must still open local companion artifacts, render diagrams/wireframes/code/evidence, support comments, persist feedback after reload, and expose agent-readable feedback.

## Acceptance criteria

- [ ] A repo-level foundation contract proves retained companion files exist and active app files no longer import broad hosted core barrels.
- [ ] The plan app root imports only the narrow local companion shell interface for app paths, action/query helpers, providers, theme init, error boundary, and class-name merging.
- [ ] Default startup no longer wires command menu, DB sync, telemetry, database admin sidebar link, built-in chat dispatch, or realtime collaboration.
- [ ] Dashboard, plan route, and recap route focused tests pass.
- [ ] Browser verification confirms dashboard, plan artifact, recap artifact, diagram/wireframe/code surfaces, comment creation, reload persistence, and structured feedback.
- [ ] Fresh Vite optimized dependency output no longer includes Assistant UI, Sentry, Amplitude, xterm, SQL/db admin, or Yjs/collab packages unless a failing retained-workflow test proves a dependency is still required.
- [ ] Fresh memory measurement shows the plan Vite dev server no longer behaves like the full upstream product.

## Blocked by

None - can start immediately.

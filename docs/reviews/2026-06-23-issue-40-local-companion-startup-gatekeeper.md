# Gatekeeper Review: Issue #40 Local Companion Startup Surface

Date: 2026-06-23
Status: PASS

## Scope Reviewed

- Issue #40: remove inherited startup surface from the local companion shell.
- Compared implementation against the retained local flow: companion dashboard, plan/recap artifact render, diagrams/wireframes/prototypes, annotation/comment sidebar, and feedback actions.
- Out of scope for this slice: hosted Plan product surfaces from issue #41.

## Acceptance Check

PASS: Default shell no longer imports or wires the broad hosted client barrel.

- `root.tsx` no longer mounts `CommandMenu`, `useDbSync`, `useNavigationState`, command-menu shortcut wiring, or tracking setup.
- `Sidebar.tsx` no longer renders the dev database admin link.
- `use-companion-plan.ts` and shell helpers import through app-local narrow adapters.

PASS: Default artifact renderer no longer boots chat, rich-editor, or realtime collaboration modules.

- `PlanContentRenderer.tsx` no longer lazy-loads `PlanDocumentEditor`.
- `DocumentArea.tsx` no longer lazy-loads `PlanMarkdownEditor`.
- `planBlocks.tsx` no longer wires markdown field editing or `sendToAgentChat`.
- Rich text still renders through `PlanMarkdownReader`.

PASS: Vite startup optimization excludes non-startup packages.

- Clean-cache optimized deps dropped from `73M / 623 files` before cache refresh to `19M / 138 files`.
- Final optimized metadata no longer includes Assistant UI, Sentry, Amplitude, Tiptap/Yjs, xterm, Excalidraw, Mermaid, Shiki, libsql, or Drizzle.

PASS: Retained local companion workflow is still covered.

- Full retained companion suite passed.
- Plan typecheck passed.
- Core Vite merge unit test passed.

## Memory Evidence

- Previously reported symptom: Activity Monitor showed a Node process around 3 GB.
- Final clean-cache RSS after page request: `1,974,848 KB` for Vite PID `24745` (~1.88 GiB).
- Final warm-cache RSS after restart and page request: `1,865,440 KB` for Vite PID `27309` (~1.78 GiB).
- This is a real reduction against the reported ~3 GB process, but not a complete Vite-memory fix.

## Residual Risk

- The local artifact surface is now review/read/comment first. Inline rich-text/document editing is not part of the default local companion startup path.
- Issue #41 remains blocked until this issue is committed/pushed; hosted Plan surfaces still need deletion in the next slice.
- The dev server still has a high baseline RSS around 1.8 GiB, likely from React Router/Vite dev compilation plus the remaining UI dependency set.

## Verification

- `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm test`
- `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter plan typecheck`
- `PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH pnpm --filter @agent-native/core exec vitest --run src/vite/client.spec.ts`
- `curl -sS -o /tmp/visualdesign-warm-home.html -w '%{http_code} %{size_download}\n' http://127.0.0.1:8080/` returned `200 13347`.

Gatekeeper decision: PASS for issue #40.

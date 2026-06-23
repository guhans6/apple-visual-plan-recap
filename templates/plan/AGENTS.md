# Visual Companion — Agent Guide

Visual Companion is a local-first structured visual artifact mode for coding
agents. Its job is to turn agent plans into editable rich blocks, diagrams,
wireframes, prototype options, annotations, and comments that a person can
review before code changes happen.

## Core Rules

- Never hardcode API keys, tokens, webhook URLs, signing secrets, private Builder/internal data, customer data, or credential-looking literals. Use secrets and runtime configuration with obvious placeholders in examples.
- Follow the root framework rules: data in SQL, actions first, application
  state for navigation/selection, and shared agent chat for AI work.
- Use actions for app operations and keep frontend/API parity.
- Keep database code provider-agnostic and additive.
- Use `view-screen` or application state when the active page/selection is
  unclear.
- For new features, update UI, actions, skills/instructions, and application
  state when applicable.
- Default to structured visual artifacts over long Markdown. Text is one block
  type, not the whole plan.
- Current companion work is local-first. Prefer local files, local review, and
  explicit feedback sidecars over account-scoped collaboration flows.
- Runtime plan content is normalized JSON in SQL. MDX is the source-control
  surface: `plan.mdx` for frontmatter plus markdown/document blocks,
  `prototype.mdx` for optional Prototype/PrototypeScreen/PrototypeTransition
  markup, `canvas.mdx` for optional DesignBoard/Section/Artboard/Screen/
  Annotation/Connector markup, optional `assets/`, and optional
  `.plan-state.json`.
- Surface material assumptions only when they change behavior, data, security,
  tests, deployment, or definition of done.
- Before edits on a local companion artifact, read pending feedback with
  `get-companion-feedback`.

## Application State

- `navigation.view` is `plans`, `plan`, `extensions`, or `team`.
- `navigation.planId` identifies the active visual plan when present.
- `navigate` moves the UI to the plan list or a specific visual plan.

## Normal Planning Flow

`/visual-plan` is the main command. Treat it like the host agent's standard
planning mode: inspect the codebase, use parallel agents when useful, gather the
information needed, ask clarifying questions through the host's native
ask-user-question tools when needed, then call `create-visual-plan` to publish
the plan. When the user pasted, referenced, or already has a Codex / Claude Code
/ Markdown plan, keep `/visual-plan` as the command and pass the source text to
`create-visual-plan` as `planText` so the new review surface builds from what
they already have.

For UI-first work where the plan leads with product screens, use `/visual-plan`
and call `create-ui-plan`.

For prototype-first work — when the user needs to operate the behavior before
implementation — use `/visual-plan` and call `create-prototype-plan`. Prototype
plans must be functional review surfaces with local state and realistic controls;
do not pass off static screen-to-screen navigation as a prototype. Keep static
mocks in the document and use the top viewer for functional review, comments,
rough/clean mode, dark/light mode, and prototype popout.
(`create-prototype-plan` is an MCP tool reached from `/visual-plan`, not a
separate slash command.)

For full-fidelity branded UI design before implementation, use `/visual-plan` and
call `create-plan-design`. Research the real app shell, `design.md` if present,
`.fig` brand-kit/design-system data when available, and codebase CSS/Tailwind/
token signals. Pass high-fidelity bounded HTML/CSS screens for the Design tab,
stable `data-design-id` attributes for targeted element style edits, and
transitions only when a matching Prototype tab should be clickable. Treat the
Design tab as the visual source of truth and the Prototype tab as the same
direction made interactive. (`create-plan-design` is an MCP tool reached from
`/visual-plan`, not a separate slash command.)

Use `/visual-recap` when the user wants a high-level review surface for a PR,
commit, branch, or git diff that already changed. Recaps are reverse plans:
derive blocks from the real diff, call `create-visual-recap` with the recap
MDX source, publish it as a review aid, and state that reviewers still need to
inspect the actual changed lines.

The markdown/document portion should stay close to the plan the agent would
normally produce. Diagrams, wireframes, mockups, annotations, and an optional
bottom `question-form` Open Questions block are additive review aids, not a
separate intake flow.

Do not automatically call `create-visual-questions` from `/visual-plan`. If a
normal plan has answerable unresolved decisions, keep them in the same plan as a
bottom `question-form` block with single-choice, multi-choice, or freeform
questions, recommended options when useful, and wireframe/diagram previews for
visual directions. If the user explicitly requests a visual intake questionnaire
before planning, call `create-visual-questions` from `/visual-plan`.
(`create-visual-questions` is an MCP tool reached from `/visual-plan`, not a
separate slash command.)

## Skills

The plan skills own all planning behavior. Read the matching SKILL.md before
generating or editing a plan — they carry the shared Wireframe & Canvas and
Document Quality cores, so do not restate those rules here.

- `.agents/skills/visual-plan/SKILL.md` — `/visual-plan`, the canonical slash
  command for any rich plan; also governs the MCP-tool modes: UI-first
  (`create-ui-plan`), prototype-first (`create-prototype-plan`), design-first
  (`create-plan-design`), and visual-intake (`create-visual-questions`).
- `.agents/skills/visual-recap/SKILL.md` — `/visual-recap`, high-level visual
  code-review recaps for PRs, commits, branches, and git diffs.

When the user critiques a plan's look or structure, fix the renderer or the
sync-guarded skills (not just one stored plan) so the improvement sticks.

## Review Recaps

- `columns` is the generic before/after layout primitive for structured
  comparisons. Use it for side-by-side schema, API, prose, and model blocks.
- The PR Visual Recap GitHub Action runs the `visual-recap` skill on each PR via
  an LLM coding agent (Claude Code or Codex, chosen with `VISUAL_RECAP_AGENT`;
  model and reasoning depth via `VISUAL_RECAP_MODEL` / `VISUAL_RECAP_REASONING`)
  when `PLAN_RECAP_TOKEN` and the backend's API key are configured, shows a
  non-required `Visual Recap` check while it runs, then posts a sticky comment
  with an inline screenshot. The recap is informational and must not imply the
  diff has been reviewed.

## Source Sync

- Use the visual companion route when the user wants a DB-free visual plan or
  recap review loop. The companion routes are `/companion/plans/:slug` and
  `/companion/recaps/:slug`; they read MDX folders and feedback sidecars from
  `PLAN_LOCAL_DIR` or an explicit repo-relative `path`.
- Default checked-in storage is project-local `docs/visual-companion/` with
  `plans/` and `recaps/` subfolders. Bootstrap that folder on first requested
  companion use instead of defaulting to the companion app checkout.
- In companion runtime, `/` is the current project's companion dashboard. Keep that
  dashboard current-project-first and hide other sources behind an explicit
  opt-in section instead of mixing repos by default.
- For companion workflows, use `get-companion-plan` to read the local plan or
  recap with its target manifest, and `get-companion-feedback` to read the
  default agent queue. Do not scan the whole MDX file for review work before
  checking the queue.
- Companion feedback defaults to `resolutionTarget=agent`. Human-only review
  context must be explicit with `resolutionTarget=human`.
- Use manifest target metadata before coordinates: `blockId`, `canvasFrameId`,
  `canvasNodeId`, `sourcePath`, and `sourceRange` are the primary mapping
  signals. Treat `detached` or `unanchored` targets as lower confidence rather
  than guessing.
- Use `consume-companion-feedback` after acting on agent-targeted comments so
  they stop appearing as pending work. Use `resolve-companion-feedback` only
  when the UI thread is actually closed; reopening must preserve history.
- See `docs/visual-companion-workflow.md` for route, file, annotation,
  target-mapping, Apple demo, generic demo, recap, and verification guidance.
- Use `get-local-plan-folder` to read a DB-free local MDX folder from
  `PLAN_LOCAL_DIR` or from a repo-relative `path`, and
  `update-local-plan-folder` to apply structured `contentPatches` back to that
  same folder. Pass `path` whenever the user is viewing a
  companion artifact URL with `?path=...`. These local-folder actions do not read or
  write SQL.
- Use `promote-local-plan-folder` when a temporary local plan should be saved
  into the repo. Its default target is `apps.plan.roots[0].path/<slug>` from
  `agent-native.json`, falling back to `docs/visual-companion/plans/<slug>`.
- Use `patch-visual-plan-source` for small source edits by stable semantic IDs.
  It patches the MDX AST, runs formatting, parses back to normalized JSON, and
  persists the runtime model. Prefer this over regenerating a whole plan when the
  requested change is a few lines, one annotation, one artboard, or one
  wireframe node.
- In Agent Native Desktop, the companion menu can link a user-chosen local folder for
  the current plan and keep the companion artifact rooted in repo-local MDX
  files instead of the old hosted plan flow.
- Do not fork the vocabulary. MDX components must map to the same runtime terms:
  `DesignBoard`, `Section`, `Artboard`, `Screen`, `Annotation`, `Connector`, and
  the wireframe kit primitives from `shared/plan-content.ts`.

## Companion Review And Edits

- The default companion browser surface is review/read/comment first. Do not
  assume inline rich-text or document editing is mounted in the browser.
- Local companion folders opened from `PLAN_LOCAL_DIR` or a repo-relative
  `?path=...` route should be changed through `update-local-plan-folder` or
  `patch-visual-plan-source`, so writes go back to `plan.mdx`, `canvas.mdx`, and
  `prototype.mdx` without touching hosted storage.
- Review annotation mode pins feedback to prose, canvas, artboard, wireframe,
  diagram, and prototype targets. Treat comments as the primary review channel;
  use source patches or structured content patches for actual artifact edits.
- Design and prototype changes must keep stable semantic IDs (`data-design-id`,
  `data-plan-design-id`, block ids, frame ids, node ids) so feedback can map
  back to source. Use targeted source patches for structural or text changes.
- Companion comments include reviewer identity, resolver intent (`agent` or
  `human`), exact anchors, and thread history. Add or update local review
  feedback through companion-owned actions, preserving author fields and parent
  comment ids when replying.
- `get-companion-feedback` returns the current local companion feedback queue.
  Read it before changing code or updating artifact files so the agent acts on
  the pending local review thread instead of stale assumptions.
- **Anchor interpretation.** `targetX`/`targetY` are percentages within the
  named element; bare `x`/`y` are percentages of the whole document;
  `canvasX`/`canvasY` are board-world pixels. Wireframe anchors carry
  `targetNodeId`/`targetNodePath` — prefer those over raw coordinates; fall back
  to coordinates plus the focused screenshot only when no node id is present.
  Resolve `textQuote` with `contextBefore`/`contextAfter`; if `ambiguous: true`,
  ask the user. Threads in `detachedThreads` no longer match current prose —
  reconcile, never drop. Act on `resolutionTarget=agent`; treat `human` as
  context only; `@mentions` are notification signals, not routing. Mark ingested
  comments consumed (`consumedCommentIds`); set `status=resolved` only on
  agent-targeted comments you actually addressed.
- New human comments send best-effort transactional email when email is
  configured: root comments and replies notify the plan owner, @mentioned
  members, and replies also notify prior human participants in that thread.
  Reuse the shared `renderEmail` template; do not invent a separate
  plan-specific email style.
## Events

The plan app emits three events on the framework event bus: `plan.created`,
`plan.commented`, and `plan.status.changed`. Automations can
subscribe to any of them — if a user asks to "notify me when someone comments"
or similar, call `manage-automations` with `action=define` (trigger `plan.commented`,
optional condition on `resolutionTarget`) rather than writing bespoke integration
code. See the `automations` skill and the [Visual Plans events docs](/docs/template-plan#events)
for payload schemas and recipe examples.

Read the relevant root skill before implementation: `adding-a-feature`,
`actions`, `storing-data`, `real-time-sync`, `security`, `delegate-to-agent`,
`frontend-design`, `shadcn-ui`, and `self-modifying-code`.

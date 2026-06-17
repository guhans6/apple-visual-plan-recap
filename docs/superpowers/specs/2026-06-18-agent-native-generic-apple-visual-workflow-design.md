# Agent-Native Generic + Apple Visual Workflow Design

## Status

Approved design direction:

- Use the real `guhans6/agent-native` fork as the product surface.
- Preserve Agent-Native's visual quality and renderer instead of rebuilding a separate app.
- Add a generic plan/recap contract that works for any project.
- Ship an Apple-first domain pack on top of that generic contract.
- Use the installed Cursor-inspired `DESIGN.md` as the visual design reference.
- Default to local-first storage, with hosted publish or self-hosted DB/team mode as explicit later steps.

## References

- Agent-Native Visual Plans docs: https://www.agent-native.com/docs/template-plan
- Cursor design reference installed by `npx getdesign@latest add cursor`: `DESIGN.md`
- Apple documentation areas used for workflow categories:
  - Xcode: https://developer.apple.com/documentation/xcode
  - SwiftData: https://developer.apple.com/documentation/SwiftData
  - App Intents: https://developer.apple.com/documentation/appintents
  - Privacy manifest files: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files

## Product Goal

Turn Agent-Native Plan into a local-first visual collaboration system that can
plan and recap any software project, while making Apple development the first
high-quality domain pack.

The developer should be able to ask for `/visual-plan` or `/visual-recap`, get a
high-quality rendered surface, annotate it visually, send feedback to the agent,
and keep the plan/recap source and feedback locally unless they explicitly
publish.

## Non-Goals

- Do not build a separate replacement app outside Agent-Native.
- Do not make Apple the only supported project type.
- Do not generate production Apple UI as the purpose of the workflow.
- Do not default private plans or feedback to hosted Agent-Native storage.
- Do not add multiplayer, auth, sharing, email, mentions, or team DB mode to the
  first local-first patch.
- Do not reduce Agent-Native's current visual quality while adding local support.

## Architecture

The system has three layers.

### 1. Generic Visual Workflow Core

This is domain-neutral and should work for Apple, web, backend, data, security,
or future project packs.

Responsibilities:

- Define the canonical local plan folder contract.
- Define stable block ID requirements.
- Define comment, annotation, resolve, reopen, and consume semantics.
- Define what the agent reads when the user clicks "Send to agent".
- Keep hosted DB-backed behavior unchanged when a plan is not local.
- Provide domain pack selection from project context.

Local folder contract:

```text
plans/<slug>/
  plan.mdx
  canvas.mdx              optional
  prototype.mdx           optional
  .plan-state.json        optional upstream state
  feedback.jsonl          append-only local feedback events
  feedback-state.json     compact current feedback index
```

Feedback event requirements:

- `id`
- `planSlug`
- `targetBlockId`
- `targetKind`
- `anchorKind`
- `message`
- `resolutionTarget`
- `status`
- `creator`
- `createdAt`
- optional `resolvedAt`
- optional `consumedAt`
- optional visual anchor metadata for canvas coordinates, annotation IDs, image
  crop metadata, and text ranges

Default read behavior:

- Show open `resolutionTarget: "agent"` feedback first.
- Include resolved but unconsumed feedback as secondary context.
- Exclude consumed feedback by default.
- Preserve all historical events in `feedback.jsonl`.

### 2. Domain Packs

Domain packs convert repo context into visual plan/recap structure.

The first shipped packs are:

- `generic`: default fallback for all repos.
- `apple`: selected automatically for Swift, Xcode, Apple-platform, SwiftPM,
  SwiftUI, UIKit, AppKit, SwiftData, App Intents, widget, or extension repos.

Future packs can be added without changing the command surface:

- `web`
- `backend-api`
- `design-system`
- `data-ml`
- `security-review`

Domain detection should be explainable. The agent should state which pack it
selected and why, for example:

```text
Using Apple visual workflow because this repo contains MDZen.xcodeproj,
SwiftUI view files, and an XCTest target.
```

Manual override should be possible:

```text
Use /visual-plan with generic workflow.
Use /visual-recap with Apple workflow.
```

### 3. Cursor-Inspired Visual Layer

The visual layer keeps Agent-Native's existing Plan renderer as the base and
applies the Cursor-inspired design tokens only where they improve readability
and developer-tool polish.

Installed design tokens from `DESIGN.md`:

- Canvas: `#f7f7f4`
- Canvas soft: `#fafaf7`
- Surface card: `#ffffff`
- Ink: `#26251e`
- Body: `#5a5852`
- Muted: `#807d72`
- Hairline: `#e6e5e0`
- Hairline strong: `#cfcdc4`
- Primary accent: `#f54e00`
- Primary active: `#d04200`
- Success: `#1f8a65`
- Error: `#cf2d56`
- Timeline thinking: `#dfa88f`
- Timeline grep: `#9fc9a2`
- Timeline read: `#9fbbe0`
- Timeline edit: `#c0a8dd`
- Timeline done: `#c08532`

Typography rules:

- Prefer CursorGothic where legally available.
- Use Inter as the open substitute.
- Use JetBrains Mono on code, diffs, file paths, commands, logs, and evidence
  panes.
- Display text uses weight 400 with restrained negative letter spacing.
- Component titles can use weight 600.

Visual rules:

- Warm cream canvas, not pure white.
- Hairline-only depth; no drop-shadow-heavy UI.
- 8px buttons and inputs.
- 12px cards and panes.
- 80px section rhythm for large editorial pages.
- Cursor orange is scarce and reserved for primary action or brand accent.
- Timeline pastels are only for agent/workflow stage visualization.
- Dark mode must not wash out light previews. Every mockup and card needs a
  contrast check in light and dark shells.

## Agent-Native Fork Integration

The real target is `BuilderIO-agent-native` with `origin` pointing at
`guhans6/agent-native` and `upstream` pointing at `BuilderIO/agent-native`.

Key upstream surfaces:

- `templates/plan/actions/get-local-plan-folder.ts`
- `templates/plan/actions/get-plan-feedback.ts`
- `templates/plan/actions/consume-plan-feedback.ts`
- `templates/plan/actions/resolve-plan-comment.ts`
- `templates/plan/actions/reply-to-plan-comment.ts`
- `templates/plan/app/pages/PlansPage.tsx`
- `templates/plan/app/components/plan/CanvasArea.tsx`
- `templates/plan/app/components/plan/PlanContentRenderer.tsx`
- `templates/plan/shared/plan-content.ts`
- `templates/plan/server/lib/local-plan-files.ts`
- `templates/plan/server/plan-mdx.ts`

Current upstream behavior to preserve:

- Hosted plans keep DB-backed comments, sharing, plan history, publishing, and
  existing "Send to agent" behavior.
- Local-files mode renders local MDX and avoids hosted DB writes.
- Local-files mode currently disables hosted sharing, browser comments, plan
  history, and publish/export receipts until explicit publish.

Required local-first behavior to add:

- Local mode exposes review/comment controls.
- Local comments persist to local sidecars, not Plan DB.
- Local "Send to agent" reads sidecar feedback.
- Local consume/resolve/reopen updates sidecars.
- Hosted behavior remains unchanged outside local mode.

## User Workflows

### Generic Plan

1. User asks for `/visual-plan`.
2. Agent inspects repo context.
3. No specific domain pack matches, so `generic` is selected.
4. Agent creates `plans/<slug>/plan.mdx` and optional `canvas.mdx`.
5. Agent starts/open local Plan route.
6. User reviews, annotates, and clicks "Send to agent".
7. Agent reads local feedback, updates the plan, consumes handled comments.

Example:

```text
Use /visual-plan for refactoring the billing webhook handler.
```

Visual treatment:

- Endpoint/data-flow diagram.
- File tree.
- Change slices.
- Risk checklist.
- Verification commands.
- Open questions.

### Generic Recap

1. User asks for `/visual-recap` on a branch, PR, commit, or diff.
2. Agent inspects the diff and repo context.
3. Generic recap blocks summarize files, behavior, contracts, tests, and risk.
4. User annotates recap blocks.
5. Agent reads feedback and creates a follow-up patch or plan.

Example:

```text
Use /visual-recap on the diff between main and this branch.
```

Visual treatment:

- High-altitude summary.
- File and module map.
- Annotated code/diff highlights.
- Evidence panel.
- Residual risk list.

### Apple Plan

1. User asks for `/visual-plan` in a Swift/Xcode repo.
2. Agent selects the Apple pack from project context.
3. Agent renders all four v1 Apple surfaces:
   - Plan/recap document.
   - Workflow canvas.
   - Evidence panels.
   - Question/decision forms.
4. User annotates the exact block or canvas region.
5. Agent reads feedback and updates the plan before implementation.

Example:

```text
Use /visual-plan for adding SwiftData sync to notes.
```

Visual treatment:

- Xcode target/scheme map.
- SwiftData model and migration diagram.
- SwiftUI screen/state flow.
- Simulator/preview verification panel.
- Privacy/App Store risk checklist.
- Open decision form for sync policy and migration behavior.

### Apple Recap

1. User asks for `/visual-recap` after a branch or PR.
2. Agent selects Apple pack from repo/diff context.
3. Recap emphasizes changed Apple surfaces, verification evidence, and residual
   Apple-platform risk.
4. User comments on risky areas.
5. Agent reads local feedback and creates a follow-up patch or plan.

Example:

```text
Use /visual-recap on this PR before I review the SwiftUI changes.
```

Visual treatment:

- Changed target/scheme/package map.
- Annotated Swift diff.
- Preview/simulator evidence panel.
- Entitlement/privacy/accessibility risk list.
- Follow-up checklist.

## Apple v1 Surfaces

All four are in v1.

### 1. Plan/Recap Document

Already mostly present upstream.

Needed additions:

- Apple-specific block ordering.
- Better prompts/templates for Swift/Xcode context.
- Apple risk language.
- Stable IDs for every commentable block.

Use for:

- Goals and non-goals.
- Scope.
- File tree.
- Annotated code.
- Diff highlights.
- Implementation slices.
- Review checklist.

### 2. Workflow Canvas

Partly present upstream through canvas, artboards, wireframes, connectors, and
annotations.

Needed additions:

- Apple-specific canvas vocabulary.
- Xcode target/scheme artboards.
- App surface artboards.
- Simulator/device/previews artboards.
- Handoff arrows between app, extensions, widgets, intents, and data stores.

Use for:

- SwiftUI navigation flow.
- UIKit/AppKit controller/window flow.
- App Intents/Shortcuts entity/action flow.
- Widget/extension relationship map.
- Data migration path.
- Build/test/release lane.

### 3. Evidence Panels

Partly present upstream through code, checklist, callout, diff, file-tree, and
recap blocks.

Needed additions:

- Structured evidence block for commands, simulator/device, screenshot/log refs,
  pass/fail status, and residual caveats.
- Apple verification presets.

Use for:

- `swift test`
- `swift build`
- `xcodebuild build`
- `xcodebuild test`
- Swift Testing / XCTest results
- SwiftUI Preview checks
- Simulator/device run checks
- UI screenshot checks
- Accessibility checks
- Privacy manifest review
- Entitlements/signing review
- Performance/memory/concurrency checks

### 4. Question/Decision Forms

Already present upstream through question forms and visual questions.

Needed additions:

- Apple-specific decision templates.
- Explicit routing of answers back into plan revisions.

Use for:

- Platform support.
- Migration choices.
- Preview/simulator coverage.
- App Store review risk.
- Entitlement tradeoffs.
- Data retention/privacy decisions.
- Release/TestFlight decisions.

## Case Matrix

| Case | Present Upstream | New Generic Work | Apple Pack Work | Visual Treatment |
|---|---:|---:|---:|---|
| Basic implementation plan | Yes | Contract validation | Apple template | Rich doc, file tree, checklist |
| PR/diff recap | Yes | Contract validation | Apple recap template | Editorial recap, annotated diff |
| Local MDX rendering | Yes | Keep and extend | Apple examples | Local Plan route |
| Hosted comments | Yes | Preserve | Preserve | Existing comment UI |
| Local comments in local-files mode | No | Sidecar-backed comment actions | Apple defaults | Review toolbar + local persistence |
| Send local feedback to agent | No | Local `get-plan-feedback` | Apple grouping | Handoff payload |
| Consume local feedback | No | Local consume event | Apple follow-up flow | Consumed state |
| Resolve/reopen local feedback | No | Local state events | Apple review flow | Thread status |
| Generic repo detection | Partial | Domain pack router | Apple detection rules | Pack badge/explanation |
| Generic plan for non-Apple repo | Partial | Generic pack | None | Diagrams, file map, risk |
| Generic recap for non-Apple repo | Partial | Generic pack | None | Diff recap, evidence |
| Xcode target/scheme map | No | Domain extension point | New | Canvas block |
| SwiftPM package map | No | Domain extension point | New | File/package map |
| SwiftUI screen/state flow | Partial wireframe | Domain extension point | New | Wireframe + state diagram |
| UIKit/AppKit window/controller flow | Partial wireframe | Domain extension point | New | App surface canvas |
| SwiftData/Core Data model/migration | Partial data model | Domain extension point | New | Data model + risk panel |
| App Intents/Shortcuts | No | Domain extension point | New | Intent/entity/action flow |
| Widgets/extensions | No | Domain extension point | New | Extension relationship map |
| Entitlements/capabilities | No | Evidence/risk extension | New | Capability risk panel |
| Privacy manifests | No | Evidence/risk extension | New | Privacy checklist |
| Signing/provisioning | No | Evidence/risk extension | New | Release risk panel |
| SwiftUI previews | No | Evidence extension | New | Preview evidence panel |
| Simulator/device evidence | Partial screenshots | Evidence extension | New | Run evidence panel |
| XCTest/Swift Testing | Partial checklist | Evidence extension | New | Test evidence panel |
| Accessibility review | Partial checklist | Evidence extension | New | HIG/accessibility checklist |
| Performance profiling | Partial checklist | Evidence extension | New | Performance risk panel |
| Memory/leak review | Partial checklist | Evidence extension | New | Leak evidence panel |
| Concurrency review | Partial checklist | Evidence extension | New | Risk and code highlight |
| TestFlight/App Store readiness | No | Release extension | New | Release checklist |
| Cursor-inspired visual polish | No | Tokenized design layer | Apple components use it | Warm canvas, hairlines, mono code |
| Future web/backend/security packs | No | Pack registry | Not Apple-specific | Same core contract |

## Apple Workflow Examples

### Example 1: SwiftData Sync Plan

Input:

```text
Use /visual-plan for adding SwiftData sync to notes.
```

Plan output:

- Goal and non-goals.
- Target/scheme map.
- SwiftData model diagram.
- Migration risk panel.
- SwiftUI state flow.
- Verification evidence plan.
- Open questions for sync policy and conflict handling.

### Example 2: SwiftUI Refactor Recap

Input:

```text
Use /visual-recap on this branch.
```

Recap output:

- Summary of changed views/models/tests.
- Annotated diff for the view-state boundary.
- Preview/simulator evidence.
- Accessibility and Dynamic Type risk.
- Follow-up comments for agent-targeted fixes.

### Example 3: App Intent Plan

Input:

```text
Use /visual-plan before exposing this action to Shortcuts.
```

Plan output:

- App Intent/entity/action flow.
- App Shortcuts phrase checklist.
- Privacy and availability notes.
- Test plan for Shortcuts/Siri surfaces.

### Example 4: Widget Extension Recap

Input:

```text
Use /visual-recap on the widget extension changes.
```

Recap output:

- App/extension relationship map.
- Timeline provider data flow.
- Entitlement/app group review.
- Simulator evidence and residual risk.

### Example 5: Generic API Refactor Plan

Input:

```text
Use /visual-plan for the upload API refactor.
```

Plan output:

- Endpoint map.
- Request/response flow.
- File tree.
- Annotated code snippets.
- Test and risk checklist.

## Data Flow

```text
User request
  -> agent inspects repo context
  -> domain pack router selects generic/apple
  -> skill creates local MDX folder
  -> Agent-Native local route renders plan/recap
  -> user annotates block/canvas/comment
  -> local sidecar event appended
  -> user clicks Send to agent
  -> local get-plan-feedback reads sidecars
  -> agent updates plan/code
  -> consume-plan-feedback appends consumed event
  -> plan reload shows handled state
```

## Error Handling

- Missing sidecar files read as empty feedback.
- Invalid feedback JSON returns a clear local-file parse error with path.
- Missing target block ID marks feedback as detached, not lost.
- If local folder is outside allowed roots, the action fails before writing.
- If hosted plan mode is active, local sidecar actions are not used.
- If `DESIGN.md` tokens are missing, renderer falls back to existing
  Agent-Native styles and reports the missing design reference in dev logs.
- If CursorGothic is unavailable, Inter/system fallback is used.

## Testing Strategy

### Generic Core Tests

- Missing local sidecars read as empty feedback.
- Creating local comments appends JSONL and updates state.
- Open agent-targeted comments group by block ID.
- Resolved unconsumed comments remain available to the agent.
- Consumed comments are excluded by default.
- Hosted DB-backed comment tests still pass.

### Agent-Native UI Tests

- Local route shows review toolbar.
- Local route can create a block comment.
- Local route can create a canvas comment.
- Local route can resolve/reopen a comment.
- Local route can send local feedback to agent.
- Light and dark shells preserve contrast.

### Apple Pack Tests

- Swift/Xcode fixture selects Apple pack.
- Non-Apple fixture selects generic pack.
- Apple plan includes all four v1 surfaces.
- Apple recap includes evidence and residual risk blocks.
- Apple examples validate MDX block vocabulary and stable IDs.

### Visual Quality Tests

- Snapshot or browser checks for main plan, recap, canvas, and evidence panels.
- Contrast check for Cursor palette in dark and light shells.
- Code surfaces use mono font tokens.
- No drop-shadow-heavy replacements for Agent-Native's existing hairline style.

## Implementation Slices

1. Install and commit `DESIGN.md`.
2. Add generic workflow contract docs and types.
3. Patch Agent-Native local feedback persistence.
4. Patch local `get-plan-feedback` and consume/resolve/reopen actions.
5. Enable local comment UI in `PlansPage`.
6. Add generic domain pack router.
7. Add Apple domain pack templates and examples.
8. Add Apple evidence panels and case presets.
9. Apply Cursor-inspired visual tokens to relevant Plan surfaces.
10. Verify all case matrix entries and run gatekeeper review.

## Open Decisions

None for the design phase. Implementation may uncover exact Agent-Native file
split changes, but the user-approved direction is fixed:

- real Agent-Native fork,
- generic core contract,
- Apple-first pack,
- local-first storage,
- Cursor-inspired visual layer.

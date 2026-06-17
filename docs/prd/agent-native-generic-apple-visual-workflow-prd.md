# Agent-Native Generic + Apple Visual Workflow PRD

Issue tracker status: published as https://github.com/guhans6/apple-visual-plan-recap/issues/13.

Source spec: `docs/superpowers/specs/2026-06-18-agent-native-generic-apple-visual-workflow-design.md`

## Problem Statement

Developers want the visual quality of Agent-Native Plan for planning and review, but the current local-files workflow is not enough for the user's intended collaboration loop. Local plans can render, but local visual comments, "Send to agent", consume/resolve state, and domain-specific Apple workflows are not integrated into the real Agent-Native fork.

The user also does not want the project to become Apple-only. Apple development is the first priority, but the underlying system should support generic non-Apple projects and future domain packs. The system must preserve Agent-Native's high-quality visual renderer, add Cursor-inspired developer-tool polish from `DESIGN.md`, and keep private work local by default.

## Solution

Build the workflow inside the real `guhans6/agent-native` fork using three layers:

- A generic visual workflow core that defines the local plan folder contract, stable block IDs, local feedback sidecars, comment lifecycle, agent handoff payload, and domain-pack routing.
- An Apple-first domain pack selected from project context for Swift, Xcode, SwiftUI, UIKit, AppKit, SwiftData, App Intents, widgets, extensions, and Apple release workflows.
- A Cursor-inspired visual layer using the installed `DESIGN.md` reference: warm cream canvas `#f7f7f4`, warm ink `#26251e`, Cursor orange `#f54e00`, hairline depth, 8px controls, 12px cards, JetBrains Mono code surfaces, and timeline pastel pills scoped to agent activity.

The default user flow stays generic:

- `/visual-plan` creates a local plan.
- `/visual-recap` creates a local recap.
- Project context selects `apple` or `generic`.
- The rendered Agent-Native Plan surface supports local review comments.
- "Send to agent" reads local feedback sidecars.
- Agents update the plan or code and consume handled feedback.
- Hosted publish and self-hosted DB/team mode remain explicit later choices.

## User Stories

1. As a developer, I want `/visual-plan` to work for any project, so that I do not need a different command for every stack.
2. As a developer, I want `/visual-recap` to work for any project, so that I can review diffs visually regardless of language.
3. As a developer, I want the workflow to detect Apple repos from project context, so that Swift/Xcode projects automatically get Apple-specific plans.
4. As a developer, I want to override the selected domain pack, so that I can force generic or Apple behavior when context detection is wrong.
5. As an Apple developer, I want the Apple pack to cover Xcode targets and schemes, so that scope mistakes are visible before implementation.
6. As an Apple developer, I want the Apple pack to cover SwiftPM packages, so that package-level changes are visible in plans and recaps.
7. As an Apple developer, I want SwiftUI screen and state flows shown visually, so that UI behavior can be reviewed before code changes.
8. As an Apple developer, I want UIKit and AppKit controller/window flows shown visually, so that non-SwiftUI app surfaces are still supported.
9. As an Apple developer, I want SwiftData and Core Data model/migration risk shown visually, so that persistence changes receive focused review.
10. As an Apple developer, I want App Intents and Shortcuts flows shown visually, so that intent/entity/action design is clear.
11. As an Apple developer, I want widget and extension relationships shown visually, so that app-extension data boundaries are clear.
12. As an Apple developer, I want entitlement and capability changes called out, so that signing and review-sensitive changes are not hidden.
13. As an Apple developer, I want privacy manifest risk called out, so that privacy-sensitive work is reviewed before shipping.
14. As an Apple developer, I want signing and provisioning risk shown in recaps, so that release issues are visible.
15. As an Apple developer, I want SwiftUI Preview status shown as evidence, so that visual checks are not forgotten.
16. As an Apple developer, I want simulator and device evidence shown as evidence, so that runtime checks are visible.
17. As an Apple developer, I want XCTest and Swift Testing evidence shown, so that verification is tied to the plan or recap.
18. As an Apple developer, I want accessibility review checklists, so that Dynamic Type, VoiceOver, contrast, and HIG concerns are visible.
19. As an Apple developer, I want performance, memory, and concurrency risks called out, so that high-risk runtime issues receive focused review.
20. As an Apple developer, I want TestFlight and App Store readiness included for release work, so that release risk is not buried in chat.
21. As a reviewer, I want local visual comments in local-files mode, so that I can annotate rendered plans without hosted storage.
22. As a reviewer, I want comments anchored to stable blocks and canvas regions, so that feedback stays attached to the right visual element.
23. As a reviewer, I want to mark comments as agent-targeted or human-review-only, so that the agent acts only on intended feedback.
24. As a reviewer, I want resolved feedback to remain auditable, so that the review history is not lost.
25. As a reviewer, I want consumed feedback hidden from default agent reads, so that stale feedback does not get applied repeatedly.
26. As an agent, I want local `get-plan-feedback` to return grouped sidecar feedback, so that I can patch the right block or code path.
27. As an agent, I want local `consume-plan-feedback` to append a consume event, so that review history is preserved.
28. As an agent, I want missing sidecar files to read as empty feedback, so that new local plans work without manual setup.
29. As an agent, I want malformed sidecar files to produce clear local-file errors, so that corruption is actionable.
30. As a developer, I want hosted DB-backed plans to keep existing behavior, so that local-first work does not regress sharing workflows.
31. As a developer, I want the Cursor-inspired visual layer applied carefully, so that visual quality improves without losing Agent-Native's current style.
32. As a developer, I want `DESIGN.md` color and typography tokens used consistently, so that the visual system has a stable reference.
33. As a developer, I want light and dark shells checked for contrast, so that the UI does not become unreadable.
34. As a developer, I want code, commands, logs, and diffs rendered in mono typography, so that developer artifacts scan clearly.
35. As a future maintainer, I want a generic domain-pack contract, so that web, backend, security, or data packs can be added later.
36. As a future maintainer, I want Apple pack behavior expressed as templates and examples, so that it can evolve without hardcoding every case.
37. As a future maintainer, I want implementation slices that cut across schema, action, UI, and tests, so that each issue is demoable.
38. As a project owner, I want local-first to remain the default, so that private plans and feedback do not leave the repo without consent.

## Implementation Decisions

- The real product surface is the `guhans6/agent-native` fork, not a separate companion app.
- `/visual-plan` and `/visual-recap` remain generic command surfaces.
- Domain pack selection is based on project context, with Apple selected for Swift, Xcode, Apple-platform, SwiftPM, SwiftUI, UIKit, AppKit, SwiftData, App Intents, widget, or extension signals.
- Manual domain override remains possible.
- The generic local folder contract includes `plan.mdx`, optional `canvas.mdx`, optional `prototype.mdx`, optional `.plan-state.json`, `feedback.jsonl`, and `feedback-state.json`.
- Local feedback is append-only JSONL plus a compact state index.
- Local feedback mirrors the hosted comment concepts where useful: target block, anchor, status, resolution target, creator, timestamps, resolved state, and consumed state.
- Missing local feedback files are treated as empty feedback.
- Hosted DB-backed comment behavior must remain unchanged when not in local mode.
- Local mode must expose review/comment controls instead of hiding them.
- Local "Send to agent" must read sidecar feedback rather than hosted DB comments.
- Local consume/resolve/reopen must update sidecars.
- Apple v1 includes all four surfaces: plan/recap document, workflow canvas, evidence panels, and question/decision forms.
- Cursor-inspired visual tokens come from the installed `DESIGN.md` reference.
- Visual updates must preserve Agent-Native's existing high-quality renderer and avoid a full redesign.
- Hosted publish and self-hosted DB/team mode are explicit later promotion paths.

## Testing Decisions

- Tests should verify behavior through public seams, not private implementation details.
- Existing Agent-Native action tests are the prior art for `get-plan-feedback`, consume, resolve, reply, publish, and local plan behavior.
- Existing Plan page/component tests are the prior art for UI comment flows and local route behavior.
- Existing canvas/wireframe tests are the prior art for visual surface behavior.
- Generic core tests should cover missing sidecars, creating comments, grouping feedback by block, resolved/unconsumed visibility, consume behavior, malformed local files, and hosted behavior not regressing.
- UI tests should cover local route review toolbar visibility, block comments, canvas comments, resolve/reopen, "Send to agent", and light/dark contrast.
- Apple pack tests should cover Swift/Xcode fixture detection, non-Apple generic fallback, all four Apple v1 surfaces, evidence blocks, residual risk blocks, stable IDs, and block vocabulary validation.
- Visual quality tests should cover Cursor palette contrast, mono code surfaces, warm canvas/hairline styling, and no drop-shadow-heavy regressions.
- Gatekeeper review should verify the PRD, spec, and issue slices do not overclaim upstream behavior and do not omit any case in the case matrix.

## Out of Scope

- Building a separate replacement app outside Agent-Native.
- Making the workflow Apple-only.
- Generating production Apple UI.
- Defaulting private work to hosted Agent-Native storage.
- Multiplayer review, auth, sharing, email, mentions, or team DB mode in the first local-first implementation.
- Replacing Xcode, Swift, XCTest, Swift Testing, simulator, or device verification.
- Full self-hosted DB/team mode before the local sidecar loop is complete.
- Adding web/backend/security/data packs in the first Apple-priority implementation.

## Further Notes

The earlier Apple-only proof-of-loop remains useful, but this PRD supersedes it as the broader product direction. The implementation should move from the standalone proof toward the real Agent-Native fork while keeping the same local-first feedback principles.

The installed `DESIGN.md` is part of the product input. It should be treated as the design-system reference when implementing visual changes.

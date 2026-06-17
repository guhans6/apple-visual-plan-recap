# Apple Visual Plan/Recap PRD

Issue tracker status: local PRD artifact. Publish later with `ready-for-agent` when the Apple visual skills repo and issue tracker are created.

## Problem Statement

Apple-platform development with coding agents is still too text-heavy. A developer can ask an agent to plan a Swift, SwiftUI, AppKit, UIKit, SwiftData, Xcode, or App Store workflow, but the result is usually a wall of Markdown that is hard to scan, hard to annotate, and hard to steer. When work is broad, the developer has to mentally connect architecture, UI state, file changes, tests, simulator behavior, and review comments across chat, code, and terminal output.

The user wants a visual collaboration workflow similar to the Agent-Native Plan experience seen in a video: a rendered plan or recap that developers can inspect visually, annotate directly, and use as a feedback surface for agents. The workflow must be Apple-focused, privacy-conscious, local-first, and useful for planning/reviewing Apple development work rather than generating production Apple UI.

## Solution

Build a narrow Apple-focused visual planning and recap system with two agent skills and a local/self-hostable visual Plan app spike.

The system keeps only two skills:

- `/visual-plan` for planning before implementation.
- `/visual-recap` for reviewing a branch, PR, commit, or working-tree diff after implementation.

The skills generate structured MDX artifacts that a Plan app can render as diagrams, file maps, screen-state sketches, annotated code, open questions, and recap blocks. The Apple focus comes from the skill instructions, examples, vocabulary, and verification expectations: Swift, Xcode, SwiftUI, AppKit, UIKit, SwiftData, App Intents, widgets, targets, schemes, previews, simulators, entitlements, privacy manifests, TestFlight, and App Store review.

The MVP must be local-first. Upstream Agent-Native local-files mode can render local MDX plans, but it does not currently provide browser comments by default for local plans. The MVP therefore adds a local visual feedback layer: comments and annotations are anchored to stable block IDs, persisted beside the MDX plan in sidecar files, readable by the coding agent, and consumable after the agent acts on them.

Self-hosted DB/shared-team mode is deferred until the local loop is proven. Hosted third-party Plan storage is not the default.

## User Stories

1. As an Apple app developer, I want to open a visual plan before an agent edits code, so that I can understand the proposed work without reading a long chat transcript.
2. As an Apple app developer, I want a plan to show affected targets, schemes, packages, and app surfaces, so that I can catch scope mistakes early.
3. As an Apple app developer, I want a plan to show SwiftUI, UIKit, AppKit, widget, or extension state flows, so that I can evaluate behavior before implementation.
4. As an Apple app developer, I want a plan to show Xcode verification steps, so that the agent and I agree on what evidence will prove the work.
5. As an Apple app developer, I want a plan to show simulator, preview, and test expectations, so that visual/runtime checks are not forgotten.
6. As an Apple app developer, I want a plan to include platform availability notes, so that iOS, macOS, watchOS, tvOS, and visionOS differences are explicit.
7. As an Apple app developer, I want a plan to call out entitlements, capabilities, and privacy manifests, so that review-sensitive changes are visible up front.
8. As an Apple app developer, I want a plan to distinguish production UI from planning sketches, so that visual artifacts do not get mistaken for final product design.
9. As an Apple app developer, I want to comment on a rendered plan block, so that feedback is anchored to the exact diagram, file map, code excerpt, or question.
10. As an Apple app developer, I want to mark a comment as agent-targeted or human-review-only, so that the agent knows what to act on.
11. As an Apple app developer, I want local comments to persist in project files, so that feedback is not lost when the browser reloads.
12. As an Apple app developer, I want the agent to read open comments from local files, so that private code and feedback do not need hosted Plan storage.
13. As an Apple app developer, I want the agent to update the MDX plan after feedback, so that the rendered plan reflects the latest agreement.
14. As an Apple app developer, I want handled feedback to be marked consumed, so that the agent does not repeatedly act on the same comment.
15. As an Apple app developer, I want resolved feedback to remain visible, so that review history remains auditable.
16. As an Apple app developer, I want consumed feedback excluded from default agent reads, so that the agent focuses on unhandled work.
17. As an Apple app developer, I want a visual recap after implementation, so that I can scan what changed before reading raw diffs.
18. As an Apple app developer, I want a recap to show file tree changes, so that I can understand the footprint of a branch.
19. As an Apple app developer, I want a recap to show annotated Swift diffs, so that the key behavioral changes are easy to review.
20. As an Apple app developer, I want a recap to show testing and runtime evidence, so that I can judge whether the agent verified the work.
21. As an Apple app developer, I want a recap to call out residual risk, so that I can focus review on signing, migration, privacy, performance, accessibility, and App Store concerns.
22. As an Apple app developer, I want local MDX artifacts checked into a repo when useful, so that planning and review decisions can be audited.
23. As an Apple app developer, I want the block vocabulary validated before the agent writes MDX, so that broken custom tags do not produce a blank or invalid plan.
24. As an Apple app developer, I want every commentable block to have a stable ID, so that comments remain attached after plan edits.
25. As an Apple app developer, I want the rendered UI to expose stable block anchors, so that comments can target visual blocks reliably.
26. As an Apple app developer, I want the Apple skills pack to include only visual plan and recap skills, so that unrelated workflow skills do not clutter the installation.
27. As an Apple app developer, I want hosted Plan services to be opt-in, so that private Apple code does not leave local/self-hosted infrastructure by default.
28. As an Apple app developer, I want self-hosted DB/team mode later, so that the workflow can grow into shared review without blocking local MVP value.
29. As an Apple app developer, I want issue-sized vertical slices, so that agents can implement the system incrementally and safely.
30. As an Apple app developer, I want a gatekeeper review before implementation, so that the PRD, plan, and issues do not overclaim upstream capabilities.
31. As an agent implementing the workflow, I want explicit feedback file contracts, so that I can build the local loop without guessing.
32. As an agent implementing the workflow, I want acceptance criteria for privacy and no hosted DB writes, so that I do not accidentally rely on hosted Plan behavior.
33. As a future open-source maintainer, I want licensing and attribution decisions called out, so that publishing later does not create avoidable legal or trust issues.
34. As a future open-source maintainer, I want Apple branding boundaries explicit, so that the project is not confused with an official Apple product.
35. As a reviewer, I want local collaboration evidence recorded, so that the project only claims success after the comment-to-agent loop works.

## Implementation Decisions

- Build a narrow skills pack instead of forking the entire BuilderIO skills catalog.
- Keep only visual planning and visual recap skills in the Apple-focused skill pack.
- Rewrite skill instructions around Apple development vocabulary and verification workflows.
- Default private Apple work to local-files mode.
- Treat third-party hosted Plan publishing as explicit opt-in.
- Treat self-hosted DB/shared-team mode as a later phase after local MVP proof.
- Use structured MDX as the plan source format because it remains readable to agents while carrying renderable block structure.
- Require agents to fetch or validate the Plan block vocabulary before authoring sample MDX.
- Require every commentable block to have a stable ID.
- Require the renderer to expose stable block anchors that can be targeted by comments.
- Add a local feedback sidecar contract because upstream local-files mode currently renders local plans but does not provide browser comments by default.
- Store local feedback as append-only feedback events plus a compact state index.
- Store local feedback beside the MDX plan rather than in browser local storage.
- Use an event shape that mirrors the upstream DB-backed comment model where possible: anchor, target block, status, resolution target, created-by, created-at, and consumed-at.
- Provide an agent-readable feedback reader that groups open agent-targeted comments by block.
- Provide a consume flow so agents can mark handled feedback as consumed without deleting review history.
- Preserve resolved feedback for human audit while excluding consumed feedback from default agent reads.
- Reuse the upstream Plan app concepts where practical, but do not assume upstream local mode already supports local comments.
- Keep local MVP scope limited to comments, replies, resolve/reopen status, agent/human target, persistence, readback, and consume state.
- Defer multiplayer, auth, email notifications, screenshots, mentions, hosted sharing, and public package publishing.
- Preserve upstream notices and verify exact Agent-Native licensing before any public redistribution.
- Avoid names or marketing copy that imply official Apple affiliation.

## Testing Decisions

- Test external behavior rather than internal implementation details.
- The highest-value seam is the local human-agent feedback loop: render a local plan, add a block-anchored comment, persist it, read it as an agent, update MDX, consume the comment, and verify UI state changes.
- The skills pack should be tested with content checks that verify only two skills exist and hosted-default language is not reintroduced.
- The MDX sample should be tested by validating real Plan block tags and stable block IDs.
- The local feedback contract should be tested by reading an empty feedback file, reading open agent-targeted feedback, grouping by target block, and excluding consumed feedback.
- The consume flow should be tested by appending a consume event and updating the state index without deleting original feedback.
- The local Plan app should be tested at the route level to ensure local plans no longer return hardcoded empty feedback when sidecar files exist.
- The rendered app should be tested at the UI behavior seam: comment mode visible in local mode, comment anchored to a rendered block, open/resolved/consumed counts displayed correctly.
- Hosted behavior should be regression-tested to ensure existing DB-backed comments still work when local mode is false.
- Privacy behavior should be tested by confirming the MVP local loop does not require hosted Plan actions or Plan DB writes.
- PRD and issue quality should be tested by gatekeeper review: no upstream overclaim, no missing local feedback tasks, no horizontal-only slices, and no stale implementation details in PRD/issues.

## Out of Scope

- Generating production Apple UI.
- Replacing Swift, Xcode, XCTest, simulator, or code review verification.
- Supporting all BuilderIO skills.
- Installing telemetry.
- Publishing a public package.
- Public open-source release before license review.
- Hosted third-party Plan storage as a default.
- Multiplayer collaboration in the MVP.
- Account/auth-based reviewer identity in the MVP.
- Email notifications, mentions, and team sharing in the MVP.
- Screenshot-focused feedback capture in the MVP.
- Full self-hosted database-backed team mode in the first pass.
- App Store distribution or notarization for the Plan app.

## Further Notes

The critical correction from review is that local-files mode is not enough by itself. The local MVP must add a real local feedback layer. The value proposition is not simply "visual plans"; it is a private local loop where the developer annotates a rendered artifact and the agent can read, act on, and consume that feedback.

The implementation plan should remain the execution source of truth for file-level tasks. This PRD intentionally avoids specific file paths and code snippets except for describing stable contracts at a product level.


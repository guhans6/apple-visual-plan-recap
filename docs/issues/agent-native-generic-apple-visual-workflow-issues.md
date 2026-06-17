# Agent-Native Generic + Apple Visual Workflow Issue Breakdown

Issue tracker status: published to https://github.com/guhans6/apple-visual-plan-recap/issues.

Parent PRD: `docs/prd/agent-native-generic-apple-visual-workflow-prd.md`

Source spec: `docs/superpowers/specs/2026-06-18-agent-native-generic-apple-visual-workflow-design.md`

Published PRD issue: https://github.com/guhans6/apple-visual-plan-recap/issues/13

Published slices:

- Issue 1: https://github.com/guhans6/apple-visual-plan-recap/issues/14
- Issue 2: https://github.com/guhans6/apple-visual-plan-recap/issues/15
- Issue 3: https://github.com/guhans6/apple-visual-plan-recap/issues/16
- Issue 4: https://github.com/guhans6/apple-visual-plan-recap/issues/17
- Issue 5: https://github.com/guhans6/apple-visual-plan-recap/issues/18
- Issue 6: https://github.com/guhans6/apple-visual-plan-recap/issues/19
- Issue 7: https://github.com/guhans6/apple-visual-plan-recap/issues/20
- Issue 8: https://github.com/guhans6/apple-visual-plan-recap/issues/21
- Issue 9: https://github.com/guhans6/apple-visual-plan-recap/issues/22
- Issue 10: https://github.com/guhans6/apple-visual-plan-recap/issues/23

## Proposed Vertical Slices

1. **Add local feedback sidecars to Agent-Native local plans**
   - Type: AFK
   - Blocked by: None
   - User stories covered: 21, 22, 24, 28, 29, 30

2. **Enable local comment authoring in the real Plan UI**
   - Type: AFK
   - Blocked by: Issue 1
   - User stories covered: 21, 22, 23, 30, 33

3. **Send and consume local feedback end to end**
   - Type: AFK
   - Blocked by: Issues 1, 2
   - User stories covered: 24, 25, 26, 27, 28, 29, 30

4. **Add generic domain-pack routing**
   - Type: AFK
   - Blocked by: Issue 3
   - User stories covered: 1, 2, 3, 4, 35, 37

5. **Ship generic plan and recap templates on the shared contract**
   - Type: AFK
   - Blocked by: Issue 4
   - User stories covered: 1, 2, 35, 37

6. **Add Apple project detection and plan template**
   - Type: AFK
   - Blocked by: Issues 4, 5
   - User stories covered: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 36, 38

7. **Add Apple recap template with evidence and residual risk**
   - Type: AFK
   - Blocked by: Issues 4, 5
   - User stories covered: 14, 15, 16, 17, 18, 19, 20, 36, 38

8. **Add Apple workflow canvas and evidence panels**
   - Type: AFK
   - Blocked by: Issues 6, 7
   - User stories covered: 5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20

9. **Apply Cursor-inspired visual quality layer**
   - Type: AFK
   - Blocked by: Issues 2, 5, 8
   - User stories covered: 31, 32, 33, 34

10. **Prove the full generic and Apple case matrix**
    - Type: HITL
    - Blocked by: Issues 1-9
    - User stories covered: 1-38

## Issues

### Issue 1: Add local feedback sidecars to Agent-Native local plans

Labels: `ready-for-agent`

#### What to build

Extend real Agent-Native local plan folders so local plans can carry sidecar feedback state beside their MDX content. A local plan with no feedback files should still render normally, and a local plan with feedback files should load comment summary information without touching hosted Plan database tables.

#### Acceptance criteria

- [ ] Local plans support an append-only feedback event log and compact feedback state index.
- [ ] Missing feedback sidecar files are treated as an empty feedback set.
- [ ] Malformed feedback sidecars produce a clear local-file error with the affected path.
- [ ] Local feedback items preserve stable target block IDs, anchor metadata, status, resolution target, creator, creation time, resolved time, and consumed time.
- [ ] Hosted DB-backed plan comments still load through the existing hosted path.
- [ ] Behavior is covered by action or server-level tests.

#### Blocked by

None - can start immediately.

### Issue 2: Enable local comment authoring in the real Plan UI

Labels: `ready-for-agent`

#### What to build

Enable the real Agent-Native Plan UI review/comment flow for local-files mode. A developer should be able to open a local plan, enter comment mode, click a rendered block or canvas region, create an agent-targeted or human-review-only comment, and reload the plan with the comment still visible from local sidecars.

#### Acceptance criteria

- [ ] Local plan mode exposes review/comment controls without enabling hosted sharing controls.
- [ ] A local block comment can be created from the rendered Plan UI.
- [ ] A local canvas or visual-region comment can be created where the upstream canvas supports anchors.
- [ ] Comments persist to local sidecars, not hosted database tables.
- [ ] Comment counts and open state update after creation and reload.
- [ ] Hosted plan comment UI behavior remains unchanged.
- [ ] UI tests cover local block comments and at least one visual/canvas anchor path.

#### Blocked by

- Issue 1.

### Issue 3: Send and consume local feedback end to end

Labels: `ready-for-agent`

#### What to build

Make the local "Send to agent" and feedback lifecycle work end to end. Local `get-plan-feedback` should read sidecar feedback, group open agent-targeted feedback by target, include resolved unconsumed feedback as secondary context, and exclude consumed feedback by default. Local consume, resolve, and reopen actions should append sidecar events and preserve review history.

#### Acceptance criteria

- [ ] Local `get-plan-feedback` reads local sidecars for local plans.
- [ ] Open agent-targeted feedback is grouped by stable target block or visual anchor.
- [ ] Resolved but unconsumed feedback remains available as secondary context.
- [ ] Consumed feedback is excluded from default agent reads.
- [ ] Consume appends an event rather than deleting feedback.
- [ ] Resolve and reopen update sidecar state while preserving history.
- [ ] Hosted `get-plan-feedback` and consume behavior remain unchanged.
- [ ] Tests cover local send, resolve, reopen, consume, and hosted regression behavior.

#### Blocked by

- Issue 1.
- Issue 2.

### Issue 4: Add generic domain-pack routing

Labels: `ready-for-agent`

#### What to build

Add a generic domain-pack routing layer for `/visual-plan` and `/visual-recap`. The router should inspect project context, select `apple` when Apple signals are present, otherwise select `generic`, and allow explicit override. The selected pack and reason should be visible in the generated artifact or agent output.

#### Acceptance criteria

- [ ] Generic and Apple packs share one command surface.
- [ ] Apple context is selected for Swift, Xcode, SwiftPM, SwiftUI, UIKit, AppKit, SwiftData, App Intents, widgets, or extensions.
- [ ] Non-Apple fixtures fall back to the generic pack.
- [ ] Manual override can force generic or Apple behavior.
- [ ] The selected pack and reason are reported in the plan or recap metadata.
- [ ] Tests cover Apple detection, generic fallback, and manual override.

#### Blocked by

- Issue 3.

### Issue 5: Ship generic plan and recap templates on the shared contract

Labels: `ready-for-agent`

#### What to build

Create generic plan and recap templates that use the shared local contract and render well for non-Apple projects. The templates should include high-altitude summary, file/module map, diagram or flow, annotated code or diff highlights, evidence, risk, and open questions.

#### Acceptance criteria

- [ ] Generic `/visual-plan` creates a local plan using the shared folder and feedback contract.
- [ ] Generic `/visual-recap` creates a local recap using the shared folder and feedback contract.
- [ ] Templates include stable IDs for commentable blocks.
- [ ] Generic artifacts render in the real Agent-Native Plan UI.
- [ ] Generic artifacts can receive local comments and send feedback to the agent.
- [ ] Tests cover a non-Apple plan and recap fixture.

#### Blocked by

- Issue 4.

### Issue 6: Add Apple project detection and plan template

Labels: `ready-for-agent`

#### What to build

Add the Apple domain pack's planning path. In an Apple repo, `/visual-plan` should create an Apple-specific visual plan that includes all four v1 surfaces: plan document, workflow canvas, evidence panels, and question/decision forms.

#### Acceptance criteria

- [ ] Apple plan generation is selected from Swift/Xcode project context.
- [ ] The plan includes Xcode target/scheme and SwiftPM package context where available.
- [ ] The plan includes SwiftUI, UIKit, AppKit, SwiftData/Core Data, App Intents, widget, extension, entitlement, privacy, and release-risk sections when relevant.
- [ ] The plan includes a workflow canvas with Apple-specific artboards or diagrams.
- [ ] The plan includes evidence panels for build, test, preview, simulator/device, accessibility, privacy, performance, memory, and concurrency checks where relevant.
- [ ] The plan includes question/decision forms for unresolved platform, release, privacy, data, or migration decisions.
- [ ] Tests cover an Apple fixture and validate stable IDs and block vocabulary.

#### Blocked by

- Issue 4.
- Issue 5.

### Issue 7: Add Apple recap template with evidence and residual risk

Labels: `ready-for-agent`

#### What to build

Add the Apple domain pack's recap path. In an Apple repo or Apple-focused diff, `/visual-recap` should summarize changed targets, schemes, packages, app surfaces, Swift diffs, verification evidence, and residual Apple-platform risks.

#### Acceptance criteria

- [ ] Apple recap generation is selected from Swift/Xcode project or diff context.
- [ ] The recap shows changed targets, schemes, packages, widgets, extensions, intents, or preview/test bundles where present.
- [ ] The recap includes annotated Swift or project/config diffs.
- [ ] The recap includes verification evidence for tests, builds, previews, simulator/device, screenshots, logs, accessibility, privacy, performance, memory, and concurrency where relevant.
- [ ] The recap calls out residual risks for signing, entitlements, migrations, privacy manifests, accessibility, performance, concurrency, TestFlight, and App Store review.
- [ ] The recap can receive local comments and send feedback to the agent.
- [ ] Tests cover an Apple recap fixture and residual risk output.

#### Blocked by

- Issue 4.
- Issue 5.

### Issue 8: Add Apple workflow canvas and evidence panels

Labels: `ready-for-agent`

#### What to build

Deepen the Apple visual surfaces beyond text templates. Apple plans and recaps should include reusable canvas patterns and evidence panels for target/scheme maps, app surface flows, data/model migration, intents/widgets/extensions, build/test/release lanes, and verification results.

#### Acceptance criteria

- [ ] Apple target/scheme maps render as commentable visual blocks.
- [ ] Apple app surface flows render for SwiftUI, UIKit, and AppKit scenarios.
- [ ] SwiftData/Core Data migration flows render as data/model visual blocks.
- [ ] App Intent, widget, and extension relationships render as visual flows where relevant.
- [ ] Evidence panels distinguish planned, passed, failed, skipped, and not-run checks.
- [ ] Evidence panels support command/log/screenshot references without embedding private secrets.
- [ ] Local comments can target the new canvas/evidence surfaces.
- [ ] Tests or visual checks cover at least one plan and one recap surface.

#### Blocked by

- Issue 6.
- Issue 7.

### Issue 9: Apply Cursor-inspired visual quality layer

Labels: `ready-for-agent`

#### What to build

Apply the installed Cursor-inspired `DESIGN.md` visual reference to the relevant Agent-Native Plan surfaces without reducing existing visual quality. The work should preserve Agent-Native's current renderer strengths while adding warm canvas, hairline depth, mono code surfaces, restrained orange accents, and timeline pastel usage for agent activity.

#### Acceptance criteria

- [ ] Relevant Plan surfaces use `DESIGN.md` colors or token equivalents: warm canvas, ink, body, muted, hairline, primary orange, semantic success/error, and timeline colors.
- [ ] Code, command, log, and diff surfaces use mono typography.
- [ ] Buttons and inputs use 8px radius; cards and panes use 12px radius unless existing Agent-Native components require otherwise.
- [ ] Cursor orange is used sparingly and not as a generic status color.
- [ ] Timeline pastels are scoped to agent/workflow stages.
- [ ] Light and dark shell contrast is verified for plan, recap, canvas, and evidence panels.
- [ ] No drop-shadow-heavy visual regression is introduced.

#### Blocked by

- Issue 2.
- Issue 5.
- Issue 8.

### Issue 10: Prove the full generic and Apple case matrix

Labels: `ready-for-agent`

#### What to build

Run the final acceptance pass across the full case matrix and record a gatekeeper review. The proof should show generic plan, generic recap, Apple plan, Apple recap, local comments, send-to-agent, consume/resolve/reopen, Cursor-inspired visual quality, and no hosted behavior regression.

#### Acceptance criteria

- [ ] Generic plan flow is demonstrated end to end.
- [ ] Generic recap flow is demonstrated end to end.
- [ ] Apple plan flow is demonstrated end to end with all four v1 surfaces.
- [ ] Apple recap flow is demonstrated end to end with evidence and residual risk.
- [ ] Local block and canvas comments persist to sidecars.
- [ ] Local send-to-agent and consume/resolve/reopen work end to end.
- [ ] Hosted DB-backed comments still pass existing regression tests.
- [ ] Cursor-inspired visual quality checks pass in light and dark shells.
- [ ] Gatekeeper review verdict is PASS.

#### Blocked by

- Issues 1-9.

# Apple Visual Plan/Recap Issue Breakdown

Issue tracker status: published to https://github.com/guhans6/apple-visual-plan-recap/issues.

Parent PRD: `docs/prd/apple-visual-plan-recap-prd.md`

Published PRD issue: https://github.com/guhans6/apple-visual-plan-recap/issues/1

Published slices:

- Issue 1: https://github.com/guhans6/apple-visual-plan-recap/issues/2
- Issue 2: https://github.com/guhans6/apple-visual-plan-recap/issues/3
- Issue 3: https://github.com/guhans6/apple-visual-plan-recap/issues/4
- Issue 4: https://github.com/guhans6/apple-visual-plan-recap/issues/5
- Issue 5: https://github.com/guhans6/apple-visual-plan-recap/issues/6
- Issue 6: https://github.com/guhans6/apple-visual-plan-recap/issues/7
- Issue 7: https://github.com/guhans6/apple-visual-plan-recap/issues/8
- Issue 8: https://github.com/guhans6/apple-visual-plan-recap/issues/9
- Issue 9: https://github.com/guhans6/apple-visual-plan-recap/issues/10
- Issue 10: https://github.com/guhans6/apple-visual-plan-recap/issues/11

## Proposed Vertical Slices

1. **Create Apple-only visual skills pack**
   - Type: AFK
   - Blocked by: None
   - User stories covered: 26, 27, 33, 34

2. **Rewrite visual-plan for local Apple planning**
   - Type: AFK
   - Blocked by: Issue 1
   - User stories covered: 1-8, 22-24, 27

3. **Rewrite visual-recap for Apple code review**
   - Type: AFK
   - Blocked by: Issue 1
   - User stories covered: 17-21, 22-24, 27

4. **Render a local Apple MDX sample plan**
   - Type: AFK
   - Blocked by: Issues 1, 2
   - User stories covered: 1, 2, 3, 23, 24

5. **Define local feedback sidecar contract**
   - Type: AFK
   - Blocked by: Issue 4
   - User stories covered: 9-16, 24, 31, 32

6. **Enable local block-anchored comments in the Plan app**
   - Type: AFK
   - Blocked by: Issue 5
   - User stories covered: 9-11, 24, 25

7. **Add local agent feedback reader**
   - Type: AFK
   - Blocked by: Issues 5, 6
   - User stories covered: 12, 16, 31, 32

8. **Add local consume and resolve flow**
   - Type: AFK
   - Blocked by: Issue 7
   - User stories covered: 13-16, 31, 32

9. **Prove the private local human-agent loop**
   - Type: HITL
   - Blocked by: Issues 4-8
   - User stories covered: 9-16, 30, 35

10. **Document self-hosting and future shared-team mode**
    - Type: AFK
    - Blocked by: Issue 9
    - User stories covered: 27-29, 33, 34

## Issues

### Issue 1: Create Apple-only visual skills pack

Labels: `ready-for-agent`

#### What to build

Create the minimal Apple visual skills package that contains only visual planning and visual recap skills. The package should be private/local-first, preserve required upstream notices, avoid telemetry, and avoid names or descriptions that imply official Apple affiliation.

#### Acceptance criteria

- [ ] The skills pack contains only visual-plan and visual-recap skills.
- [ ] Plugin metadata describes Apple-platform visual planning and review.
- [ ] Package metadata is private and local-first.
- [ ] Upstream notices are preserved where copied material is used.
- [ ] No unrelated BuilderIO workflow skills are included.

#### Blocked by

None - can start immediately.

### Issue 2: Rewrite visual-plan for local Apple planning

Labels: `ready-for-agent`

#### What to build

Rewrite the visual planning skill so it guides agents to create local/private Apple development plans. It should cover app surfaces, targets, schemes, previews, simulator/device evidence, platform availability, data models, entitlements, privacy concerns, and App Store/TestFlight implications where relevant.

#### Acceptance criteria

- [ ] The skill defaults to local-files or self-hosted mode and does not default to third-party hosted Plan storage.
- [ ] The skill states that it produces planning artifacts, not production Apple UI.
- [ ] Apple development surfaces and verification expectations are explicit.
- [ ] The skill requires stable IDs for commentable blocks.
- [ ] The skill references the local feedback contract.
- [ ] The skill requires block vocabulary validation before authoring MDX examples.

#### Blocked by

Issue 1.

### Issue 3: Rewrite visual-recap for Apple code review

Labels: `ready-for-agent`

#### What to build

Rewrite the visual recap skill so it summarizes Apple branch/PR/diff work as a visual code-review artifact. It should emphasize changed targets, schemes, packages, user-visible app surfaces, architecture/data flow, annotated Swift diffs, verification evidence, and residual Apple-platform risk.

#### Acceptance criteria

- [ ] The skill defaults to local-files or self-hosted mode and does not default to third-party hosted Plan storage.
- [ ] The skill frames recaps as review aids, not replacements for code review.
- [ ] The skill covers Apple-specific residual risks such as signing, entitlements, migrations, performance, accessibility, privacy, and App Store review.
- [ ] The skill requires secret and private-data redaction.
- [ ] The skill requires stable IDs for commentable blocks.
- [ ] The skill references the local feedback contract.

#### Blocked by

Issue 1.

### Issue 4: Render a local Apple MDX sample plan

Labels: `ready-for-agent`

#### What to build

Create a sample Apple visual plan that renders locally and demonstrates the intended MDX structure. The sample should use real Plan block tags, stable block IDs, an Apple workflow scenario, and empty local feedback sidecars.

#### Acceptance criteria

- [ ] The sample plan uses block tags validated against the Plan block catalog.
- [ ] Every commentable block has a stable ID.
- [ ] The sample includes a file map, diagram, and open questions.
- [ ] Empty local feedback sidecar files are present.
- [ ] The sample can be opened in the local Plan app without hosted Plan DB writes.

#### Blocked by

Issues 1 and 2.

### Issue 5: Define local feedback sidecar contract

Labels: `ready-for-agent`

#### What to build

Define the local feedback contract that stores block-anchored comments and feedback state beside each local MDX plan. The contract should mirror the upstream DB-backed comment model where useful while staying simple enough for local file persistence.

#### Acceptance criteria

- [ ] The contract defines append-only feedback events.
- [ ] The contract defines a compact state index.
- [ ] Each feedback item includes ID, plan slug, target block ID, target kind, anchor kind, message, resolution target, status, creator, creation time, and consumed time.
- [ ] The contract distinguishes open, resolved, and consumed states.
- [ ] The contract explicitly forbids browser-only localStorage as the source of truth.
- [ ] Skill references document how agents should read and consume local feedback.

#### Blocked by

Issue 4.

### Issue 6: Enable local block-anchored comments in the Plan app

Labels: `ready-for-agent`

#### What to build

Enable local-mode comments in the Plan app. The developer should be able to enter review/comment mode on a local plan, click a rendered block, write a comment, mark it agent-targeted or human-review-only, reply, resolve, and reopen. Comments should persist to local feedback sidecar files.

#### Acceptance criteria

- [ ] Local mode exposes comment/review controls.
- [ ] Clicking a rendered block anchors a comment to a stable block ID.
- [ ] Creating a comment appends a feedback event to local files.
- [ ] Replies append feedback events to local files.
- [ ] Resolve and reopen actions update local feedback state without deleting history.
- [ ] Hosted DB-backed comment behavior still works when not in local mode.
- [ ] MVP does not add multiplayer, auth, email, mentions, or screenshots.

#### Blocked by

Issue 5.

### Issue 7: Add local agent feedback reader

Labels: `ready-for-agent`

#### What to build

Add an agent-readable feedback reader for local plans. It should read local feedback sidecar files, group open agent-targeted comments by block, include nearby MDX context, include resolved feedback as secondary context, and exclude consumed feedback by default.

#### Acceptance criteria

- [ ] The reader handles missing feedback files as an empty feedback set.
- [ ] The reader groups feedback by target block ID.
- [ ] Open agent-targeted comments appear first.
- [ ] Resolved unconsumed comments appear after open agent-targeted comments.
- [ ] Consumed comments are excluded by default.
- [ ] Output includes enough MDX context for the agent to update the right block.

#### Blocked by

Issues 5 and 6.

### Issue 8: Add local consume and resolve flow

Labels: `ready-for-agent`

#### What to build

Add the agent-side flow for marking handled local feedback as consumed while preserving review history. The consume flow should append an event, update the state index, and make consumed feedback disappear from the default agent feedback read.

#### Acceptance criteria

- [ ] The consume flow appends a consumed event rather than deleting the original feedback.
- [ ] The state index updates after consume.
- [ ] The feedback reader excludes consumed feedback by default.
- [ ] Resolved feedback remains visible in review history.
- [ ] The flow supports acting on one or more feedback IDs.

#### Blocked by

Issue 7.

### Issue 9: Prove the private local human-agent loop

Labels: `ready-for-agent`

#### What to build

Run and document the full private local loop. A developer opens a local plan, comments on a rendered block, feedback persists locally, the agent reads it, the agent updates MDX, the agent consumes the feedback, and the UI reflects the new open/resolved/consumed state without hosted Plan DB writes.

#### Acceptance criteria

- [ ] A local sample plan opens in the Plan app.
- [ ] A rendered block exposes a stable block anchor.
- [ ] A human comment persists to local feedback files.
- [ ] The agent feedback reader returns the open comment.
- [ ] The agent updates the MDX plan based on the comment.
- [ ] The agent consumes the handled comment.
- [ ] The UI no longer presents consumed feedback as unhandled agent work.
- [ ] The test confirms no hosted Plan DB write is required.
- [ ] Collaboration evidence is documented.

#### Blocked by

Issues 4, 5, 6, 7, and 8.

### Issue 10: Document self-hosting and future shared-team mode

Labels: `ready-for-agent`

#### What to build

Document how the local MVP can later grow into self-hosted DB/shared-team mode. The documentation should clearly separate local-files mode, self-hosted Plan app mode, and third-party hosted mode.

#### Acceptance criteria

- [ ] Documentation explains local-files mode as the default privacy path.
- [ ] Documentation explains which environment/configuration pieces are needed for self-hosting.
- [ ] Documentation states hosted third-party mode is opt-in.
- [ ] Documentation records that self-hosted shared-team mode is deferred until local feedback loop proof.
- [ ] Documentation calls out license verification before public redistribution.

#### Blocked by

Issue 9.

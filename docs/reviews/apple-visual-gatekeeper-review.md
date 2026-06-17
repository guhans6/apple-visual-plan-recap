# Apple Visual Plan/PRD/Issues Gatekeeper Review

Verdict: PASS

Reviewed artifacts:

- Implementation plan: `docs/superpowers/plans/2026-06-17-apple-visual-plan-recap.md`
- PRD: `docs/prd/apple-visual-plan-recap-prd.md`
- Issues: `docs/issues/apple-visual-plan-recap-issues.md`

## Gatekeeper Criteria

- The artifacts must not assume upstream local-files mode already supports browser comments.
- The artifacts must make local feedback sidecar files an explicit MVP feature.
- The PRD must describe product intent without brittle file-path implementation detail.
- The issues must be vertical slices, not horizontal-only layers.
- The issues must include acceptance criteria that prove user-visible behavior.
- Hosted third-party Plan storage must not be the default.
- The local feedback loop must be a hard completion gate.
- MDX block authoring must require real block vocabulary validation and stable IDs.
- Apple focus must be workflow/review oriented, not production UI generation.
- Publishing/open-source work must remain blocked on license review.

## Round 1 Findings

Status: FAIL

Findings from reviewing the prior implementation plan before PRD/issues creation:

- The plan included comments/annotations as a goal, but local-files behavior could be read as already providing browser comments.
- The end-to-end gate allowed fallback to whichever feedback route was available.
- The sample MDX used lowercase/custom-looking block tags that were not proven against the Plan block registry.
- The local feedback sidecar was not yet a named product contract.

Actions taken:

- Added a verified "Local Feedback Reality" section to the plan.
- Added `feedback.jsonl` and `feedback-state.json` sidecar contract.
- Added Tasks 5A-5D for local feedback contract, UI, agent reader, and consume/resolve flow.
- Replaced the loose completion gate with a mandatory local human-agent feedback loop.
- Corrected sample MDX guidance to require real block tags such as `FileTree`, `Diagram`, and `QuestionForm` after catalog validation.

## Round 2 Findings

Status: FAIL

Findings after drafting the PRD/issues:

- The issues needed to distinguish AFK and HITL slices.
- The self-hosting slice risked appearing too early, before local feedback proof.
- The PRD needed to explicitly state that self-hosted DB/shared-team mode is later than local feedback MVP.
- The issue breakdown needed a dedicated slice for local consume semantics so review history is not lost.

Actions taken:

- Marked slices AFK/HITL.
- Made the private local human-agent loop a HITL proof slice.
- Moved self-hosting/shared-team documentation behind local loop proof.
- Added a dedicated local consume/resolve issue.

## Round 3 Findings

Status: PASS

Evidence:

- The plan explicitly states upstream local local-plan bundles return no comments and local UI hides comment controls.
- The PRD states the MVP adds a local visual feedback layer instead of relying on upstream local-files behavior.
- The issues include vertical slices for skills, local rendering, feedback contract, local comments, agent reader, consume flow, and proof loop.
- The local loop is a hard MVP completion gate: rendered local plan -> human block comment -> feedback sidecar -> agent reads -> MDX changes -> feedback consumed -> UI updates.
- Hosted third-party Plan storage is explicitly opt-in.
- Self-hosted shared-team mode is deferred until local MVP proof.
- MDX authoring requires real block vocabulary validation and stable IDs.
- Open-source/public release remains blocked on upstream license verification.

## Residual Risks

- The workspace has no configured issue tracker, so PRD and issues were produced as local artifacts instead of published tracker tickets.
- The exact final implementation details for local comment UI should be verified against the copied Plan app during execution.
- License verification is still required before any public release.

## Final Verdict

PASS: The implementation plan, PRD, and issue breakdown are aligned. They no longer overclaim upstream local-files behavior, they make local feedback a first-class MVP feature, and they split implementation into agent-ready vertical slices.

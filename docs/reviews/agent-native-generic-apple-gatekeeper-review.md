# Agent-Native Generic + Apple Workflow Gatekeeper Review

Current verdict: PASS

Reviewed artifacts:

- `docs/superpowers/specs/2026-06-18-agent-native-generic-apple-visual-workflow-design.md`
- `docs/prd/agent-native-generic-apple-visual-workflow-prd.md`
- `docs/issues/agent-native-generic-apple-visual-workflow-issues.md`
- `DESIGN.md`

## Gate Criteria

- [x] PRD reflects the approved direction: real Agent-Native fork, generic core, Apple-first pack, Cursor-inspired visual layer.
- [x] PRD keeps local-first as the default and treats hosted/self-hosted DB mode as explicit later promotion.
- [x] PRD does not claim local comments already exist in upstream Agent-Native local-files mode.
- [x] PRD preserves generic non-Apple workflows rather than making the system Apple-only.
- [x] PRD includes the Cursor `DESIGN.md` tokens as a concrete visual-system input.
- [x] Issue slices are vertical enough to be demoable and testable, not just horizontal layers.
- [x] Issue slices publish blockers before dependents.
- [x] Issue slices cover local sidecars, local UI comments, send/consume feedback, generic routing, generic templates, Apple plan, Apple recap, Apple visual surfaces, Cursor visual polish, and final case-matrix proof.
- [x] Apple case coverage includes Xcode targets/schemes, SwiftPM, SwiftUI, UIKit, AppKit, SwiftData/Core Data, App Intents, widgets/extensions, entitlements, privacy manifests, signing/provisioning, previews, simulator/device evidence, XCTest/Swift Testing, accessibility, performance, memory, concurrency, and TestFlight/App Store readiness.
- [x] Testing decisions use behavior seams: action/server tests, Plan UI tests, fixtures, visual/contrast checks, and hosted regression tests.

## Review Loop

### Round 1: FAIL

Findings:

- Initial issue slicing from the spec risked becoming horizontal: design tokens, domain routing, Apple templates, and local feedback could have been separated without a demoable path.
- Generic non-Apple behavior was less explicit than Apple behavior.
- Cursor visual rules needed to be tied to concrete `DESIGN.md` tokens and visual checks.

Fixes applied:

- Reworked slices so each major issue has an end-to-end behavior and acceptance criteria.
- Added explicit generic plan/recap stories, decisions, tests, and issues.
- Added `DESIGN.md` token usage and contrast requirements to PRD and issue criteria.

### Round 2: PASS

No blocking findings.

Residual risks:

- The actual Agent-Native fork implementation will need careful hosted-regression testing because local and hosted comment flows share concepts but must use different persistence paths.
- The Cursor design reference includes CursorGothic as a licensed font; implementation must use Inter/system fallback unless the font is legally available.
- Some Apple case details will be fixture-dependent; implementation should include representative fixtures rather than trying to support every Apple edge case in one slice.

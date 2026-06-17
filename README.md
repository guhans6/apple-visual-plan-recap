# Apple Visual Plan/Recap

Apple-focused visual planning and recap workflow for coding agents.

This project narrows the BuilderIO visual-plan and visual-recap idea to Apple
development workflows: Swift, SwiftUI, UIKit, AppKit, SwiftData, Xcode targets,
schemes, previews, simulators, signing, entitlements, privacy, TestFlight, and
App Store review.

The goal is not to generate production Apple UI. The goal is a local-first
collaboration surface where a developer can inspect rendered plans/recaps,
annotate stable visual blocks, and let an agent read and consume that feedback.

## Current Artifacts

- PRD: `docs/prd/apple-visual-plan-recap-prd.md`
- Issue slices: `docs/issues/apple-visual-plan-recap-issues.md`
- Implementation plan: `docs/superpowers/plans/2026-06-17-apple-visual-plan-recap.md`
- Gatekeeper review: `docs/reviews/apple-visual-gatekeeper-review.md`
- Local feedback contract: `docs/feedback/local-feedback-contract.md`
- Self-hosting notes: `docs/self-hosting.md`

## Verify

```sh
npm run check
```

The check validates:

- only `visual-plan` and `visual-recap` skills are present,
- skill docs default to local/self-hosted rendering,
- the sample MDX uses approved block tags and stable IDs,
- sample sidecars start in the correct state,
- local feedback read/group/consume behavior works.

## Run Local Plan

```sh
npm run dev
```

Then open `http://127.0.0.1:4173`. The local server renders
`examples/apple-settings-pane/plan.mdx`, exposes stable block anchors, and
persists comments into the sample feedback sidecars.

## Upstream References

- BuilderIO skills: https://github.com/BuilderIO/skills
- Agent-Native: https://github.com/BuilderIO/agent-native

Forks should preserve upstream license notices where copied material is used.

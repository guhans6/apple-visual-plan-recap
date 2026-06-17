---
name: visual-plan
description: Create local-first rendered planning artifacts for Apple-platform development work before implementation.
---

# Apple Visual Plan

Use this skill when an Apple-platform task is broad enough that a developer
should inspect the plan visually before code changes begin.

The output is a planning artifact, not production UI. It should help the
developer review scope, affected files, app surfaces, data flow, verification,
risks, and open questions.

## Defaults

- Prefer local-files or self-hosted rendering.
- Do not publish private Apple code, plans, screenshots, or feedback to hosted
  third-party Plan storage unless the user explicitly opts in.
- Write MDX that remains readable as plain text.
- Validate the available Plan block vocabulary before writing examples.
- Give every commentable block a stable `id`.
- Store local feedback beside the plan in `feedback.jsonl` and
  `feedback-state.json`.

## Apple Planning Checklist

Cover the parts that are relevant to the requested work:

- Product surface: app, scene, window, view, widget, extension, intent, menu, or
  background workflow.
- Platform: iOS, macOS, watchOS, tvOS, visionOS, Catalyst, or shared Swift
  package.
- Xcode shape: project, workspace, target, scheme, build configuration, preview,
  simulator, device, and test bundle.
- Frameworks: SwiftUI, UIKit, AppKit, SwiftData, Core Data, App Intents,
  WidgetKit, StoreKit, Combine, Observation, Core ML, or Foundation Models.
- State and data flow: source of truth, model ownership, persistence, migration,
  networking, concurrency, and cancellation.
- Capabilities: entitlements, app groups, keychain, push, background modes,
  privacy manifests, signing, and App Store review sensitivity.
- Verification: Swift tests, XCTest, Swift Testing, Xcode build, preview,
  simulator/device run, screenshots, logs, accessibility, performance, and
  privacy checks.
- Human decisions: open questions that should be answered before implementation.

## Required Sections

1. Goal and non-goals.
2. Affected Apple surfaces and repo files.
3. Architecture and data-flow diagram.
4. Implementation slices with dependencies.
5. Verification plan with exact commands where known.
6. Local feedback instructions.
7. Risks and review focus.

## Local Feedback Contract

When rendering locally, comments must persist outside browser-only state:

- `feedback.jsonl` is the append-only event log.
- `feedback-state.json` is the compact current index.
- Agent-targeted comments use `resolutionTarget: "agent"`.
- Human-review-only comments use `resolutionTarget: "human-review"`.
- Agents read open feedback, update the plan, then append a consumed event.

Do not mark a visual plan complete until the rendered artifact can be opened and
the feedback sidecars are present.

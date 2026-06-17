---
name: visual-recap
description: Create local-first rendered review recaps for Apple-platform branches, commits, PRs, or working-tree diffs.
---

# Apple Visual Recap

Use this skill after implementation to create a visual review artifact for an
Apple-platform change.

The recap is a review aid, not a replacement for code review, tests, Xcode
verification, simulator checks, or human approval.

## Defaults

- Prefer local-files or self-hosted rendering.
- Do not publish private Apple code, plans, screenshots, diffs, or feedback to
  hosted third-party Plan storage unless the user explicitly opts in.
- Redact secrets, tokens, certificates, provisioning data, private customer
  data, and private App Store or TestFlight metadata.
- Validate the Plan block vocabulary before writing examples.
- Give every commentable block a stable `id`.
- Store local feedback beside the recap in `feedback.jsonl` and
  `feedback-state.json`.

## Recap Content

Cover the parts that changed:

- Branch, commit, PR, or working-tree scope.
- Changed targets, schemes, packages, app extensions, widgets, intents, or
  preview/test bundles.
- User-visible app surfaces and state transitions.
- Architecture and data-flow changes.
- Annotated Swift, Objective-C, plist, entitlement, project, package, and test
  diffs where useful.
- Verification evidence: commands run, simulator/device used, screenshots or
  logs inspected, and failures not fixed.
- Residual risk: signing, entitlements, migrations, privacy, accessibility,
  performance, concurrency, App Store review, and platform availability.

## Required Sections

1. Change overview.
2. File and target map.
3. Behavioral impact.
4. Annotated diff highlights.
5. Verification evidence.
6. Residual risk and review checklist.
7. Local feedback instructions.

## Local Feedback Contract

When rendering locally, comments must persist outside browser-only state:

- `feedback.jsonl` is the append-only event log.
- `feedback-state.json` is the compact current index.
- Agent-targeted comments use `resolutionTarget: "agent"`.
- Human-review-only comments use `resolutionTarget: "human-review"`.
- Agents read open feedback, update the recap or code, then append a consumed
  event.

Do not claim the recap is complete until private data is redacted and the
feedback sidecars are present.

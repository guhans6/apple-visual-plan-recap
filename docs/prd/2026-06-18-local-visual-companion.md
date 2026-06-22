# PRD: Local Visual Companion Review Desk

## Product Statement

Build a private, local-first review desk for coding-agent artifacts. The
product opens local plans, recaps, diffs, and evidence, lets a developer leave
structured feedback, and keeps the full review trail in readable local files.

## Problem

Coding-agent work is often reviewed in plain text or scattered notes. That
makes it hard to inspect a plan spatially, attach feedback to the exact target,
track evidence, and send precise follow-up back to the agent that will make the
next change.

## Users

- A developer reviewing local agent output
- A coding agent consuming structured feedback from local files

## Scope

- Open local plan and recap artifacts from disk
- Show artifact context, diffs, evidence, and follow-up state in one workspace
- Persist feedback and review state in git-friendly sidecars
- Expose structured local actions and local-file handoff that agents can
  consume safely outside the companion UI

## Out Of Scope

- Remote services
- Public distribution flows
- Built-in chat surfaces
- Organization features
- Multi-template product expansion

## Requirements

1. The repo presents one product: local visual companion artifact review.
2. The default workflow stays on local files and explicit local actions.
3. Feedback targets must carry stable identifiers so follow-up work is precise.
4. Review state must remain auditable through readable local files.
5. The product must remain private and local-first in top-level docs and
   product framing.

## Canonical Local Contract

```text
docs/visual-companion/
  README.md
  plans/<slug>/
    plan.mdx
    canvas.mdx
    manifest.json
    feedback.jsonl
    evidence.jsonl
    evidence/
    assets/
    .plan-state.json
  recaps/<slug>/
    recap.mdx
    manifest.json
    feedback.jsonl
    evidence.jsonl
    evidence/
    assets/
    .plan-state.json
```

## Quality Bar

- Constrained local file access
- Clear separation between open, consumed, and resolved feedback
- Explicit evidence links for verification-sensitive claims
- Calm review UI centered on reading and follow-up, not broad product sprawl

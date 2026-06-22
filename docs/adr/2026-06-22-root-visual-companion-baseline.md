# ADR: Root Visual Companion Baseline

## Status

Accepted

## Decision

The tracked root repo is the only canonical home for this product.

The retained implementation baseline comes from the companion-specific slice of
the imported `BuilderIO-agent-native-restructure/` tree, not from the
Apple-only root prototype and not from the full imported upstream worktrees.

The final repo keeps:

- local companion app routes
- local artifact folders
- feedback, evidence, and recap coverage sidecars
- bundled visual companion skills

The final repo removes:

- Apple-only product framing
- hosted and public workflow framing
- imported upstream repo copies
- non-companion packages and templates

## Consequences

- Future feature work should target the tracked root only.
- Imported upstream trees are migration inputs, not steady-state product
  surfaces.
- Cleanup must preserve the approved local companion workflow contract before
  deleting stale historical or hosted residue.

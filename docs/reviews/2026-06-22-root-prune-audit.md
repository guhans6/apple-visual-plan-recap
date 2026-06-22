# Root Prune Audit

## Summary

The repository currently has a split identity.

- The tracked root is an Apple-specific prototype with a small local server,
  sample files, and Apple-only repo framing.
- The imported `BuilderIO-agent-native-restructure/` tree contains the real
  local companion implementation direction, including the companion routes,
  companion actions, local dashboard, and local workflow docs.
- Imported upstream trees contribute about `7.1G` of local surface area and
  about `4713` spec/test files, which creates substantial search, review, and
  future implementation noise.

## Findings

- The root product story and the retained implementation surface do not match.
- Old Apple-only and hosted-era framing remain visible at the root.
- Imported upstream worktrees are useful migration sources, but they should not
  remain part of the final steady-state product surface.
- Future feature work should happen only after the root identity is made
  single-source and the retained companion contract is explicit.

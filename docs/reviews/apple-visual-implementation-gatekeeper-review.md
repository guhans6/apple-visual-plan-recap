# Apple Visual Implementation Gatekeeper Review

Verdict: PASS

Reviewed branch: `feature/apple-visual-local-loop`

Reviewed scope:

- Apple-only `visual-plan` and `visual-recap` skill pack.
- Local Apple sample plan with stable block IDs.
- Local feedback sidecar contract.
- Agent feedback reader and consume flow.
- Self-hosted local plan server for block-anchored comments.
- Published PRD and issue links.

## Gate Criteria

- [x] The repo contains only the two intended skills.
- [x] Skills default to local/self-hosted rendering, not hosted third-party storage.
- [x] Skills are Apple workflow/review focused and do not claim to generate production Apple UI.
- [x] Sample MDX uses validated block tags and stable block IDs.
- [x] Feedback persists to `feedback.jsonl` and `feedback-state.json`, not browser-only state.
- [x] Agent-targeted feedback can be read by block ID.
- [x] Consumed feedback is hidden from default agent reads without deleting history.
- [x] A rendered local surface exposes stable block anchors and a comment form.
- [x] Creating a block comment through the local app path persists to the sidecars.
- [x] Self-hosted/team mode is documented as a later phase after local proof.
- [x] Upstream forks exist and local clones are wired with `origin` as the fork and `upstream` as BuilderIO.

## Evidence

Command:

```sh
npm run check
```

Result:

- `check:skills` passed.
- `check:sample` passed.
- `node --test test/*.test.mjs` passed.
- 5 behavior tests passed.

Covered behavior:

- Missing sidecars read as empty feedback.
- Open agent-targeted comments group by stable block ID.
- Consuming feedback appends an event and preserves history.
- Local plan server renders stable block anchors.
- Local plan server persists block comments to sidecar feedback.

## Findings

No blocking findings.

## Residual Risk

- The deeper Agent-Native fork has not yet been patched to replace its upstream local-files comment gap. This PR proves the local collaboration loop in the new Apple-focused self-hosted surface and keeps the Agent-Native integration as a separate fork patch.
- Licensing remains MIT-compatible for the current repo content. Any future copied upstream code still needs the upstream notice preserved in the copied subtree.

# Self-Hosting Notes

The MVP is local-first. Self-hosted DB/team mode is intentionally deferred until
the file-backed comment loop works end to end.

## Current Local Mode

Use the checked-in skill pack and local feedback sidecars:

```sh
npm run check
```

The current proof covers:

- Apple-only visual plan and recap skill files.
- A sample Apple MDX plan with stable block IDs.
- Empty local feedback sidecars.
- A feedback reader and consume flow that preserves history.

## Later Self-Hosted Mode

A later Agent-Native fork patch should:

- Keep hosted third-party storage opt-in.
- Enable local mode comment controls.
- Persist local comments to `feedback.jsonl`.
- Build `feedback-state.json` from local events.
- Keep existing DB-backed hosted comments working outside local mode.
- Avoid adding auth, multiplayer, email, mentions, screenshots, or hosted
  sharing to the MVP.

## Upstream Forks

The upstream repositories have been forked under the user account:

- https://github.com/guhans6/skills
- https://github.com/guhans6/agent-native

Local clones use `origin` for the fork and `upstream` for BuilderIO.

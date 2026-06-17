# Local Feedback Sidecar Contract

Local visual plans and recaps store feedback beside the rendered MDX source.
Browser-only localStorage is not the source of truth.

## Files

- `feedback.jsonl`: append-only event log.
- `feedback-state.json`: compact current state index.

## Event Types

### created

```json
{
  "type": "created",
  "id": "fb-1",
  "planSlug": "apple-settings-pane",
  "targetBlockId": "verification-evidence",
  "targetKind": "block",
  "anchorKind": "block",
  "message": "Add the Preview verification command here.",
  "resolutionTarget": "agent",
  "status": "open",
  "creator": "human",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### resolved

```json
{
  "type": "resolved",
  "id": "fb-1",
  "actor": "human",
  "resolvedAt": "2026-06-17T10:04:00.000Z"
}
```

### reopened

```json
{
  "type": "reopened",
  "id": "fb-1",
  "actor": "human",
  "reopenedAt": "2026-06-17T10:05:00.000Z"
}
```

### consumed

```json
{
  "type": "consumed",
  "id": "fb-1",
  "actor": "agent",
  "consumedAt": "2026-06-17T10:06:00.000Z"
}
```

## State

```json
{
  "version": 1,
  "planSlug": "apple-settings-pane",
  "items": {
    "fb-1": {
      "id": "fb-1",
      "planSlug": "apple-settings-pane",
      "targetBlockId": "verification-evidence",
      "targetKind": "block",
      "anchorKind": "block",
      "message": "Add the Preview verification command here.",
      "resolutionTarget": "agent",
      "status": "open",
      "creator": "human",
      "createdAt": "2026-06-17T10:00:00.000Z",
      "resolvedAt": null,
      "consumedAt": null
    }
  }
}
```

## Agent Behavior

Agents should:

1. Read feedback through `src/local-feedback.js`.
2. Act on open `resolutionTarget: "agent"` items first.
3. Preserve human-review-only comments for reviewer context.
4. Append a `consumed` event after handling a feedback item.
5. Never delete historical events from `feedback.jsonl`.

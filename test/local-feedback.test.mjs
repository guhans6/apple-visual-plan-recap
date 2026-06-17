import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  appendFeedbackEvent,
  consumeFeedback,
  readFeedback,
} from "../src/local-feedback.js";

async function makePlanDir() {
  return mkdtemp(path.join(tmpdir(), "apple-visual-feedback-"));
}

test("missing sidecar files read as an empty feedback set", async () => {
  const planDir = await makePlanDir();

  const result = await readFeedback({ planDir });

  assert.deepEqual(result.items, []);
  assert.deepEqual(result.groups, {});
});

test("open agent-targeted feedback is grouped by target block id", async () => {
  const planDir = await makePlanDir();

  await appendFeedbackEvent({
    planDir,
    event: {
      type: "created",
      id: "fb-1",
      planSlug: "settings-plan",
      targetBlockId: "verification-evidence",
      targetKind: "block",
      anchorKind: "block",
      message: "Add the Preview verification command here.",
      resolutionTarget: "agent",
      status: "open",
      creator: "human",
      createdAt: "2026-06-17T10:00:00.000Z",
    },
  });

  await appendFeedbackEvent({
    planDir,
    event: {
      type: "created",
      id: "fb-2",
      planSlug: "settings-plan",
      targetBlockId: "risk-register",
      targetKind: "block",
      anchorKind: "block",
      message: "Keep this one for human review only.",
      resolutionTarget: "human-review",
      status: "open",
      creator: "human",
      createdAt: "2026-06-17T10:01:00.000Z",
    },
  });

  const result = await readFeedback({ planDir });

  assert.deepEqual(Object.keys(result.groups), ["verification-evidence"]);
  assert.equal(result.groups["verification-evidence"][0].id, "fb-1");
  assert.equal(result.groups["verification-evidence"][0].message, "Add the Preview verification command here.");
});

test("consuming feedback appends an event, updates state, and hides it by default", async () => {
  const planDir = await makePlanDir();

  await appendFeedbackEvent({
    planDir,
    event: {
      type: "created",
      id: "fb-1",
      planSlug: "settings-plan",
      targetBlockId: "verification-evidence",
      targetKind: "block",
      anchorKind: "block",
      message: "Add the Preview verification command here.",
      resolutionTarget: "agent",
      status: "open",
      creator: "human",
      createdAt: "2026-06-17T10:00:00.000Z",
    },
  });

  await consumeFeedback({
    planDir,
    feedbackId: "fb-1",
    actor: "agent",
    consumedAt: "2026-06-17T10:05:00.000Z",
  });

  const defaultRead = await readFeedback({ planDir });
  assert.deepEqual(defaultRead.items, []);
  assert.deepEqual(defaultRead.groups, {});

  const withConsumed = await readFeedback({ planDir, includeConsumed: true });
  assert.equal(withConsumed.items.length, 1);
  assert.equal(withConsumed.items[0].status, "consumed");
  assert.equal(withConsumed.items[0].consumedAt, "2026-06-17T10:05:00.000Z");

  const events = await readFile(path.join(planDir, "feedback.jsonl"), "utf8");
  assert.match(events, /"type":"created"/);
  assert.match(events, /"type":"consumed"/);
});

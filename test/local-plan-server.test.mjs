import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { readFeedback } from "../src/local-feedback.js";
import { handleLocalPlanRequest } from "../src/local-plan-server.js";

async function makePlanDir() {
  const planDir = await mkdtemp(path.join(tmpdir(), "apple-visual-plan-server-"));
  await writeFile(
    path.join(planDir, "plan.mdx"),
    `<RichText id="goal">Plan goal</RichText>
<Checklist id="verification-evidence" items={["swift test"]} />`,
    "utf8",
  );
  await writeFile(path.join(planDir, "feedback.jsonl"), "", "utf8");
  await writeFile(
    path.join(planDir, "feedback-state.json"),
    JSON.stringify({ version: 1, planSlug: "server-plan", items: {} }, null, 2),
    "utf8",
  );
  return planDir;
}

test("local plan server renders stable block anchors", async () => {
  const planDir = await makePlanDir();
  const response = await handleLocalPlanRequest({
    planDir,
    planSlug: "server-plan",
    method: "GET",
    url: "/",
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /data-plan-block-id="goal"/);
  assert.match(response.body, /data-plan-block-id="verification-evidence"/);
  assert.match(response.body, /data-comment-form/);
});

test("local plan server persists block comments to sidecar feedback", async () => {
  const planDir = await makePlanDir();
  const response = await handleLocalPlanRequest({
    planDir,
    planSlug: "server-plan",
    method: "POST",
    url: "/api/comments",
    body: {
      id: "fb-server-1",
      targetBlockId: "verification-evidence",
      message: "Add simulator verification.",
      resolutionTarget: "agent",
      createdAt: "2026-06-17T11:00:00.000Z",
    },
  });

  assert.equal(response.status, 201);

  const feedback = await readFeedback({ planDir });
  assert.equal(feedback.groups["verification-evidence"][0].id, "fb-server-1");
  assert.equal(feedback.groups["verification-evidence"][0].message, "Add simulator verification.");
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendLocalPlanFeedbackEvent,
  readLocalPlanFeedback,
} from "./local-plan-feedback.js";

let previousPlanLocalDir: string | undefined;

async function makeLocalPlanFolder() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "local-plan-feedback-"));
  process.env.PLAN_LOCAL_DIR = root;
  const folder = path.join(root, "settings-flow");
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(folder + "/plan.mdx", "# Settings flow\n", "utf-8");
  return folder;
}

beforeEach(() => {
  previousPlanLocalDir = process.env.PLAN_LOCAL_DIR;
});

afterEach(() => {
  if (previousPlanLocalDir === undefined) {
    delete process.env.PLAN_LOCAL_DIR;
  } else {
    process.env.PLAN_LOCAL_DIR = previousPlanLocalDir;
  }
});

describe("local plan feedback sidecars", () => {
  it("reads missing sidecars as empty feedback for a local plan folder", async () => {
    const folder = await makeLocalPlanFolder();

    const feedback = await readLocalPlanFeedback({
      planId: "local-settings-flow",
      slug: "settings-flow",
      folder,
    });

    expect(feedback.comments).toEqual([]);
    expect(feedback.events).toEqual([]);
    expect(feedback.summary).toEqual({
      commentCount: 0,
      openCommentCount: 0,
    });
  });

  it("persists a created feedback event as a PlanComment-compatible sidecar item", async () => {
    const folder = await makeLocalPlanFolder();

    await appendLocalPlanFeedbackEvent({
      folder,
      event: {
        type: "created",
        id: "fb_1",
        planId: "local-settings-flow",
        targetBlockId: "verification-evidence",
        targetKind: "block",
        anchorKind: "block",
        message: "Add the SwiftUI preview command.",
        resolutionTarget: "agent",
        status: "open",
        createdBy: "human",
        createdAt: "2026-06-18T10:00:00.000Z",
      },
    });

    const feedback = await readLocalPlanFeedback({
      planId: "local-settings-flow",
      slug: "settings-flow",
      folder,
    });

    expect(feedback.comments).toEqual([
      expect.objectContaining({
        id: "fb_1",
        planId: "local-settings-flow",
        kind: "comment",
        status: "open",
        message: "Add the SwiftUI preview command.",
        createdBy: "human",
        resolutionTarget: "agent",
        consumedAt: null,
      }),
    ]);
    expect(feedback.comments[0]?.anchor).toBe(
      JSON.stringify({
        anchorKind: "block",
        targetKind: "block",
        targetBlockId: "verification-evidence",
      }),
    );
    expect(feedback.summary).toEqual({
      commentCount: 1,
      openCommentCount: 1,
    });
    await expect(fs.readFile(path.join(folder, "feedback.jsonl"), "utf-8"))
      .resolves.toContain('"type":"created"');
  });

  it("preserves a browser-authored annotation anchor", async () => {
    const folder = await makeLocalPlanFolder();
    const anchor = JSON.stringify({
      anchorKind: "point",
      targetKind: "document",
      x: 42,
      y: 64,
      textQuote: "Run the macOS test target.",
    });

    await appendLocalPlanFeedbackEvent({
      folder,
      event: {
        type: "created",
        id: "fb_anchor",
        planId: "local-settings-flow",
        anchor,
        message: "This needs the simulator screenshot.",
        resolutionTarget: "agent",
        createdBy: "human",
        createdAt: "2026-06-18T11:00:00.000Z",
      },
    });

    const feedback = await readLocalPlanFeedback({
      planId: "local-settings-flow",
      slug: "settings-flow",
      folder,
    });

    expect(feedback.comments[0]?.anchor).toBe(anchor);
  });
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanContent } from "../shared/plan-content.js";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";
import { writePlanLocalFiles } from "../server/lib/local-plan-files.js";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const action = (await import("./get-local-plan-folder.js")).default as {
  run: (args: { slug: string; kind?: "plan" | "recap" }) => Promise<{
    comments: Array<{ id: string; message: string; status: string }>;
    events: Array<{ type: string }>;
    summary: { commentCount: number; openCommentCount: number };
  }>;
};

function sampleContent(): PlanContent {
  return {
    version: 2,
    title: "Settings flow",
    brief: "Review the Settings scene.",
    blocks: [
      {
        id: "verification-evidence",
        type: "rich-text",
        title: "Verification evidence",
        data: { markdown: "Run the macOS test target." },
      },
    ],
  };
}

describe("get-local-plan-folder action", () => {
  let tmpDir: string;
  let savedDir: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "plan-local-action-"));
    savedDir = process.env.PLAN_LOCAL_DIR;
    savedNodeEnv = process.env.NODE_ENV;
    process.env.PLAN_LOCAL_DIR = tmpDir;
    process.env.NODE_ENV = "test";
  });

  afterEach(async () => {
    if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedDir;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("includes local feedback sidecars in the returned plan bundle", async () => {
    const content = sampleContent();
    const written = await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });
    await appendLocalPlanFeedbackEvent({
      folder: written.folder,
      event: {
        type: "created",
        id: "fb_1",
        planId: "local-settings-flow",
        targetBlockId: "verification-evidence",
        targetKind: "block",
        anchorKind: "block",
        message: "Add the xcodebuild command output here.",
        resolutionTarget: "agent",
        createdBy: "human",
        createdAt: "2026-06-18T10:00:00.000Z",
      },
    });

    const result = await action.run({ slug: "settings-flow" });

    expect(result.comments).toMatchObject([
      {
        id: "fb_1",
        message: "Add the xcodebuild command output here.",
        status: "open",
      },
    ]);
    expect(result.events).toHaveLength(1);
    expect(result.summary).toMatchObject({
      commentCount: 1,
      openCommentCount: 1,
    });
    expect(result.path).toBe("/companion/plans/settings-flow");
  });
});

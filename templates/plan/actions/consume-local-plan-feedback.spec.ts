import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
  embedApp: vi.fn(() => ({ title: "stub" })),
}));

const action = (await import("./consume-local-plan-feedback.js")).default as {
  run: (args: {
    slug: string;
    commentIds: string[];
  }) => Promise<{ consumedCommentIds: string[]; consumedAt: string }>;
};
const readAction = (await import("./get-local-plan-folder.js")).default as {
  run: (args: { slug: string }) => Promise<{
    comments: Array<{ id: string; consumedAt: string | null }>;
    summary: { openCommentCount: number };
  }>;
};

describe("consume-local-plan-feedback action", () => {
  let tmpDir: string;
  let savedDir: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "plan-local-consume-"));
    savedDir = process.env.PLAN_LOCAL_DIR;
    savedNodeEnv = process.env.NODE_ENV;
    process.env.PLAN_LOCAL_DIR = tmpDir;
    process.env.NODE_ENV = "test";
    const folder = path.join(tmpDir, "settings-flow");
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(path.join(folder, "plan.mdx"), "# Settings flow\n");
    await appendLocalPlanFeedbackEvent({
      folder,
      event: {
        type: "created",
        id: "fb_1",
        planId: "local-settings-flow",
        anchor: JSON.stringify({ anchorKind: "point", x: 10, y: 20 }),
        message: "Add the simulator screenshot.",
        resolutionTarget: "agent",
        createdBy: "human",
        createdAt: "2026-06-18T10:00:00.000Z",
      },
    });
  });

  afterEach(async () => {
    if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedDir;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("marks local sidecar feedback consumed and removes it from open work", async () => {
    const result = await action.run({
      slug: "settings-flow",
      commentIds: ["fb_1"],
    });
    const bundle = await readAction.run({ slug: "settings-flow" });

    expect(result.consumedCommentIds).toEqual(["fb_1"]);
    expect(bundle.comments[0]?.consumedAt).toBe(result.consumedAt);
    expect(bundle.summary.openCommentCount).toBe(0);
  });
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const action = (await import("./update-local-plan-feedback.js")).default as {
  run: (args: {
    slug: string;
    comments: Array<{
      id: string;
      anchor?: string;
      message: string;
      resolutionTarget?: "agent" | "human";
      createdBy?: "human" | "agent" | "import";
    }>;
  }) => Promise<{
    comments: Array<{ id: string; anchor: string | null; message: string }>;
    summary: { commentCount: number; openCommentCount: number };
  }>;
};

describe("update-local-plan-feedback action", () => {
  let tmpDir: string;
  let savedDir: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "plan-local-update-"));
    savedDir = process.env.PLAN_LOCAL_DIR;
    savedNodeEnv = process.env.NODE_ENV;
    process.env.PLAN_LOCAL_DIR = tmpDir;
    process.env.NODE_ENV = "test";
    await fs.mkdir(path.join(tmpDir, "settings-flow"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, "settings-flow", "plan.mdx"),
      "# Settings flow\n",
      "utf-8",
    );
  });

  afterEach(async () => {
    if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedDir;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("appends local comment sidecars and returns the refreshed bundle", async () => {
    const anchor = JSON.stringify({
      anchorKind: "point",
      targetKind: "document",
      x: 32,
      y: 40,
    });

    const result = await action.run({
      slug: "settings-flow",
      comments: [
        {
          id: "fb_1",
          anchor,
          message: "Add a simulator screenshot.",
          resolutionTarget: "agent",
          createdBy: "human",
        },
      ],
    });

    expect(result.comments).toMatchObject([
      {
        id: "fb_1",
        anchor,
        message: "Add a simulator screenshot.",
      },
    ]);
    expect(result.summary).toMatchObject({
      commentCount: 1,
      openCommentCount: 1,
    });
    await expect(
      fs.readFile(path.join(tmpDir, "settings-flow", "feedback.jsonl"), "utf-8"),
    ).resolves.toContain('"id":"fb_1"');
  });
});

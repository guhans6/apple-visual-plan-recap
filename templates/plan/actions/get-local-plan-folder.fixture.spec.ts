import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const action = (await import("./get-local-plan-folder.js")).default as {
  run: (args: { slug: string }) => Promise<{
    plan: { title: string; content: { blocks: Array<{ id: string }> } };
    summary: { commentCount: number; openCommentCount: number };
  }>;
};

describe("get-local-plan-folder sample fixture", () => {
  it("loads the checked-in block kitchen sink sample", async () => {
    const savedDir = process.env.PLAN_LOCAL_DIR;
    const savedNodeEnv = process.env.NODE_ENV;
    try {
      process.env.PLAN_LOCAL_DIR = path.join(process.cwd(), "plans");
      process.env.NODE_ENV = "test";

      const result = await action.run({ slug: "block-kitchen-sink" });

      expect(result.plan.title).toBe("Block Kitchen Sink");
      expect(result.plan.content.blocks.map((block) => block.id)).toEqual(
        expect.arrayContaining(["rt-intro", "table-api", "code-impl"]),
      );
      expect(result.summary).toMatchObject({
        commentCount: 0,
        openCommentCount: 0,
      });
    } finally {
      if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
      else process.env.PLAN_LOCAL_DIR = savedDir;
      if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = savedNodeEnv;
    }
  });
});

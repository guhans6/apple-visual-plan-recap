import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const getPlan = (await import("./get-companion-plan.js")).default as {
  run: (args: { slug: string; kind?: "plan" | "recap" }) => Promise<{
    plan: { title: string; content: { blocks: Array<{ id: string }> } };
    path: string;
    companionEvidence?: {
      summary: {
        verifiedCount: number;
        assumedCount: number;
        unverifiedCount: number;
      };
      packets: Array<{
        evidenceId: string;
        kind: string;
        status: string;
      }>;
    } | null;
  }>;
};

const getFeedback = (await import("./get-companion-feedback.js")).default as {
  run: (args: { slug: string }) => Promise<{
    pending: Array<{ id: string; target: { id: string } | null }>;
  }>;
};

describe("get-companion-plan generic demo fixture", () => {
  it("loads the generic workflow demo with pending agent feedback", async () => {
    const savedDir = process.env.PLAN_LOCAL_DIR;
    const savedNodeEnv = process.env.NODE_ENV;
    try {
      process.env.PLAN_LOCAL_DIR = path.join(process.cwd(), "plans");
      process.env.NODE_ENV = "test";

      const result = await getPlan.run({
        slug: "generic-workflow-demo",
        kind: "plan",
      });
      const feedback = await getFeedback.run({ slug: "generic-workflow-demo" });

      expect(result.path).toBe("/companion/plans/generic-workflow-demo");
      expect(result.plan.title).toBe("Generic Service Rollout Plan");
      expect(result.plan.content.blocks.map((block) => block.id)).toEqual(
        expect.arrayContaining([
          "generic-overview",
          "generic-file-map",
          "generic-flow",
          "generic-evidence",
          "generic-risks",
          "generic-open-questions",
        ]),
      );
      expect(result.companionEvidence).toMatchObject({
        summary: {
          verifiedCount: 1,
          assumedCount: 0,
          unverifiedCount: 1,
        },
        packets: expect.arrayContaining([
          expect.objectContaining({
            evidenceId: "ev_generic_tests",
            kind: "command-run",
            status: "verified",
          }),
          expect.objectContaining({
            evidenceId: "ev_generic_logs",
            kind: "artifact",
            status: "unverified",
          }),
        ]),
      });
      expect(feedback.pending).toEqual([
        expect.objectContaining({
          id: "fb_generic_evidence",
          target: expect.objectContaining({ id: "generic-evidence" }),
        }),
      ]);
    } finally {
      if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
      else process.env.PLAN_LOCAL_DIR = savedDir;
      if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = savedNodeEnv;
    }
  });
});

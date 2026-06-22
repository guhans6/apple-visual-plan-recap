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
    companionManifest: { targets: Array<{ id: string }> };
    companionEvidence?: {
      packets: Array<{
        evidenceId: string;
        kind: string;
        status: string;
        feedbackIds: string[];
        planTargetIds: string[];
      }>;
    } | null;
    summary: { commentCount: number; openCommentCount: number };
  }>;
};

const getFeedback = (await import("./get-companion-feedback.js")).default as {
  run: (args: { slug: string }) => Promise<{
    pending: Array<{ id: string; target: { id: string } | null }>;
  }>;
};

describe("get-companion-plan apple demo fixture", () => {
  it("loads the Apple workflow demo with manifest targets and pending feedback", async () => {
    const savedDir = process.env.PLAN_LOCAL_DIR;
    const savedNodeEnv = process.env.NODE_ENV;
    try {
      process.env.PLAN_LOCAL_DIR = path.join(process.cwd(), "plans");
      process.env.NODE_ENV = "test";

      const result = await getPlan.run({
        slug: "apple-workflow-demo",
        kind: "plan",
      });
      const feedback = await getFeedback.run({ slug: "apple-workflow-demo" });

      expect(result.path).toBe("/companion/plans/apple-workflow-demo");
      expect(result.plan.title).toBe("Apple Settings Sync Plan");
      expect(result.plan.content.blocks.map((block) => block.id)).toEqual(
        expect.arrayContaining([
          "apple-context",
          "apple-target-scheme-map",
          "apple-workflow-canvas",
          "apple-data-migration",
          "apple-intents-widgets-extensions",
          "apple-evidence-panel",
          "apple-decision-form",
        ]),
      );
      expect(
        result.companionManifest.targets.map((target) => target.id),
      ).toEqual(expect.arrayContaining(["apple-evidence-panel"]));
      expect(result.companionEvidence).toMatchObject({
        packets: expect.arrayContaining([
          expect.objectContaining({
            evidenceId: "ev_tests",
            kind: "command-run",
            status: "verified",
            feedbackIds: ["fb_evidence_1"],
            planTargetIds: ["apple-evidence-panel"],
          }),
          expect.objectContaining({
            evidenceId: "ev_preview",
            kind: "screenshot",
            status: "verified",
            planTargetIds: ["apple-evidence-panel"],
          }),
          expect.objectContaining({
            evidenceId: "ev_release_note",
            kind: "reviewer-note",
            status: "assumed",
            feedbackIds: ["fb_release_1"],
            planTargetIds: ["apple-decision-form"],
          }),
        ]),
      });
      expect(feedback.pending).toEqual([
        expect.objectContaining({
          id: "fb_evidence_1",
          target: expect.objectContaining({ id: "apple-evidence-panel" }),
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

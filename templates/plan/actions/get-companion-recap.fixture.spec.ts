import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
}));

const getPlan = (await import("./get-companion-plan.js")).default as {
  run: (args: { slug: string; kind?: "plan" | "recap" }) => Promise<{
    plan: {
      title: string;
      kind: string;
      content: { blocks: Array<{ id: string }> };
    };
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
        feedbackIds: string[];
      }>;
    } | null;
    recapCoverage?: {
      summary: {
        statusCounts: Record<string, number>;
      };
      links: Array<{
        recapBlockId: string;
        feedbackIds: string[];
        evidenceIds: string[];
      }>;
    } | null;
  }>;
};

const getFeedback = (await import("./get-companion-feedback.js")).default as {
  run: (args: { slug: string; kind?: "plan" | "recap" }) => Promise<{
    pending: Array<{ id: string; target: { id: string } | null }>;
  }>;
};

describe("get-companion-plan recap fixture", () => {
  it("loads a local recap through the companion recap contract", async () => {
    const savedDir = process.env.PLAN_LOCAL_DIR;
    const savedNodeEnv = process.env.NODE_ENV;
    try {
      process.env.PLAN_LOCAL_DIR = path.join(process.cwd(), "plans");
      process.env.NODE_ENV = "test";

      const result = await getPlan.run({
        slug: "apple-workflow-recap-demo",
        kind: "recap",
      });
      const feedback = await getFeedback.run({
        slug: "apple-workflow-recap-demo",
        kind: "recap",
      });

      expect(result.path).toBe("/companion/recaps/apple-workflow-recap-demo");
      expect(result.plan.kind).toBe("recap");
      expect(result.plan.content.blocks.map((block) => block.id)).toEqual(
        expect.arrayContaining([
          "recap-summary",
          "recap-evidence",
          "recap-next-actions",
        ]),
      );
      expect(feedback.pending).toEqual([
        expect.objectContaining({
          id: "fb_recap_followup",
          target: expect.objectContaining({ id: "recap-next-actions" }),
        }),
      ]);
      expect(result.recapCoverage).toMatchObject({
        summary: {
          statusCounts: {
            implemented: 1,
            verified: 1,
            deferred: 1,
            missing: 0,
          },
        },
      });
      expect(result.recapCoverage?.links).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recapBlockId: "recap-evidence",
            feedbackIds: ["fb_evidence_1"],
            evidenceIds: ["ev_tests", "ev_preview"],
          }),
        ]),
      );
      expect(result.companionEvidence).toMatchObject({
        summary: {
          verifiedCount: 2,
          assumedCount: 1,
          unverifiedCount: 0,
        },
        packets: expect.arrayContaining([
          expect.objectContaining({
            evidenceId: "ev_tests",
            kind: "command-run",
            status: "verified",
            feedbackIds: ["fb_evidence_1"],
          }),
          expect.objectContaining({
            evidenceId: "ev_risk",
            kind: "reviewer-note",
            status: "assumed",
            feedbackIds: ["fb_recap_followup"],
          }),
        ]),
      });
    } finally {
      if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
      else process.env.PLAN_LOCAL_DIR = savedDir;
      if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = savedNodeEnv;
    }
  });
});

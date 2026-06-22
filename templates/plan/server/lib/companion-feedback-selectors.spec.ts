import { describe, expect, it } from "vitest";
import type { PlanComment } from "../../shared/types.js";
import type { CompanionManifest } from "./companion-manifest.js";
import { selectCompanionFeedbackForAgent } from "./companion-feedback-selectors.js";

function comment(id: string, overrides: Partial<PlanComment> = {}): PlanComment {
  return {
    id,
    planId: "local-settings-sync",
    sectionId: null,
    kind: "annotation",
    status: "open",
    anchor: JSON.stringify({
      anchorKind: "point",
      targetKind: "block",
      targetBlockId: "apple-evidence-panel",
    }),
    message: id,
    createdBy: "human",
    resolutionTarget: "agent",
    consumedAt: null,
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
    ...overrides,
  };
}

const manifest: CompanionManifest = {
  version: 1,
  slug: "settings-sync",
  kind: "plan",
  generatedAt: "2026-06-18T10:00:00.000Z",
  targets: [
    {
      id: "apple-evidence-panel",
      targetKind: "evidence-row",
      label: "Evidence",
      sourcePath: "plan.mdx",
      sourceRange: { startLine: 20, endLine: 30 },
    },
  ],
};

describe("companion feedback selectors", () => {
  it("returns only open unconsumed agent-targeted human feedback by default", () => {
    const result = selectCompanionFeedbackForAgent({
      comments: [
        comment("agent-open"),
        comment("human-only", { resolutionTarget: "human" }),
        comment("consumed", { consumedAt: "2026-06-18T11:00:00.000Z" }),
        comment("resolved", { status: "resolved" }),
        comment("agent-authored", { createdBy: "agent" }),
      ],
      manifest,
    });

    expect(result.pending.map((item) => item.id)).toEqual(["agent-open"]);
    expect(result.pending[0]?.target).toMatchObject({
      id: "apple-evidence-panel",
      sourcePath: "plan.mdx",
    });
    expect(result.secondary.map((item) => item.id)).toEqual(["resolved"]);
  });

  it("keeps detached feedback readable without inventing a target", () => {
    const result = selectCompanionFeedbackForAgent({
      comments: [
        comment("detached", {
          anchor: JSON.stringify({
            anchorKind: "point",
            targetKind: "block",
            targetBlockId: "missing-block",
          }),
        }),
      ],
      manifest,
    });

    expect(result.pending).toHaveLength(1);
    expect(result.pending[0]?.target).toBeNull();
    expect(result.pending[0]?.targetStatus).toBe("detached");
  });
});

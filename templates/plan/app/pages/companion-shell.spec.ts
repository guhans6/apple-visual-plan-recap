import { describe, expect, it } from "vitest";
import { buildCompanionWorkspaceModel } from "./companion-shell";

describe("buildCompanionWorkspaceModel", () => {
  it("renders explicit domain review-pack signals from the companion manifest", () => {
    const model = buildCompanionWorkspaceModel({
      slug: "settings-flow",
      kind: "plan",
      plan: {
        plan: {
          title: "Apple Settings Sync Plan",
          content: {
            blocks: [
              { id: "apple-target-scheme-map" },
              { id: "apple-data-migration" },
              { id: "apple-intents-widgets-extensions" },
              { id: "apple-evidence-panel" },
              { id: "apple-decision-form" },
            ],
          },
        },
        summary: {
          openCommentCount: 2,
        },
        events: [{ type: "feedback-resolved" }],
        companionManifest: {
          targets: [{ id: "apple-evidence-panel" }],
          reviewPacks: [
            {
              id: "apple-review",
              title: "Apple review pack",
              items: [
                {
                  id: "apple-targets",
                  title: "Targets & schemes",
                  status: "mapped",
                  detail:
                    "Target and scheme review stays attached to the companion source map.",
                },
                {
                  id: "apple-preview-simulator",
                  title: "Preview & simulator",
                  status: "verified",
                  detail:
                    "Preview and simulator proof is present in the shared evidence packets.",
                },
              ],
            },
          ],
        },
        companionFeedback: {
          ordered: [
            {
              id: "fb_evidence_1",
              status: "resolved",
              changedBy: "import",
              resolutionSummary: "Imported the simulator verification packet.",
              changedFiles: ["Sources/SettingsStore.swift"],
              evidenceRefs: ["ev_preview"],
              commitOrDiffRef: "7741abdda",
            },
          ],
        },
        companionEvidence: {
          packets: [
            {
              evidenceId: "ev_preview",
              kind: "screenshot",
              status: "verified",
              summary: "Preview proof is attached.",
              planTargetIds: ["apple-evidence-panel"],
            },
            {
              evidenceId: "ev_release_note",
              kind: "reviewer-note",
              status: "assumed",
              summary: "Release signoff is still pending.",
              planTargetIds: ["apple-decision-form"],
            },
          ],
          summary: {
            verifiedCount: 1,
            assumedCount: 1,
            unverifiedCount: 0,
          },
        },
      },
      feedback: {
        pending: [{ id: "fb_evidence_1" }],
      },
    });

    expect(model.reviewPackItems).toEqual([
      expect.objectContaining({
        title: "Targets & schemes",
        status: "mapped",
      }),
      expect.objectContaining({
        title: "Preview & simulator",
        status: "verified",
      }),
    ]);
    expect(model.importedResults).toEqual([
      expect.objectContaining({
        id: "fb_evidence_1",
        status: "resolved",
        changedFiles: ["Sources/SettingsStore.swift"],
        evidenceRefs: ["ev_preview"],
        commitOrDiffRef: "7741abdda",
      }),
    ]);
  });

  it("does not infer an Apple review pack from title or block names alone", () => {
    const model = buildCompanionWorkspaceModel({
      slug: "settings-flow",
      kind: "plan",
      plan: {
        plan: {
          title: "Apple Settings Sync Plan",
          content: {
            blocks: [{ id: "apple-evidence-panel" }],
          },
        },
        companionManifest: {
          targets: [{ id: "apple-evidence-panel" }],
        },
      },
      feedback: {
        pending: [],
      },
    });

    expect(model.reviewPackItems).toEqual([]);
  });

  it("keeps generic companion states quiet when Apple signals are absent", () => {
    const model = buildCompanionWorkspaceModel({
      slug: "generic-flow",
      kind: "plan",
      plan: {
        plan: {
          title: "Generic Service Rollout Plan",
          content: {
            blocks: [{ id: "generic-overview" }],
          },
        },
        summary: {
          openCommentCount: 0,
        },
        events: [],
        companionManifest: {
          targets: [{ id: "generic-overview" }],
        },
      },
      feedback: {
        pending: [],
      },
    });

    expect(model.reviewPackItems).toEqual([]);
    expect(model.cards.find((card) => card.id === "feedback")).toMatchObject({
      detail: "No pending agent-targeted feedback right now.",
    });
    expect(model.cards.find((card) => card.id === "evidence")).toMatchObject({
      summary: "1 source-linked review target",
    });
  });
});

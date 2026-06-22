import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";

const hookMocks = vi.hoisted(() => ({
  useCompanionPlan: vi.fn(),
  useCompanionFeedback: vi.fn(),
  useUpdateCompanionFeedback: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/hooks/use-companion-plan", () => ({
  useCompanionPlan: hookMocks.useCompanionPlan,
  useCompanionFeedback: hookMocks.useCompanionFeedback,
  useUpdateCompanionFeedback: hookMocks.useUpdateCompanionFeedback,
}));

import { CompanionPage } from "./CompanionPage";

function richTextBlock(id: string, markdown: string) {
  return {
    id,
    type: "rich-text" as const,
    data: { markdown },
  };
}

describe("CompanionPage", () => {
  it("shows a companion-specific error state when the plan query fails", () => {
    hookMocks.useCompanionPlan.mockReturnValue({
      data: undefined,
      error: new Error("Action get-companion-plan failed: Missing path."),
      isError: true,
    });
    hookMocks.useCompanionFeedback.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionPage slug="missing-flow" kind="plan" />
      </MemoryRouter>,
    );

    expect(html).toContain("Plan not found");
    expect(html).toContain(
      "This plan could not be found in the current companion workspace.",
    );
    expect(html).not.toContain("missing-flow:plan:true");
  });

  it("does not render an empty artifact while a companion plan load has no data", () => {
    hookMocks.useCompanionPlan.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
    });
    hookMocks.useCompanionFeedback.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionPage slug="missing-flow" kind="plan" />
      </MemoryRouter>,
    );

    expect(html).toContain("Plan not found");
    expect(html).toContain(
      "This plan could not be found in the current companion workspace.",
    );
    expect(html).not.toContain("Untitled plan");
    expect(html).not.toContain("data-testid=\"companion-artifact-editor\"");
  });

  it("renders a dedicated companion workspace shell around the plan surface", () => {
    hookMocks.useCompanionPlan.mockReturnValue({
      data: {
        plan: {
          title: "Apple Settings Sync Plan",
          content: {
            blocks: [
              richTextBlock("apple-context", "## Context"),
              richTextBlock("apple-evidence-panel", "## Evidence"),
            ],
          },
        },
        summary: {
          openCommentCount: 2,
        },
        events: [
          {
            type: "local.feedback.created",
            payload: {
              feedbackEvent: {
                type: "feedback-created",
                id: "fb_evidence_1",
                message: "Capture final proof.",
                createdAt: "2026-06-18T10:00:00.000Z",
                createdBy: "human",
                resolutionTarget: "agent",
              },
            },
          },
          {
            type: "local.feedback.status_changed",
            payload: {
              feedbackEvent: {
                type: "feedback-status-changed",
                id: "fb_evidence_1",
                status: "resolved",
                changedAt: "2026-06-18T10:04:00.000Z",
                changedBy: "import",
                resolutionSummary:
                  "Imported the simulator verification packet from the agent.",
                changedFiles: ["Sources/SettingsStore.swift"],
                evidenceRefs: ["ev_tests"],
                commitOrDiffRef: "7741abdda",
              },
            },
          },
          {
            type: "local.feedback.consumed",
            payload: {
              feedbackEvent: {
                type: "feedback-consumed",
                id: "fb_evidence_1",
                consumedAt: "2026-06-18T10:05:00.000Z",
                consumedBy: "import",
              },
            },
          },
        ],
        companionManifest: {
          targets: [{ id: "apple-evidence-panel" }],
          reviewPacks: [
            {
              id: "apple-review",
              title: "Apple review pack",
              items: [
                {
                  id: "apple-preview-simulator",
                  title: "Preview & simulator",
                  status: "verified",
                  detail:
                    "Preview and simulator proof is present in the shared evidence packets.",
                },
                {
                  id: "apple-release-risk",
                  title: "Release risk",
                  status: "assumed",
                  detail:
                    "Release readiness still depends on reviewer signoff and other human checks.",
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
              changedAt: "2026-06-18T10:04:00.000Z",
              changedBy: "import",
              resolutionSummary:
                "Imported the simulator verification packet from the agent.",
              changedFiles: ["Sources/SettingsStore.swift"],
              evidenceRefs: ["ev_tests"],
              commitOrDiffRef: "7741abdda",
            },
          ],
        },
        companionEvidence: {
          packets: [
            {
              evidenceId: "ev_tests",
              kind: "command-run",
              status: "verified",
              summary:
                "xcodebuild test passed for the Settings target and simulator destination.",
              createdAt: "2026-06-18T10:01:00.000Z",
              feedbackIds: ["fb_evidence_1"],
              planTargetIds: ["apple-evidence-panel"],
              command:
                "xcodebuild test -scheme SettingsSync -destination 'platform=iOS Simulator,name=iPhone 16'",
            },
          ],
          summary: {
            verifiedCount: 1,
            assumedCount: 0,
            unverifiedCount: 0,
          },
        },
      },
    });
    hookMocks.useCompanionFeedback.mockReturnValue({
      data: {
        pending: [
          {
            id: "fb_evidence_1",
            status: "open",
            resolutionTarget: "agent",
            message: "Capture final proof.",
          },
        ],
      },
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionPage slug="settings-flow" kind="plan" />
      </MemoryRouter>,
    );

    expect(html).toContain("Apple Settings Sync Plan");
    expect(html).toContain("Plan workspace");
    expect(html).toContain("Feedback");
    expect(html).toContain("Context");
    expect(html).toContain("History");
    expect(html).toContain("Evidence");
    expect(html).toContain("Review pack");
    expect(html).toContain("Preview &amp; simulator");
    expect(html).toContain("Release risk");
    expect(html).toContain("Imported results");
    expect(html).toContain(
      "Imported the simulator verification packet from the agent.",
    );
    expect(html).toContain("Sources/SettingsStore.swift");
    expect(html).toContain("7741abdda");
    expect(html).toContain("Evidence review");
    expect(html).toContain("command-run");
    expect(html).toContain("verified");
    expect(html).toContain("fb_evidence_1");
    expect(html).toContain("apple-evidence-panel");
    expect(html).toContain("data-testid=\"companion-review-sidebar\"");
    expect(html).toContain("Review comments");
    expect(html).toContain("Capture final proof.");
    expect(html).toContain("Comment on selected text");
    expect(html).toContain("data-testid=\"companion-artifact-editor\"");
    expect(html).not.toContain("data-testid=\"plans-page\"");
  });

  it("surfaces recap proof status in the dedicated companion workspace", () => {
    hookMocks.useCompanionPlan.mockReturnValue({
      data: {
        plan: {
          title: "Apple Settings Sync Recap",
          content: {
            blocks: [richTextBlock("recap-evidence", "## Recap evidence")],
          },
        },
        summary: {
          openCommentCount: 1,
        },
        events: [{ type: "feedback-resolved" }, { type: "feedback-reopened" }],
        companionManifest: {
          targets: [{ id: "recap-evidence" }],
        },
        recapCoverage: {
          summary: {
            statusCounts: {
              implemented: 1,
              verified: 1,
              deferred: 1,
              missing: 1,
            },
          },
          links: [
            {
              recapBlockId: "recap-summary",
              status: "implemented",
              planTargetIds: ["apple-target-scheme-map"],
              feedbackIds: [],
              evidenceIds: [],
              note: "Target and scheme mapping shipped in the completed diff.",
            },
            {
              recapBlockId: "recap-evidence",
              status: "verified",
              planTargetIds: ["apple-evidence-panel"],
              feedbackIds: ["fb_evidence_1"],
              evidenceIds: ["ev_tests", "ev_preview"],
            },
            {
              recapBlockId: "recap-next-actions",
              status: "deferred",
              planTargetIds: ["apple-decision-form"],
              feedbackIds: ["fb_recap_followup"],
              evidenceIds: ["ev_risk"],
              note: "Reviewer signoff is still pending.",
            },
            {
              recapBlockId: "recap-missing-proof",
              status: "missing",
              planTargetIds: ["apple-release-readiness"],
              feedbackIds: ["fb_missing_release"],
              evidenceIds: [],
              note: "Release proof is still missing from the recap.",
            },
          ],
        },
        companionEvidence: {
          packets: [
            {
              evidenceId: "ev_risk",
              kind: "reviewer-note",
              status: "assumed",
              summary: "Release-risk signoff remains a human follow-up item.",
              createdAt: "2026-06-18T10:23:00.000Z",
              feedbackIds: ["fb_recap_followup"],
              planTargetIds: ["apple-decision-form"],
            },
          ],
          summary: {
            verifiedCount: 0,
            assumedCount: 1,
            unverifiedCount: 0,
          },
        },
      },
    });
    hookMocks.useCompanionFeedback.mockReturnValue({
      data: {
        pending: [{ id: "fb_recap_followup" }],
      },
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionPage slug="settings-recap" kind="recap" />
      </MemoryRouter>,
    );

    expect(html).toContain("Recap workspace");
    expect(html).toContain("Apple Settings Sync Recap");
    expect(html).toContain("1 verified, 1 deferred");
    expect(html).toContain("Recap review");
    expect(html).toContain("implemented");
    expect(html).toContain("missing");
    expect(html).toContain("recap-missing-proof");
    expect(html).toContain("Release proof is still missing from the recap.");
    expect(html).toContain("reviewer-note");
    expect(html).toContain("assumed");
    expect(html).toContain("data-testid=\"companion-artifact-editor\"");
  });

  it("keeps generic quiet states non-alarming when evidence and recap data are absent", () => {
    hookMocks.useCompanionPlan.mockReturnValue({
      data: {
        plan: {
          title: "Generic Service Rollout Plan",
          content: {
            blocks: [richTextBlock("generic-overview", "## Overview")],
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
    });
    hookMocks.useCompanionFeedback.mockReturnValue({
      data: {
        pending: [],
      },
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompanionPage slug="generic-flow" kind="plan" />
      </MemoryRouter>,
    );

    expect(html).toContain("Generic Service Rollout Plan");
    expect(html).toContain("No pending agent-targeted feedback right now.");
    expect(html).not.toContain("Review pack");
    expect(html).not.toContain("Evidence review");
    expect(html).not.toContain("Recap review");
    expect(html).toContain("data-testid=\"companion-artifact-editor\"");
  });
});

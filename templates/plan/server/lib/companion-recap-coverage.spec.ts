import { describe, expect, it } from "vitest";
import { summarizeCompanionRecapCoverage } from "./companion-recap-coverage.js";

describe("summarizeCompanionRecapCoverage", () => {
  it("counts recap coverage statuses and preserves traceability links", () => {
    const result = summarizeCompanionRecapCoverage({
      links: [
        {
          recapBlockId: "recap-summary",
          status: "implemented",
          planTargetIds: ["apple-target-scheme-map"],
          feedbackIds: [],
          evidenceIds: [],
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
        },
      ],
    });

    expect(result.summary.statusCounts).toEqual({
      implemented: 1,
      verified: 1,
      deferred: 1,
      missing: 0,
    });
    expect(result.links[1]).toMatchObject({
      recapBlockId: "recap-evidence",
      feedbackIds: ["fb_evidence_1"],
      evidenceIds: ["ev_tests", "ev_preview"],
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  approvalStateForRevision,
  resolveCompanionAnchor,
  type CompanionManifest,
} from "./companion-targeting.js";

const manifest: CompanionManifest = {
  revisionDigest: "rev_v2",
  targets: [
    {
      id: "summary",
      label: "Summary",
      sourcePath: "plan.mdx",
      sourceRange: { startLine: 1, endLine: 6 },
      searchableText: "Settings sync summary.",
    },
    {
      id: "evidence",
      label: "Evidence",
      sourcePath: "plan.mdx",
      sourceRange: { startLine: 8, endLine: 14 },
      searchableText: "Run xcodebuild test before approval.",
    },
  ],
};

describe("resolveCompanionAnchor", () => {
  it("prefers stable ids, reanchors on a unique quote match, and marks stale ids detached", () => {
    expect(
      resolveCompanionAnchor({
        manifest,
        feedback: {
          blockId: "summary",
          textQuote: "Settings sync summary.",
        },
      }),
    ).toMatchObject({
      state: "matched",
      confidence: 1,
      target: { id: "summary" },
    });

    expect(
      resolveCompanionAnchor({
        manifest,
        feedback: {
          blockId: "missing-block",
          textQuote: "Run xcodebuild test before approval.",
        },
      }),
    ).toMatchObject({
      state: "reanchored",
      target: { id: "evidence" },
    });

    expect(
      resolveCompanionAnchor({
        manifest,
        feedback: {
          blockId: "missing-block",
          textQuote: "Unknown quote",
        },
      }),
    ).toMatchObject({
      state: "detached",
      target: null,
    });
  });

  it("reports ambiguous and unanchored states explicitly", () => {
    const ambiguousManifest: CompanionManifest = {
      revisionDigest: "rev_v3",
      targets: [
        {
          id: "summary-a",
          label: "Summary A",
          sourcePath: "plan.mdx",
          searchableText: "Shared quote text",
        },
        {
          id: "summary-b",
          label: "Summary B",
          sourcePath: "plan.mdx",
          searchableText: "Shared quote text",
        },
      ],
    };

    expect(
      resolveCompanionAnchor({
        manifest: ambiguousManifest,
        feedback: {
          textQuote: "Shared quote text",
        },
      }),
    ).toMatchObject({
      state: "ambiguous",
      target: null,
    });

    expect(
      resolveCompanionAnchor({
        manifest,
        feedback: {},
      }),
    ).toMatchObject({
      state: "unanchored",
      target: null,
    });
  });
});

describe("approvalStateForRevision", () => {
  it("marks approvals stale when the revision digest changes", () => {
    expect(
      approvalStateForRevision({
        approvedRevisionDigest: "rev_v2",
        currentRevisionDigest: "rev_v2",
      }),
    ).toEqual({ status: "current" });

    expect(
      approvalStateForRevision({
        approvedRevisionDigest: "rev_v1",
        currentRevisionDigest: "rev_v2",
      }),
    ).toEqual({
      status: "stale",
      approvedRevisionDigest: "rev_v1",
      currentRevisionDigest: "rev_v2",
    });
  });
});

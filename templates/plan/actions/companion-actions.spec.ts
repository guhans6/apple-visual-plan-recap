import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanContent } from "../shared/plan-content.js";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";
import { writePlanLocalFiles } from "../server/lib/local-plan-files.js";

vi.mock("@agent-native/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@agent-native/core")>()),
  defineAction: (entry: unknown) => entry,
  embedApp: (entry: unknown) => entry,
}));

const getPlan = (await import("./get-companion-plan.js")).default as {
  run: (args: { slug: string; kind?: "plan" | "recap" }) => Promise<{
    slug: string;
    path: string;
    companionManifest: { targets: Array<{ id: string; sourcePath: string }> };
    companionFeedback?: {
      ordered: Array<{
        id: string;
        status: string;
        resolutionSummary: string | null;
        changedFiles: string[];
        evidenceRefs: string[];
        commitOrDiffRef: string | null;
      }>;
    };
    companionEvidence?: {
      packets: Array<{
        evidenceId: string;
        kind: string;
        status: string;
        feedbackIds: string[];
        planTargetIds: string[];
      }>;
    } | null;
    comments: Array<{ id: string }>;
    events: Array<{
      type: string;
      payload?: {
        feedbackEvent?: {
          type: string;
          status?: string;
          changedFiles?: string[];
          evidenceRefs?: string[];
        };
      } | null;
    }>;
  }>;
};

const getFeedback = (await import("./get-companion-feedback.js")).default as {
  run: (args: { slug: string }) => Promise<{
    pending: Array<{
      id: string;
      target: { id: string; sourcePath: string } | null;
      targetStatus: string;
    }>;
    secondary: Array<{ id: string }>;
  }>;
};

const updateFeedback = (await import("./update-companion-feedback.js"))
  .default as {
  run: (args: {
    slug: string;
    comments: Array<{
      id: string;
      message: string;
      anchor?: string;
      resolutionTarget?: "agent" | "human";
    }>;
  }) => Promise<{ comments: Array<{ id: string }> }>;
};

const resolveFeedback = (await import("./resolve-companion-feedback.js"))
  .default as {
  run: (args: {
    slug: string;
    commentId: string;
    status: "resolved" | "open";
  }) => Promise<{ status: string }>;
};

const resolveLocalFeedback = (await import("./resolve-local-plan-feedback.js"))
  .default as {
  run: (args: {
    slug: string;
    commentId: string;
    status:
      | "open"
      | "acknowledged"
      | "in_progress"
      | "resolved"
      | "declined"
      | "superseded"
      | "reopened";
    changedFiles?: string[];
    evidenceRefs?: string[];
  }) => Promise<{ status: string }>;
};

const consumeFeedback = (await import("./consume-companion-feedback.js"))
  .default as {
  run: (args: {
    slug: string;
    commentIds: string[];
  }) => Promise<{ consumedCommentIds: string[] }>;
};

const exportSelection = (await import("./export-companion-selection.js"))
  .default as {
  run: (args: {
    slug: string;
    kind?: "plan" | "recap";
    commentIds: string[];
  }) => Promise<{
    selection: {
      commentIds: string[];
      feedback: Array<{ id: string }>;
      evidence: Array<{ evidenceId: string }>;
      recapCoverage: Array<{ recapBlockId: string }>;
    };
  }>;
};

const importResult = (await import("./import-companion-result.js")).default as {
  run: (args: {
    slug: string;
    results: Array<{
      commentIds: string[];
      status:
        | "acknowledged"
        | "in_progress"
        | "resolved"
        | "declined"
        | "superseded"
        | "reopened";
      resolutionSummary?: string;
      changedFiles?: string[];
      evidenceRefs?: string[];
      commitOrDiffRef?: string;
      consume?: boolean;
      evidence?: Array<{
        evidenceId: string;
        kind: "command-run" | "screenshot" | "artifact" | "reviewer-note";
        status: "verified" | "assumed" | "unverified";
        summary: string;
        planTargetIds?: string[];
      }>;
    }>;
  }) => Promise<{
    imported: Array<{
      commentIds: string[];
      consumedCommentIds: string[];
      evidenceIds: string[];
    }>;
  }>;
};

function sampleContent(): PlanContent {
  return {
    version: 2,
    title: "Settings flow",
    brief: "Review the Settings scene.",
    blocks: [
      {
        id: "verification-evidence",
        type: "table",
        title: "Verification evidence",
        data: {
          columns: ["Check", "Status"],
          rows: [["xcodebuild test", "not-run"]],
        },
      },
    ],
  };
}

describe("companion local actions", () => {
  let tmpDir: string;
  let savedDir: string | undefined;
  let savedNodeEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "companion-actions-"));
    savedDir = process.env.PLAN_LOCAL_DIR;
    savedNodeEnv = process.env.NODE_ENV;
    process.env.PLAN_LOCAL_DIR = tmpDir;
    process.env.NODE_ENV = "test";
  });

  afterEach(async () => {
    if (savedDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedDir;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("reads a companion plan and returns manifest-enriched pending agent feedback", async () => {
    const content = sampleContent();
    const written = await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });
    await appendLocalPlanFeedbackEvent({
      folder: written.folder,
      event: {
        type: "created",
        id: "fb_evidence",
        planId: "local-settings-flow",
        targetBlockId: "verification-evidence",
        targetKind: "block",
        anchorKind: "block",
        message: "Add the xcodebuild command output here.",
        resolutionTarget: "agent",
        createdBy: "human",
        createdAt: "2026-06-18T10:00:00.000Z",
      },
    });
    await fs.writeFile(
      path.join(written.folder, "evidence.jsonl"),
      `${JSON.stringify({
        evidenceId: "ev_tests",
        kind: "command-run",
        status: "verified",
        summary: "xcodebuild test output captured for the local plan.",
        createdAt: "2026-06-18T10:01:00.000Z",
        feedbackIds: ["fb_evidence"],
        planTargetIds: ["verification-evidence"],
        command: "xcodebuild test -scheme SettingsSync",
      })}\n`,
      "utf-8",
    );

    const plan = await getPlan.run({ slug: "settings-flow", kind: "plan" });
    const feedback = await getFeedback.run({ slug: "settings-flow" });

    expect(plan.path).toBe("/companion/plans/settings-flow");
    expect(plan.companionManifest.targets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "verification-evidence",
          sourcePath: "plan.mdx",
        }),
      ]),
    );
    expect(feedback.pending).toEqual([
      expect.objectContaining({
        id: "fb_evidence",
        targetStatus: "matched",
        target: expect.objectContaining({
          id: "verification-evidence",
          sourcePath: "plan.mdx",
        }),
      }),
    ]);
    expect(plan.companionEvidence).toMatchObject({
      packets: [
        expect.objectContaining({
          evidenceId: "ev_tests",
          kind: "command-run",
          status: "verified",
          feedbackIds: ["fb_evidence"],
          planTargetIds: ["verification-evidence"],
        }),
      ],
    });
  });

  it("creates, resolves, and consumes companion feedback through clean action names", async () => {
    const content = sampleContent();
    await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });

    await updateFeedback.run({
      slug: "settings-flow",
      comments: [
        {
          id: "fb_new",
          message: "Add the exact destination.",
          resolutionTarget: "agent",
          anchor: JSON.stringify({ targetBlockId: "verification-evidence" }),
        },
      ],
    });
    await resolveFeedback.run({
      slug: "settings-flow",
      commentId: "fb_new",
      status: "resolved",
    });
    const consumed = await consumeFeedback.run({
      slug: "settings-flow",
      commentIds: ["fb_new"],
    });
    const feedback = await getFeedback.run({ slug: "settings-flow" });

    expect(consumed.consumedCommentIds).toEqual(["fb_new"]);
    expect(feedback.pending).toEqual([]);
    expect(feedback.secondary).toEqual([]);
  });

  it("preserves in-progress resolution packets with changed files and evidence refs", async () => {
    const content = sampleContent();
    await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });

    await updateFeedback.run({
      slug: "settings-flow",
      comments: [
        {
          id: "fb_progress",
          message: "Capture the verified command output.",
          resolutionTarget: "agent",
          anchor: JSON.stringify({ targetBlockId: "verification-evidence" }),
        },
      ],
    });
    await resolveLocalFeedback.run({
      slug: "settings-flow",
      commentId: "fb_progress",
      status: "in_progress",
      changedFiles: ["Sources/SettingsStore.swift"],
      evidenceRefs: ["ev_tests"],
    });

    const plan = await getPlan.run({ slug: "settings-flow", kind: "plan" });
    const feedback = await getFeedback.run({ slug: "settings-flow" });

    expect(feedback.pending).toEqual([
      expect.objectContaining({
        id: "fb_progress",
      }),
    ]);
    expect(plan.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "local.feedback.status_changed",
          payload: expect.objectContaining({
            feedbackEvent: expect.objectContaining({
              status: "in_progress",
              changedFiles: ["Sources/SettingsStore.swift"],
              evidenceRefs: ["ev_tests"],
            }),
          }),
        }),
      ]),
    );
  });

  it("exports selected companion work with linked evidence and recap coverage", async () => {
    const content = sampleContent();
    const written = await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/recaps/settings-flow",
    });
    await appendLocalPlanFeedbackEvent({
      folder: written.folder,
      event: {
        type: "created",
        id: "fb_export",
        planId: "local-settings-flow",
        targetBlockId: "verification-evidence",
        targetKind: "block",
        anchorKind: "block",
        message: "Export this evidence task.",
        resolutionTarget: "agent",
        createdBy: "human",
        createdAt: "2026-06-18T10:00:00.000Z",
      },
    });
    await fs.writeFile(
      path.join(written.folder, "evidence.jsonl"),
      `${JSON.stringify({
        evidenceId: "ev_export",
        kind: "command-run",
        status: "verified",
        summary: "Command output is ready for handoff.",
        createdAt: "2026-06-18T10:01:00.000Z",
        feedbackIds: ["fb_export"],
        planTargetIds: ["verification-evidence"],
      })}\n`,
      "utf-8",
    );
    await fs.writeFile(
      path.join(written.folder, "companion-manifest.json"),
      `${JSON.stringify({
        version: 1,
        slug: "settings-flow",
        kind: "recap",
        generatedAt: "2026-06-18T10:00:00.000Z",
        targets: [
          {
            id: "verification-evidence",
            targetKind: "evidence-row",
            label: "Verification evidence",
            sourcePath: "plan.mdx",
          },
        ],
        recapCoverage: {
          links: [
            {
              recapBlockId: "verification-evidence",
              status: "verified",
              planTargetIds: ["verification-evidence"],
              feedbackIds: ["fb_export"],
              evidenceIds: ["ev_export"],
            },
          ],
        },
      })}\n`,
      "utf-8",
    );

    const exported = await exportSelection.run({
      slug: "settings-flow",
      kind: "recap",
      commentIds: ["fb_export"],
    });

    expect(exported.selection).toMatchObject({
      commentIds: ["fb_export"],
      feedback: [expect.objectContaining({ id: "fb_export" })],
      evidence: [expect.objectContaining({ evidenceId: "ev_export" })],
      recapCoverage: [
        expect.objectContaining({ recapBlockId: "verification-evidence" }),
      ],
    });
  });

  it("imports agent result packets back into evidence and feedback history", async () => {
    const content = sampleContent();
    await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });

    await updateFeedback.run({
      slug: "settings-flow",
      comments: [
        {
          id: "fb_import",
          message: "Capture the final verified command output.",
          resolutionTarget: "agent",
          anchor: JSON.stringify({ targetBlockId: "verification-evidence" }),
        },
      ],
    });

    const imported = await importResult.run({
      slug: "settings-flow",
      results: [
        {
          commentIds: ["fb_import"],
          status: "resolved",
          resolutionSummary: "Imported the command result packet.",
          changedFiles: ["Sources/SettingsStore.swift"],
          evidenceRefs: ["ev_imported"],
          commitOrDiffRef: "2f55d20ba",
          consume: true,
          evidence: [
            {
              evidenceId: "ev_imported",
              kind: "command-run",
              status: "verified",
              summary: "Verified command output imported from the agent run.",
              planTargetIds: ["verification-evidence"],
            },
          ],
        },
      ],
    });

    const plan = await getPlan.run({ slug: "settings-flow", kind: "plan" });
    const feedback = await getFeedback.run({ slug: "settings-flow" });

    expect(imported.imported).toEqual([
      expect.objectContaining({
        commentIds: ["fb_import"],
        consumedCommentIds: ["fb_import"],
        evidenceIds: ["ev_imported"],
      }),
    ]);
    expect(plan.companionEvidence).toMatchObject({
      packets: [
        expect.objectContaining({
          evidenceId: "ev_imported",
          status: "verified",
          planTargetIds: ["verification-evidence"],
        }),
      ],
    });
    expect(plan.companionFeedback?.ordered).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "fb_import",
          status: "resolved",
          resolutionSummary: "Imported the command result packet.",
          changedFiles: ["Sources/SettingsStore.swift"],
          evidenceRefs: ["ev_imported"],
          commitOrDiffRef: "2f55d20ba",
        }),
      ]),
    );
    expect(plan.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "local.feedback.status_changed",
          payload: expect.objectContaining({
            feedbackEvent: expect.objectContaining({
              status: "resolved",
              evidenceRefs: ["ev_imported"],
              commitOrDiffRef: "2f55d20ba",
            }),
          }),
        }),
      ]),
    );
    expect(feedback.pending).toEqual([]);
  });

  it("does not consume pending feedback by default for non-terminal imported statuses", async () => {
    const content = sampleContent();
    await writePlanLocalFiles({
      planId: "plan_settings",
      title: content.title ?? "Settings flow",
      brief: content.brief,
      content,
      url: "/companion/plans/settings-flow",
    });

    await updateFeedback.run({
      slug: "settings-flow",
      comments: [
        {
          id: "fb_import_progress",
          message: "Start validating the command output.",
          resolutionTarget: "agent",
          anchor: JSON.stringify({ targetBlockId: "verification-evidence" }),
        },
      ],
    });

    const imported = await importResult.run({
      slug: "settings-flow",
      results: [
        {
          commentIds: ["fb_import_progress"],
          status: "in_progress",
          resolutionSummary: "Started validating the imported result packet.",
          changedFiles: ["Sources/SettingsStore.swift"],
          evidenceRefs: ["ev_progress"],
        },
      ],
    });

    const plan = await getPlan.run({ slug: "settings-flow", kind: "plan" });
    const feedback = await getFeedback.run({ slug: "settings-flow" });

    expect(imported.imported).toEqual([
      expect.objectContaining({
        commentIds: ["fb_import_progress"],
        consumedCommentIds: [],
        evidenceIds: [],
      }),
    ]);
    expect(plan.companionFeedback?.ordered).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "fb_import_progress",
          status: "in_progress",
          resolutionSummary: "Started validating the imported result packet.",
          changedFiles: ["Sources/SettingsStore.swift"],
          evidenceRefs: ["ev_progress"],
        }),
      ]),
    );
    expect(feedback.pending).toEqual([
      expect.objectContaining({
        id: "fb_import_progress",
      }),
    ]);
  });
});

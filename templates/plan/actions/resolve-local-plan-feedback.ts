import { defineAction } from "@agent-native/core";
import { z } from "zod";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { nowIso } from "../server/plans.js";

const lifecycleStatusSchema = z.enum([
  "open",
  "acknowledged",
  "in_progress",
  "resolved",
  "declined",
  "superseded",
  "reopened",
]);

export default defineAction({
  description:
    "Resolve or reopen a local plan feedback comment by appending a local sidecar event.",
  schema: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    commentId: z.string().min(1),
    status: lifecycleStatusSchema,
    resolutionSummary: z.string().optional(),
    changedFiles: z.array(z.string()).optional(),
    evidenceRefs: z.array(z.string()).optional(),
    commitOrDiffRef: z.string().optional(),
    changedBy: z.enum(["human", "agent", "import"]).optional(),
  }),
  requiresAuth: false,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: false,
    isConsequential: true,
    title: "Resolve Local Plan Feedback",
    description:
      "Resolve or reopen local sidecar feedback while preserving review history.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Local plan feedback is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({ slug: args.slug, path: args.path });
    const changedAt = nowIso();
    await appendLocalPlanFeedbackEvent({
      folder: local.folder,
      event: {
        type: "feedback-status-changed",
        id: args.commentId,
        status: args.status === "open" ? "reopened" : args.status,
        changedAt,
        changedBy: args.changedBy ?? "human",
        resolutionSummary: args.resolutionSummary,
        changedFiles: args.changedFiles,
        evidenceRefs: args.evidenceRefs,
        commitOrDiffRef: args.commitOrDiffRef,
      },
    });

    return {
      slug: local.slug,
      planId: `local-${local.slug}`,
      commentId: args.commentId,
      status: args.status,
      updatedAt: changedAt,
    };
  },
});

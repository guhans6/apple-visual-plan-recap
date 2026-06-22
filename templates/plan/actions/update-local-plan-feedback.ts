import { defineAction } from "@agent-native/core";
import { z } from "zod";
import {
  appendLocalPlanFeedbackEvent,
  readLocalPlanFeedback,
} from "../server/lib/local-plan-feedback.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { nowIso } from "../server/plans.js";

const localPlanCommentSchema = z.object({
  id: z.string().min(1),
  anchor: z.string().optional(),
  message: z.string().min(1),
  resolutionTarget: z.enum(["agent", "human"]).optional(),
  createdBy: z.enum(["human", "agent", "import"]).optional(),
});

export default defineAction({
  description:
    "Append DB-free local visual plan feedback sidecars for a local MDX folder.",
  schema: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    comments: z.array(localPlanCommentSchema).min(1),
  }),
  http: { method: "POST" },
  requiresAuth: false,
  readOnly: false,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: false,
    title: "Update Local Plan Feedback",
    description:
      "Append local-only human feedback to a PLAN_LOCAL_DIR MDX plan folder.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Local plan feedback is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({ slug: args.slug, path: args.path });
    const planId = `local-${local.slug}`;

    for (const comment of args.comments) {
      await appendLocalPlanFeedbackEvent({
        folder: local.folder,
        event: {
          type: "feedback-created",
          id: comment.id,
          planId,
          anchor: comment.anchor,
          message: comment.message,
          resolutionTarget: comment.resolutionTarget ?? "agent",
          createdBy: comment.createdBy ?? "human",
          createdAt: nowIso(),
        },
      });
    }

    const feedback = await readLocalPlanFeedback({
      planId,
      slug: local.slug,
      folder: local.folder,
    });

    return {
      slug: local.slug,
      planId,
      comments: feedback.comments,
      summary: feedback.summary,
    };
  },
});

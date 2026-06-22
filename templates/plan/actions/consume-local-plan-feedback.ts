import { defineAction, embedApp } from "@agent-native/core";
import { z } from "zod";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { nowIso } from "../server/plans.js";

export default defineAction({
  description:
    "Mark one or more local plan feedback comments as consumed after acting on them. This writes only to the local feedback.jsonl sidecar.",
  schema: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    commentIds: z.array(z.string().min(1)).min(1),
    consumedBy: z.enum(["human", "agent", "import"]).optional(),
  }),
  requiresAuth: false,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: false,
    isConsequential: true,
    title: "Consume Local Plan Feedback",
    description:
      "Mark local sidecar feedback comments consumed so they no longer appear as pending local work.",
  },
  mcpApp: {
    compactCatalog: true,
    resource: embedApp({
      title: "Consume Local Feedback",
      description:
        "Open the local Visual Companion surface to view and manage feedback comments.",
      iframeTitle: "Visual Companion",
      openLabel: "Open Local Plan",
      height: 860,
    }),
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Local plan feedback is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({ slug: args.slug, path: args.path });
    const consumedAt = nowIso();
    for (const id of args.commentIds) {
      await appendLocalPlanFeedbackEvent({
        folder: local.folder,
        event: {
          type: "feedback-consumed",
          id,
          consumedAt,
          consumedBy: args.consumedBy ?? "agent",
        },
      });
    }

    return {
      slug: local.slug,
      planId: `local-${local.slug}`,
      consumedCommentIds: args.commentIds,
      consumedAt,
    };
  },
});

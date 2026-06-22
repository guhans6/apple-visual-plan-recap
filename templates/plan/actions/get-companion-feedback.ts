import { defineAction } from "@agent-native/core";
import { z } from "zod";
import {
  buildCompanionManifest,
  readCompanionManifest,
} from "../server/lib/companion-manifest.js";
import { selectCompanionFeedbackForAgent } from "../server/lib/companion-feedback-selectors.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readLocalPlanFeedback } from "../server/lib/local-plan-feedback.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";

export default defineAction({
  description:
    "Read pending local visual companion feedback for coding agents, enriched with manifest targets.",
  schema: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    kind: z.enum(["plan", "recap"]).optional(),
  }),
  http: { method: "GET" },
  requiresAuth: false,
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: false,
    title: "Get Companion Feedback",
    description:
      "Read open unconsumed agent-targeted companion feedback with source targets.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Visual companion feedback is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({
      slug: args.slug,
      path: args.path,
    });
    const planId = `local-${local.slug}`;
    const feedback = await readLocalPlanFeedback({
      planId,
      slug: local.slug,
      folder: local.folder,
    });
    const companionManifest =
      (await readCompanionManifest(local.folder)) ??
      (await buildCompanionManifest({
        folder: local.folder,
        slug: local.slug,
        kind: args.kind ?? "plan",
        content: local.content,
        sourceFiles: local.mdx,
      }));
    const selected = selectCompanionFeedbackForAgent({
      comments: feedback.comments,
      manifest: companionManifest,
    });
    return {
      slug: local.slug,
      planId,
      companionManifest,
      pending: selected.pending,
      secondary: selected.secondary,
      summary: {
        pendingCount: selected.pending.length,
        secondaryCount: selected.secondary.length,
      },
    };
  },
});

import { defineAction } from "@agent-native/core";
import { z } from "zod";
import { readCompanionEvidence } from "../server/lib/companion-evidence.js";
import {
  buildCompanionManifest,
  readCompanionManifest,
} from "../server/lib/companion-manifest.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readLocalPlanFeedback } from "../server/lib/local-plan-feedback.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { selectCompanionFeedbackForAgent } from "../server/lib/companion-feedback-selectors.js";

export default defineAction({
  description:
    "Export selected companion feedback with linked proof and recap context for an external coding agent handoff.",
  schema: z.object({
    slug: z.string().min(1).regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    kind: z.enum(["plan", "recap"]).optional(),
    commentIds: z.array(z.string().min(1)).min(1),
  }),
  http: { method: "POST" },
  requiresAuth: false,
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: false,
    title: "Export Companion Selection",
    description:
      "Export selected companion work with linked feedback, evidence, and recap context.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Companion handoff export is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({ slug: args.slug, path: args.path });
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
    const selectedFeedback = selectCompanionFeedbackForAgent({
      comments: feedback.comments,
      manifest: companionManifest,
    }).pending.filter((item) => args.commentIds.includes(item.id));
    const selectedCommentIds = selectedFeedback.map((item) => item.id);
    const selectedTargetIds = [
      ...new Set(
        selectedFeedback
          .flatMap((item) => [item.target?.id, item.target?.linkedBlockId])
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const companionEvidence = await readCompanionEvidence(local.folder);
    const selectedEvidence =
      companionEvidence?.packets.filter(
        (packet) =>
          packet.feedbackIds.some((id) => selectedCommentIds.includes(id)) ||
          packet.planTargetIds.some((id) => selectedTargetIds.includes(id)),
      ) ?? [];
    const selectedEvidenceIds = selectedEvidence.map((packet) => packet.evidenceId);
    const selectedRecapCoverage =
      companionManifest.recapCoverage?.links.filter(
        (link) =>
          link.feedbackIds.some((id) => selectedCommentIds.includes(id)) ||
          link.evidenceIds.some((id) => selectedEvidenceIds.includes(id)),
      ) ?? [];

    return {
      slug: local.slug,
      planId,
      selection: {
        commentIds: selectedCommentIds,
        feedback: selectedFeedback,
        evidence: selectedEvidence,
        recapCoverage: selectedRecapCoverage,
      },
    };
  },
});

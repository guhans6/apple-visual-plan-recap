import { defineAction } from "@agent-native/core";
import { z } from "zod";
import {
  appendCompanionEvidencePackets,
  type CompanionEvidencePacket,
} from "../server/lib/companion-evidence.js";
import { appendLocalPlanFeedbackEvent } from "../server/lib/local-plan-feedback.js";
import { isLocalPlanRuntime } from "../server/lib/local-identity.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { nowIso } from "../server/plans.js";

const evidencePacketSchema = z.object({
  evidenceId: z.string().min(1),
  kind: z.enum(["command-run", "screenshot", "artifact", "reviewer-note"]),
  status: z.enum(["verified", "assumed", "unverified"]),
  summary: z.string().min(1),
  planTargetIds: z.array(z.string().min(1)).optional(),
  command: z.string().optional(),
  artifactPath: z.string().optional(),
  note: z.string().optional(),
});

const resultPacketSchema = z.object({
  commentIds: z.array(z.string().min(1)).min(1),
  status: z.enum([
    "acknowledged",
    "in_progress",
    "resolved",
    "declined",
    "superseded",
    "reopened",
  ]),
  resolutionSummary: z.string().optional(),
  changedFiles: z.array(z.string()).optional(),
  evidenceRefs: z.array(z.string()).optional(),
  commitOrDiffRef: z.string().optional(),
  consume: z.boolean().optional(),
  evidence: z.array(evidencePacketSchema).optional(),
});

export default defineAction({
  description:
    "Import structured external-agent result packets back into the companion feedback and evidence history.",
  schema: z.object({
    slug: z.string().min(1).regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    results: z.array(resultPacketSchema).min(1),
  }),
  http: { method: "POST" },
  requiresAuth: false,
  readOnly: false,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: false,
    isConsequential: true,
    title: "Import Companion Result",
    description:
      "Import external-agent result packets into companion evidence and feedback history.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Companion result import is only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({ slug: args.slug, path: args.path });
    const imported = [];

    for (const result of args.results) {
      const changedAt = nowIso();
      const importedEvidenceIds =
        result.evidence?.map((packet) => packet.evidenceId) ?? [];
      const evidencePackets: CompanionEvidencePacket[] =
        result.evidence?.map((packet) => ({
          evidenceId: packet.evidenceId,
          kind: packet.kind,
          status: packet.status,
          summary: packet.summary,
          createdAt: changedAt,
          feedbackIds: result.commentIds,
          planTargetIds: packet.planTargetIds ?? [],
          command: packet.command,
          artifactPath: packet.artifactPath,
          note: packet.note,
        })) ?? [];

      await appendCompanionEvidencePackets({
        folder: local.folder,
        packets: evidencePackets,
      });

      const evidenceRefs = [
        ...new Set([...(result.evidenceRefs ?? []), ...importedEvidenceIds]),
      ];

      for (const commentId of result.commentIds) {
        await appendLocalPlanFeedbackEvent({
          folder: local.folder,
          event: {
            type: "feedback-status-changed",
            id: commentId,
            status: result.status,
            changedAt,
            changedBy: "import",
            resolutionSummary: result.resolutionSummary,
            changedFiles: result.changedFiles,
            evidenceRefs,
            commitOrDiffRef: result.commitOrDiffRef,
          },
        });

        if (result.consume !== false) {
          await appendLocalPlanFeedbackEvent({
            folder: local.folder,
            event: {
              type: "feedback-consumed",
              id: commentId,
              consumedAt: changedAt,
              consumedBy: "import",
            },
          });
        }
      }

      imported.push({
        commentIds: result.commentIds,
        consumedCommentIds: result.consume === false ? [] : result.commentIds,
        evidenceIds: importedEvidenceIds,
      });
    }

    return {
      slug: local.slug,
      planId: `local-${local.slug}`,
      imported,
    };
  },
});

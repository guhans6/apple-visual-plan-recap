import type { PlanComment } from "../../shared/types.js";
import type {
  CompanionManifest,
  CompanionManifestTarget,
} from "./companion-manifest.js";

export interface CompanionFeedbackItem extends PlanComment {
  target: CompanionManifestTarget | null;
  targetStatus: "matched" | "detached" | "unanchored";
}

export function selectCompanionFeedbackForAgent(input: {
  comments: PlanComment[];
  manifest: CompanionManifest | null;
}): { pending: CompanionFeedbackItem[]; secondary: CompanionFeedbackItem[] } {
  const withTargets = input.comments.map((comment) =>
    companionFeedbackItem(comment, input.manifest),
  );

  const agentHumanFeedback = withTargets.filter(
    (comment) =>
      comment.createdBy === "human" &&
      comment.resolutionTarget !== "human" &&
      !comment.deletedAt,
  );

  return {
    pending: agentHumanFeedback.filter(
      (comment) => comment.status === "open" && !comment.consumedAt,
    ),
    secondary: agentHumanFeedback.filter(
      (comment) => comment.status === "resolved" && !comment.consumedAt,
    ),
  };
}

function companionFeedbackItem(
  comment: PlanComment,
  manifest: CompanionManifest | null,
): CompanionFeedbackItem {
  const targetId = targetIdForComment(comment);
  if (!targetId) {
    return { ...comment, target: null, targetStatus: "unanchored" };
  }
  const target =
    manifest?.targets.find(
      (item) => item.id === targetId || item.linkedBlockId === targetId,
    ) ?? null;
  return {
    ...comment,
    target,
    targetStatus: target ? "matched" : "detached",
  };
}

function targetIdForComment(comment: PlanComment): string | null {
  if (!comment.anchor) return null;
  try {
    const anchor = JSON.parse(comment.anchor) as {
      targetBlockId?: unknown;
      blockId?: unknown;
      canvasFrameId?: unknown;
      targetId?: unknown;
    };
    for (const value of [
      anchor.targetBlockId,
      anchor.blockId,
      anchor.canvasFrameId,
      anchor.targetId,
    ]) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  } catch {
    return null;
  }
  return null;
}

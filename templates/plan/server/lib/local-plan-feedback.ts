import fs from "node:fs/promises";
import path from "node:path";
import type { PlanCommentResolutionTarget } from "../../shared/comment-context.js";
import type {
  PlanAuthor,
  PlanComment,
  PlanEvent,
} from "../../shared/types.js";

const FEEDBACK_EVENTS_FILE = "feedback.jsonl";

type LegacyCreatedEvent = {
  type: "created";
  id: string;
  planId: string;
  anchor?: string;
  targetBlockId?: string;
  targetKind?: string;
  anchorKind?: string;
  message: string;
  resolutionTarget?: PlanCommentResolutionTarget;
  status?: "open" | "resolved";
  createdBy?: PlanAuthor;
  createdAt: string;
};

type LegacyStatusEvent = {
  type: "resolved" | "reopened" | "consumed";
  id: string;
  actor?: string;
  at: string;
};

type FeedbackCreatedEvent = {
  type: "feedback-created";
  id: string;
  planId: string;
  anchor?: string;
  targetBlockId?: string;
  targetKind?: string;
  anchorKind?: string;
  message: string;
  resolutionTarget: PlanCommentResolutionTarget;
  createdBy: PlanAuthor;
  createdAt: string;
};

type FeedbackStatusChangedEvent = {
  type: "feedback-status-changed";
  id: string;
  status:
    | "open"
    | "acknowledged"
    | "in_progress"
    | "resolved"
    | "declined"
    | "superseded"
    | "reopened";
  changedAt: string;
  changedBy: PlanAuthor;
  resolutionSummary?: string;
  changedFiles?: string[];
  evidenceRefs?: string[];
  commitOrDiffRef?: string;
};

type FeedbackConsumedEvent = {
  type: "feedback-consumed";
  id: string;
  consumedAt: string;
  consumedBy: PlanAuthor;
};

export type LocalPlanFeedbackEvent =
  | LegacyCreatedEvent
  | LegacyStatusEvent
  | FeedbackCreatedEvent
  | FeedbackStatusChangedEvent
  | FeedbackConsumedEvent;

export interface LocalPlanFeedbackReadInput {
  planId: string;
  slug: string;
  folder: string;
}

export interface LocalPlanFeedbackReadResult {
  comments: PlanComment[];
  events: PlanEvent[];
  summary: {
    commentCount: number;
    openCommentCount: number;
  };
}

type LocalPlanFeedbackState = {
  planId: string | null;
  comments: Record<string, PlanComment>;
};

export async function readLocalPlanFeedback(
  input: LocalPlanFeedbackReadInput,
): Promise<LocalPlanFeedbackReadResult> {
  const events = await readFeedbackEvents(input.folder);
  const state = replayFeedbackEvents(events, input.planId);
  const comments = Object.values(state.comments).sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );

  return {
    comments,
    events: events.map((event) => planEventForLocalFeedback(event, state.planId)),
    summary: {
      commentCount: comments.length,
      openCommentCount: comments.filter(
        (comment) =>
          comment.status === "open" && !comment.consumedAt && !comment.deletedAt,
      ).length,
    },
  };
}

export async function appendLocalPlanFeedbackEvent(input: {
  folder: string;
  event: LocalPlanFeedbackEvent;
}): Promise<PlanComment | null> {
  await fs.mkdir(input.folder, { recursive: true });
  await fs.appendFile(
    path.join(input.folder, FEEDBACK_EVENTS_FILE),
    `${JSON.stringify(input.event)}\n`,
    "utf-8",
  );

  const state = replayFeedbackEvents(
    await readFeedbackEvents(input.folder),
    eventPlanId(input.event),
  );
  return state.comments[input.event.id] ?? null;
}

async function readFeedbackEvents(
  folder: string,
): Promise<LocalPlanFeedbackEvent[]> {
  try {
    const source = await fs.readFile(
      path.join(folder, FEEDBACK_EVENTS_FILE),
      "utf-8",
    );
    const events: LocalPlanFeedbackEvent[] = [];
    for (const line of source.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        events.push(JSON.parse(trimmed) as LocalPlanFeedbackEvent);
      } catch {
        break;
      }
    }
    return events;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new Error(
      `Could not read local plan feedback at ${path.join(folder, FEEDBACK_EVENTS_FILE)}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function replayFeedbackEvents(
  events: LocalPlanFeedbackEvent[],
  fallbackPlanId: string | null,
): LocalPlanFeedbackState {
  const state: LocalPlanFeedbackState = {
    planId: fallbackPlanId,
    comments: {},
  };

  for (const event of events) {
    if (event.type === "created" || event.type === "feedback-created") {
      state.planId = event.planId;
      state.comments[event.id] = {
        id: event.id,
        planId: event.planId,
        parentCommentId: null,
        sectionId: null,
        kind: "comment",
        status: event.type === "created" ? (event.status ?? "open") : "open",
        anchor: event.anchor ?? localBlockAnchorForEvent(event),
        message: event.message,
        createdBy: event.createdBy ?? "human",
        resolutionTarget: event.resolutionTarget,
        consumedAt: null,
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
      };
      continue;
    }

    const existing = state.comments[event.id];
    if (!existing) continue;

    if (event.type === "resolved") {
      existing.status = "resolved";
      existing.resolvedAt = event.at;
      existing.updatedAt = event.at;
      continue;
    }

    if (event.type === "reopened") {
      existing.status = "open";
      existing.resolvedAt = null;
      existing.updatedAt = event.at;
      continue;
    }

    if (event.type === "consumed") {
      existing.consumedAt = event.at;
      existing.updatedAt = event.at;
      continue;
    }

    if (event.type === "feedback-consumed") {
      existing.consumedAt = event.consumedAt;
      existing.updatedAt = event.consumedAt;
      continue;
    }

    if (event.type !== "feedback-status-changed") continue;

    existing.status = planCommentStatusForLifecycle(event.status);
    existing.resolvedAt = isResolvedLifecycleStatus(event.status)
      ? event.changedAt
      : null;
    existing.resolvedBy = isResolvedLifecycleStatus(event.status)
      ? event.changedBy
      : null;
    existing.updatedAt = event.changedAt;
  }

  return state;
}

function planEventForLocalFeedback(
  event: LocalPlanFeedbackEvent,
  fallbackPlanId: string | null,
): PlanEvent {
  if (event.type === "created" || event.type === "feedback-created") {
    return {
      id: `event-${event.id}`,
      planId: event.planId,
      type: "local.feedback.created",
      message: "Human added local visual plan feedback.",
      payload: { feedbackEvent: event },
      createdBy: event.createdBy ?? "human",
      createdAt: event.createdAt,
    };
  }

  if (event.type === "feedback-status-changed") {
    return {
      id: `event-feedback-status-${event.id}-${event.changedAt}`,
      planId: fallbackPlanId ?? "local-plan",
      type: "local.feedback.status_changed",
      message: `Local visual plan feedback moved to ${event.status}.`,
      payload: { feedbackEvent: event },
      createdBy: event.changedBy,
      createdAt: event.changedAt,
    };
  }

  if (event.type === "feedback-consumed") {
    return {
      id: `event-feedback-consumed-${event.id}-${event.consumedAt}`,
      planId: fallbackPlanId ?? "local-plan",
      type: "local.feedback.consumed",
      message: "Local visual plan feedback was consumed.",
      payload: { feedbackEvent: event },
      createdBy: event.consumedBy,
      createdAt: event.consumedAt,
    };
  }

  return {
    id: `event-${event.type}-${event.id}-${event.at}`,
    planId: fallbackPlanId ?? "local-plan",
    type: `local.feedback.${event.type}`,
    message: `Local visual plan feedback ${event.type}.`,
    payload: { feedbackEvent: event },
    createdBy: "human",
    createdAt: event.at,
  };
}

function localBlockAnchorForEvent(
  event: LegacyCreatedEvent | FeedbackCreatedEvent,
): string | null {
  if (!event.targetBlockId && !event.targetKind && !event.anchorKind) return null;
  return JSON.stringify({
    anchorKind: event.anchorKind,
    targetKind: event.targetKind,
    targetBlockId: event.targetBlockId,
  });
}

function planCommentStatusForLifecycle(
  status: FeedbackStatusChangedEvent["status"],
): "open" | "resolved" {
  return isResolvedLifecycleStatus(status) ? "resolved" : "open";
}

function isResolvedLifecycleStatus(
  status: FeedbackStatusChangedEvent["status"],
): boolean {
  return (
    status === "resolved" ||
    status === "declined" ||
    status === "superseded"
  );
}

function eventPlanId(event: LocalPlanFeedbackEvent): string | null {
  return "planId" in event ? event.planId : null;
}

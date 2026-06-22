export type CompanionFeedbackStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "declined"
  | "superseded"
  | "reopened";

export type CompanionFeedbackResolutionTarget = "agent" | "human";

export type CompanionFeedbackEvent =
  | {
      type: "feedback-created";
      id: string;
      message: string;
      createdAt: string;
      createdBy: "human" | "agent" | "import";
      resolutionTarget: CompanionFeedbackResolutionTarget;
    }
  | {
      type: "feedback-status-changed";
      id: string;
      status: CompanionFeedbackStatus;
      changedAt: string;
      changedBy: "human" | "agent" | "import";
      resolutionSummary?: string;
      changedFiles?: string[];
      evidenceRefs?: string[];
      commitOrDiffRef?: string;
    }
  | {
      type: "feedback-consumed";
      id: string;
      consumedAt: string;
      consumedBy: "human" | "agent" | "import";
    };

export interface CompanionFeedbackItem {
  id: string;
  message: string;
  createdAt: string;
  createdBy: "human" | "agent" | "import";
  resolutionTarget: CompanionFeedbackResolutionTarget;
  status: CompanionFeedbackStatus;
  consumedAt: string | null;
  changedAt: string | null;
  changedBy: "human" | "agent" | "import" | null;
  resolutionSummary: string | null;
  changedFiles: string[];
  evidenceRefs: string[];
  commitOrDiffRef: string | null;
}

export interface CompanionFeedbackState {
  byId: Record<string, CompanionFeedbackItem>;
  ordered: CompanionFeedbackItem[];
}

export function replayCompanionFeedbackEvents(
  events: CompanionFeedbackEvent[],
): CompanionFeedbackState {
  const byId: Record<string, CompanionFeedbackItem> = {};

  for (const event of events) {
    if (event.type === "feedback-created") {
      byId[event.id] = {
        id: event.id,
        message: event.message,
        createdAt: event.createdAt,
        createdBy: event.createdBy,
        resolutionTarget: event.resolutionTarget,
        status: "open",
        consumedAt: null,
        changedAt: null,
        changedBy: null,
        resolutionSummary: null,
        changedFiles: [],
        evidenceRefs: [],
        commitOrDiffRef: null,
      };
      continue;
    }

    const current = byId[event.id];
    if (!current) continue;

    if (event.type === "feedback-status-changed") {
      current.status = event.status;
      current.changedAt = event.changedAt;
      current.changedBy = event.changedBy;
      current.resolutionSummary = event.resolutionSummary ?? null;
      current.changedFiles = event.changedFiles ?? [];
      current.evidenceRefs = event.evidenceRefs ?? [];
      current.commitOrDiffRef = event.commitOrDiffRef ?? null;
      continue;
    }

    current.consumedAt = event.consumedAt;
  }

  const ordered = Object.values(byId).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id),
  );
  return { byId, ordered };
}

export function selectPendingCompanionFeedback(
  state: CompanionFeedbackState,
): CompanionFeedbackItem[] {
  return state.ordered.filter(
    (item) =>
      item.resolutionTarget === "agent" &&
      !item.consumedAt &&
      !isTerminalFeedbackStatus(item.status),
  );
}

function isTerminalFeedbackStatus(status: CompanionFeedbackStatus): boolean {
  return status === "resolved" || status === "declined" || status === "superseded";
}

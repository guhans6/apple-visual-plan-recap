import { describe, expect, it } from "vitest";
import {
  replayCompanionFeedbackEvents,
  selectPendingCompanionFeedback,
  type CompanionFeedbackEvent,
} from "./companion-feedback.js";

function created(
  id: string,
  overrides: Partial<Extract<CompanionFeedbackEvent, { type: "feedback-created" }>> = {},
): Extract<CompanionFeedbackEvent, { type: "feedback-created" }> {
  return {
    type: "feedback-created",
    id,
    message: id,
    createdAt: "2026-06-18T10:00:00.000Z",
    createdBy: "human",
    resolutionTarget: "agent",
    ...overrides,
  };
}

describe("replayCompanionFeedbackEvents", () => {
  it("keeps acknowledged agent feedback actionable and excludes human-only, terminal, and consumed items", () => {
    const state = replayCompanionFeedbackEvents([
      created("agent-open"),
      created("human-only", { resolutionTarget: "human" }),
      created("agent-ack"),
      {
        type: "feedback-status-changed",
        id: "agent-ack",
        status: "acknowledged",
        changedAt: "2026-06-18T10:05:00.000Z",
        changedBy: "agent",
      },
      created("agent-resolved"),
      {
        type: "feedback-status-changed",
        id: "agent-resolved",
        status: "resolved",
        changedAt: "2026-06-18T10:10:00.000Z",
        changedBy: "agent",
        resolutionSummary: "Implemented the requested change.",
        changedFiles: ["Sources/SettingsStore.swift"],
        evidenceRefs: ["ev_1"],
      },
      created("agent-consumed"),
      {
        type: "feedback-consumed",
        id: "agent-consumed",
        consumedAt: "2026-06-18T10:12:00.000Z",
        consumedBy: "agent",
      },
    ]);

    expect(selectPendingCompanionFeedback(state).map((item) => item.id)).toEqual([
      "agent-ack",
      "agent-open",
    ]);
    expect(state.byId["agent-resolved"]).toMatchObject({
      status: "resolved",
      resolutionSummary: "Implemented the requested change.",
      changedFiles: ["Sources/SettingsStore.swift"],
      evidenceRefs: ["ev_1"],
    });
  });

  it("returns reopened and in-progress agent feedback to the actionable queue", () => {
    const state = replayCompanionFeedbackEvents([
      created("reopened-item"),
      {
        type: "feedback-status-changed",
        id: "reopened-item",
        status: "resolved",
        changedAt: "2026-06-18T10:10:00.000Z",
        changedBy: "agent",
        resolutionSummary: "Patched the first pass.",
      },
      {
        type: "feedback-status-changed",
        id: "reopened-item",
        status: "reopened",
        changedAt: "2026-06-18T10:15:00.000Z",
        changedBy: "human",
      },
      created("active-item"),
      {
        type: "feedback-status-changed",
        id: "active-item",
        status: "in_progress",
        changedAt: "2026-06-18T10:11:00.000Z",
        changedBy: "agent",
      },
    ]);

    expect(selectPendingCompanionFeedback(state).map((item) => item.id)).toEqual([
      "active-item",
      "reopened-item",
    ]);
    expect(state.byId["reopened-item"]).toMatchObject({
      status: "reopened",
      changedBy: "human",
    });
  });
});

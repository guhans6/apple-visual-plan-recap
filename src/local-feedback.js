import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FEEDBACK_EVENTS_FILE = "feedback.jsonl";
const FEEDBACK_STATE_FILE = "feedback-state.json";

export async function readFeedback({ planDir, includeConsumed = false, includeHumanReview = false }) {
  const state = await readState(planDir);
  const items = Object.values(state.items)
    .filter((item) => includeConsumed || item.status !== "consumed")
    .filter((item) => includeHumanReview || item.resolutionTarget === "agent")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    items,
    groups: groupByTargetBlock(items),
  };
}

export async function appendFeedbackEvent({ planDir, event }) {
  await ensurePlanDir(planDir);
  const normalized = normalizeEvent(event);
  const eventsPath = path.join(planDir, FEEDBACK_EVENTS_FILE);
  const state = applyEvent(await readState(planDir), normalized);

  await appendJsonLine(eventsPath, normalized);
  await writeState(planDir, state);

  return state.items[normalized.id];
}

export async function consumeFeedback({ planDir, feedbackId, actor, consumedAt = new Date().toISOString() }) {
  return appendFeedbackEvent({
    planDir,
    event: {
      type: "consumed",
      id: feedbackId,
      actor,
      consumedAt,
    },
  });
}

export async function resolveFeedback({ planDir, feedbackId, actor, resolvedAt = new Date().toISOString() }) {
  return appendFeedbackEvent({
    planDir,
    event: {
      type: "resolved",
      id: feedbackId,
      actor,
      resolvedAt,
    },
  });
}

export async function reopenFeedback({ planDir, feedbackId, actor, reopenedAt = new Date().toISOString() }) {
  return appendFeedbackEvent({
    planDir,
    event: {
      type: "reopened",
      id: feedbackId,
      actor,
      reopenedAt,
    },
  });
}

async function readState(planDir) {
  const statePath = path.join(planDir, FEEDBACK_STATE_FILE);

  try {
    return normalizeState(JSON.parse(await readFile(statePath, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return replayEvents(await readEvents(planDir));
}

async function readEvents(planDir) {
  const eventsPath = path.join(planDir, FEEDBACK_EVENTS_FILE);

  try {
    const contents = await readFile(eventsPath, "utf8");
    return contents
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function replayEvents(events) {
  return events.reduce((state, event) => applyEvent(state, normalizeEvent(event)), emptyState());
}

function applyEvent(state, event) {
  if (event.type === "created") {
    state.items[event.id] = {
      id: event.id,
      planSlug: event.planSlug,
      targetBlockId: event.targetBlockId,
      targetKind: event.targetKind,
      anchorKind: event.anchorKind,
      message: event.message,
      resolutionTarget: event.resolutionTarget,
      status: event.status,
      creator: event.creator,
      createdAt: event.createdAt,
      resolvedAt: null,
      consumedAt: null,
    };
    return state;
  }

  const existing = state.items[event.id];
  if (!existing) {
    throw new Error(`Cannot apply ${event.type} event for missing feedback ${event.id}`);
  }

  if (event.type === "resolved") {
    existing.status = "resolved";
    existing.resolvedAt = event.resolvedAt;
    return state;
  }

  if (event.type === "reopened") {
    existing.status = "open";
    existing.resolvedAt = null;
    return state;
  }

  if (event.type === "consumed") {
    existing.status = "consumed";
    existing.consumedAt = event.consumedAt;
    return state;
  }

  throw new Error(`Unsupported feedback event type: ${event.type}`);
}

function normalizeEvent(event) {
  if (!event || typeof event !== "object") {
    throw new Error("Feedback event must be an object");
  }

  if (!["created", "resolved", "reopened", "consumed"].includes(event.type)) {
    throw new Error(`Unsupported feedback event type: ${event.type}`);
  }

  if (!event.id) {
    throw new Error("Feedback event must include an id");
  }

  if (event.type === "created") {
    for (const field of [
      "planSlug",
      "targetBlockId",
      "targetKind",
      "anchorKind",
      "message",
      "resolutionTarget",
      "status",
      "creator",
      "createdAt",
    ]) {
      if (!event[field]) {
        throw new Error(`Created feedback event must include ${field}`);
      }
    }
  }

  return event;
}

function normalizeState(state) {
  return {
    version: 1,
    planSlug: state?.planSlug ?? null,
    items: state?.items ?? {},
  };
}

function emptyState() {
  return {
    version: 1,
    planSlug: null,
    items: {},
  };
}

async function ensurePlanDir(planDir) {
  await mkdir(planDir, { recursive: true });
}

async function appendJsonLine(filePath, value) {
  const previous = await readFile(filePath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  });

  await writeFile(filePath, `${previous}${JSON.stringify(value)}\n`, "utf8");
}

async function writeState(planDir, state) {
  await writeFile(path.join(planDir, FEEDBACK_STATE_FILE), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function groupByTargetBlock(items) {
  return items.reduce((groups, item) => {
    groups[item.targetBlockId] ??= [];
    groups[item.targetBlockId].push(item);
    return groups;
  }, {});
}

export interface CompanionManifestTarget {
  id: string;
  label: string;
  sourcePath: string;
  sourceRange?: { startLine: number; endLine: number };
  searchableText?: string;
}

export interface CompanionManifest {
  revisionDigest: string;
  targets: CompanionManifestTarget[];
}

export interface CompanionFeedbackLocator {
  blockId?: string;
  canvasFrameId?: string;
  canvasNodeId?: string;
  textQuote?: string;
}

export type CompanionAnchorState =
  | "matched"
  | "reanchored"
  | "ambiguous"
  | "detached"
  | "unanchored";

export function resolveCompanionAnchor(input: {
  manifest: CompanionManifest;
  feedback: CompanionFeedbackLocator;
}): {
  state: CompanionAnchorState;
  confidence: number;
  target: CompanionManifestTarget | null;
} {
  const stableId =
    input.feedback.blockId ??
    input.feedback.canvasNodeId ??
    input.feedback.canvasFrameId;
  if (stableId) {
    const target =
      input.manifest.targets.find((candidate) => candidate.id === stableId) ?? null;
    if (target) return { state: "matched", confidence: 1, target };
  }

  const quote = input.feedback.textQuote?.trim().toLowerCase();
  if (quote) {
    const matches = input.manifest.targets.filter((candidate) =>
      candidate.searchableText?.toLowerCase().includes(quote),
    );
    if (matches.length === 1) {
      return { state: "reanchored", confidence: 0.86, target: matches[0] ?? null };
    }
    if (matches.length > 1) {
      return { state: "ambiguous", confidence: 0.4, target: null };
    }
    return { state: "detached", confidence: 0, target: null };
  }

  return { state: "unanchored", confidence: 0, target: null };
}

export function approvalStateForRevision(input: {
  approvedRevisionDigest: string | null;
  currentRevisionDigest: string;
}):
  | { status: "missing" }
  | { status: "current" }
  | {
      status: "stale";
      approvedRevisionDigest: string;
      currentRevisionDigest: string;
    } {
  if (!input.approvedRevisionDigest) return { status: "missing" };
  if (input.approvedRevisionDigest === input.currentRevisionDigest) {
    return { status: "current" };
  }
  return {
    status: "stale",
    approvedRevisionDigest: input.approvedRevisionDigest,
    currentRevisionDigest: input.currentRevisionDigest,
  };
}

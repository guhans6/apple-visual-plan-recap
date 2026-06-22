import fs from "node:fs/promises";
import path from "node:path";

const EVIDENCE_EVENTS_FILE = "evidence.jsonl";

export type CompanionEvidenceKind =
  | "command-run"
  | "screenshot"
  | "artifact"
  | "reviewer-note";

export type CompanionEvidenceStatus = "verified" | "assumed" | "unverified";

export interface CompanionEvidencePacket {
  evidenceId: string;
  kind: CompanionEvidenceKind;
  status: CompanionEvidenceStatus;
  summary: string;
  createdAt: string;
  feedbackIds: string[];
  planTargetIds: string[];
  command?: string;
  artifactPath?: string;
  note?: string;
}

type RawCompanionEvidencePacket = Partial<CompanionEvidencePacket> & {
  evidenceId?: unknown;
  kind?: unknown;
  summary?: unknown;
  createdAt?: unknown;
};

export interface CompanionEvidenceCollection {
  packets: CompanionEvidencePacket[];
  summary: {
    verifiedCount: number;
    assumedCount: number;
    unverifiedCount: number;
  };
}

export async function readCompanionEvidence(
  folder: string,
): Promise<CompanionEvidenceCollection | null> {
  const packets = await readCompanionEvidencePackets(folder);
  if (packets.length === 0) return null;

  const summary = {
    verifiedCount: 0,
    assumedCount: 0,
    unverifiedCount: 0,
  };

  for (const packet of packets) {
    if (packet.status === "verified") summary.verifiedCount += 1;
    else if (packet.status === "assumed") summary.assumedCount += 1;
    else summary.unverifiedCount += 1;
  }

  return { packets, summary };
}

export async function appendCompanionEvidencePackets(input: {
  folder: string;
  packets: CompanionEvidencePacket[];
}): Promise<void> {
  if (input.packets.length === 0) return;
  await fs.mkdir(input.folder, { recursive: true });
  await fs.appendFile(
    path.join(input.folder, EVIDENCE_EVENTS_FILE),
    input.packets.map((packet) => JSON.stringify(packet)).join("\n") + "\n",
    "utf-8",
  );
}

async function readCompanionEvidencePackets(
  folder: string,
): Promise<CompanionEvidencePacket[]> {
  try {
    const source = await fs.readFile(
      path.join(folder, EVIDENCE_EVENTS_FILE),
      "utf-8",
    );
    const packets: CompanionEvidencePacket[] = [];
    for (const line of source.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const packet = normalizeCompanionEvidencePacket(
          JSON.parse(trimmed) as RawCompanionEvidencePacket,
        );
        if (packet) packets.push(packet);
      } catch {
        break;
      }
    }
    return packets.sort(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) ||
        left.evidenceId.localeCompare(right.evidenceId),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new Error(
      `Could not read companion evidence at ${path.join(folder, EVIDENCE_EVENTS_FILE)}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function normalizeCompanionEvidencePacket(
  input: RawCompanionEvidencePacket,
): CompanionEvidencePacket | null {
  const evidenceId =
    typeof input.evidenceId === "string" && input.evidenceId.trim()
      ? input.evidenceId
      : null;
  const kind = isCompanionEvidenceKind(input.kind) ? input.kind : null;
  const summary =
    typeof input.summary === "string" && input.summary.trim()
      ? input.summary
      : null;
  const createdAt =
    typeof input.createdAt === "string" && input.createdAt.trim()
      ? input.createdAt
      : null;

  if (!evidenceId || !kind || !summary || !createdAt) return null;

  return {
    evidenceId,
    kind,
    status: isCompanionEvidenceStatus(input.status) ? input.status : "assumed",
    summary,
    createdAt,
    feedbackIds: stringArray(input.feedbackIds),
    planTargetIds: stringArray(input.planTargetIds),
    command:
      typeof input.command === "string" && input.command.trim()
        ? input.command
        : undefined,
    artifactPath:
      typeof input.artifactPath === "string" && input.artifactPath.trim()
        ? input.artifactPath
        : undefined,
    note:
      typeof input.note === "string" && input.note.trim()
        ? input.note
        : undefined,
  };
}

function stringArray(input: unknown): string[] {
  return Array.isArray(input)
    ? input.filter((value): value is string => typeof value === "string")
    : [];
}

function isCompanionEvidenceKind(
  input: unknown,
): input is CompanionEvidenceKind {
  return (
    input === "command-run" ||
    input === "screenshot" ||
    input === "artifact" ||
    input === "reviewer-note"
  );
}

function isCompanionEvidenceStatus(
  input: unknown,
): input is CompanionEvidenceStatus {
  return input === "verified" || input === "assumed" || input === "unverified";
}

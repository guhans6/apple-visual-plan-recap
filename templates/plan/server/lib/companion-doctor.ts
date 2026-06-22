import fs from "node:fs/promises";
import path from "node:path";
import {
  readPlanLocalFolder,
  type LocalPlanLocationInput,
} from "./local-plan-files.js";
import { parsePlanCommentAnchor } from "../../shared/comment-context.js";

export interface CompanionDoctorIssue {
  code:
    | "damaged-jsonl-tail"
    | "broken-reference"
    | "invalid-anchor"
    | "invalid-manifest"
    | "workspace-escape";
  severity: "warning" | "error";
  file?: string;
  line?: number;
  message: string;
}

export interface CompanionDoctorReport {
  canonicalFiles: {
    authoritative: string[];
    appendOnly: string[];
    disposable: string[];
    optionalArtifacts: string[];
  };
  manifest: {
    exists: boolean;
    revisionDigest: string | null;
  };
  feedback: {
    validEventCount: number;
    damagedTail: boolean;
  };
  evidence: {
    validEventCount: number;
    damagedTail: boolean;
  };
  issues: CompanionDoctorIssue[];
}

interface ParsedJsonlReport {
  validEventCount: number;
  damagedTail: boolean;
  issues: CompanionDoctorIssue[];
}

const CANONICAL_FILES = {
  authoritative: ["plan.mdx", "canvas.mdx", "recap.mdx", "manifest.json"],
  appendOnly: ["feedback.jsonl", "evidence.jsonl"],
  disposable: [".plan-state.json"],
  optionalArtifacts: ["assets/", "evidence/"],
} as const;

export async function doctorCompanionFolder(
  input: string | LocalPlanLocationInput,
): Promise<CompanionDoctorReport> {
  const issues: CompanionDoctorIssue[] = [];

  let folder: string;
  try {
    const local = await readPlanLocalFolder(input);
    folder = local.folder;
  } catch (error) {
    return {
      canonicalFiles: materializeCanonicalFiles(),
      manifest: { exists: false, revisionDigest: null },
      feedback: { validEventCount: 0, damagedTail: false },
      evidence: { validEventCount: 0, damagedTail: false },
      issues: [
        {
          code: "workspace-escape",
          severity: "error",
          message:
            error instanceof Error ? error.message : "Failed to open plan folder.",
        },
      ],
    };
  }

  const manifest = await readManifest(
    path.join(folder, "manifest.json"),
    folder,
    issues,
  );
  const feedback = await readJsonlReport(path.join(folder, "feedback.jsonl"));
  const evidence = await readJsonlReport(path.join(folder, "evidence.jsonl"));

  issues.push(...feedback.issues, ...evidence.issues);

  return {
    canonicalFiles: materializeCanonicalFiles(),
    manifest,
    feedback: {
      validEventCount: feedback.validEventCount,
      damagedTail: feedback.damagedTail,
    },
    evidence: {
      validEventCount: evidence.validEventCount,
      damagedTail: evidence.damagedTail,
    },
    issues,
  };
}

function materializeCanonicalFiles(): CompanionDoctorReport["canonicalFiles"] {
  return {
    authoritative: [...CANONICAL_FILES.authoritative],
    appendOnly: [...CANONICAL_FILES.appendOnly],
    disposable: [...CANONICAL_FILES.disposable],
    optionalArtifacts: [...CANONICAL_FILES.optionalArtifacts],
  };
}

async function readManifest(
  filePath: string,
  folder: string,
  issues: CompanionDoctorIssue[],
): Promise<CompanionDoctorReport["manifest"]> {
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, "utf-8")) as {
      revisionDigest?: unknown;
      targets?: Array<{ sourcePath?: unknown }>;
    };
    for (const target of parsed.targets ?? []) {
      const rawSourcePath =
        typeof target?.sourcePath === "string" ? target.sourcePath : null;
      const sourcePath = normalizeCompanionReferencePath(target?.sourcePath);
      if (rawSourcePath && !sourcePath) {
        issues.push({
          code: "broken-reference",
          severity: "warning",
          file: "manifest.json",
          message: `Manifest reference uses an unsafe path: ${rawSourcePath}`,
        });
        continue;
      }
      if (!sourcePath) continue;
      if (!(await fileExists(path.join(folder, sourcePath)))) {
        issues.push({
          code: "broken-reference",
          severity: "warning",
          file: "manifest.json",
          message: `Manifest reference does not exist on disk: ${rawSourcePath}`,
        });
      }
    }
    return {
      exists: true,
      revisionDigest:
        typeof parsed.revisionDigest === "string" ? parsed.revisionDigest : null,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { exists: false, revisionDigest: null };
    }
    issues.push({
      code: "invalid-manifest",
      severity: "error",
      file: "manifest.json",
      message: "manifest.json is not valid JSON.",
    });
    return { exists: true, revisionDigest: null };
  }
}

async function readJsonlReport(filePath: string): Promise<ParsedJsonlReport> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const issues: CompanionDoctorIssue[] = [];
    let validEventCount = 0;
    let damagedTail = false;

    for (const [index, line] of raw.split("\n").entries()) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as { anchor?: unknown };
        validEventCount += 1;
        if (
          typeof parsed.anchor === "string" &&
          parsed.anchor.trim() &&
          !parsePlanCommentAnchor(parsed.anchor)
        ) {
          issues.push({
            code: "invalid-anchor",
            severity: "warning",
            file: path.basename(filePath),
            line: index + 1,
            message: "Feedback event contains an invalid anchor payload.",
          });
        }
      } catch {
        damagedTail = true;
        issues.push({
          code: "damaged-jsonl-tail",
          severity: "warning",
          file: path.basename(filePath),
          line: index + 1,
          message: `${path.basename(filePath)} contains a damaged JSONL tail; earlier valid events were recovered.`,
        });
        break;
      }
    }

    return { validEventCount, damagedTail, issues };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { validEventCount: 0, damagedTail: false, issues: [] };
    }
    throw error;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeCompanionReferencePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (path.isAbsolute(trimmed) || trimmed.includes("\0")) return null;
  const normalized = path.posix.normalize(trimmed.replace(/\\/g, "/"));
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    return null;
  }
  return normalized;
}

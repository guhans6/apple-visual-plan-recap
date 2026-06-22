import fs from "node:fs/promises";
import path from "node:path";
import type {
  PlanBlock,
  PlanBlockType,
  PlanContent,
} from "../../shared/plan-content.js";
import type { PlanKind } from "../../shared/types.js";
import type { CompanionRecapCoverage } from "./companion-recap-coverage.js";

const COMPANION_MANIFEST_FILE = "companion-manifest.json";

export type CompanionTargetKind =
  | "document-block"
  | "canvas-frame"
  | "wireframe-node"
  | "code-reference"
  | "evidence-row"
  | "decision-question";

export interface CompanionManifestTarget {
  id: string;
  targetKind: CompanionTargetKind;
  label: string;
  sourcePath: string;
  sourceRange?: { startLine: number; endLine: number };
  linkedBlockId?: string;
}

export interface CompanionManifestReviewPackItem {
  id: string;
  title: string;
  status: string;
  detail: string;
}

export interface CompanionManifestReviewPack {
  id: string;
  title: string;
  items: CompanionManifestReviewPackItem[];
}

export interface CompanionManifest {
  version: 1;
  slug: string;
  kind: PlanKind;
  generatedAt: string;
  targets: CompanionManifestTarget[];
  reviewPacks?: CompanionManifestReviewPack[];
  recapCoverage?: CompanionRecapCoverage;
}

type CompanionSourceFiles = {
  "plan.mdx"?: string;
  "canvas.mdx"?: string;
  "prototype.mdx"?: string;
  ".plan-state.json"?: string;
};

export async function buildCompanionManifest(input: {
  folder: string;
  slug: string;
  kind: PlanKind;
  content: PlanContent;
  sourceFiles: CompanionSourceFiles;
}): Promise<CompanionManifest> {
  const targets = [
    ...documentTargetsForBlocks(input.content.blocks, input.sourceFiles),
    ...canvasTargets(input.content, input.sourceFiles),
  ];
  const manifest: CompanionManifest = {
    version: 1,
    slug: input.slug,
    kind: input.kind,
    generatedAt: new Date().toISOString(),
    targets: dedupeTargets(targets),
  };
  await fs.writeFile(
    path.join(input.folder, COMPANION_MANIFEST_FILE),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf-8",
  );
  return manifest;
}

export async function readCompanionManifest(
  folder: string,
): Promise<CompanionManifest | null> {
  try {
    return JSON.parse(
      await fs.readFile(path.join(folder, COMPANION_MANIFEST_FILE), "utf-8"),
    ) as CompanionManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function documentTargetsForBlocks(
  blocks: PlanBlock[],
  sourceFiles: CompanionSourceFiles,
): CompanionManifestTarget[] {
  const targets: CompanionManifestTarget[] = [];
  const visit = (block: PlanBlock) => {
    targets.push({
      id: block.id,
      targetKind: targetKindForBlock(block.type),
      label: block.title ?? block.id,
      sourcePath: "plan.mdx",
      sourceRange: findSourceRange(sourceFiles["plan.mdx"] ?? "", block.id),
    });
    if (block.type === "tabs") {
      for (const tab of block.data.tabs) {
        for (const child of tab.blocks) visit(child);
      }
    }
    if (block.type === "columns") {
      for (const column of block.data.columns) {
        for (const child of column.blocks) visit(child);
      }
    }
  };
  for (const block of blocks) visit(block);
  return targets;
}

function canvasTargets(
  content: PlanContent,
  sourceFiles: CompanionSourceFiles,
): CompanionManifestTarget[] {
  return (content.canvas?.frames ?? []).map((frame) => ({
    id: frame.id,
    targetKind: "canvas-frame",
    label: frame.label ?? frame.id,
    sourcePath: "canvas.mdx",
    sourceRange: findSourceRange(sourceFiles["canvas.mdx"] ?? "", frame.id),
    linkedBlockId: frame.blockId,
  }));
}

function dedupeTargets(
  targets: CompanionManifestTarget[],
): CompanionManifestTarget[] {
  const seen = new Set<string>();
  return targets.filter((target) => {
    const key = `${target.targetKind}:${target.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function targetKindForBlock(type: PlanBlockType): CompanionTargetKind {
  if (type === "table") return "evidence-row";
  if (type === "question-form" || type === "visual-questions") {
    return "decision-question";
  }
  if (type === "code" || type === "code-tabs" || type === "annotated-code") {
    return "code-reference";
  }
  return "document-block";
}

function findSourceRange(
  source: string,
  id: string,
): { startLine: number; endLine: number } | undefined {
  const lines = source.split("\n");
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b(?:id|blockId)=["']${escaped}["']`);
  const index = lines.findIndex((line) => pattern.test(line));
  if (index < 0) return undefined;
  return { startLine: index + 1, endLine: index + 1 };
}

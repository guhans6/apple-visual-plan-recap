import fs from "node:fs/promises";
import path from "node:path";
import {
  parsePlanMdxFolder,
  type PlanMdxFolder,
} from "../plan-mdx.js";
import { companionRoutePath } from "../../shared/companion-routes.js";
import {
  localPlanRepoRoot,
} from "./local-plan-files.js";

export interface LocalCompanionDashboardEntry {
  slug: string;
  title: string;
  kind: "plan" | "recap";
  routePath: string;
  repoPath: string;
  updatedAt: string | null;
}

export interface LocalCompanionDashboardProject {
  repoRoot: string;
  companionRoot: string;
  planRoot: string;
  recapRoot: string;
  plans: LocalCompanionDashboardEntry[];
  recaps: LocalCompanionDashboardEntry[];
}

export interface LocalCompanionDashboardData {
  companionRuntime: boolean;
  currentProject: LocalCompanionDashboardProject;
  additionalSources: Array<{
    id: string;
    label: string;
    plans: LocalCompanionDashboardEntry[];
    recaps: LocalCompanionDashboardEntry[];
  }>;
  additionalSourcesAvailable: boolean;
}

export async function listLocalCompanionDashboard(_input?: {
  includeAdditionalSources?: boolean;
}): Promise<LocalCompanionDashboardData> {
  const repoRoot = localPlanRepoRoot();
  const planRoot = dashboardPlanRoot(repoRoot);
  const companionRoot = inferCompanionRoot(repoRoot, planRoot);
  const recapRoot = inferRecapRoot(repoRoot, companionRoot, planRoot);
  const additionalSources = _input?.includeAdditionalSources
    ? await listAdditionalSources(repoRoot)
    : [];
  return {
    companionRuntime: true,
    currentProject: {
      repoRoot,
      companionRoot,
      planRoot,
      recapRoot,
      plans: await listDashboardEntries(repoRoot, planRoot, "plan"),
      recaps: await listDashboardEntries(repoRoot, recapRoot, "recap"),
    },
    additionalSources,
    additionalSourcesAvailable: additionalSources.length > 0,
  };
}

async function listDashboardEntries(
  repoRoot: string,
  root: string,
  kind: "plan" | "recap",
): Promise<LocalCompanionDashboardEntry[]> {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  const listed = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const repoPath = toRepoPath(repoRoot, path.join(root, entry.name));
        try {
          const local = await readDashboardFolder(repoRoot, root, entry.name);
          const routeRepoPath = isCanonicalCompanionPath(repoPath, kind)
            ? null
            : local.repoPath;
          return {
            slug: local.slug,
            title: local.content.title || local.slug,
            kind,
            routePath: companionRoutePath(kind, local.slug, routeRepoPath),
            repoPath,
            updatedAt: await readUpdatedAt(path.join(root, entry.name)),
          };
        } catch {
          return null;
        }
      }),
  );
  return listed
    .filter((entry): entry is LocalCompanionDashboardEntry => entry !== null)
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

async function readDashboardFolder(
  repoRoot: string,
  root: string,
  slug: string,
): Promise<{
  slug: string;
  repoPath: string;
  content: { title?: string | null; brief?: string | null };
}> {
  const folder = path.join(root, slug);
  const mdx = await readDashboardMdxFolder(folder);
  const content = await parsePlanMdxFolder(mdx);
  return {
    slug,
    repoPath: toRepoPath(repoRoot, folder),
    content,
  };
}

async function readDashboardMdxFolder(folder: string): Promise<PlanMdxFolder> {
  const planMdx = await fs.readFile(path.join(folder, "plan.mdx"), "utf-8");
  const mdx: PlanMdxFolder = { "plan.mdx": planMdx };
  for (const file of [
    "canvas.mdx",
    "prototype.mdx",
    ".plan-state.json",
  ] as const) {
    try {
      mdx[file] = await fs.readFile(path.join(folder, file), "utf-8");
    } catch {
      // Optional companion file.
    }
  }
  return mdx;
}

function toRepoPath(repoRoot: string, absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

async function readUpdatedAt(folder: string): Promise<string | null> {
  try {
    return (await fs.stat(path.join(folder, "plan.mdx"))).mtime.toISOString();
  } catch {
    return null;
  }
}

function isCanonicalCompanionPath(
  repoPath: string,
  kind: "plan" | "recap",
): boolean {
  const prefix =
    kind === "plan"
      ? "docs/visual-companion/plans/"
      : "docs/visual-companion/recaps/";
  return repoPath.startsWith(prefix);
}

function inferCompanionRoot(repoRoot: string, planRoot: string): string {
  const canonicalRoot = path.join(repoRoot, "docs", "visual-companion");
  if (path.basename(planRoot) === "plans") {
    return path.dirname(planRoot);
  }
  return canonicalRoot;
}

function inferRecapRoot(
  repoRoot: string,
  companionRoot: string,
  planRoot: string,
): string {
  if (path.basename(planRoot) === "plans") {
    return path.join(path.dirname(planRoot), "recaps");
  }
  return path.join(companionRoot, "recaps");
}

function dashboardPlanRoot(repoRoot: string): string {
  const configured = process.env.PLAN_LOCAL_DIR?.trim();
  if (configured) {
    return path.resolve(repoRoot, configured);
  }
  return path.join(repoRoot, "docs", "visual-companion", "plans");
}

async function listAdditionalSources(
  currentRepoRoot: string,
): Promise<LocalCompanionDashboardData["additionalSources"]> {
  const siblingRoots = await discoverSiblingRepoRoots(currentRepoRoot);
  const sources = await Promise.all(
    siblingRoots.map(async (repoRoot) => {
      const companionRoot = path.join(repoRoot, "docs", "visual-companion");
      const planRoot = path.join(companionRoot, "plans");
      const recapRoot = path.join(companionRoot, "recaps");
      const plans = await listDashboardEntries(repoRoot, planRoot, "plan");
      const recaps = await listDashboardEntries(repoRoot, recapRoot, "recap");
      if (plans.length === 0 && recaps.length === 0) {
        return null;
      }
      return {
        id: repoRoot,
        label: path.basename(repoRoot),
        plans,
        recaps,
      };
    }),
  );
  return sources
    .filter((source): source is NonNullable<typeof source> => source !== null)
    .sort((left, right) => left.label.localeCompare(right.label));
}

async function discoverSiblingRepoRoots(currentRepoRoot: string): Promise<string[]> {
  const parentDir = path.dirname(currentRepoRoot);
  const currentBase = path.basename(currentRepoRoot);
  const entries = await fs
    .readdir(parentDir, { withFileTypes: true })
    .catch(() => []);
  const candidates = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name !== currentBase)
      .map(async (entry) => {
        const candidateRoot = path.join(parentDir, entry.name);
        return (await looksLikeRepoWithCompanion(candidateRoot))
          ? candidateRoot
          : null;
      }),
  );
  return candidates.filter((entry): entry is string => entry !== null);
}

async function looksLikeRepoWithCompanion(candidateRoot: string): Promise<boolean> {
  const checks = await Promise.all([
    pathExists(path.join(candidateRoot, ".git")),
    pathExists(path.join(candidateRoot, "agent-native.json")),
    pathExists(path.join(candidateRoot, "docs", "visual-companion")),
  ]);
  return checks.some(Boolean);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

import fs from "node:fs/promises";
import path from "node:path";

export type VisualCompanionPaths = {
  repoRoot: string;
  rootAbsolute: string;
  rootRelative: string;
  plansAbsolute: string;
  plansRelative: string;
  recapsAbsolute: string;
  recapsRelative: string;
  readmePath: string;
};

export type EnsureVisualCompanionRootResult = VisualCompanionPaths & {
  created: boolean;
};

const VISUAL_COMPANION_ROOT = "docs/visual-companion";

const README_CONTENT = `# Visual Companion

Project-local visual companion artifacts live here.

- \`plans/\` stores local visual plan folders.
- \`recaps/\` stores local visual recap folders.
- Commit these files with the project unless your repo has a different explicit policy.
`;

export function visualCompanionPaths(repoRoot: string): VisualCompanionPaths {
  const normalizedRoot = path.resolve(repoRoot);
  return {
    repoRoot: normalizedRoot,
    rootAbsolute: path.join(normalizedRoot, VISUAL_COMPANION_ROOT),
    rootRelative: VISUAL_COMPANION_ROOT,
    plansAbsolute: path.join(normalizedRoot, VISUAL_COMPANION_ROOT, "plans"),
    plansRelative: `${VISUAL_COMPANION_ROOT}/plans`,
    recapsAbsolute: path.join(normalizedRoot, VISUAL_COMPANION_ROOT, "recaps"),
    recapsRelative: `${VISUAL_COMPANION_ROOT}/recaps`,
    readmePath: path.join(normalizedRoot, VISUAL_COMPANION_ROOT, "README.md"),
  };
}

export async function ensureVisualCompanionRoot(
  repoRoot: string,
): Promise<EnsureVisualCompanionRootResult> {
  const paths = visualCompanionPaths(repoRoot);
  let created = false;

  await fs.mkdir(paths.plansAbsolute, { recursive: true });
  await fs.mkdir(paths.recapsAbsolute, { recursive: true });

  try {
    await fs.writeFile(paths.readmePath, README_CONTENT, {
      encoding: "utf-8",
      flag: "wx",
    });
    created = true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EEXIST") throw error;
  }

  return { ...paths, created };
}

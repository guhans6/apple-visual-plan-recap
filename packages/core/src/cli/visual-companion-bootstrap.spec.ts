import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  ensureVisualCompanionRoot,
  visualCompanionPaths,
} from "./visual-companion-bootstrap.js";

const tmpRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tmpRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

async function tmpDir(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "an-visual-companion-"));
  tmpRoots.push(root);
  return root;
}

describe("visual companion bootstrap", () => {
  it("derives docs/visual-companion paths under the target repo", async () => {
    const repoRoot = await tmpDir();

    const paths = visualCompanionPaths(repoRoot);

    expect(paths.rootRelative).toBe("docs/visual-companion");
    expect(paths.plansRelative).toBe("docs/visual-companion/plans");
    expect(paths.recapsRelative).toBe("docs/visual-companion/recaps");
    expect(paths.rootAbsolute).toBe(path.join(repoRoot, "docs/visual-companion"));
  });

  it("creates the root folders and README idempotently", async () => {
    const repoRoot = await tmpDir();

    const first = await ensureVisualCompanionRoot(repoRoot);
    const second = await ensureVisualCompanionRoot(repoRoot);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(first.readmePath).toBe(
      path.join(repoRoot, "docs/visual-companion/README.md"),
    );
    await expect(fs.stat(first.plansAbsolute)).resolves.toBeTruthy();
    await expect(fs.stat(first.recapsAbsolute)).resolves.toBeTruthy();
    await expect(fs.readFile(first.readmePath, "utf-8")).resolves.toContain(
      "Project-local visual companion artifacts live here.",
    );
  });
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writePlanLocalFolder } from "./local-plan-files.js";
import { doctorCompanionFolder } from "./companion-doctor.js";
import type { PlanContent } from "../../shared/plan-content.js";

function sampleContent(): PlanContent {
  return {
    version: 2,
    title: "Settings sync",
    brief: "Review the local companion contract.",
    blocks: [
      {
        id: "summary",
        type: "rich-text",
        data: {
          markdown: "Settings sync summary.",
        },
      },
    ],
  };
}

describe("doctorCompanionFolder", () => {
  let tmpDir: string;
  let savedPlanLocalDir: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "companion-doctor-"));
    savedPlanLocalDir = process.env.PLAN_LOCAL_DIR;
    process.env.PLAN_LOCAL_DIR = tmpDir;

    await writePlanLocalFolder({
      slug: "settings-sync",
      planId: "local-settings-sync",
      title: "Settings sync",
      brief: "Review the local companion contract.",
      content: sampleContent(),
      url: "/companion/plans/settings-sync",
    });
  });

  afterEach(async () => {
    if (savedPlanLocalDir === undefined) delete process.env.PLAN_LOCAL_DIR;
    else process.env.PLAN_LOCAL_DIR = savedPlanLocalDir;
    delete process.env.PLAN_REPO_ROOT;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("recovers valid feedback events before a damaged tail and reports the damage", async () => {
    const folder = path.join(tmpDir, "settings-sync");
    await fs.writeFile(
      path.join(folder, "feedback.jsonl"),
      [
        JSON.stringify({
          type: "comment-created",
          id: "fb_1",
          message: "Tighten the summary.",
          anchor: {
            sectionId: "summary",
            textQuote: "Settings sync summary.",
            resolutionTarget: "agent",
          },
        }),
        '{"type":"comment-created","id":"fb_2"',
      ].join("\n"),
      "utf-8",
    );
    await fs.writeFile(
      path.join(folder, "evidence.jsonl"),
      `${JSON.stringify({
        evidenceId: "ev_1",
        kind: "test-result",
        summary: "No verification captured yet.",
      })}\n`,
      "utf-8",
    );
    await fs.writeFile(
      path.join(folder, "manifest.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        planId: "local-settings-sync",
        planKind: "plan",
        revisionDigest: "rev_settings_sync_v1",
        targets: [
          {
            id: "summary",
            sourcePath: "plan.mdx",
          },
        ],
      })}\n`,
      "utf-8",
    );

    const result = await doctorCompanionFolder({ slug: "settings-sync" });

    expect(result.canonicalFiles.authoritative).toEqual(
      expect.arrayContaining(["plan.mdx", "manifest.json"]),
    );
    expect(result.canonicalFiles.appendOnly).toEqual(
      expect.arrayContaining(["feedback.jsonl", "evidence.jsonl"]),
    );
    expect(result.canonicalFiles.disposable).toEqual([".plan-state.json"]);
    expect(result.feedback.validEventCount).toBe(1);
    expect(result.feedback.damagedTail).toBe(true);
    expect(result.evidence.validEventCount).toBe(1);
    expect(result.manifest.revisionDigest).toBe("rev_settings_sync_v1");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "damaged-jsonl-tail",
          file: "feedback.jsonl",
          severity: "warning",
        }),
      ]),
    );
  });

  it("reports manifest references that point at missing local files", async () => {
    const folder = path.join(tmpDir, "settings-sync");
    await fs.writeFile(
      path.join(folder, "manifest.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        planId: "local-settings-sync",
        planKind: "plan",
        revisionDigest: "rev_settings_sync_v2",
        targets: [
          {
            id: "summary",
            sourcePath: "plan.mdx",
          },
          {
            id: "missing-evidence",
            sourcePath: "evidence/missing-log.txt",
          },
        ],
      })}\n`,
      "utf-8",
    );

    const result = await doctorCompanionFolder({ slug: "settings-sync" });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "broken-reference",
          file: "manifest.json",
          severity: "warning",
        }),
      ]),
    );
  });

  it("treats escaped manifest reference paths as broken references", async () => {
    const folder = path.join(tmpDir, "settings-sync");
    await fs.writeFile(
      path.join(folder, "manifest.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        planId: "local-settings-sync",
        planKind: "plan",
        revisionDigest: "rev_settings_sync_v3",
        targets: [
          {
            id: "escaped-ref",
            sourcePath: "../outside.txt",
          },
        ],
      })}\n`,
      "utf-8",
    );

    const result = await doctorCompanionFolder({ slug: "settings-sync" });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "broken-reference",
          file: "manifest.json",
          severity: "warning",
          message: expect.stringContaining("../outside.txt"),
        }),
      ]),
    );
  });

  it("reports repo-relative workspace escapes instead of throwing", async () => {
    const repoRoot = path.join(tmpDir, "repo");
    const outsideRoot = path.join(tmpDir, "outside");
    await fs.mkdir(path.join(repoRoot, "plans"), { recursive: true });
    await fs.mkdir(path.join(repoRoot, "docs/plans"), { recursive: true });
    await fs.mkdir(outsideRoot, { recursive: true });
    await fs.symlink(outsideRoot, path.join(repoRoot, "docs/plans/current"));

    process.env.PLAN_LOCAL_DIR = path.join(repoRoot, "plans");
    process.env.PLAN_REPO_ROOT = repoRoot;

    const result = await doctorCompanionFolder({
      slug: "settings-sync",
      path: "docs/plans/current",
    });

    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "workspace-escape",
        severity: "error",
      }),
    ]);
  });
});

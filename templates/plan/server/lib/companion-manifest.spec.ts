import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { PlanContent } from "../../shared/plan-content.js";
import {
  buildCompanionManifest,
  readCompanionManifest,
} from "./companion-manifest.js";

describe("companion manifest", () => {
  it("persists stable document and canvas targets for a local plan", async () => {
    const folder = await fs.mkdtemp(
      path.join(os.tmpdir(), "companion-manifest-"),
    );
    const content: PlanContent = {
      version: 2,
      title: "Settings sync",
      brief: "Apple visual plan.",
      canvas: {
        title: "Workflow",
        frames: [
          {
            id: "settings-frame",
            label: "Settings",
            surface: "mobile",
            blockId: "settings-screen",
            x: 100,
            y: 80,
            width: 360,
            height: 640,
          },
        ],
      },
      blocks: [
        {
          id: "apple-evidence-panel",
          type: "table",
          title: "Evidence",
          data: {
            columns: ["Check", "Status"],
            rows: [["xcodebuild test", "not-run"]],
          },
        },
        {
          id: "settings-screen",
          type: "wireframe",
          title: "Settings screen",
          data: {
            surface: "mobile",
            screen: [{ id: "settings-toggle", el: "row" }],
          },
        },
      ],
    };

    const manifest = await buildCompanionManifest({
      folder,
      slug: "settings-sync",
      kind: "plan",
      content,
      sourceFiles: {
        "plan.mdx": [
          "# Settings sync",
          "",
          '<Table id="apple-evidence-panel" />',
          '<Wireframe id="settings-screen" />',
          "",
        ].join("\n"),
        "canvas.mdx": [
          "<Canvas>",
          '  <Artboard id="settings-frame" blockId="settings-screen" />',
          "</Canvas>",
          "",
        ].join("\n"),
      },
    });

    expect(manifest.targets.map((target) => target.id)).toEqual(
      expect.arrayContaining([
        "apple-evidence-panel",
        "settings-screen",
        "settings-frame",
      ]),
    );
    expect(
      manifest.targets.find((target) => target.id === "apple-evidence-panel"),
    ).toMatchObject({
      targetKind: "evidence-row",
      sourcePath: "plan.mdx",
      sourceRange: { startLine: 3, endLine: 3 },
    });
    expect(
      manifest.targets.find((target) => target.id === "settings-frame"),
    ).toMatchObject({
      targetKind: "canvas-frame",
      sourcePath: "canvas.mdx",
      linkedBlockId: "settings-screen",
    });
    await expect(readCompanionManifest(folder)).resolves.toMatchObject({
      version: 1,
      slug: "settings-sync",
      kind: "plan",
    });
  });
});

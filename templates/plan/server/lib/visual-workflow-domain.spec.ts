import { describe, expect, it } from "vitest";
import {
  buildVisualWorkflowContent,
  cursorVisualWorkflowTokens,
  selectVisualWorkflowDomainPack,
  visualWorkflowCaseMatrix,
  type VisualWorkflowProjectContext,
} from "./visual-workflow-domain.js";

const appleContext: VisualWorkflowProjectContext = {
  repoPath: "/work/MDZen",
  files: [
    "MDZen.xcodeproj/project.pbxproj",
    "Package.swift",
    "Sources/App/SettingsScene.swift",
    "Sources/App/ModelContainer.swift",
    "Sources/App/ShortcutsProvider.swift",
    "Widget/TimelineProvider.swift",
    "Tests/MDZenTests/SettingsTests.swift",
  ],
  textSignals: ["SwiftUI", "SwiftData", "AppIntent", "WidgetKit"],
};

describe("visual workflow domain packs", () => {
  it("selects Apple for Swift/Xcode context and reports explainable reasons", () => {
    const selected = selectVisualWorkflowDomainPack(appleContext);

    expect(selected.pack).toBe("apple");
    expect(selected.reason).toContain("MDZen.xcodeproj");
    expect(selected.reason).toContain("Package.swift");
    expect(selected.signals).toEqual(
      expect.arrayContaining(["xcodeproj", "swiftpm", "swiftui", "swiftdata"]),
    );
  });

  it("falls back to generic for non-Apple context and supports manual override", () => {
    const generic = selectVisualWorkflowDomainPack({
      repoPath: "/work/api",
      files: ["package.json", "src/server.ts", "tests/server.test.ts"],
      textSignals: ["Express", "Postgres"],
    });
    const forced = selectVisualWorkflowDomainPack(appleContext, "generic");

    expect(generic.pack).toBe("generic");
    expect(generic.reason).toContain("No Apple project signals");
    expect(forced.pack).toBe("generic");
    expect(forced.reason).toContain("Manual override");
  });

  it("builds generic plan and recap content with stable commentable blocks", () => {
    const plan = buildVisualWorkflowContent({
      kind: "plan",
      title: "Billing webhook refactor",
      brief: "Make webhook retry handling explicit.",
      context: {
        repoPath: "/work/api",
        files: ["src/webhooks/billing.ts", "tests/billing.test.ts"],
      },
    });
    const recap = buildVisualWorkflowContent({
      kind: "recap",
      title: "Billing webhook recap",
      brief: "Review the branch diff.",
      context: {
        repoPath: "/work/api",
        files: ["src/webhooks/billing.ts", "tests/billing.test.ts"],
      },
    });

    expect(plan.blocks.map((block) => block.id)).toEqual(
      expect.arrayContaining([
        "generic-overview",
        "generic-file-map",
        "generic-flow",
        "generic-evidence",
        "generic-risks",
        "generic-open-questions",
      ]),
    );
    expect(recap.blocks.map((block) => block.id)).toContain(
      "generic-diff-highlights",
    );
  });

  it("builds Apple plan content with workflow canvas, evidence, and decisions", () => {
    const content = buildVisualWorkflowContent({
      kind: "plan",
      title: "Settings sync plan",
      brief: "Plan the SwiftData-backed settings sync work.",
      context: appleContext,
    });

    expect(content.blocks[0]).toMatchObject({
      id: "apple-context",
      type: "callout",
    });
    expect(content.blocks.map((block) => block.id)).toEqual(
      expect.arrayContaining([
        "apple-context",
        "apple-target-scheme-map",
        "apple-workflow-canvas",
        "apple-data-migration",
        "apple-intents-widgets-extensions",
        "apple-evidence-panel",
        "apple-decision-form",
      ]),
    );
    expect(JSON.stringify(content.blocks)).toContain("SwiftData/Core Data");
    expect(JSON.stringify(content.blocks)).toContain("SwiftUI/UIKit/AppKit");
  });

  it("builds Apple recap content with verification evidence and residual risk", () => {
    const content = buildVisualWorkflowContent({
      kind: "recap",
      title: "Settings sync recap",
      brief: "Recap the Apple-platform branch.",
      context: appleContext,
    });

    expect(content.blocks.map((block) => block.id)).toEqual(
      expect.arrayContaining([
        "apple-recap-summary",
        "apple-changed-surfaces",
        "apple-swift-diff-highlights",
        "apple-verification-evidence",
        "apple-residual-risk",
      ]),
    );
    expect(JSON.stringify(content.blocks)).toContain("signing");
    expect(JSON.stringify(content.blocks)).toContain("privacy manifest");
    expect(JSON.stringify(content.blocks)).toContain("concurrency");
  });

  it("exports Cursor-inspired tokens and covers the declared case matrix", () => {
    expect(cursorVisualWorkflowTokens.canvas).toBe("#f7f7f4");
    expect(cursorVisualWorkflowTokens.primaryAccent).toBe("#f54e00");
    expect(cursorVisualWorkflowTokens.monoFont).toContain("JetBrains Mono");
    expect(visualWorkflowCaseMatrix.every((item) => item.status)).toBe(true);
    expect(visualWorkflowCaseMatrix.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "generic-plan",
        "generic-recap",
        "apple-plan",
        "apple-recap",
        "local-feedback-loop",
        "cursor-visual-layer",
      ]),
    );
  });
});

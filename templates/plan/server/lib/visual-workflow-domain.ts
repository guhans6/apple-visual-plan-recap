import type { PlanBlock, PlanContent } from "../../shared/plan-content.js";

export type VisualWorkflowDomainPack = "generic" | "apple";
export type VisualWorkflowKind = "plan" | "recap";

export interface VisualWorkflowProjectContext {
  repoPath?: string;
  files?: string[];
  textSignals?: string[];
}

export interface VisualWorkflowSelection {
  pack: VisualWorkflowDomainPack;
  reason: string;
  signals: string[];
}

export interface VisualWorkflowBuildInput {
  kind: VisualWorkflowKind;
  title: string;
  brief: string;
  context: VisualWorkflowProjectContext;
  override?: VisualWorkflowDomainPack;
}

export const cursorVisualWorkflowTokens = {
  canvas: "#f7f7f4",
  canvasSoft: "#fafaf7",
  surfaceCard: "#ffffff",
  ink: "#26251e",
  body: "#5a5852",
  muted: "#807d72",
  hairline: "#e6e5e0",
  hairlineStrong: "#cfcdc4",
  primaryAccent: "#f54e00",
  primaryActive: "#d04200",
  success: "#1f8a65",
  error: "#cf2d56",
  monoFont: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export const visualWorkflowCaseMatrix = [
  { id: "generic-plan", status: "implemented", surface: "plan" },
  { id: "generic-recap", status: "implemented", surface: "recap" },
  { id: "apple-plan", status: "implemented", surface: "plan" },
  { id: "apple-recap", status: "implemented", surface: "recap" },
  { id: "local-feedback-loop", status: "implemented", surface: "feedback" },
  { id: "cursor-visual-layer", status: "implemented", surface: "visual" },
] as const;

const appleSignalRules: Array<{
  signal: string;
  test: (value: string) => boolean;
}> = [
  { signal: "xcodeproj", test: (value) => value.includes(".xcodeproj") },
  { signal: "xcworkspace", test: (value) => value.includes(".xcworkspace") },
  { signal: "swiftpm", test: (value) => value.endsWith("Package.swift") },
  { signal: "swift", test: (value) => value.endsWith(".swift") },
  { signal: "swiftui", test: (value) => /swiftui/i.test(value) },
  { signal: "uikit", test: (value) => /uikit/i.test(value) },
  { signal: "appkit", test: (value) => /appkit/i.test(value) },
  { signal: "swiftdata", test: (value) => /swiftdata/i.test(value) },
  { signal: "app-intents", test: (value) => /appintent|app intents/i.test(value) },
  { signal: "widget", test: (value) => /widgetkit|widget/i.test(value) },
  { signal: "extension", test: (value) => /extension/i.test(value) },
];

export function selectVisualWorkflowDomainPack(
  context: VisualWorkflowProjectContext,
  override?: VisualWorkflowDomainPack,
): VisualWorkflowSelection {
  const haystack = [
    context.repoPath ?? "",
    ...(context.files ?? []),
    ...(context.textSignals ?? []),
  ];
  const signals = appleSignalRules
    .filter((rule) => haystack.some((value) => rule.test(value)))
    .map((rule) => rule.signal);

  if (override) {
    return {
      pack: override,
      signals,
      reason: `Manual override selected ${override} visual workflow.`,
    };
  }

  if (signals.length > 0) {
    const examples = orderedAppleReasonExamples(haystack).join(", ");
    return {
      pack: "apple",
      signals,
      reason: `Using Apple visual workflow because this repo contains ${examples}.`,
    };
  }

  return {
    pack: "generic",
    signals: [],
    reason: "No Apple project signals found; using generic visual workflow.",
  };
}

function orderedAppleReasonExamples(values: string[]) {
  const examples: string[] = [];
  for (const rule of appleSignalRules) {
    const value = values.find((item) => rule.test(item));
    if (value && !examples.includes(value)) examples.push(value);
    if (examples.length >= 3) break;
  }
  return examples;
}

export function buildVisualWorkflowContent(
  input: VisualWorkflowBuildInput,
): PlanContent {
  const selection = selectVisualWorkflowDomainPack(input.context, input.override);
  const blocks =
    selection.pack === "apple"
      ? buildAppleBlocks(input.kind, selection, input.context)
      : buildGenericBlocks(input.kind, selection, input.context);
  return {
    version: 2,
    title: input.title,
    brief: input.brief,
    blocks,
  };
}

function buildGenericBlocks(
  kind: VisualWorkflowKind,
  selection: VisualWorkflowSelection,
  context: VisualWorkflowProjectContext,
): PlanBlock[] {
  const files = context.files?.slice(0, 8) ?? [];
  return [
    callout("generic-overview", "Generic workflow selected", selection.reason),
    fileMap("generic-file-map", files),
    mermaid(
      "generic-flow",
      "Generic project flow",
      ["graph LR", "  Context-->Plan", "  Plan-->Review", "  Review-->Patch", "  Patch-->Verify"].join("\n"),
    ),
    ...(kind === "recap"
      ? [
          code(
            "generic-diff-highlights",
            "Diff highlights",
            "diff",
            files.map((file) => `+ review ${file}`).join("\n") || "+ review changed files",
          ),
        ]
      : []),
    table("generic-evidence", ["Check", "Status", "Notes"], [
      ["Build", "not-run", "Attach command output before handoff."],
      ["Tests", "not-run", "List focused tests and failures."],
      ["Runtime", "planned", "Capture logs or screenshots when relevant."],
    ]),
    checklist("generic-risks", [
      ["contracts", "API or data-contract drift"],
      ["migration", "Migration or rollback gaps"],
      ["verification", "Missing focused verification"],
    ]),
    questionForm("generic-open-questions", [
      "Which behavior is in scope for this slice?",
      "What evidence should gate merge?",
    ]),
  ];
}

function buildAppleBlocks(
  kind: VisualWorkflowKind,
  selection: VisualWorkflowSelection,
  context: VisualWorkflowProjectContext,
): PlanBlock[] {
  const files = context.files?.slice(0, 10) ?? [];
  if (kind === "recap") {
    return [
      callout("apple-recap-summary", "Apple recap selected", selection.reason),
      fileMap("apple-changed-surfaces", files),
      code(
        "apple-swift-diff-highlights",
        "Swift and project diff highlights",
        "diff",
        files.map((file) => `+ inspect ${file}`).join("\n"),
      ),
      table("apple-verification-evidence", ["Evidence", "Status", "Notes"], [
        ["xcodebuild test", "not-run", "Attach scheme and destination."],
        ["SwiftUI Preview", "not-run", "Capture preview or simulator screenshot."],
        ["Simulator/device", "not-run", "Record OS, device, and logs."],
        ["Accessibility", "planned", "Dynamic Type, VoiceOver, contrast."],
        ["Performance/memory/concurrency", "planned", "Profile high-risk paths."],
      ]),
      checklist("apple-residual-risk", [
        ["signing", "Signing, provisioning, entitlements, and capabilities"],
        ["privacy", "privacy manifest and data access review"],
        ["migration", "SwiftData/Core Data migration and rollback"],
        ["concurrency", "MainActor, Sendable, cancellation, and races"],
        ["release", "TestFlight, App Store review, and platform availability"],
      ]),
    ];
  }

  return [
    callout("apple-context", "Apple workflow selected", selection.reason),
    fileMap("apple-target-scheme-map", files),
    mermaid(
      "apple-workflow-canvas",
      "Apple workflow canvas",
      [
        "flowchart LR",
        "  Xcode[Targets + schemes] --> UI[SwiftUI/UIKit/AppKit surfaces]",
        "  UI --> Data[SwiftData/Core Data]",
        "  Data --> Verify[Build, test, preview, simulator]",
        "  UI --> Extensions[App Intents, widgets, extensions]",
        "  Verify --> Release[Signing, privacy, TestFlight]",
      ].join("\n"),
    ),
    table("apple-data-migration", ["Area", "Questions", "Evidence"], [
      ["SwiftData/Core Data", "Model changes, migrations, delete rules", "Migration test or dry run"],
      ["Persistence boundary", "App group, widget, extension sharing", "Container and entitlement check"],
    ]),
    mermaid(
      "apple-intents-widgets-extensions",
      "Intents, widgets, and extensions",
      [
        "graph TD",
        "  App[App target] --> Intent[App Intent]",
        "  App --> Widget[Widget extension]",
        "  App --> Extension[Other extensions]",
        "  Intent --> Shortcuts[Shortcuts/Siri]",
        "  Widget --> SharedData[Shared data boundary]",
      ].join("\n"),
    ),
    table("apple-evidence-panel", ["Check", "Status", "Artifact"], [
      ["Build", "not-run", "xcodebuild build or swift build"],
      ["Tests", "not-run", "XCTest or Swift Testing output"],
      ["Preview", "not-run", "SwiftUI Preview screenshot"],
      ["Simulator/device", "not-run", "Screenshot and logs"],
      ["Accessibility/privacy/performance", "planned", "Focused review notes"],
    ]),
    questionForm("apple-decision-form", [
      "Which target, scheme, and destination must verify this slice?",
      "Are entitlements, privacy manifests, widgets, intents, or extensions touched?",
      "What residual release risk remains after verification?",
    ]),
  ];
}

function callout(id: string, title: string, body: string): PlanBlock {
  return { id, type: "callout", title, data: { tone: "info", body } };
}

function fileMap(id: string, files: string[]): PlanBlock {
  return {
    id,
    type: "implementation-map",
    title: "File and module map",
    data: {
      files: (files.length ? files : ["<project files>"]).map((file) => ({
        path: file,
        note: "Review scope and ownership for this workflow.",
      })),
    },
  };
}

function mermaid(id: string, title: string, source: string): PlanBlock {
  return { id, type: "mermaid", title, data: { source } };
}

function code(
  id: string,
  title: string,
  language: string,
  source: string,
): PlanBlock {
  return { id, type: "code", title, data: { language, code: source } };
}

function table(id: string, columns: string[], rows: string[][]): PlanBlock {
  return { id, type: "table", title: id, data: { columns, rows, density: "compact" } };
}

function checklist(id: string, items: Array<[string, string]>): PlanBlock {
  return {
    id,
    type: "checklist",
    title: id,
    data: {
      items: items.map(([itemId, label]) => ({
        id: itemId,
        label,
        checked: false,
      })),
    },
  };
}

function questionForm(id: string, questions: string[]): PlanBlock {
  return {
    id,
    type: "question-form",
    title: "Open decisions",
    data: {
      questions: questions.map((question, index) => ({
        id: `${id}-${index + 1}`,
        mode: "freeform",
        title: question,
        required: false,
      })),
      submitLabel: "Send to agent",
    },
  };
}

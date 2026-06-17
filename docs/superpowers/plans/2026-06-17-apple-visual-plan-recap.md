# Apple Visual Plan/Recap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Apple-focused visual planning and recap workflow where developers and agents collaborate through rendered plans, diffs, diagrams, annotations, and feedback instead of chat-only text.

**Architecture:** Keep the fork narrow: an Apple-only skills repo with only `/visual-plan` and `/visual-recap`, plus a separate self-hostable Agent-Native Plan app fork/spike. The skills generate structured MDX plan artifacts tuned for Apple development, and the Plan app renders them, accepts comments/annotations, and exposes feedback back to the agent through MCP/local files.

**Tech Stack:** Markdown/MDX skills, Agent-Native Plan template, Node 22, pnpm, React/React Router, MCP, local-files mode, optional self-hosted HTTP MCP, Swift/Xcode workflow conventions.

---

## Scope

This is not an Apple UI generator. The visual surface should help an Apple developer understand and steer work:

- SwiftUI/AppKit/UIKit screen states and navigation flows as review aids.
- Xcode target/scheme/test flow diagrams.
- SwiftData/Core Data/schema diagrams.
- App Intents, widgets, permissions, background tasks, and platform availability maps.
- PR/branch recaps with file trees, annotated diffs, risk notes, and verification evidence.
- Figma-like comments/annotations on rendered plan blocks so the developer can tell the agent what to change.
- A local feedback sidecar so comments survive outside hosted Plan DB storage and are readable by the coding agent.

This MVP should not publish a public package yet. It should prove local/self-hosted usefulness first.

## Review Update: Local Feedback Reality

External review corrected an important assumption: upstream local-files mode gives local `plan.mdx`, optional `canvas.mdx`, optional `prototype.mdx`, and `.plan-state.json`, but it does not currently provide browser comments/annotations by default in the local route.

Verified against the upstream checkout:

- `templates/plan/actions/get-local-plan-folder.ts` builds local plan bundles with `comments: []` and `events: []`.
- `templates/plan/app/pages/PlansPage.tsx` hides `ReviewMarkupToolbar`, comment visibility controls, and "Send to agent" while `localPlanMode` is true.
- DB-backed hosted/self-hosted comments already have the right model: `plan_comments` includes anchors, replies, status, `resolution_target`, `resolved_at`, and `consumed_at`.
- `get-plan-feedback` already groups actionable agent-targeted feedback, human-review feedback, visual threads, detached anchors, and consumed/unconsumed state.

Therefore the MVP must include a new local feedback layer instead of relying on upstream local-files behavior.

## Repository Layout

Use the existing workspace root:

- Existing audit clone: `BuilderIO-skills/`
- Existing dependency/source clone: `BuilderIO-agent-native/`
- New fork workspace: `apple-visual-skills/`
- New self-host spike workspace: `apple-plan-app/`
- Planning docs: `docs/`

Planned files:

- Create: `apple-visual-skills/.codex-plugin/plugin.json`
- Create: `apple-visual-skills/.claude-plugin/plugin.json`
- Create: `apple-visual-skills/LICENSE`
- Create: `apple-visual-skills/README.md`
- Create: `apple-visual-skills/skills/visual-plan/SKILL.md`
- Create: `apple-visual-skills/skills/visual-plan/README.md`
- Create: `apple-visual-skills/skills/visual-plan/references/apple-plan-blocks.md`
- Create: `apple-visual-skills/skills/visual-plan/references/apple-workflow-examples.md`
- Create: `apple-visual-skills/skills/visual-plan/references/local-feedback-contract.md`
- Create: `apple-visual-skills/skills/visual-recap/SKILL.md`
- Create: `apple-visual-skills/skills/visual-recap/README.md`
- Create: `apple-visual-skills/skills/visual-recap/references/apple-recap-examples.md`
- Create: `apple-visual-skills/skills/visual-recap/references/local-feedback-contract.md`
- Create: `apple-visual-skills/docs/SELF_HOSTING.md`
- Create: `apple-visual-skills/docs/WORKFLOW.md`
- Create: `apple-visual-skills/scripts/check-skill-content.mjs`
- Create: `apple-visual-skills/package.json`
- Create: `apple-plan-app/README.md`
- Create: `apple-plan-app/.env.example`
- Create: `apple-plan-app/docs/APPLE_WORKFLOW.md`
- Create: `apple-plan-app/docs/LOCAL_FEEDBACK.md`
- Create: `apple-plan-app/scripts/get-local-feedback.mjs`
- Create: `apple-plan-app/scripts/consume-local-feedback.mjs`
- Modify: `apple-plan-app/actions/get-local-plan-folder.ts`
- Modify: `apple-plan-app/app/pages/PlansPage.tsx`
- Create or modify: `apple-plan-app/server/lib/local-feedback-files.ts`

## Design Decisions

- Keep the skills text-first and Apple-specific; the Plan app remains the renderer/collaboration surface.
- Default to `local-files` mode for private Apple work. Hosted Builder/Agent-Native URLs must be examples only, not default behavior.
- Treat self-hosted DB mode as Phase 2. The MVP collaboration loop must work without hosted Plan DB writes.
- Store local comments in sidecar files beside the MDX plan. Do not rely on browser `localStorage`, because the agent must be able to read and update feedback.
- Every rendered block that can receive feedback must have a stable `id`, and the renderer must expose a stable `data-block-id` or equivalent anchor.
- Do not include telemetry in our own installer/docs.
- Avoid using Apple trademarks in package names as if this were official. Use names like `apple-visual-skills` or `mac-ios-visual-skills`, not "Apple Plan" as a brand.
- Preserve upstream license notices for copied MIT/ISC code and verify exact licensing before publishing.
- Treat MDX as the source format because it is readable to agents while carrying structured blocks. Validate real block tags against the Plan block catalog before authoring examples.

---

### Task 1: Create The Apple-Only Skills Fork

**Files:**
- Create: `apple-visual-skills/.codex-plugin/plugin.json`
- Create: `apple-visual-skills/.claude-plugin/plugin.json`
- Create: `apple-visual-skills/LICENSE`
- Create: `apple-visual-skills/package.json`
- Create: `apple-visual-skills/README.md`

- [ ] **Step 1: Copy only the visual skills into a new folder**

Run:

```bash
mkdir -p apple-visual-skills/skills
cp -R BuilderIO-skills/skills/visual-plan apple-visual-skills/skills/visual-plan
cp -R BuilderIO-skills/skills/visual-recap apple-visual-skills/skills/visual-recap
cp BuilderIO-skills/LICENSE apple-visual-skills/LICENSE
```

Expected: `apple-visual-skills/skills` contains only `visual-plan` and `visual-recap`.

- [ ] **Step 2: Add minimal package metadata**

Create `apple-visual-skills/package.json`:

```json
{
  "name": "apple-visual-skills",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "Apple-focused visual planning and recap skills for coding agents.",
  "license": "MIT",
  "scripts": {
    "check": "node scripts/check-skill-content.mjs"
  }
}
```

- [ ] **Step 3: Add Codex plugin metadata**

Create `apple-visual-skills/.codex-plugin/plugin.json`:

```json
{
  "name": "apple-visual-skills",
  "version": "0.0.0",
  "description": "Apple-focused visual plan and recap skills for Swift, iOS, macOS, watchOS, tvOS, and visionOS development.",
  "author": {
    "name": "Local"
  },
  "license": "MIT",
  "keywords": ["apple", "swift", "xcode", "swiftui", "visual-plan", "visual-recap"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Apple Visual Skills",
    "shortDescription": "Visual planning and recap workflows for Apple developers.",
    "longDescription": "A narrow skills pack for Apple-platform development planning and review. It uses visual plans, recaps, diagrams, file maps, annotated diffs, and comments to help developers and agents collaborate.",
    "developerName": "Local",
    "category": "Development",
    "capabilities": ["Read", "Write"],
    "defaultPrompt": [
      "Use Apple Visual Skills when visual planning or visual recap applies",
      "Default to local-files or self-hosted Plan mode",
      "Use Apple docs and Xcode evidence when platform semantics matter"
    ]
  }
}
```

- [ ] **Step 4: Add Claude plugin metadata**

Create `apple-visual-skills/.claude-plugin/plugin.json`:

```json
{
  "name": "apple-visual-skills",
  "displayName": "Apple Visual Skills",
  "description": "Apple-focused visual plan and recap skills for Swift, iOS, macOS, watchOS, tvOS, and visionOS development.",
  "author": {
    "name": "Local"
  },
  "license": "MIT",
  "keywords": ["apple", "swift", "xcode", "swiftui", "visual-plan", "visual-recap"],
  "skills": "./skills/"
}
```

- [ ] **Step 5: Verify only two skills are present**

Run:

```bash
find apple-visual-skills/skills -maxdepth 2 -name SKILL.md -print | sort
```

Expected:

```text
apple-visual-skills/skills/visual-plan/SKILL.md
apple-visual-skills/skills/visual-recap/SKILL.md
```

- [ ] **Step 6: Commit**

```bash
git add apple-visual-skills
git commit -m "feat: create apple visual skills fork"
```

---

### Task 2: Rewrite `/visual-plan` For Apple Development

**Files:**
- Modify: `apple-visual-skills/skills/visual-plan/SKILL.md`
- Modify: `apple-visual-skills/skills/visual-plan/README.md`
- Create: `apple-visual-skills/skills/visual-plan/references/apple-plan-blocks.md`
- Create: `apple-visual-skills/skills/visual-plan/references/apple-workflow-examples.md`

- [ ] **Step 1: Replace hosted-first language with Apple local/self-hosted language**

In `apple-visual-skills/skills/visual-plan/SKILL.md`, make these rules explicit near the top:

```markdown
## Apple Visual Plan Defaults

Use this skill for Apple-platform implementation planning when a visual review surface would make the work easier to understand than chat-only text.

Default to local-files or self-hosted Plan mode. Do not publish plan content to a third-party hosted Plan service unless the user explicitly asks for that hosted service.

This skill does not generate production Apple UI by default. It creates a visual collaboration artifact: diagrams, screen-state sketches, architecture maps, file trees, annotated code, questions, and feedback anchors that help the developer and agent agree on what should be built.
```

- [ ] **Step 2: Add Apple-specific plan surfaces**

Add this section:

```markdown
## Apple Plan Surfaces

Choose the smallest useful visual surface:

- Navigation flow: app scenes, windows, sheets, tabs, split views, deep links, and modal paths.
- Screen-state matrix: loading, empty, error, permission denied, logged out, subscribed, offline, and platform-specific states.
- Architecture map: Swift packages, app targets, extensions, widgets, intents, services, persistence, and networking boundaries.
- Xcode verification flow: schemes, destinations, test bundles, previews, simulator/device runs, and logs.
- Data model: SwiftData/Core Data entities, migrations, CloudKit sync boundaries, document formats, cache shape, and ownership.
- Platform availability: iOS/macOS/watchOS/tvOS/visionOS version gates and fallback behavior.
- App Store/TestFlight flow: entitlements, signing, privacy manifests, capabilities, review notes, and rollout gates.
```

- [ ] **Step 3: Add local-files output contract**

Add this contract:

```markdown
## Local Files Contract

When MCP Plan tools are unavailable or when privacy matters, write the plan as local MDX:

- `plans/<slug>/plan.mdx` for the document body.
- `plans/<slug>/canvas.mdx` when the plan has a top visual map.
- `plans/<slug>/.plan-state.json` for local-only metadata when supported.

Use frontmatter:

```mdx
---
title: "Short Apple Workflow Plan"
kind: "plan"
localOnly: true
platforms: ["iOS", "macOS"]
---
```

Run the local Plan bridge when available:

```bash
npx @agent-native/core@latest plan local serve --dir plans/<slug> --kind plan --open
```
```

- [ ] **Step 4: Add Apple block reference**

Create `apple-visual-skills/skills/visual-plan/references/apple-plan-blocks.md`:

```markdown
# Apple Plan Block Guidance

Use ordinary Markdown for the plan narrative. Use structured MDX blocks only when they improve review.

Recommended blocks:

- `diagram`: app architecture, navigation, state machines, data sync, background task flow.
- `file-tree`: target files, Swift packages, test files, previews, generated artifacts.
- `diff` or `annotated-code`: proposed load-bearing Swift changes.
- `data-model`: SwiftData/Core Data/schema shape.
- `columns`: before/after behavior or platform comparison.
- `tabs`: iOS/macOS variants, implementation options, test destinations.
- `question-form`: decisions the developer must make before coding.

Apple-specific labels to use consistently:

- `Target`
- `Scheme`
- `Destination`
- `Simulator`
- `Device`
- `Preview`
- `Entitlement`
- `Capability`
- `Privacy Manifest`
- `App Intent`
- `Widget`
- `Extension`
- `Migration`
- `Availability`
- `Accessibility`
```

- [ ] **Step 5: Add examples**

Create `apple-visual-skills/skills/visual-plan/references/apple-workflow-examples.md`:

```markdown
# Apple Visual Plan Examples

## SwiftUI Feature

Plan should show:

- Entry screen and changed interaction surface.
- State matrix for loading, empty, error, and permission states.
- Files: view, view model/store, model, service, tests, previews.
- Verification: Swift tests, Xcode build, preview/simulator screenshot.

## SwiftData Migration

Plan should show:

- Entity diagram before and after.
- Migration policy and fallback.
- Files: model, migration tests, fixture store, UI read path.
- Verification: migration fixture test and app launch with migrated store.

## App Intent

Plan should show:

- Intent phrase/surface.
- Entity/query model.
- Privacy and authorization assumptions.
- Verification: Shortcuts/App Intents build, simulator invocation, unit coverage.
```

- [ ] **Step 6: Update README**

Rewrite `apple-visual-skills/skills/visual-plan/README.md` so the first paragraph says:

```markdown
# Apple Visual Plan

Create a rendered collaboration plan for Apple-platform work before implementation. The output is a structured MDX plan that can be opened in a local or self-hosted Plan app so the developer can review diagrams, file maps, screen-state sketches, annotated code, open questions, and comments before the agent edits code.
```

- [ ] **Step 7: Run content check**

Run:

```bash
rg -n "plan.agent-native.com|hosted default|NEVER hand the plan|Builder Skills|Builder.io" apple-visual-skills/skills/visual-plan
```

Expected: no results, except allowed references in a migration note if intentionally kept.

- [ ] **Step 8: Commit**

```bash
git add apple-visual-skills/skills/visual-plan
git commit -m "feat: tailor visual plan for apple workflows"
```

---

### Task 3: Rewrite `/visual-recap` For Apple Code Review

**Files:**
- Modify: `apple-visual-skills/skills/visual-recap/SKILL.md`
- Modify: `apple-visual-skills/skills/visual-recap/README.md`
- Create: `apple-visual-skills/skills/visual-recap/references/apple-recap-examples.md`

- [ ] **Step 1: Add Apple recap purpose**

Add this near the top of `SKILL.md`:

```markdown
## Apple Visual Recap Defaults

Use this skill after a branch, PR, commit, or working-tree diff changes Apple-platform code and the reviewer would benefit from a rendered overview before reading raw diffs.

Default to local-files or self-hosted Plan mode. Do not publish code, diffs, screenshots, or plan content to a third-party hosted service unless the user explicitly asks.

The recap is not a replacement for code review. It is a visual map of what changed, why it matters, how to verify it, and where the reviewer should focus.
```

- [ ] **Step 2: Add Apple recap coverage**

Add this checklist:

```markdown
## Apple Recap Coverage

Every substantial Apple recap should include:

- Changed targets, schemes, packages, extensions, widgets, intents, or previews.
- User-visible surfaces affected, including platform variants.
- Architecture or data flow changes.
- Load-bearing Swift diffs with annotations.
- Verification evidence: `swift test`, `swift build`, `xcodebuild`, simulator/device run, preview build, screenshots, or logs.
- Residual risk: platform availability, signing, entitlements, migrations, performance, accessibility, privacy, App Store review.
```

- [ ] **Step 3: Add examples**

Create `apple-visual-skills/skills/visual-recap/references/apple-recap-examples.md`:

```markdown
# Apple Visual Recap Examples

## SwiftUI Screen Refactor

Blocks:

- `columns`: before/after layout behavior.
- `file-tree`: view, extracted components, tests, previews.
- `diff`: load-bearing state and binding changes.
- `diagram`: data flow from model/store to view.

## Xcode Build Fix

Blocks:

- `diagram`: target/scheme/dependency relationship.
- `diff`: project/package/config changes.
- `rich-text`: root cause and why the fix is scoped.
- `file-tree`: changed project files and source files.

## Persistence Migration

Blocks:

- `data-model`: old and new model shape.
- `diff`: migration code.
- `rich-text`: compatibility and rollback note.
- `tabs`: migration fixture, app launch, UI read-path verification.
```

- [ ] **Step 4: Preserve secret redaction rules**

Keep or add:

```markdown
## Secret And Private Data Rule

Never transcribe secrets, provisioning profiles, signing certificates, API keys, tokens, webhook URLs, `.env` values, user private data, or credential-looking literals into a visual recap. Redact as `<redacted>` or `sk-...`.
```

- [ ] **Step 5: Run content check**

Run:

```bash
rg -n "plan.agent-native.com|hosted publish|NEVER hand the recap|Builder Skills|Builder.io" apple-visual-skills/skills/visual-recap
```

Expected: no results, except allowed references in a migration note if intentionally kept.

- [ ] **Step 6: Commit**

```bash
git add apple-visual-skills/skills/visual-recap
git commit -m "feat: tailor visual recap for apple code review"
```

---

### Task 4: Add Workflow Documentation For Developers

**Files:**
- Create: `apple-visual-skills/docs/WORKFLOW.md`
- Create: `apple-visual-skills/docs/SELF_HOSTING.md`
- Modify: `apple-visual-skills/README.md`

- [ ] **Step 1: Create workflow docs**

Create `apple-visual-skills/docs/WORKFLOW.md`:

```markdown
# Apple Visual Workflow

## Before Coding

1. Developer asks for `/visual-plan`.
2. Agent inspects the real Apple project: packages, Xcode project/workspace, schemes, targets, app surfaces, tests, previews, and docs.
3. Agent writes a structured MDX plan.
4. Plan opens in local or self-hosted Plan app.
5. Developer annotates blocks, asks questions, chooses options, or requests changes.
6. Agent reads feedback and updates the plan.
7. Implementation starts only after the plan is approved or the developer says to proceed.

## After Coding

1. Developer asks for `/visual-recap`.
2. Agent reads the branch/PR/working-tree diff.
3. Agent creates a visual recap with file tree, diagrams, annotated diffs, verification, and risks.
4. Developer comments directly on rendered blocks.
5. Agent reads comments and fixes gaps or updates the recap.

## What This Improves

- Less wall-of-text planning.
- Easier review of multi-file Swift/Xcode changes.
- Clearer handoff for architecture, UI state, data migrations, and verification.
- Developer feedback becomes anchored to a specific visual block or code excerpt.
```

- [ ] **Step 2: Create self-hosting docs**

Create `apple-visual-skills/docs/SELF_HOSTING.md`:

```markdown
# Self Hosting

The Apple visual skills can run in three modes:

## Local Files

The agent writes `plans/<slug>/plan.mdx` and optional `canvas.mdx`. The Plan app reads from disk through a local bridge. This is the default privacy-first mode.

## Self-Hosted Plan App

Fork or copy the Agent-Native `templates/plan` app into a separate repo or folder. Configure:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `A2A_SECRET`
- optional `GOOGLE_CLIENT_ID`
- optional `GOOGLE_CLIENT_SECRET`

Then connect agents to the self-hosted MCP URL:

```bash
npx @agent-native/core@latest connect https://your-plan-host.example.com --client codex
```

## Hosted Third-Party Plan

Use only when explicitly approved for a task. Do not make this the default for private Apple code.
```

- [ ] **Step 3: Create root README**

Create `apple-visual-skills/README.md`:

```markdown
# Apple Visual Skills

Apple-focused `/visual-plan` and `/visual-recap` skills for coding agents.

This project is a narrow fork/spike inspired by BuilderIO skills and Agent-Native Plan. It keeps only the visual planning and recap workflow, then tunes it for Swift, Xcode, SwiftUI, UIKit, AppKit, SwiftData, App Intents, widgets, TestFlight, and App Store review.

## What You Can Do

- Plan Apple features visually before coding.
- Review branch/PR diffs as rendered recaps.
- Annotate diagrams, file maps, screen-state sketches, and code excerpts.
- Feed structured comments back to the agent.
- Keep plan artifacts as local MDX files.
- Self-host the Plan app when sharing/commenting is useful.

## What This Is Not

- Not an official Apple project.
- Not a production UI generator.
- Not a replacement for Swift/Xcode tests or real code review.
- Not intended to send private code to a third-party service by default.
```

- [ ] **Step 4: Commit**

```bash
git add apple-visual-skills/README.md apple-visual-skills/docs
git commit -m "docs: describe apple visual workflow"
```

---

### Task 5: Create Self-Hosted Plan App Spike

**Files:**
- Create: `apple-plan-app/README.md`
- Create: `apple-plan-app/.env.example`
- Create: `apple-plan-app/docs/APPLE_WORKFLOW.md`

- [ ] **Step 1: Copy the upstream Plan template**

Run:

```bash
cp -R BuilderIO-agent-native/templates/plan apple-plan-app
```

Expected: `apple-plan-app/package.json`, `apple-plan-app/app`, `apple-plan-app/actions`, and `apple-plan-app/server` exist.

- [ ] **Step 2: Preserve upstream licensing notes**

Create `apple-plan-app/README.md` with:

```markdown
# Apple Plan App Spike

This folder is a local/self-hosting spike based on the Agent-Native Plan template.

Before publishing or redistributing, verify the upstream Agent-Native repository license and preserve required notices. The current goal is private local evaluation, not public release.

## Goal

Provide a rendered collaboration surface for Apple visual plans and recaps:

- MDX rendering.
- Diagrams and structured plan blocks.
- Comments and annotations.
- Agent-readable feedback.
- Local-files and self-hosted operation.

## First Test

Run the app locally, open a sample Apple visual plan, add a comment, and confirm the agent can read that feedback.

Important: upstream local plan mode currently disables the hosted/DB-backed comment controls. The first local test should confirm rendering only. Local comments are implemented in Tasks 5A-5D.
```

- [ ] **Step 3: Create Apple-specific environment example**

Create `apple-plan-app/.env.example`:

```bash
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:8081
DATABASE_URL=
A2A_SECRET=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PLAN_LOCAL_DIR=./plans
PLAN_LOCAL_MODE=1
```

- [ ] **Step 4: Add workflow note**

Create `apple-plan-app/docs/APPLE_WORKFLOW.md`:

```markdown
# Apple Workflow In The Plan App

The app should be evaluated against these flows:

1. Open a local visual plan from `plans/<slug>/plan.mdx`.
2. Render Apple architecture diagrams and file maps.
3. Add a comment to a specific block.
4. Resolve or reply to a comment.
5. Export or read feedback through MCP/local files.
6. Update the MDX and confirm the rendered surface changes.

Do not customize Apple UI styling until the collaboration flow works.
```

- [ ] **Step 5: Commit**

```bash
git add apple-plan-app
git commit -m "feat: add self-hosted plan app spike"
```

---

### Task 5A: Add Local Feedback Data Contract

**Files:**
- Create: `apple-plan-app/docs/LOCAL_FEEDBACK.md`
- Create: `apple-visual-skills/skills/visual-plan/references/local-feedback-contract.md`
- Create: `apple-visual-skills/skills/visual-recap/references/local-feedback-contract.md`
- Create or modify: `apple-plan-app/server/lib/local-feedback-files.ts`

- [ ] **Step 1: Document the local sidecar files**

Create `apple-plan-app/docs/LOCAL_FEEDBACK.md`:

````markdown
# Local Feedback

Local plan mode stores human feedback beside the MDX source so a coding agent can read and act on comments without hosted Plan database writes.

Every local plan folder may contain:

- `plan.mdx` — source document.
- `canvas.mdx` — optional top visual surface.
- `.plan-state.json` — local plan metadata and block index.
- `feedback.jsonl` — append-only feedback events.
- `feedback-state.json` — compact current index for fast reads.

Do not store local feedback only in browser localStorage. The agent must be able to read it from files.

## Event Shape

```json
{
  "id": "cmt_001",
  "event": "feedback_created",
  "planSlug": "swiftui-settings-plan",
  "targetBlockId": "settings-file-tree",
  "targetKind": "file-tree",
  "anchorKind": "block",
  "message": "Need macOS Settings window placement clarified.",
  "resolutionTarget": "agent",
  "status": "open",
  "createdBy": "human",
  "createdAt": "2026-06-17T00:00:00.000Z",
  "consumedAt": null
}
```

## Required Fields

- `id`
- `event`
- `planSlug`
- `targetBlockId`
- `targetKind`
- `anchorKind`
- `message`
- `resolutionTarget`
- `status`
- `createdBy`
- `createdAt`
- `consumedAt`

## Status Rules

- `open`: reviewer expects action or discussion.
- `resolved`: reviewer-facing issue is handled.
- `consumed`: agent has ingested the feedback and acted or explicitly deferred it.

Resolved feedback remains visible in the UI. Consumed feedback is excluded from default agent reads but remains in `feedback.jsonl` for audit.
````

- [ ] **Step 2: Add skill reference docs**

Create `apple-visual-skills/skills/visual-plan/references/local-feedback-contract.md`:

```markdown
# Local Feedback Contract

When creating local Apple visual plans, every commentable block must have a stable `id`.

The local Plan app writes human comments to:

- `feedback.jsonl`
- `feedback-state.json`

The agent must read open `resolutionTarget: "agent"` feedback before updating the plan. After acting, the agent must append a consumed event or call the local consume script.
```

Create `apple-visual-skills/skills/visual-recap/references/local-feedback-contract.md`:

```markdown
# Local Feedback Contract

When creating local Apple visual recaps, every commentable block must have a stable `id`.

The local Plan app writes reviewer comments to:

- `feedback.jsonl`
- `feedback-state.json`

The agent must read open `resolutionTarget: "agent"` feedback before changing code, updating the recap, or claiming review feedback has been addressed.
```

- [ ] **Step 3: Implement file helpers**

Create `apple-plan-app/server/lib/local-feedback-files.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { assertLocalPlanSlug, localPlansDir } from "./local-plan-files.js";

export type LocalFeedbackStatus = "open" | "resolved" | "consumed";
export type LocalFeedbackResolutionTarget = "agent" | "human";

export interface LocalFeedbackEvent {
  id: string;
  event: "feedback_created" | "feedback_replied" | "feedback_resolved" | "feedback_reopened" | "feedback_consumed";
  planSlug: string;
  targetBlockId: string;
  targetKind: string;
  anchorKind: "block" | "text" | "point" | "visual";
  message: string;
  resolutionTarget: LocalFeedbackResolutionTarget;
  status: LocalFeedbackStatus;
  createdBy: "human" | "agent";
  createdAt: string;
  consumedAt: string | null;
  parentId?: string | null;
}

export interface LocalFeedbackState {
  version: 1;
  planSlug: string;
  updatedAt: string;
  open: LocalFeedbackEvent[];
  resolved: LocalFeedbackEvent[];
  consumed: LocalFeedbackEvent[];
}

export function localFeedbackFolder(slug: string): string {
  return path.join(localPlansDir(), assertLocalPlanSlug(slug));
}

export function localFeedbackJsonlPath(slug: string): string {
  return path.join(localFeedbackFolder(slug), "feedback.jsonl");
}

export function localFeedbackStatePath(slug: string): string {
  return path.join(localFeedbackFolder(slug), "feedback-state.json");
}

export async function readLocalFeedbackEvents(slug: string): Promise<LocalFeedbackEvent[]> {
  try {
    const body = await fs.readFile(localFeedbackJsonlPath(slug), "utf8");
    return body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LocalFeedbackEvent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function appendLocalFeedbackEvent(event: LocalFeedbackEvent): Promise<void> {
  const folder = localFeedbackFolder(event.planSlug);
  await fs.mkdir(folder, { recursive: true });
  await fs.appendFile(localFeedbackJsonlPath(event.planSlug), `${JSON.stringify(event)}\n`, "utf8");
  await writeLocalFeedbackState(event.planSlug);
}

export async function writeLocalFeedbackState(slug: string): Promise<LocalFeedbackState> {
  const events = await readLocalFeedbackEvents(slug);
  const state: LocalFeedbackState = {
    version: 1,
    planSlug: slug,
    updatedAt: new Date().toISOString(),
    open: events.filter((event) => event.status === "open" && !event.consumedAt),
    resolved: events.filter((event) => event.status === "resolved" && !event.consumedAt),
    consumed: events.filter((event) => Boolean(event.consumedAt) || event.status === "consumed"),
  };
  await fs.writeFile(localFeedbackStatePath(slug), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}
```

- [ ] **Step 4: Commit**

```bash
git add apple-plan-app/docs/LOCAL_FEEDBACK.md apple-plan-app/server/lib/local-feedback-files.ts apple-visual-skills/skills/visual-plan/references/local-feedback-contract.md apple-visual-skills/skills/visual-recap/references/local-feedback-contract.md
git commit -m "feat: define local visual feedback contract"
```

---

### Task 5B: Add Local Comment UI To The Plan App

**Files:**
- Modify: `apple-plan-app/actions/get-local-plan-folder.ts`
- Modify: `apple-plan-app/app/pages/PlansPage.tsx`
- Modify: `apple-plan-app/server/lib/local-feedback-files.ts`

- [ ] **Step 1: Include local feedback in local plan bundles**

Modify `apple-plan-app/actions/get-local-plan-folder.ts` to read feedback events and summary for the local slug. The returned local bundle must no longer hardcode `comments: []` without also reading `feedback.jsonl`.

Implementation rule:

```ts
const feedbackEvents = await readLocalFeedbackEvents(local.slug);
const comments = localFeedbackEventsToPlanComments(feedbackEvents);
```

Add a converter in `local-feedback-files.ts` that maps local sidecar events to the existing `PlanBundle["comments"]` shape so the current comment rail can be reused.

- [ ] **Step 2: Enable review controls in local mode**

Modify `PlansPage.tsx` so local mode can show a local review toolbar. The MVP can reuse the existing comment UI, but local mutations must write sidecar files instead of hosted actions.

Minimum behavior:

- Show review/comment mode for local plans.
- Click a rendered block with `data-block-id`.
- Open a comment composer.
- Persist a root comment to `feedback.jsonl`.
- Show open comment count per block.
- Reply to a local comment.
- Resolve/reopen a local comment.
- Mark comment `resolutionTarget` as `agent` or `human`.

Do not implement multiplayer, sharing, mentions, email, screenshots, or auth in this task.

- [ ] **Step 3: Preserve hosted behavior**

Run a targeted search after the change:

```bash
rg -n "localPlanMode|ReviewMarkupToolbar|openCommentCount|feedback.jsonl" apple-plan-app/app/pages/PlansPage.tsx apple-plan-app/actions/get-local-plan-folder.ts apple-plan-app/server/lib/local-feedback-files.ts
```

Expected:

- Hosted plan comment code remains available when `localPlanMode` is false.
- Local plan comments write through local feedback helpers.
- No hosted Plan DB action is required for local comments.

- [ ] **Step 4: Commit**

```bash
git add apple-plan-app/actions/get-local-plan-folder.ts apple-plan-app/app/pages/PlansPage.tsx apple-plan-app/server/lib/local-feedback-files.ts
git commit -m "feat: enable local plan comments"
```

---

### Task 5C: Add Local Agent Feedback Reader

**Files:**
- Create: `apple-plan-app/scripts/get-local-feedback.mjs`
- Modify: `apple-plan-app/package.json`

- [ ] **Step 1: Add feedback reader script**

Create `apple-plan-app/scripts/get-local-feedback.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/get-local-feedback.mjs plans/<slug>");
  process.exit(1);
}

const feedbackPath = path.join(folder, "feedback.jsonl");
const planPath = path.join(folder, "plan.mdx");
const canvasPath = path.join(folder, "canvas.mdx");

function readOptional(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

const events = readOptional(feedbackPath)
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const plan = readOptional(planPath);
const canvas = readOptional(canvasPath);

function sourceContext(blockId) {
  const source = `${plan}\n\n${canvas}`;
  const index = source.indexOf(`id="${blockId}"`);
  if (index < 0) return "";
  return source.slice(Math.max(0, index - 400), Math.min(source.length, index + 800));
}

const openAgent = events.filter(
  (event) =>
    event.status === "open" &&
    event.resolutionTarget === "agent" &&
    !event.consumedAt,
);
const resolved = events.filter(
  (event) => event.status === "resolved" && !event.consumedAt,
);

const grouped = new Map();
for (const event of [...openAgent, ...resolved]) {
  const group = grouped.get(event.targetBlockId) ?? {
    targetBlockId: event.targetBlockId,
    targetKind: event.targetKind,
    sourceContext: sourceContext(event.targetBlockId),
    comments: [],
  };
  group.comments.push(event);
  grouped.set(event.targetBlockId, group);
}

console.log(
  JSON.stringify(
    {
      folder,
      openAgentCount: openAgent.length,
      resolvedCount: resolved.length,
      groups: Array.from(grouped.values()),
    },
    null,
    2,
  ),
);
```

- [ ] **Step 2: Add npm script**

Modify `apple-plan-app/package.json`:

```json
{
  "scripts": {
    "feedback:read": "node scripts/get-local-feedback.mjs"
  }
}
```

Preserve existing scripts; only add the new script key.

- [ ] **Step 3: Run reader against an empty sample**

Run:

```bash
cd apple-plan-app
node scripts/get-local-feedback.mjs ../apple-visual-skills/examples/swiftui-settings-plan
```

Expected:

```json
{
  "openAgentCount": 0,
  "resolvedCount": 0,
  "groups": []
}
```

- [ ] **Step 4: Commit**

```bash
git add apple-plan-app/scripts/get-local-feedback.mjs apple-plan-app/package.json
git commit -m "feat: read local plan feedback"
```

---

### Task 5D: Add Local Feedback Consume/Resolve Flow

**Files:**
- Create: `apple-plan-app/scripts/consume-local-feedback.mjs`
- Modify: `apple-plan-app/package.json`
- Modify: `apple-visual-skills/docs/WORKFLOW.md`

- [ ] **Step 1: Add consume script**

Create `apple-plan-app/scripts/consume-local-feedback.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const folder = process.argv[2];
const commentId = process.argv[3];

if (!folder || !commentId) {
  console.error("Usage: node scripts/consume-local-feedback.mjs plans/<slug> cmt_001");
  process.exit(1);
}

const feedbackPath = path.join(folder, "feedback.jsonl");
const statePath = path.join(folder, "feedback-state.json");
const now = new Date().toISOString();
const body = fs.existsSync(feedbackPath) ? fs.readFileSync(feedbackPath, "utf8") : "";
const events = body
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const target = events.find((event) => event.id === commentId);
if (!target) {
  console.error(`Feedback id not found: ${commentId}`);
  process.exit(1);
}

const consumed = {
  ...target,
  id: `${commentId}_consumed_${Date.now()}`,
  event: "feedback_consumed",
  status: "consumed",
  createdBy: "agent",
  createdAt: now,
  consumedAt: now,
  parentId: commentId,
};

fs.appendFileSync(feedbackPath, `${JSON.stringify(consumed)}\n`, "utf8");

const nextEvents = [...events, consumed];
const state = {
  version: 1,
  updatedAt: now,
  open: nextEvents.filter((event) => event.status === "open" && !event.consumedAt),
  resolved: nextEvents.filter((event) => event.status === "resolved" && !event.consumedAt),
  consumed: nextEvents.filter((event) => event.status === "consumed" || event.consumedAt),
};
fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ consumed: commentId, at: now }, null, 2));
```

- [ ] **Step 2: Add npm script**

Modify `apple-plan-app/package.json`:

```json
{
  "scripts": {
    "feedback:consume": "node scripts/consume-local-feedback.mjs"
  }
}
```

Preserve existing scripts; only add the new script key.

- [ ] **Step 3: Document agent loop**

Append to `apple-visual-skills/docs/WORKFLOW.md`:

```markdown
## Local Feedback Agent Loop

1. Read feedback:
   `node ../apple-plan-app/scripts/get-local-feedback.mjs plans/<slug>`
2. Update `plan.mdx` or `canvas.mdx`.
3. Mark each handled feedback item consumed:
   `node ../apple-plan-app/scripts/consume-local-feedback.mjs plans/<slug> cmt_001`
4. Reopen the local plan and confirm the UI shows the correct open/resolved/consumed state.
```

- [ ] **Step 4: Commit**

```bash
git add apple-plan-app/scripts/consume-local-feedback.mjs apple-plan-app/package.json apple-visual-skills/docs/WORKFLOW.md
git commit -m "feat: consume local plan feedback"
```

---

### Task 6: Add A Sample Apple Plan Artifact

**Files:**
- Create: `apple-visual-skills/examples/swiftui-settings-plan/plan.mdx`
- Create: `apple-visual-skills/examples/swiftui-settings-plan/canvas.mdx`
- Create: `apple-visual-skills/examples/swiftui-settings-plan/.plan-state.json`
- Create: `apple-visual-skills/examples/swiftui-settings-plan/feedback.jsonl`
- Create: `apple-visual-skills/examples/swiftui-settings-plan/feedback-state.json`

- [ ] **Step 1: Create sample plan folder**

Run:

```bash
mkdir -p apple-visual-skills/examples/swiftui-settings-plan
```

- [ ] **Step 2: Verify block tags before authoring sample**

Run if the Agent-Native CLI is available:

```bash
npx @agent-native/core@latest plan blocks --out /tmp/apple-plan-blocks.md
rg -n "FileTree|Diagram|QuestionForm|RichText" /tmp/apple-plan-blocks.md
```

Expected: the block catalog includes these canonical tags or documents their current replacement. If any tag differs, update the sample to the catalog before creating the MDX.

- [ ] **Step 3: Add sample `plan.mdx`**

Create `apple-visual-skills/examples/swiftui-settings-plan/plan.mdx`:

```mdx
---
title: "SwiftUI Settings Sync Plan"
kind: "plan"
localOnly: true
platforms: ["iOS", "macOS"]
---

<RichText id="settings-objective">

# SwiftUI Settings Sync Plan

## Objective

Add a settings screen that lets users toggle sync behavior, review account status, and recover from offline/error states.

## Surfaces

- iOS Settings screen pushed from the Profile tab.
- macOS Settings window section.
- Shared Swift package model for sync preferences.

</RichText>

<FileTree
  id="settings-file-tree"
  title="Planned Files"
  entries={[
    { path: "App/Settings/SettingsView.swift", change: "added", note: "Shared settings surface with platform-specific layout branches." },
    { path: "App/Settings/SettingsViewModel.swift", change: "added", note: "Owns sync preference state and account status mapping." },
    { path: "Shared/Sync/SyncPreferences.swift", change: "added", note: "Cross-platform value model." },
    { path: "Shared/Sync/SyncPreferencesTests.swift", change: "added", note: "Unit tests for defaults and persistence transitions." }
  ]}
/>

<QuestionForm
  id="settings-open-questions"
  title="Open Questions"
  questions={[
    { id: "default-sync", label: "Should sync default on for signed-in users?", type: "choice", options: ["On", "Off"] },
    { id: "mac-placement", label: "Should macOS use Settings window or sidebar detail?", type: "choice", options: ["Settings window", "Sidebar detail"] }
  ]}
/>
```

- [ ] **Step 4: Add sample `canvas.mdx`**

Create `apple-visual-skills/examples/swiftui-settings-plan/canvas.mdx`:

```mdx
# Canvas

<Diagram
  id="settings-sync-flow"
  title="Settings Sync Flow"
  data={{
    caption: "Settings sync flow.",
    html: '<div class="diagram-panel" data-rough><div class="diagram-node">Profile Tab</div><div class="diagram-node">Settings Screen</div><div class="diagram-node">Sync Toggle</div><div class="diagram-node">SyncPreferences</div><div class="diagram-node">Persistent Store</div><div class="diagram-node">Account + Offline Status</div></div>',
    css: ".diagram-panel { display: flex; flex-wrap: wrap; gap: 12px; }"
  }}
/>
```

- [ ] **Step 5: Add local state**

Create `apple-visual-skills/examples/swiftui-settings-plan/.plan-state.json`:

```json
{
  "kind": "plan",
  "localOnly": true,
  "slug": "swiftui-settings-plan",
  "commentableBlocks": [
    "settings-objective",
    "settings-file-tree",
    "settings-open-questions",
    "settings-sync-flow"
  ]
}
```

- [ ] **Step 6: Add empty feedback sidecars**

Create `apple-visual-skills/examples/swiftui-settings-plan/feedback.jsonl` as an empty file.

Create `apple-visual-skills/examples/swiftui-settings-plan/feedback-state.json`:

```json
{
  "version": 1,
  "planSlug": "swiftui-settings-plan",
  "updatedAt": "2026-06-17T00:00:00.000Z",
  "open": [],
  "resolved": [],
  "consumed": []
}
```

- [ ] **Step 7: Validate sample is readable**

Run:

```bash
rg -n "SwiftUI Settings Sync Plan|QuestionForm|FileTree|Diagram|settings-file-tree|settings-sync-flow" apple-visual-skills/examples/swiftui-settings-plan
```

Expected: matches in `plan.mdx` and `canvas.mdx`.

- [ ] **Step 8: Commit**

```bash
git add apple-visual-skills/examples
git commit -m "test: add sample apple visual plan"
```

---

### Task 7: Add Basic Skill Content Checks

**Files:**
- Create: `apple-visual-skills/scripts/check-skill-content.mjs`
- Modify: `apple-visual-skills/package.json`

- [ ] **Step 1: Add content check script**

Create `apple-visual-skills/scripts/check-skill-content.mjs`:

```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");
const requiredSkills = ["visual-plan", "visual-recap"];
const forbidden = [
  "NEVER hand the plan over as inline chat content",
  "NEVER hand the recap to the user as inline chat content",
  "Hosted default: connect `https://plan.agent-native.com",
  "Builder Skills"
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

const skillDirs = readdirSync(skillsRoot).filter((entry) =>
  statSync(path.join(skillsRoot, entry)).isDirectory()
);

const extra = skillDirs.filter((name) => !requiredSkills.includes(name));
const missing = requiredSkills.filter((name) => !skillDirs.includes(name));

if (extra.length || missing.length) {
  console.error(`Unexpected skills. extra=${extra.join(",")} missing=${missing.join(",")}`);
  process.exit(1);
}

for (const file of walk(skillsRoot)) {
  const body = readFileSync(file, "utf8");
  for (const needle of forbidden) {
    if (body.includes(needle)) {
      console.error(`${path.relative(root, file)} contains forbidden text: ${needle}`);
      process.exit(1);
    }
  }
}

console.log("Apple visual skill content checks passed");
```

- [ ] **Step 2: Run check**

Run:

```bash
cd apple-visual-skills
npm run check
```

Expected:

```text
Apple visual skill content checks passed
```

- [ ] **Step 3: Commit**

```bash
git add apple-visual-skills/scripts apple-visual-skills/package.json
git commit -m "test: add apple visual skill checks"
```

---

### Task 8: Prove The Local Human-Agent Feedback Loop

**Files:**
- Modify: `apple-visual-skills/docs/WORKFLOW.md`
- Modify: `apple-plan-app/docs/APPLE_WORKFLOW.md`
- Modify: `apple-visual-skills/examples/swiftui-settings-plan/plan.mdx`
- Modify: `apple-visual-skills/examples/swiftui-settings-plan/feedback.jsonl`
- Modify: `apple-visual-skills/examples/swiftui-settings-plan/feedback-state.json`

- [ ] **Step 1: Run the local Plan app**

Run from the copied app folder:

```bash
cd apple-plan-app
pnpm install
pnpm dev
```

Expected: local Plan app starts and prints a local URL.

- [ ] **Step 2: Open sample local plan**

Run from `apple-visual-skills` if Agent-Native CLI is available:

```bash
npx @agent-native/core@latest plan local serve --dir examples/swiftui-settings-plan --kind plan --open
```

Expected: sample plan opens in the Plan UI.

- [ ] **Step 3: Verify no hosted Plan DB write is required**

Run:

```bash
rg -n "create-visual-plan|update-visual-plan|get-plan-feedback|plan.agent-native.com" apple-visual-skills/examples/swiftui-settings-plan apple-plan-app/docs/LOCAL_FEEDBACK.md
```

Expected: no hosted Plan action is required for the local feedback test.

- [ ] **Step 4: Manual local comment test**

In the rendered plan:

1. Add a comment on the file tree block: `Need macOS Settings window placement clarified.`
2. Add a comment on the diagram block: `Show CloudKit sync boundary if this touches iCloud.`
3. Resolve one comment.
4. Leave one comment open.

Expected:

- Rendered block has a stable block anchor such as `data-block-id="settings-file-tree"`.
- Comment appears anchored to the selected rendered block.
- `feedback.jsonl` receives append-only events.
- `feedback-state.json` includes the open/resolved state.

- [ ] **Step 5: Agent feedback-read test**

Run:

```bash
node apple-plan-app/scripts/get-local-feedback.mjs apple-visual-skills/examples/swiftui-settings-plan
```

Expected: output groups open agent-targeted feedback by `targetBlockId`, includes `settings-file-tree` or `settings-sync-flow`, and includes nearby MDX source context.

- [ ] **Step 6: Agent update test**

Edit `apple-visual-skills/examples/swiftui-settings-plan/plan.mdx` so the macOS placement is explicit:

```mdx
<RichText id="settings-objective">

# SwiftUI Settings Sync Plan

## Objective

Add a settings screen that lets users toggle sync behavior, review account status, and recover from offline/error states.

## Surfaces

- iOS Settings screen pushed from the Profile tab.
- macOS Settings window section, using the standard Settings scene rather than a sidebar detail.
- Shared Swift package model for sync preferences.

</RichText>
```

Run:

```bash
node apple-plan-app/scripts/consume-local-feedback.mjs apple-visual-skills/examples/swiftui-settings-plan cmt_001
node apple-plan-app/scripts/get-local-feedback.mjs apple-visual-skills/examples/swiftui-settings-plan
```

Expected: `cmt_001` is no longer returned in default open agent feedback.

- [ ] **Step 7: UI state test**

Reopen the local plan.

Expected:

- Consumed feedback is not presented as unhandled agent work.
- Resolved comments remain visible when "show resolved" is selected.
- Open comments remain visible and actionable.

- [ ] **Step 8: Document the result**

Append to `apple-visual-skills/docs/WORKFLOW.md`:

```markdown
## MVP Collaboration Evidence

- Local plan opened:
- Comment anchored to file tree:
- Comment anchored to diagram:
- Feedback persisted to `feedback.jsonl`:
- Agent feedback read path:
- Agent consumed feedback path:
- Hosted Plan DB write avoided:
- Remaining limitation:
```

- [ ] **Step 9: Commit**

```bash
git add apple-visual-skills/docs/WORKFLOW.md apple-plan-app/docs/APPLE_WORKFLOW.md apple-visual-skills/examples/swiftui-settings-plan
git commit -m "docs: record apple visual collaboration loop"
```

---

## Verification

Run these before calling the MVP complete:

```bash
find apple-visual-skills/skills -maxdepth 2 -name SKILL.md -print | sort
cd apple-visual-skills && npm run check
rg -n "plan.agent-native.com|Builder Skills|efficient-fable|plow-ahead|quick-recap|agent-watchdog|plan-arbiter|stay-within-limits|read-the-damn-docs" apple-visual-skills
```

Expected:

- Only `visual-plan` and `visual-recap` skill files exist.
- Content check passes.
- Search finds no generic skills and no hosted default language.

For the app spike:

```bash
cd apple-plan-app
pnpm install
pnpm dev
```

Expected:

- Dev server starts.
- Sample local plan renders.
- Local route renders the sample without hosted Plan DB writes.
- Comments can be added to rendered blocks in local mode.
- Comments persist to `feedback.jsonl`.
- Agent can read open agent-targeted feedback with `node scripts/get-local-feedback.mjs <plan-folder>`.
- Agent can mark handled feedback consumed with `node scripts/consume-local-feedback.mjs <plan-folder> <comment-id>`.
- UI accurately distinguishes open, resolved, and consumed feedback.

MVP is not complete until this local loop works:

```text
rendered local plan -> human block comment -> feedback.jsonl -> agent reads -> plan.mdx changes -> feedback consumed -> UI updates
```

## What You Can Do With This

Once implemented, an Apple developer can:

- Ask for a visual plan before a Swift/Xcode change.
- Review navigation/state/data/test flow visually.
- Annotate a specific diagram, file, code excerpt, or question.
- Ask the agent to revise the plan from anchored feedback.
- Let the agent implement after plan approval.
- Ask for a visual recap of a branch/PR after implementation.
- Review the recap before line-by-line diff review.
- Keep plan artifacts as repo-local MDX for audit/history.
- Use a local private feedback loop first.
- Self-host the visual app later for team/shared review when the local loop is proven.

## Open Risks

- Upstream Agent-Native licensing must be verified before public redistribution of the Plan app fork.
- MDX authoring may be brittle unless examples and validation are strong.
- The Plan app is larger than the two-skill pack; self-hosting may require pruning later.
- Upstream local-files mode currently does not provide browser comments by default; the local feedback layer is real product work.
- Comment anchoring depends on stable block IDs and renderer `data-block-id` support.
- Feedback sidecar files need careful append/consume semantics to avoid losing review history.
- Apple platform docs and Xcode behavior still require current-doc/tool verification; the visual plan should not become a place where agents make unverified framework claims.

## Revised Build Phases

1. Apple visual skills generate local MDX.
2. Local Plan app renders the MDX.
3. Local feedback sidecar files capture anchored comments.
4. Local feedback reader exposes comments to the agent.
5. Agent updates MDX and marks comments consumed.
6. Only after the local loop works, evaluate self-hosted DB/shared-team mode.

## Self-Review

Spec coverage:

- Only visual skills are kept: covered by Tasks 1 and 7.
- Apple-focused, not generic UI generation: covered by Tasks 2 and 3.
- Self-host/local-first: covered by Tasks 4 and 5.
- Local feedback sidecar: covered by Tasks 5A-5D.
- Figma-like annotation/collaboration loop: covered by Tasks 5B and 8.
- Easy-to-understand workflow: covered by Task 4 and README docs.
- MDX as LLM-readable structured format: covered by Tasks 2, 6, and docs.

Placeholder scan:

- No implementation steps contain placeholder markers or open-ended "do this later" instructions.
- Task 8 no longer allows a hosted feedback-route fallback; local file feedback is mandatory for MVP completion.

Type/path consistency:

- All planned files live under `apple-visual-skills/`, `apple-plan-app/`, or `docs/`.
- Skill names remain `visual-plan` and `visual-recap`.
- Feedback files are consistently named `feedback.jsonl` and `feedback-state.json`.

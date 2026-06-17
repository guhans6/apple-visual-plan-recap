import { readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const sampleDir = path.join(root, "examples", "apple-settings-pane");
const planPath = path.join(sampleDir, "plan.mdx");

const allowedBlocks = new Set(["RichText", "FileTree", "Diagram", "QuestionForm", "Checklist"]);
const plan = await readFile(planPath, "utf8");

const tags = [...plan.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]);
for (const tag of tags) {
  if (!allowedBlocks.has(tag)) {
    throw new Error(`Unsupported sample Plan block tag: ${tag}`);
  }
}

const commentableBlocks = [...plan.matchAll(/<([A-Z][A-Za-z0-9]*)\b([^>]*)>/g)];
for (const [fullTag, tag, attrs] of commentableBlocks) {
  if (allowedBlocks.has(tag) && !/\bid="[^"]+"/.test(attrs)) {
    throw new Error(`Sample block is missing a stable id: ${fullTag}`);
  }
}

const state = JSON.parse(await readFile(path.join(sampleDir, "feedback-state.json"), "utf8"));
if (state.version !== 1 || state.planSlug !== "apple-settings-pane" || typeof state.items !== "object") {
  throw new Error("feedback-state.json does not match the local feedback contract");
}

const feedbackLog = await readFile(path.join(sampleDir, "feedback.jsonl"), "utf8");
if (feedbackLog.trim() !== "") {
  throw new Error("sample feedback.jsonl must start empty");
}

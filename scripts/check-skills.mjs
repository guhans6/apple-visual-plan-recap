import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const skillsDir = path.join(root, "skills");
const expectedSkills = ["visual-plan", "visual-recap"];

const actualSkills = (await readdir(skillsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assertEqual(actualSkills, expectedSkills, "skills directory must contain only Apple visual skills");

for (const skill of expectedSkills) {
  const skillPath = path.join(skillsDir, skill, "SKILL.md");
  const contents = await readFile(skillPath, "utf8");

  assertIncludes(contents, "local-files or self-hosted rendering", `${skill} must default local/self-hosted`);
  assertIncludes(contents, "feedback.jsonl", `${skill} must reference the append-only feedback log`);
  assertIncludes(contents, "feedback-state.json", `${skill} must reference feedback state`);
  assertIncludes(contents, "stable `id`", `${skill} must require stable IDs`);
  assertNotIncludes(contents.toLowerCase(), "default to hosted", `${skill} must not default to hosted storage`);
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(value, needle, message) {
  if (!value.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(value, needle, message) {
  if (value.includes(needle)) {
    throw new Error(message);
  }
}

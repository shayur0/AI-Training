#!/usr/bin/env node
// Sensor (PreToolUse, matcher: Edit|Write): blocks a write to the ROOT CLAUDE.md
// (the L1 router) if it would grow past 150 lines. Root CLAUDE.md only —
// instructions/CLAUDE.md and other L2/L3 docs have no such cap, since detail
// is supposed to live there, not in the router. Simulates the edit against the
// file's current on-disk content (PreToolUse fires before the tool runs, so
// disk still has the pre-edit version) rather than trusting the diff alone.

const fs = require("fs");
const path = require("path");

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rootClaudeMd = path.resolve(projectDir, "CLAUDE.md");

const ti = payload?.tool_input || {};
const filePath = ti.file_path ? path.resolve(ti.file_path) : null;
if (filePath !== rootClaudeMd) process.exit(0);

const MAX_LINES = 150;

function countLines(text) {
  return text.length === 0 ? 0 : text.split("\n").length;
}

let resultingContent = null;

if (typeof ti.content === "string") {
  // Write tool: content is the full new file.
  resultingContent = ti.content;
} else if (typeof ti.old_string === "string" && typeof ti.new_string === "string") {
  // Edit tool: simulate against what's actually on disk right now.
  let current;
  try {
    current = fs.readFileSync(rootClaudeMd, "utf8");
  } catch {
    process.exit(0);
  }
  if (!current.includes(ti.old_string)) process.exit(0); // let the real tool call surface that error
  resultingContent = ti.replace_all
    ? current.split(ti.old_string).join(ti.new_string)
    : current.replace(ti.old_string, ti.new_string);
}

if (resultingContent === null) process.exit(0);

const lineCount = countLines(resultingContent);
if (lineCount > MAX_LINES) {
  console.error(
    `Blocked: this write would make root CLAUDE.md ${lineCount} lines (cap: ${MAX_LINES}). ` +
    "CLAUDE.md is the L1 router — navigation and critical rules only. Move whatever you were " +
    "about to add into an L2/L3 doc (with YAML frontmatter: type, last_verified, owner) and add " +
    "one row to the router table pointing at it instead."
  );
  process.exit(2);
}

process.exit(0);

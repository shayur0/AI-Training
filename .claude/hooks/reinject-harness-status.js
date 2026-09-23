#!/usr/bin/env node
// SessionStart hook: re-injects open harness/status.jsonl entries into context
// at the start of every session. Claude has no memory across a context reset —
// this is what lets "what was I in the middle of" survive one anyway. Reads
// the whole append-only log and keeps only the latest status per id (a later
// line for the same id supersedes an earlier one; nothing is ever edited
// in place, so "latest wins" is how a close is expressed).

const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const statusFile = path.resolve(projectDir, "harness", "status.jsonl");

let lines;
try {
  lines = fs.readFileSync(statusFile, "utf8").split("\n").filter(Boolean);
} catch {
  process.exit(0); // no harness/status.jsonl yet — nothing to reinject
}

const latestById = new Map();
for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.id) latestById.set(entry.id, entry);
  } catch {
    // skip a malformed line rather than fail the whole session start
  }
}

const open = [...latestById.values()].filter((e) => e.status === "open");

if (open.length > 0) {
  console.log("Open harness/status.jsonl entries from a prior session:");
  for (const e of open) {
    console.log(`- ${e.id} (${e.ts}): ${e.title}${e.detail ? " — " + e.detail : ""}`);
  }
}

process.exit(0);

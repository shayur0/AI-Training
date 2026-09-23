#!/usr/bin/env node
// Sensor (Stop, session-end): a last defense-in-depth check right before the
// session ends. Re-checks the same two things the PreToolUse hooks guard
// individually, in case something slipped through a path they don't cover
// (e.g. a tool outside Bash/Edit/Write, or a hook that was bypassed). Exit 2
// on a Stop hook blocks the session from ending and feeds the message back —
// used here only for something genuinely worth stopping for, not routine.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const problems = [];

// 1. Is a .env file staged for commit?
try {
  const staged = execSync("git diff --cached --name-only", { cwd: projectDir, encoding: "utf8" });
  const envFiles = staged.split("\n").filter((f) => /(^|\/)\.env(\.[A-Za-z0-9_-]+)?$/.test(f.trim()));
  if (envFiles.length > 0) {
    problems.push(`.env file(s) staged for commit: ${envFiles.join(", ")} — unstage before ending.`);
  }
} catch {
  // Not a git repo, or git unavailable — nothing to check.
}

// 2. Is root CLAUDE.md over budget? (belt-and-suspenders on top of the PreToolUse hook.)
try {
  const claudeMd = fs.readFileSync(path.resolve(projectDir, "CLAUDE.md"), "utf8");
  const lines = claudeMd.split("\n").length;
  if (lines > 150) {
    problems.push(`root CLAUDE.md is ${lines} lines (cap: 150) — move detail into an L2/L3 doc.`);
  }
} catch {
  // No root CLAUDE.md — nothing to check.
}

if (problems.length > 0) {
  console.error("Session-end check found something worth fixing before stopping:\n" + problems.map((p) => `- ${p}`).join("\n"));
  process.exit(2);
}

process.exit(0);

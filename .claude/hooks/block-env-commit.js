#!/usr/bin/env node
// Sensor (PreToolUse, matcher: Bash): blocks any git add/commit that explicitly
// names a .env file. .gitignore already keeps a plain `git add -A` from picking
// one up — this catches the case that bypasses that: `git add -f .env` or
// `git add backend/.env` typed directly. Silent on allow (exit 0), loud on
// block (exit 2 + a fix message on stderr) — Claude Code's hook contract.

let input = "";
try {
  input = require("fs").readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const command = payload?.tool_input?.command || "";
if (!command) process.exit(0);

const isGitAddOrCommit = /\bgit\s+(add|commit)\b/.test(command);
const mentionsEnvFile = /(^|[\s/"'])\.env(\.[A-Za-z0-9_-]+)?(["'\s]|$)/.test(command);

if (isGitAddOrCommit && mentionsEnvFile) {
  console.error(
    "Blocked: this command stages or commits a .env file. .env holds real secrets and must " +
    "never enter git history — .gitignore already excludes it from `git add -A`, so a command " +
    "naming it directly (or `-f`/`--force`) is the one way it still gets through. If you need to " +
    "share a variable's *name* (not its value), add it to .env.example instead."
  );
  process.exit(2);
}

process.exit(0);

#!/usr/bin/env node
// Runs every per-agent eval plus the synthesis eval against one orchestrator
// run. Exit code is nonzero if anything fails, so this is what the loop
// (scripts/orchestrator-loop.mjs) checks before it lets a run ship.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const runDir = process.argv[2];
const topicLabel = process.argv[3];
if (!runDir || !topicLabel) {
  console.error("usage: node run-all.mjs <runDir> <topicLabel>");
  process.exit(2);
}

const checks = [
  [join(__dirname, "per-agent", "topic-researcher.eval.mjs"), [runDir]],
  [join(__dirname, "per-agent", "safety-reviewer.eval.mjs"), [runDir]],
  [join(__dirname, "per-agent", "question-writer.eval.mjs"), [runDir]],
  [join(__dirname, "synthesis.eval.mjs"), [runDir, topicLabel]],
  [join(__dirname, "shipped-worksheet.eval.mjs"), []],
];

let allPassed = true;
for (const [script, args] of checks) {
  const result = spawnSync("node", [script, ...args], { encoding: "utf8" });
  process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) allPassed = false;
}

console.log(allPassed ? "\n=== ALL EVALS PASSED ===" : "\n=== EVAL FAILURES — DO NOT SHIP THIS RUN ===");
process.exit(allPassed ? 0 : 1);

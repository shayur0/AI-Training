#!/usr/bin/env node
// Re-scores existing run logs' first-attempt output against the current
// critic.mjs, without re-running generation. Used once, honestly: the critic
// itself had a bug (fail-002, see RESULTS.md) found via a real before-run;
// this shows what the same real generations would have scored under the
// corrected critic, rather than silently rewriting the original log files.

import { readFileSync, readdirSync } from "node:fs";
import { critic } from "./critic.mjs";

const [, , packetPath, prefix] = process.argv;
const packet = JSON.parse(readFileSync(packetPath, "utf8"));

const files = readdirSync("self-healing/runs").filter((f) => f.startsWith(prefix + "-") && f.endsWith(".json") && !f.includes("summary"));

let totalTries = 0;
let retries = 0;
let escalations = 0;
const rows = [];

for (const f of files.sort()) {
  const log = JSON.parse(readFileSync(`self-healing/runs/${f}`, "utf8"));
  // Re-walk the trail with the corrected critic to find the true first
  // passing attempt.
  let tries = 0;
  let ok = false;
  for (const step of log.trail) {
    if (!step.questions) break; // an act() error attempt, leave as escalated
    tries++;
    const result = critic(packet, step.questions);
    if (result.ok) { ok = true; break; }
  }
  if (!ok) escalations++;
  totalTries += tries;
  retries += tries - 1;
  rows.push({ file: f, tries, ok });
}

console.log(JSON.stringify({ prefix, n: files.length, totalTries, retries, escalations, avgTries: totalTries / files.length, rows }, null, 2));

#!/usr/bin/env node
// Drains topics/queue.json (filled by .claude/hooks/enqueue-topic-request.sh):
// for each unprocessed topic request, runs the orchestrator headlessly via the
// `claude` CLI, then gates success on evals/run-all.mjs before marking it
// processed. This is what "runs on its own every 30 minutes" actually calls —
// see the bottom of this file for how to schedule it.
//
// Default is --dry-run: prints what would happen without spawning a real
// headless Claude session (that costs real tokens/time and does real agentic
// work, so it's opt-in via --live, not the default here).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const QUEUE_FILE = join(REPO_ROOT, "topics", "queue.json");

const args = process.argv.slice(2);
const live = args.includes("--live");
const once = true; // this process always does one pass; repetition is external (see bottom)

function loadQueue() {
  if (!existsSync(QUEUE_FILE)) return [];
  return JSON.parse(readFileSync(QUEUE_FILE, "utf8"));
}

function saveQueue(queue) {
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + "\n");
}

function orchestratorPrompt(item) {
  const requestText = existsSync(item.path) ? readFileSync(item.path, "utf8") : "";
  return `You are the orchestrator described in agents-plan.md at the root of this repo. ` +
    `A new topic request was queued: slug "${item.slug}", request file contents:\n\n${requestText}\n\n` +
    `Run the four sub-agents in order — .claude/skills/topic-researcher, safety-reviewer, ` +
    `question-writer, worksheet-integrator (read each SKILL.md for its task and guardrail) — ` +
    `to add this as a real new topic, writing intermediate artifacts to evals/runs/${item.slug}/ ` +
    `(1-packet.json, 2-packet-reviewed.json, 3-questions.json) the same way the "Summer Olympics" ` +
    `run did. Then run \`node evals/run-all.mjs evals/runs/${item.slug} "<topic label>"\` — if ` +
    `anything fails, find the mismatch, fix it, and re-run until every eval passes before ` +
    `finishing. Do not mark this done if any eval is still failing.`;
}

function processOne(item, queue) {
  console.log(`\n=== ${item.slug} ===`);
  const prompt = orchestratorPrompt(item);

  if (!live) {
    console.log("[dry-run] would invoke:");
    console.log(`  claude -p <orchestrator prompt, ${prompt.length} chars> (cwd: ${REPO_ROOT})`);
    console.log("[dry-run] pass --live to actually run it (spawns a real headless Claude session).");
    return;
  }

  const result = spawnSync("claude", ["-p", prompt], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });

  const runDir = join(REPO_ROOT, "evals", "runs", item.slug);
  const evalOk = existsSync(runDir)
    ? spawnSync("node", [join(REPO_ROOT, "evals", "run-all.mjs"), runDir, item.slug], { encoding: "utf8" }).status === 0
    : false;

  const logDir = join(REPO_ROOT, "logs", "orchestrator");
  mkdirSync(logDir, { recursive: true });
  writeFileSync(
    join(logDir, `${item.slug}.${Date.now()}.log`),
    JSON.stringify({ slug: item.slug, exitCode: result.status, evalOk, ranAt: new Date().toISOString() }, null, 2)
  );

  if (result.status === 0 && evalOk) {
    item.processed = true;
    item.processed_at = new Date().toISOString();
    saveQueue(queue);
    console.log(`[orchestrator-loop] ${item.slug}: done, evals passed.`);
  } else {
    console.log(`[orchestrator-loop] ${item.slug}: NOT marked processed (exitCode=${result.status}, evalOk=${evalOk}). Will retry next pass.`);
  }
}

const queue = loadQueue();
const pending = queue.filter((q) => !q.processed);

if (pending.length === 0) {
  console.log("[orchestrator-loop] queue empty, nothing to do.");
} else {
  console.log(`[orchestrator-loop] ${pending.length} pending request(s): ${pending.map((p) => p.slug).join(", ")}`);
  for (const item of pending) processOne(item, queue);
}

// --- Scheduling this every 30 minutes (this script only ever does one pass) ---
// Pick one:
//   cron:     */30 * * * * cd "<repo>" && /usr/bin/env node scripts/orchestrator-loop.mjs --live
//   launchd:  a plist with <key>StartInterval</key><integer>1800</integer> calling the same command
//   Claude Code /loop skill: /loop 30m  (then this prompt: "run scripts/orchestrator-loop.mjs --live")
//   CronCreate (a persistent scheduled cloud routine) for unattended operation with no local machine required

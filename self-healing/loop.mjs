#!/usr/bin/env node
// act -> critic -> retry (reason fed back) -> cap 3 -> escalateToHuman.
// "act" shells out to `claude -p` for a real model call, matching the pattern
// already used by the Module 12 orchestrator loop (scripts/orchestrator-loop.mjs)
// rather than a hand-rolled API client. The instructions file is the one thing
// that changes between a "before" and an "after" run (self-healing/RESULTS.md).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { critic } from "./critic.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAX_TRIES = 3;

function extractJsonArray(text) {
  // The model's response may have prose around the JSON — take the first
  // top-level [...] block.
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("no JSON array found in model output");
  return JSON.parse(match[0]);
}

function act(packet, instructions, priorReason) {
  let prompt = `${instructions}\n\nApproved Topic Knowledge Packet:\n${JSON.stringify(packet, null, 2)}\n\nRespond with ONLY a JSON array of 6 question objects (3 math + 3 geography) in the shape described above. No prose, no markdown fence, no tool calls, no file writes -- just the JSON array as your entire response.`;

  if (priorReason) {
    prompt += `\n\nYour previous attempt was rejected for this specific reason: ${priorReason}\nFix exactly that problem and produce a corrected JSON array.`;
  }

  const result = spawnSync("claude", ["-p", prompt], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`claude -p exited ${result.status}: ${result.stderr}`);
  }
  return extractJsonArray(result.stdout);
}

export function runLoop(packet, instructions) {
  const trail = [];
  let tries = 0;
  let questions, check;

  try {
    questions = act(packet, instructions, null);
  } catch (e) {
    trail.push({ attempt: 1, error: String(e) });
    return { ok: false, escalated: true, tries: 1, trail, reason: "act() threw before any critic check" };
  }
  tries = 1;
  check = critic(packet, questions);
  trail.push({ attempt: tries, questions, check });

  while (!check.ok && tries < MAX_TRIES) {
    tries++;
    try {
      questions = act(packet, instructions, check.reason);
    } catch (e) {
      trail.push({ attempt: tries, error: String(e) });
      break;
    }
    check = critic(packet, questions);
    trail.push({ attempt: tries, questions, check });
  }

  if (check.ok) {
    return { ok: true, escalated: false, tries, trail };
  }
  return { ok: false, escalated: true, tries, trail, reason: check.reason };
}

function escalateToHuman(runResult, logPath) {
  console.error(`ESCALATED after ${runResult.tries} tries: ${runResult.reason}`);
  console.error(`Full trail written to ${logPath}`);
}

// CLI: node loop.mjs <packet.json> <instructions.md> <output-log.json>
if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const [, , packetPath, instructionsPath, logPath] = process.argv;
  if (!packetPath || !instructionsPath || !logPath) {
    console.error("usage: node loop.mjs <packet.json> <instructions.md> <output-log.json>");
    process.exit(2);
  }
  const packet = JSON.parse(readFileSync(packetPath, "utf8"));
  const instructions = readFileSync(instructionsPath, "utf8");

  const result = runLoop(packet, instructions);
  mkdirSync(dirname(resolve(logPath)), { recursive: true });
  writeFileSync(logPath, JSON.stringify(result, null, 2));

  if (result.escalated) {
    escalateToHuman(result, logPath);
    process.exit(1);
  }
  console.log(`OK after ${result.tries} tr${result.tries === 1 ? "y" : "ies"}. Log: ${logPath}`);
  process.exit(0);
}

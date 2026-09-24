#!/usr/bin/env node
// Runs the loop N times with a given instructions variant, writes one log per
// run plus a summary. node run-batch.mjs <packet.json> <instructions.md> <label> <n>

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { runLoop } from "./loop.mjs";

const [, , packetPath, instructionsPath, label, nArg] = process.argv;
if (!packetPath || !instructionsPath || !label || !nArg) {
  console.error("usage: node run-batch.mjs <packet.json> <instructions.md> <label> <n>");
  process.exit(2);
}
const n = Number(nArg);
const packet = JSON.parse(readFileSync(packetPath, "utf8"));
const instructions = readFileSync(instructionsPath, "utf8");

mkdirSync("self-healing/runs", { recursive: true });

const summary = [];
for (let i = 1; i <= n; i++) {
  process.stderr.write(`[${label}] run ${i}/${n}... `);
  const result = runLoop(packet, instructions);
  const logPath = `self-healing/runs/${label}-${String(i).padStart(2, "0")}.json`;
  writeFileSync(logPath, JSON.stringify(result, null, 2));
  summary.push({ run: i, tries: result.tries, escalated: result.escalated, ok: result.ok });
  process.stderr.write(`${result.ok ? "OK" : "ESCALATED"} after ${result.tries} tr${result.tries === 1 ? "y" : "ies"}\n`);
}

const totalTries = summary.reduce((a, r) => a + r.tries, 0);
const retries = summary.reduce((a, r) => a + (r.tries - 1), 0);
const escalations = summary.filter((r) => r.escalated).length;

const summaryOut = {
  label,
  n,
  runs: summary,
  totals: { totalTries, retries, escalations, avgTries: totalTries / n },
};
writeFileSync(`self-healing/runs/${label}-summary.json`, JSON.stringify(summaryOut, null, 2));
console.log(JSON.stringify(summaryOut.totals, null, 2));

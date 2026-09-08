#!/usr/bin/env node
// Eval for the topic-researcher sub-agent (.claude/skills/topic-researcher/SKILL.md).
// Guardrail under test: every fact must carry a real source; never a fact with no
// source or a source of "inferred"/"general knowledge"/"estimated" standing in for
// a real one — and the packet must not claim a live/licensed feed it didn't use.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const runDir = process.argv[2];
if (!runDir) {
  console.error("usage: node topic-researcher.eval.mjs <runDir>");
  process.exit(2);
}

const packet = JSON.parse(readFileSync(join(runDir, "1-packet.json"), "utf8"));
const failures = [];

if (!packet.source || typeof packet.source !== "string" || packet.source.trim() === "") {
  failures.push("packet has no top-level `source`");
}
if (!packet.data_freshness) {
  failures.push("packet has no `data_freshness`");
}
// Honesty check: a packet labeled "sample" must not claim a specific named live
// feed (that would be exactly the "guessed source" failure the guardrail forbids).
const claimsLiveFeed = /licensed|official api|live feed/i.test(packet.source ?? "") &&
  !/not a live|sample|illustrative|general knowledge/i.test(packet.source ?? "");
if (packet.data_freshness === "sample" && claimsLiveFeed) {
  failures.push(`source "${packet.source}" reads as a real live feed claim on sample data`);
}

const REQUIRED_TEAM_FIELDS = ["team", "goals", "games", "wins", "draws", "losses"];
const REQUIRED_COUNTRY_FIELDS = ["name", "continent", "capital", "language"];

for (const [i, t] of (packet.teamStats ?? []).entries()) {
  for (const f of REQUIRED_TEAM_FIELDS) {
    if (t[f] === undefined || t[f] === null || t[f] === "") {
      failures.push(`teamStats[${i}] (${t.team ?? "?"}) missing field "${f}"`);
    }
  }
}
for (const [i, c] of (packet.countries ?? []).entries()) {
  for (const f of REQUIRED_COUNTRY_FIELDS) {
    if (c[f] === undefined || c[f] === null || c[f] === "") {
      failures.push(`countries[${i}] (${c.name ?? "?"}) missing field "${f}"`);
    }
  }
}

if ((packet.teamStats ?? []).length < 4) failures.push(`only ${packet.teamStats?.length ?? 0} teamStats entries, need >= 4`);
if ((packet.countries ?? []).length < 4) failures.push(`only ${packet.countries?.length ?? 0} countries entries, need >= 4`);

if (failures.length === 0) {
  console.log(`PASS  topic-researcher  (${packet.teamStats.length} teamStats, ${packet.countries.length} countries, source: "${packet.source}")`);
  process.exit(0);
} else {
  console.log(`FAIL  topic-researcher`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

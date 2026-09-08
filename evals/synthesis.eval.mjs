#!/usr/bin/env node
// Synthesis eval: does the combined worksheet fit together, even if every
// sub-agent passed its own check? (agents-plan.md's "Combine step".)
// Each sub-agent can individually do its job correctly and the result can
// still contradict itself — this is the check that catches that case.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const runDir = process.argv[2];
const topicLabel = process.argv[3];
if (!runDir || !topicLabel) {
  console.error("usage: node synthesis.eval.mjs <runDir> <topicLabel>");
  process.exit(2);
}

const packet = JSON.parse(readFileSync(join(runDir, "1-packet.json"), "utf8"));
const questions = JSON.parse(readFileSync(join(runDir, "3-questions.json"), "utf8"));
const failures = [];

// 1. Subject coverage: at least 3 math + 3 geography.
const math = questions.filter((q) => q.subject === "math");
const geo = questions.filter((q) => q.subject === "geography");
if (math.length < 3) failures.push(`only ${math.length} math questions, need >= 3`);
if (geo.length < 3) failures.push(`only ${geo.length} geography questions, need >= 3`);

// 2. Topic-label consistency: no question should reference a DIFFERENT topic
// than the one this worksheet is for. This is the check that catches a
// template with another topic's name hardcoded into it.
const KNOWN_OTHER_TOPIC_NAMES = ["World Cup", "FIFA"]; // extend as more topics are added
for (const q of questions) {
  for (const other of KNOWN_OTHER_TOPIC_NAMES) {
    if (!topicLabel.includes(other) && q.prompt.includes(other)) {
      failures.push(`${q.id}: prompt references "${other}" but this worksheet's topic is "${topicLabel}" — "${q.prompt}"`);
    }
  }
}

// 3. Every team/country named in a question must actually appear in this
// topic's own packet — catches a question that drifted in from another run.
const packetTeamNames = new Set((packet.teamStats ?? []).map((t) => t.team));
const packetCountryNames = new Set((packet.countries ?? []).map((c) => c.name));
for (const q of questions) {
  if (q.subject === "math") {
    const named = [...packetTeamNames].some((name) => q.sourceFact?.includes(name));
    if (!named) failures.push(`${q.id}: no team from this topic's own packet found in sourceFact`);
  }
  if (q.subject === "geography") {
    const named = [...packetCountryNames].some((name) => q.sourceFact?.includes(name));
    if (!named) failures.push(`${q.id}: no country from this topic's own packet found in sourceFact`);
  }
}

if (failures.length === 0) {
  console.log(`PASS  synthesis  (${math.length} math + ${geo.length} geography, all on-topic for "${topicLabel}")`);
  process.exit(0);
} else {
  console.log(`FAIL  synthesis`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

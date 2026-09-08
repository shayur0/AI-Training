#!/usr/bin/env node
// Eval on the ORCHESTRATOR'S COMBINE STEP, not the sub-agents' draft output:
// checks what backend/src/worksheetGenerator.js actually ships for every
// registered topic, not the run artifacts under evals/runs/. This is the eval
// that would have caught the real bug found while integrating "Summer
// Olympics" (2026-09-08): question-writer's curated output correctly avoided
// winPercentageQuestion on unsound data, but generateWorksheet() called the
// same three fixed templates by position for every topic regardless, and
// silently shipped the exact misleading question the pipeline was built to
// avoid. Per-run evals on draft artifacts can't catch that — only checking
// what actually ships can.
import { TOPICS } from "../backend/src/topics/index.js";
import { generateWorksheet } from "../backend/src/worksheetGenerator.js";

const failures = [];

for (const topicId of Object.keys(TOPICS)) {
  const math = generateWorksheet(topicId, "math");
  for (const q of math) {
    if (q.skill !== "percentages") continue;
    // Re-derive the same soundness check a "won X out of Y games" claim
    // requires: wins/draws/losses should actually sum to games played.
    const m = q.explanation.match(/(\d+) ÷ (\d+)/);
    if (!m) continue;
    const [, wins, games] = m.map(Number);
    // We don't have the raw team object here, only the rendered question —
    // so this re-checks the prompt's own internal claim: "won A out of B
    // games" implies some accounting of B beyond just A. Cross-check against
    // the topic's packet directly for a precise value.
    const team = TOPICS[topicId].packet.teamStats.find((t) => q.prompt.includes(t.team));
    if (!team) {
      failures.push(`${topicId}/${q.id}: percentages question but no matching team found in packet`);
      continue;
    }
    const sum = team.wins + team.draws + team.losses;
    if (Math.abs(sum - team.games) > 1) {
      failures.push(
        `${topicId}/${q.id}: "${q.prompt}" claims ${team.wins} out of ${team.games} games, ` +
        `but wins+draws+losses (${sum}) != games (${team.games}) in the topic's own data — false "part of" claim`
      );
    }
  }
}

if (failures.length === 0) {
  console.log(`PASS  shipped-worksheet  (${Object.keys(TOPICS).length} topics, no unsound percentage claims in live output)`);
  process.exit(0);
} else {
  console.log(`FAIL  shipped-worksheet`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

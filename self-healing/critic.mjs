#!/usr/bin/env node
// The critic for the question-writer task (self-healing/TASK.md).
// All three checks are plain rules — no model call, free, instant — because all
// three failures are exactly stateable against the approved packet. Returns a
// REASON specific enough to feed back into a retry, not just pass/fail.

function numbersIn(str) {
  return (String(str).match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

const KNOWN_OTHER_TOPIC_NAMES = ["World Cup", "FIFA"];

export function critic(packet, questions) {
  const reasons = [];

  if (!Array.isArray(questions) || questions.length === 0) {
    return { ok: false, reason: "no questions produced" };
  }

  const math = questions.filter((q) => q.subject === "math");
  const geo = questions.filter((q) => q.subject === "geography");
  if (math.length < 3) reasons.push(`only ${math.length} math questions, need 3`);
  if (geo.length < 3) reasons.push(`only ${geo.length} geography questions, need 3`);

  for (const q of questions) {
    if (!q.sourceFact) {
      reasons.push(`${q.id ?? "?"}: no sourceFact to verify against — possible fabrication`);
      continue;
    }

    // --- Failure 1: fabrication ---
    if (q.subject === "math") {
      // A sourceFact can name more than one team (a comparison/difference
      // question) — pool every mentioned team's allowed numbers rather than
      // just the first match, or the second team's real numbers register as
      // fabricated.
      const teams = (packet.teamStats ?? []).filter((t) => q.sourceFact.includes(t.team));
      if (teams.length === 0) {
        reasons.push(`${q.id}: sourceFact "${q.sourceFact}" doesn't name any team from the approved packet — fabrication`);
      } else {
        const allowed = teams.flatMap((t) => [t.goals, t.games, t.wins, t.draws, t.losses]);
        for (const n of numbersIn(q.sourceFact)) {
          if (!allowed.includes(n)) {
            const teamList = teams.map((t) => `${t.team} (goals=${t.goals}, games=${t.games}, wins=${t.wins}, draws=${t.draws}, losses=${t.losses})`).join("; ");
            reasons.push(`${q.id}: sourceFact number ${n} is not an approved value for ${teamList} — fabrication`);
          }
        }
      }
    }
    if (q.subject === "geography") {
      const country = (packet.countries ?? []).find((c) => q.sourceFact.includes(c.name));
      if (!country) {
        reasons.push(`${q.id}: sourceFact "${q.sourceFact}" doesn't name any country from the approved packet — fabrication`);
      } else {
        const rest = q.sourceFact.replace(country.name, "").trim();
        const matches = [country.continent, country.capital, country.language].some((v) => rest.includes(v));
        if (!matches) {
          reasons.push(`${q.id}: sourceFact "${q.sourceFact}" doesn't match ${country.name}'s approved continent/capital/language — fabrication`);
        }
      }
    }

    // --- Failure 3: wrong-topic reference ---
    for (const other of KNOWN_OTHER_TOPIC_NAMES) {
      if (!packet.topic.includes(other) && q.prompt?.includes(other)) {
        reasons.push(`${q.id}: prompt references "${other}" but this worksheet's topic is "${packet.topic}"`);
      }
    }
  }

  // --- Failure 2: unsound percentage claim ---
  // Only a violation if the question actually frames "games" as the
  // denominator (e.g. "out of N games") — a question that instead says
  // "out of N total results" (sourced directly from wins+draws+losses) is
  // sound regardless of whether games reconciles, since it never claims
  // games is the denominator in the first place. Found for real: a bare-run
  // question phrased "France had 64 total results... 16 were wins" was a
  // false positive under the earlier version of this check, which flagged
  // any percentages question where games didn't reconcile, whether or not
  // the prompt actually said "games."
  for (const q of questions.filter((q) => q.skill === "percentages")) {
    const team = (packet.teamStats ?? []).find((t) => q.prompt?.includes(t.team));
    if (!team) {
      reasons.push(`${q.id}: percentages question but no matching team found in prompt`);
      continue;
    }
    const claimsGamesAsDenominator = /\bgames?\b/i.test(q.prompt ?? "");
    if (!claimsGamesAsDenominator) continue;
    const sum = team.wins + team.draws + team.losses;
    if (Math.abs(sum - team.games) > 1) {
      reasons.push(`${q.id}: "${q.prompt}" claims a percent-of-games figure for ${team.team}, but wins+draws+losses (${sum}) doesn't reconcile with games (${team.games}) in the approved packet — asserts a false "part of" relationship`);
    }
  }

  if (reasons.length === 0) return { ok: true };
  return { ok: false, reason: reasons.join(" | ") };
}

// CLI mode: node critic.mjs <packet.json> <questions.json>
const { fileURLToPath } = await import("node:url");
const path = await import("node:path");
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  const fs = await import("node:fs");
  const [, , packetPath, questionsPath] = process.argv;
  const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
  const result = critic(packet, questions);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

import { TOPICS } from "./topics/index.js";
import { averageGoalsQuestion, winPercentageQuestion, goalDifferenceQuestion } from "./templates/mathTemplates.js";
import { continentQuestion, capitalQuestion, languageQuestion } from "./templates/geoTemplates.js";

// winPercentageQuestion's prompt ("X won Y out of Z games") implies wins are a
// subset of games — true for World Cup's data, but not guaranteed for every
// topic's teamStats (e.g. a topic where `games` means "events entered" rather
// than "games played"). Asking it anyway asserts a relationship the data
// doesn't actually have — the exact failure this repo already fixed once for
// rounding (see commit 07ba25c). Guard it instead of assuming it always holds.
function winPercentageIsSound(team) {
  return Math.abs(team.wins + team.draws + team.losses - team.games) <= 1;
}

// Phase 1 MVP: one fixed, deterministic worksheet per topic/subject (see
// planning.md Section 5 Phase 1 — validating the pipeline end-to-end matters
// more than template variety, which is a Phase 2/3 concern). Determinism also
// means /api/grade can regenerate the same questions server-side without
// needing a session store. Topic is a lookup key into TOPICS (agents-plan.md)
// — adding a topic never requires changing this function.
export function generateWorksheet(topicId, subject) {
  const topic = TOPICS[topicId];
  if (!topic) {
    throw new Error(`Unknown topic: ${topicId}`);
  }
  const { teamStats, countries } = topic.packet;

  if (subject === "math") {
    const percentageCandidate = teamStats[1];
    const secondQuestion = winPercentageIsSound(percentageCandidate)
      ? winPercentageQuestion(percentageCandidate)
      : averageGoalsQuestion(percentageCandidate); // sound fallback: a ratio, not a "part of" claim
    return [
      averageGoalsQuestion(teamStats[0]),
      secondQuestion,
      goalDifferenceQuestion(teamStats[2], teamStats[3]),
    ];
  }

  if (subject === "geography") {
    return [
      continentQuestion(countries[0], countries, topic.packet.topic),
      capitalQuestion(countries[1], countries),
      languageQuestion(countries[2], countries),
    ];
  }

  throw new Error(`Unknown subject: ${subject}`);
}

// Client only ever sees this shape — never the answer/explanation — until
// grading happens server-side (Stage 7: grading authority stays server-side).
export function toClientQuestion(question) {
  const { id, subject, skill, difficulty, prompt, type, options } = question;
  return { id, subject, skill, difficulty, prompt, type, options };
}

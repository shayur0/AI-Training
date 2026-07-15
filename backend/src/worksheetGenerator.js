import { topicKnowledgePacket } from "./data/worldCupFacts.js";
import { averageGoalsQuestion, winPercentageQuestion, goalDifferenceQuestion } from "./templates/mathTemplates.js";
import { continentQuestion, capitalQuestion, languageQuestion } from "./templates/geoTemplates.js";

// Phase 1 MVP: one fixed, deterministic worksheet per subject (see
// planning.md Section 5 Phase 1 — validating the pipeline end-to-end for one
// topic/age-band matters more than template variety, which is a Phase 2/3
// concern). Determinism also means /api/grade can regenerate the same
// questions server-side without needing a session store.
export function generateWorksheet(subject) {
  const { teamStats, countries } = topicKnowledgePacket;

  if (subject === "math") {
    return [
      averageGoalsQuestion(teamStats[0]),
      winPercentageQuestion(teamStats[1]),
      goalDifferenceQuestion(teamStats[2], teamStats[3]),
    ];
  }

  if (subject === "geography") {
    return [
      continentQuestion(countries[0], countries),
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

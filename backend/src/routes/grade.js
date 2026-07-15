import { Router } from "express";
import { generateWorksheet } from "../worksheetGenerator.js";

const router = Router();

const VALID_SUBJECTS = new Set(["math", "geography"]);

function isCorrect(question, submittedValue) {
  if (question.type === "numeric") {
    const submitted = Number(submittedValue);
    if (Number.isNaN(submitted)) return false;
    return Math.abs(submitted - question.answer) <= question.tolerance;
  }
  // multiple-choice
  return String(submittedValue).trim() === String(question.answer).trim();
}

// Stage 7 (auto-grade closed-form answers immediately) + Stage 8 (specific,
// encouraging, fact-grounded feedback) combined into one response, per
// decisions/decision.md #3 — Phase 1 only has closed-form question types, so
// there is no open-ended-writing branch yet.
router.post("/", (req, res) => {
  const { subject, answers } = req.body ?? {};

  if (!VALID_SUBJECTS.has(subject)) {
    return res.status(400).json({ error: `subject must be one of: ${[...VALID_SUBJECTS].join(", ")}` });
  }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers must be an array of { id, value }" });
  }

  const questions = generateWorksheet(subject);
  const byId = new Map(questions.map((q) => [q.id, q]));

  const results = answers.map(({ id, value }) => {
    const question = byId.get(id);
    if (!question) {
      return { id, correct: false, feedback: "We couldn't find that question — let's skip it." };
    }
    const correct = isCorrect(question, value);
    const feedback = correct
      ? `Nice work! ${question.explanation}`
      : `Not quite — let's look at it together. ${question.explanation}`;
    return { id, skill: question.skill, correct, feedback };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const skillsToRevisit = [...new Set(results.filter((r) => !r.correct).map((r) => r.skill))];
  const skillsMastered = [...new Set(results.filter((r) => r.correct).map((r) => r.skill))];

  const otherSubject = subject === "math" ? "geography" : "math";

  res.json({
    results,
    sessionSummary: {
      correctCount,
      totalCount: results.length,
      skillsMastered,
      skillsToRevisit,
      followUpSuggestion: `Want to try a ${otherSubject} challenge next, still using the World Cup?`,
    },
  });
});

export default router;

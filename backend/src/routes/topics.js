import { Router } from "express";
import { listTopics } from "../topics/index.js";

// Stage 1 / decisions/decision.md #1: curated-only for the child — topics come
// from the registry (agents-plan.md), not free text. Free-text search behind a
// parent "grown-up mode" is still out of scope.
const router = Router();

const SUBJECT_META = {
  math: { id: "math", label: "Math", icon: "🔢" },
  geography: { id: "geography", label: "Geography", icon: "🌍" },
};

router.get("/", (_req, res) => {
  const topics = listTopics().map((topic) => ({
    ...topic,
    subjects: topic.subjects.map((s) => SUBJECT_META[s]),
  }));
  res.json({ topics });
});

export default router;

import { Router } from "express";

// Stage 1 / decisions/decision.md #1: curated-only for the child; the only
// topic in Phase 1 is the World Cup demo topic. Free-text search behind a
// parent "grown-up mode" is out of scope for Phase 1.
const router = Router();

router.get("/", (_req, res) => {
  res.json({
    topics: [
      {
        id: "world-cup-2026",
        label: "FIFA World Cup",
        icon: "⚽",
        subjects: [
          { id: "math", label: "Math", icon: "🔢" },
          { id: "geography", label: "Geography", icon: "🌍" },
        ],
      },
    ],
  });
});

export default router;

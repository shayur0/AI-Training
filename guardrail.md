# Guardrail — The Illumination Space

**Task:** Auto-grade a child's worksheet answer and show feedback immediately, unsupervised (Stage 7 in `instructions/planning.md`).

**Dial:** 4/10 (low-middle). Hard to undo — a child who's shown wrong feedback in the moment has already had that experience; the database record can be fixed afterward, but the moment itself can't be. Commit `07ba25c` shows this path has already failed silently once in production.

**Guardrail rule:** If the question is objective/closed-form (exact-match or numeric-tolerance math, multiple-choice geography/science), grade it and show feedback to the child immediately; if it's semi-open or open-ended writing, score it for the parent/teacher dashboard only and never show a hard right/wrong to the child directly.

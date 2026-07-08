# Decisions

A log of real decisions made on The Illumination Space. Each entry: what we decided, why, and what we ruled out.

---

## 1. Curated-only topic input for the youngest child-facing flow

**Decided:** Children pick topics only from pre-vetted icon/card suggestions; free-text entry is gated behind a parent "grown-up mode."

**Why:** Open free-text input from a 5–12-year-old risks unsafe or unparseable input and would require a real-time moderation classifier to handle safely.

**Ruled out:** Open free-text search for children behind only an automated safety filter — too risky to trust before any child uses the product.

(Source: [planning.md](../instructions/planning.md) Stage 1, Section 6 Decision 1)

---

## 2. Template + LLM hybrid for exercise generation

**Decided:** Exercises come from parameterized templates bound to sourced facts, with an LLM used only for phrasing variety, not fact or content invention.

**Why:** Pure free-form LLM generation risks hallucinated stats and content drift past the age-appropriateness bar.

**Ruled out:** Fully free-form LLM generation of worksheet questions — breaks the requirement that every factual claim trace back to a sourced fact.

(Source: [planning.md](../instructions/planning.md) Stage 4)

---

## 3. Split grading authority by question type

**Decided:** Closed-form answers (math, multiple-choice) are auto-graded and shown to the child immediately; open-ended writing gets encouraging acknowledgment now and rubric-based scoring later in the parent/teacher dashboard.

**Why:** Auto-grading is reliable for closed-form answers but risks misjudging valid creative or non-standard writing.

**Ruled out:** Full unsupervised auto-grading of all question types (too risky for open-ended writing), and gating all feedback behind adult review (unnecessarily slow for reliable closed-form grading).

(Source: [planning.md](../instructions/planning.md) Stage 7, Stage 9, Section 6 Decision 4)

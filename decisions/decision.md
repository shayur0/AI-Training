# Decisions

A log of real decisions made on The Illumination Space. Each entry: what we decided, why, and what we ruled out.

---

## 1. Curated-only topic input for the youngest child-facing flow

**Decided:** The child never gets a free-text topic box. Topic selection is limited to pre-vetted icon/card suggestions (e.g., "World Cup," "Dinosaurs," "My Neighborhood"). Free-text topic entry exists only behind a parent-gated "grown-up mode," not exposed to the child directly.

**Why:** Open free-text input from a 5–12-year-old carries real risk (unsafe, nonsensical, or unparseable input) and would require a real-time moderation classifier to handle safely. Curated suggestions sidestep that risk entirely and are cheaper to ship for an MVP.

**Ruled out:** Open free-text search for children, gated only by an automated safety filter. Rejected because it requires building and trusting a moderation pipeline before any child ever uses the product — an unacceptable risk surface for the youngest age band in a v1.

(Source: [planning.md](../instructions/planning.md) Stage 1, Section 6 Decision 1)

---

## 2. Template + LLM hybrid for exercise generation, not pure LLM generation

**Decided:** Exercises are generated from a library of parameterized templates (per subject/skill) bound to real facts from the sourced Topic Knowledge Packet. An LLM layer sits on top only for natural-language phrasing/variety — it cannot invent facts or question structure on its own.

**Why:** Pure free-form LLM generation risks two failure modes at once: hallucinated stats (a math question built on a fabricated goal count) and tonal/content drift (phrasing that slips past the age-appropriateness bar). Binding generation to templates + sourced facts keeps both factual accuracy and pedagogical structure controllable, while still letting the LLM vary the wording so repeat use doesn't feel robotic.

**Ruled out:** Fully free-form LLM generation of worksheet questions. Rejected because every numeric/factual claim in a worksheet must be traceable to a sourced fact — an LLM generating facts wholesale breaks that traceability and reopens the hallucination risk the whole pipeline is designed to avoid.

(Source: [planning.md](../instructions/planning.md) Stage 4)

---

## 3. Split grading authority by question type

**Decided:** Objective/closed-form answers (math results, multiple-choice geography/science) are auto-graded and shown to the child immediately. Open-ended writing gets an immediate encouraging acknowledgment but no hard score in the moment — the rubric-based assessment instead surfaces in the parent/teacher dashboard with an easy override.

**Why:** Auto-grading is reliable for closed-form answers, but carries real risk of misjudging creative or non-standard-but-valid answers in open-ended writing, especially at younger ages. Splitting by question type preserves the immediate self-navigation feedback loop where grading is trustworthy, while containing the highest-misjudgment-risk case (open-ended assessment) behind adult review rather than exposing a possibly-wrong verdict directly to a child.

**Ruled out:**
- Full unsupervised auto-grading of all question types, including open-ended writing shown directly to the child. Rejected as too risky — a misjudged "wrong" on a child's creative answer is a bad experience with no recourse in the moment.
- Requiring parent/teacher review before *any* feedback reaches the child (even for closed-form math). Rejected as unnecessarily slow — it would break the immediate feedback loop for the majority of questions, where auto-grading is already reliable.

(Source: [planning.md](../instructions/planning.md) Stage 7, Stage 9, Section 6 Decision 4)

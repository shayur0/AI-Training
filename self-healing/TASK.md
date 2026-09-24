# The task

**Input:** an approved Topic Knowledge Packet for one worksheet topic — sourced facts
already safety-reviewed (`teamStats`: team/goals/games/wins/draws/losses per entry;
`countries`: name/continent/capital/language per entry), the same shape
`evals/runs/summer-olympics/2-packet-reviewed.json` already has.

**Output:** 6 worksheet questions (3 math + 3 geography) as JSON, in the exact shape
`backend/src/templates/mathTemplates.js` / `geoTemplates.js` produce — this is
`question-writer`'s job from `agents-plan.md`, generated directly by a model this time
instead of by calling the fixed template functions, so the three failure modes below
are things a *generation* step can actually do wrong, not things fixed code could.

**How often:** every time a new topic is added to The Illumination Space. Run for real
twice so far (Summer Olympics — shipped; an abandoned Dinosaurs attempt), and it's the
one step in the orchestrator (`agents-plan.md`) that turns approved facts into what a
child actually sees.

---

# The three failures

All three are not hypothetical — they're the real bugs already found and fixed during
the Module 12 orchestrator build (`evals/runs/RUN-LOG.md`), rewritten here as
mechanically checkable rules instead of prose warnings.

## 1. Fabrication

**Checkable as:** a question's `sourceFact` or `prompt` contains a number or a
country/team name that does not appear, verbatim, among that entry's own fields in the
approved packet.

**Found today:** only by manually re-reading a shipped question against the packet —
nothing currently checks this at generation time. Late: by the time anyone notices, the
question has already been through safety review and shipped.

## 2. Unsound percentage claim

**Checkable as:** a `percentages`-skill question asserts "X won A out of B games" (or
equivalent "part of" framing) for a team where `wins + draws + losses` doesn't
reconcile with `games` (off by more than 1). This is the actual shipped-worksheet bug
from 2026-09-08 — `worksheetGenerator.js` shipped "China won 38 out of 250 games" when
88 ≠ 250 for that team.

**Found today:** `evals/shipped-worksheet.eval.mjs`, but only against code already
integrated into the app — i.e., after a human runs the eval suite, not during
generation.

## 3. Wrong-topic reference

**Checkable as:** a question's `prompt` text names a different event/topic than
`packet.topic` (e.g., says "World Cup" when the packet's topic is "Summer Olympics").
This is the actual `geoTemplates.js` bug from the same build — a template's hardcoded
"...is competing in the World Cup" text leaked into every other topic's questions
until it was generalized.

**Found today:** `evals/synthesis.eval.mjs`, same lateness problem as #2 — caught after
the fact, not during generation.

**What all three have in common:** every one was originally caught by a human running
an eval suite after the fact, not by anything that stops a bad question before it's
written down. That's the gap this assignment closes — moving the same three checks
from "an eval someone remembers to run" to "a critic in the loop that generates the
question in the first place."

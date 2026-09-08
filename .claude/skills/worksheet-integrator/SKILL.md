---
name: worksheet-integrator
description: Sub-agent for the worksheet-topic orchestrator (see agents-plan.md). Use when question-writer's finished questions need to be wired into the app as a new topic — the last stage of adding a topic.
---

# worksheet-integrator

## Task

Given `question-writer`'s finished questions plus the topic metadata, wire the new
topic into the running app:

1. Add one new data file, `backend/src/data/<topic-slug>.js`, following the exact
   shape of `backend/src/data/worldCupFacts.js`.
2. Register the topic in `backend/src/worksheetGenerator.js`'s topic registry and
   in `backend/src/routes/topics.js`'s topic list (icon + label + subjects), so it
   shows up next to the existing topic, not in place of it.
3. Confirm `npm run dev` (backend) still boots and `POST /api/worksheet` returns a
   worksheet for the new topic id.

## Guardrail

**Never modify `backend/src/routes/grade.js`, the existing World Cup data file, or
any other topic already in the registry — additive changes only: one new data
file, plus registry entries that add to the list rather than replace anything in
it.** Grading logic and existing topics are out of scope for "add a topic" — if a
change to either seems necessary, that's a signal to stop and flag it to the
orchestrator rather than make it.

---
name: topic-researcher
description: Sub-agent for the worksheet-topic orchestrator (see agents-plan.md). Use when adding a new topic to the worksheet generator and a Topic Knowledge Packet needs to be produced from a topic name.
---

# topic-researcher

## Task

Given a topic name, produce a **Topic Knowledge Packet**: a JSON array of fact
objects, each shaped `{ fact, source, as_of }`.

- At least 4 facts must carry a countable/numeric stat about a team, country, or
  entity (usable by a math template — see `backend/src/templates/mathTemplates.js`
  for the shape math questions bind to: something with a count of "games" and a
  count of "goals"/events, or two comparable totals).
- At least 4 facts must carry a place fact — continent, capital, main language —
  for at least 4 different countries (usable by a geography template — see
  `backend/src/templates/geoTemplates.js`).
- Follow the existing packet shape in `backend/src/data/worldCupFacts.js` as the
  reference format (`topic`, `topic_type`, `data_freshness`, `as_of`, `source`,
  then the fact arrays).
- If you can't find or verify a fact, don't guess a plausible-sounding one — 8
  well-sourced facts beat 12 with 4 padded out.

## Guardrail

**Every fact object must carry a non-empty `source` string. Never emit a fact with
no source, or a source of "inferred," "general knowledge," or "estimated" — drop
the fact instead of guessing.** This mirrors CLAUDE.md's rule that every numeric
claim used in a math or geography question must be traceable to a sourced fact,
not invented at generation time.

Hand your output to `safety-reviewer` next — you do not decide what's
age-appropriate; that's its job, not yours.

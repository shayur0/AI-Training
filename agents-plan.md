# agents-plan.md — The orchestrator's team

## The one big job

**Adding a new real-world topic to the worksheet generator.** Phase 1 only ships one
hardcoded topic (FIFA World Cup 2026) — `backend/src/data/worldCupFacts.js` is read
directly by `worksheetGenerator.js`. Turning "the World Cup" into "any topic a parent
picks" means: sourcing facts, deciding what's safe to show a 5–12-year-old, turning
facts into template-bound questions, and wiring the result into the app — four
different kinds of judgment.

**Why one agent shouldn't do it alone:** the failure modes don't overlap, and a single
agent under time pressure to "finish the worksheet" has every incentive to blur them —
loosen the safety bar to keep a good question, or invent a plausible number when the
research came up short. CLAUDE.md already treats both as never-break rules ("never
expose a child to unsafe content," "every fact must trace to source"). Splitting the
job means the agent writing questions never sees an unreviewed fact, and the agent
deciding what's safe never has a stake in whether the resulting question is any good.

## The orchestrator

Splits "add topic X" into four sequential handoffs, gates each one on the previous
stage's output, and combines the result into one integrated worksheet. It does not
research, judge safety, write questions, or touch code itself — if it's doing one of
those, that's a sub-agent's job, not the orchestrator's.

```
topic name
   │
   ▼
topic-researcher  ──▶  Topic Knowledge Packet (facts + source + as_of)
   │
   ▼
safety-reviewer   ──▶  same packet, each fact tagged approved/rejected + why
   │
   ▼  (question-writer only ever sees the approved subset)
question-writer   ──▶  math + geography questions, template-shaped
   │
   ▼
worksheet-integrator ──▶  new data file + topic registry entry (additive only)
```

## Sub-agent map

| Sub-agent | One task | One guardrail |
|---|---|---|
| **topic-researcher** | Given a topic name, produce a Topic Knowledge Packet: an array of `{fact, source, as_of}` objects, at least 4 with a numeric/countable stat (math-usable) and 4 with a place (geography-usable). | Every fact object must carry a non-empty `source`. Never emit a fact with no source or a source of "inferred"/"general knowledge" — drop it instead of guessing. |
| **safety-reviewer** | Given a Topic Knowledge Packet, return every fact tagged `approved` or `rejected`, with a one-line reason, for a 5–12 audience. | Never mark a fact `approved` if it involves violence, injury/death detail, sexual content, or partisan political framing — reject it (or hand back a reframed version) instead of passing it through. |
| **question-writer** | Given only the *approved* facts, write 3 math questions and 3 geography questions in the exact shape `mathTemplates.js` / `geoTemplates.js` already use (`id, subject, skill, difficulty, prompt, type, answer/options, tolerance, sourceFact, explanation`). | Every number or place name used in a question must appear verbatim in an approved fact. Never introduce a number or name that isn't traceable to one specific approved fact. |
| **worksheet-integrator** | Wire the new topic into the app: add `backend/src/data/<topic>.js` and one entry each in the topic registry and `routes/topics.js`. | Never modify `backend/src/routes/grade.js`, `worksheetGenerator.js`'s existing topics, or any other topic's data file — additive changes only, one new file plus registry entries. |

## Combine step

The orchestrator's own check before calling the job done: every question in the final
worksheet traces to an `approved` fact from *this* topic's packet (not a leftover World
Cup fact), math and geography both have ≥3 questions, and no existing topic's file
changed. This is what `evals/synthesis.eval.js` checks mechanically — the orchestrator
doesn't get to just assert it.

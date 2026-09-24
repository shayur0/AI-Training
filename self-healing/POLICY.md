# POLICY.md — what this loop may change about itself

Scope: the question-writer generation loop (`self-healing/loop.mjs`,
`self-healing/critic.mjs`, and the two instructions variants). Same question this
project has asked everywhere else in its harness work — not "can it improve itself"
but "which parts are allowed to."

## May change itself alone

- **Which of its own past retry reasons to reuse as a hint on the next run of the same
  kind of question** — this is just better phrasing of an existing constraint, not a
  new rule.
- **The retry cap's internal bookkeeping** (e.g. which attempt number it's on, what it
  logs to the trail) — pure execution detail, no behavior change to what's allowed.
- **Non-substantive prompt phrasing** in the instructions file — wording, examples,
  ordering — as long as no rule's substance changes (see "always needs a person" below
  for what counts as substance).

## Always needs a person

- **Loosening or removing any of the three critic checks** (fabrication, percentage
  soundness, topic match). A critic that can quietly narrow its own definition of
  "wrong" is a critic that will eventually pass something it shouldn't — this is
  exactly the "never rewrite your own rules" pattern from the Harness Assignment 2
  sensors (`.claude/hooks/block-oversized-claude-md.js` and friends), applied here to
  the check itself rather than to a config file.
- **Raising the retry cap above 3.** An uncapped loop is an unbounded bill; changing
  the cap is a cost/latency tradeoff a person should make deliberately, not something
  the loop decides it needs mid-run.
- **What happens on escalation** (who gets notified, whether it's silent). Silence on
  failure is the one thing this whole assignment exists to prevent.
- **Anything that touches child-facing content policy** — these questions ship to kids
  ages 5–12; the safety rules in `instructions/CLAUDE.md` are never something a loop
  gets to adjust on its own, the same line drawn for the orchestrator's
  `safety-reviewer` sub-agent in `agents-plan.md`.
- **Whether a repeated failure gets promoted from "retry loop" to "permanent
  check."** That's an architectural decision (see Part D's storage choice below) —
  a person makes the call on where a lesson gets stored, the loop doesn't
  self-promote its own fixes.

---

# The five-point fine-tune check

Answered honestly for this task (writing worksheet questions from an approved packet):

| Check | Answer | Why |
|---|---|---|
| **Narrow** — one well-defined, repeating task | ✓ Yes | Exactly one shape: approved packet in, 6 template-matching questions out. |
| **High volume** | ✗ No | Run twice for real so far (Summer Olympics, an abandoned Dinosaurs attempt). Nowhere near the volume that would justify a training run. |
| **Real dataset** | ✗ No | No corpus of graded good/bad question sets exists — the three failures are real, but there's no labeled dataset of hundreds of examples, just three named rules and 20 runs from this assignment. |
| **Measurable** | ~ Partial | The critic gives a pass/fail signal, so "does the new thing beat the old thing" is answerable in principle — but only against these three known failure modes, not a held-out eval a fine-tune would need. |
| **Stable** | ✗ No | The Illumination Space is still in active development (two topics shipped, template shapes have already changed once mid-build per `evals/runs/RUN-LOG.md`). The task itself will keep shifting as more subjects/topics are added. |

**2 of 5 yes (Narrow, partial Measurable).** Fewer than five means the honest answer is
**fix the system, not the model** — this assignment's whole premise. Per the diagnosis
ladder, the actual rung this project is on is **#2, The context**: the model wasn't
told the specific numeric/topic constraints of the packet clearly enough in the bare
instructions — not #6 (the model isn't capable of this task; the "after" run's numbers,
once available, are the evidence either way).

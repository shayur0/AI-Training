# Orchestrator run log

Real runs of the worksheet-topic orchestrator (agents-plan.md), most recent first.
Not a changelog — a record of what the evals actually caught.

## 2026-09-08 — "dinosaurs" (queued via hook, run via `scripts/orchestrator-loop.mjs --live`)

**What happened:** the hook (`.claude/hooks/enqueue-topic-request.sh`) correctly
enqueued `topics/requests/dinosaurs.md` into `topics/queue.json`. The loop picked
it up and shelled out to `claude -p` for real. `topic-researcher` produced a
sound packet (5 dinosaur species, 6 fossil-site countries, `wins+draws+losses ==
games` for every entry this time) but its `Write` call to
`evals/runs/dinosaurs/1-packet.json` needed interactive approval that a headless,
piped `claude -p` session has no way to give. The run returned exit code 0 with
no output file.

**What the eval gate did:** `orchestrator-loop.mjs` checks `existsSync(runDir)`
before even running evals, and only marks `processed: true` if both the run
produced output *and* `evals/run-all.mjs` passes. Neither held here, so
`topics/queue.json` still shows `"dinosaurs"` as `processed: false` — the loop
did not report false success. This is the one thing worth being honest about
happening exactly the way the assessment warns it can: "an autonomous loop with
no evals... reports success while quietly doing the wrong thing." The gate is
what turned a silent stall into a visible, retryable non-success instead.

**The fix this points to (not yet made):** scope `.claude/settings.json`
permissions so a headless orchestrator run can write, without a prompt, to the
paths it's actually supposed to touch (`evals/runs/**`,
`backend/src/data/*.js` new files, `backend/src/topics/index.js`,
`topics/queue.json`) — narrow allow-listing, not `--dangerously-skip-permissions`.
Tracked as a follow-up rather than done live in this run, since widening
unattended write permissions is its own judgment call, not a mechanical fix.

## 2026-09-08 — "Summer Olympics" (run manually, sub-agent by sub-agent)

**What happened:** `topic-researcher` → `safety-reviewer` → `question-writer`
all ran clean and each passed its own eval. `safety-reviewer` flagged that
`wins + draws + losses != games` for every team in this packet and warned
against building a percentage/sum-check question from those fields;
`question-writer` correctly avoided `winPercentageQuestion` because of that flag.

**What the eval gate caught:** two things the individual sub-agents couldn't see:

1. **`synthesis.eval.mjs`** — `geoTemplates.js`'s `continentQuestion` had
   `"...is competing in the World Cup"` hardcoded into its prompt text, a
   latent bug from when there was only one topic. Every Olympics geography
   question said the country was "competing in the World Cup." Fixed by
   generalizing the template to take a `topicLabel` argument instead of a
   hardcoded string (`backend/src/templates/geoTemplates.js`,
   `backend/src/worksheetGenerator.js`).
2. **`shipped-worksheet.eval.mjs`** (added *because of* this run) — the live
   `generateWorksheet()` doesn't consume `question-writer`'s curated question
   list at all; it always calls the same three templates by fixed array
   position. So even after fixing (1), the *shipped* math worksheet still
   asked "China won 38 out of 250 games. What percent of their games did they
   win?" — the exact false "part of" claim `safety-reviewer` flagged and
   `question-writer` had specifically avoided in its own draft. Fixed by
   adding `winPercentageIsSound()` as a guard in `worksheetGenerator.js`,
   falling back to a second `averageGoalsQuestion` when the data doesn't
   support the "out of" framing — which independently reproduces exactly what
   `question-writer` had already decided.

Both fixes are shared-infra changes (`geoTemplates.js`, `worksheetGenerator.js`),
not topic data — per `worksheet-integrator`'s guardrail, no topic's data file or
`grade.js` was touched to fix either one.

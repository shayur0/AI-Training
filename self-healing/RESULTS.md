# Results — before / after storing the fix

## What actually happened (read this before the numbers)

The honest finding here isn't the one the assignment's own example implies. Sonnet 5,
given only the bare instructions in `instructions-before.md` — no explicit warning
about fabrication, the games-denominator trap, or topic confusion — avoided all three
named failures on 9 of 10 real runs. The task the last three assessments' real bugs
came from turned out to be one this model is already quite good at, once it's simply
told to use the approved packet and write questions from it.

The one retry that *did* happen (run `before-04`) was not a generation failure. It was
a **false positive in `critic.mjs` itself**: the model wrote "France had 64 total
results (wins, draws, and losses). 16 of those were wins" — a sound, self-consistent
percentage question that correctly avoided the `games` field entirely — but the
critic's percentage-soundness check compared `wins+draws+losses` against `games`
*unconditionally* for any `percentages`-skill question, regardless of whether the
prompt actually claimed games as the denominator. It didn't here, so the check should
never have fired.

**So the repeated failure worth storing wasn't in the model's output. It was in the
critic's own logic.** Fixed in `critic.mjs`: the percentage-soundness check now only
fires when the prompt text actually contains the word "game(s)" — i.e., only when the
question really does claim a percent-of-games figure.

## Where the fix is stored, and why not the others

**Stored in: Checks.** ("The failure was real and repeatable — make it a permanent
critic.") Not Instructions, because the generation side was never the problem — adding
prose warnings to `instructions-after.md` would have papered over a checker bug, not
fixed it, and every future run would still carry a critic that can false-positive on a
sound answer. Not Memory (this isn't customer/case-specific), not Retrieval (nothing
was guessing from a missing source — the model read the packet correctly), not Tools or
Workflow (no missing capability, no step that needed splitting).

## The numbers

| | Before (original critic, bare instructions) | After (corrected critic, same instructions) |
|---|---|---|
| Runs | 10 | 10 |
| Total tries | 11 | 10 |
| Retries | 1 | 0 |
| Escalations | 0 | 0 |
| Avg tries/run | 1.1 | 1.0 |

All 10 real "after" runs — fresh generations, not reruns of the same output — passed
on the first try. `self-healing/runs/{before,after}-*.json` are the raw per-run trails;
`self-healing/runs/{before,after}-summary.json` are the aggregates above.

**Supporting check:** rescoring the same 10 "before" generations against the
*corrected* critic (no new model calls, same real outputs, `self-healing/rescore.mjs`)
gives 0 retries / 0 escalations / 1.0 avg tries — confirming the one retry we saw live
was entirely attributable to the critic bug, not to anything the model did wrong.

## Reading the drop honestly

Retries went from 1/10 to 0/10 — real, but small, because the baseline was already
near the floor. That's the honest shape of this result: don't oversell a 1-run swing
as proof the system "got better at the task." What it actually shows is narrower and
more useful than "the model improved": **the critic got more accurate**, which is the
whole point of storing a fix as a permanent check rather than letting a fluke incident
go unexamined and unfixed. A genuine generation-quality problem would show up as a
retry count that drops *after a prompt change*; here the prompt never changed between
before and after (`instructions-before.md` and `instructions-after.md` are
byte-identical below their comment header) — only `critic.mjs` did. That isolation is
what makes the result trustworthy rather than a coincidence: the one variable that
changed is the one thing that explains the one number that moved.

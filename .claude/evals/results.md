# Report card — routing evals

Run 2026-09-23. Each eval spawned a fresh agent (same model, zero prior context) that
read *only* root `CLAUDE.md` first, then navigated wherever it judged necessary using
`Read` alone (no Bash/Grep/Glob, so every file touched shows up as a real hop, not a
search shortcut). Hops = number of distinct files read before answering. Wrong-route =
a run that loaded a file explicitly listed as `should_not_load` for that task, or (for
the negative case) fabricated an answer instead of saying no such doc exists.

| Eval | Type | Hops | Files read | Wrong-route? | Notes |
|---|---|---|---|---|---|
| eval-explicit-01 | explicit | 2 | CLAUDE.md → `instructions/CLAUDE.md` | No | Exact target, right at the max_hops=2 budget. |
| eval-implicit-02 | implicit | 5 | CLAUDE.md → `agents-plan.md` → `instructions/planning.md` → `instructions/CLAUDE.md` → `decisions/decision.md` | **Yes** — loaded `decisions/decision.md` (explicitly should-not-load) | Answer itself was accurate and thorough, but took 5 hops against a max_hops=2 budget, and pulled in the decisions log even though the router doesn't point "add a subject" there. |
| eval-contextual-03 | contextual | 2 | CLAUDE.md → `evals/runs/RUN-LOG.md` | No | Fully answered from RUN-LOG.md alone — didn't need to also open `harness/failures.jsonl`. |
| eval-negative-04 | negative | 3 | CLAUDE.md → `decisions/decision.md` → `instructions/planning.md` | No (no fabrication) | Correctly concluded no refund/subscription doc exists and said so plainly — but took 3 hops against a max_hops=1 budget to get there, checking two files to confirm absence rather than recognizing quickly that nothing in the router even hints at billing. |

## Results line

**Average hops: 3.0** (target ≤2 — missed; explicit and contextual hit target, implicit and negative did not)
**Wrong-route rate: 25%** (1/4 — the implicit case pulled in `decisions/decision.md`)
**Cost:** 216,489 total tokens across the 4 runs (harness-reported `subagent_tokens`,
not a raw API `usage` object). Estimated at Sonnet 5 pricing ($2/MTok in, $10/MTok
out) assuming an 85/15 input/output split typical of read-heavy routing tasks:
**≈ $0.69** for the full 4-eval run. This is an estimate, not a billed figure — the
Agent tool doesn't expose a precise input/output token split.

## What this says about the router

3+ hops means the routing is broken, not the destination — per the assignment's own
rule. Two of four evals hit that. The pattern: **explicit and contextual questions
route in exactly 2 hops; implicit and negative questions don't.** The implicit case
over-explored because "add a subject" genuinely touches four different docs
(agents-plan.md, planning.md, instructions/CLAUDE.md, decisions/decision.md all have
real, relevant content) and the router doesn't disambiguate which one to open *first*
for that specific question shape. The negative case took 3 hops to conclude "nothing
exists" rather than 1, because nothing in the router explicitly rules out a whole
category (billing/subscriptions) — the agent had to check two plausible-sounding docs
before being confident there wasn't a third.

**Fix this doesn't do (yet):** a router row like "Adding a subject/skill, step
one → agents-plan.md" (singular, not the current multi-doc "need X → read Y" table
row) would likely collapse eval-implicit-02 toward 2 hops. Left as-is and named in the
reflection below, rather than re-tuned just to make this report card look better —
the honest number is 3.0 / 25%, not a retroactively fixed one.

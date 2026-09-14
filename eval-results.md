# eval-results.md — proving the harness, not the model

**Model:** identical in both runs (Sonnet 5, via a fresh general-purpose agent —
no conversation history, no prior context).

**Task given, word-for-word, both times:** "You've just been dropped into this
repository fresh, with no other context. Read ONLY the file CLAUDE.md at the
repo root — do not read any other file, do not explore the directory tree.
Based solely on that, answer: (1) what does this project do and who is it for,
(2) name two hard rules you must never break, (3) where would you look next to
understand its full architecture, and why."

**The one harness change:** root `CLAUDE.md` had two empty placeholder
sections — `## Architecture Overview` said only `_Add a brief overview of your
project architecture_`, and `## Conventions & Patterns` said only `_Add your
project-specific conventions here_`. Everything else in the file (the managed
Beads integration block, permissions, hooks) was untouched between runs. The
change: filled those two placeholders with ~15 lines naming the product, the
audience, the three files that hold the real rules/architecture/loop, and two
concrete conventions. Nothing about the task prompt, the model, or any other
file changed.

## The 10 checks

Each check: did the agent's answer, from CLAUDE.md alone, correctly state the
real fact (source of truth: `instructions/CLAUDE.md`, `instructions/planning.md`,
`agents-plan.md`)?

| # | Check | Before | After |
|---|---|---|---|
| 1 | Identifies the product as a worksheet generator | ✗ | ✓ |
| 2 | Identifies the audience as children, ages 5–12 | ✗ | ✓ |
| 3 | States the "never expose unsafe/adult content to a child" rule | ✗ | ✗ |
| 4 | States the "every fact must be sourced, never invented" rule | ✗ | ✓ |
| 5 | States the "never infer more about a specific child than given" rule | ✗ | ✗ |
| 6 | Correctly names `instructions/planning.md` for the full architecture | ✗ | ✓ |
| 7 | Correctly names `instructions/agent_loop.md` for the agent's operating loop | ✗ | ✓ |
| 8 | States the "ask before deleting a file / changing recorded scope" rule | ✗ | ✗ |
| 9 | No regression — doesn't lose ground on anything it could state correctly before (e.g. beads/task-tracking) | ✓ | ✓ |
| 10 | No hallucination — doesn't invent a wrong fact to fill the gap | ✓ | ✓ |
| | **Score** | **2 / 10** | **7 / 10** |

Full transcripts of both runs are in this assessment's write-up; nothing here
is summarized from memory — each answer was scored against the checklist
above, not against a vibe.

## What moved, and what didn't

**Moved:** the four checks (1, 2, 6, 7) that ask "does CLAUDE.md tell you what
this project *is* and where to look" all flipped from wrong to right, plus
check 4 (the sourcing rule), because the fix explicitly named those files and
that rule. That's the harness doing exactly its one job — handing a fresh
session the room's memory — with the model held constant.

**Didn't move:** checks 3, 5, and 8 stayed wrong. Those three specific rules
live in `instructions/CLAUDE.md`, not in what got added to root `CLAUDE.md` —
the fix pointed *at* that file ("hard safety/traceability rules: `instructions/
CLAUDE.md`") but didn't inline its contents, so a session that (correctly,
per its instructions) reads *only* root `CLAUDE.md` still can't state them.
This is useful, not a failure of the experiment: it shows the fix worked
exactly as far as it reached, and no further — a smaller, later harness change
(inlining those three specific rules, or having root CLAUDE.md explicitly
require reading `instructions/CLAUDE.md` before any content-generation task)
would be the next one to test the same way.

**Baseline agent's own words, unprompted:** "The file itself is almost
entirely generic scaffolding... it does not actually say what the project
does or who its users are." That's the harness gap stated by the model
that hit it, before anything was changed.

---
name: illumination-space-overview
description: Use at the start of any session in this repo, or whenever you need project context (what this product is, who it's for, how the pipeline works, what's off-limits) without re-reading every file. Trigger on questions like "what is this project," "what does this repo do," "what's the architecture," or before making any change to instructions/, decisions/, or notes/.
---

# The Illumination Space — Project Overview

## What this project is

This repo is the **planning and knowledge base** for "The Illumination Space," a
**Smart/Dynamic Worksheet Generator**. There is no application code here yet —
this is a pre-build product-planning repo. The deliverables so far are
architecture docs, product decisions, and a session journal, not software.

**Core belief:** a child's own life and the real world — interests, current
events, immediate environment — should be the "living textbook," not a static
one.

**What the product does:** given (1) a real-world topic, (2) a subject/skill,
and (3) a learning level, it generates a personalized worksheet connecting the
topic to an academic skill, then grades answers and gives feedback.

**Audience:** children ages 5–12, used either directly (self-navigation) or
set up/guided/reviewed by a parent or teacher.

**Canonical running example:** FIFA World Cup → math (goal averages, win %,
bracket probability), geography (host/competing countries), science (sports
physics, nutrition), language (descriptive/persuasive writing about a match).
Use this example when illustrating any change — it's the one already worked
through end-to-end in [planning.md](../../../instructions/planning.md) Section 3.

## Architecture: the 9-stage pipeline

Full detail lives in [instructions/planning.md](../../../instructions/planning.md).
Four phases, nine stages:

| Phase | Stages | Purpose |
|---|---|---|
| A. Intake | 1 | Capture what's wanted |
| B. Research & Safety | 2–3 | Turn a topic into safe, structured knowledge |
| C. Generation & Delivery | 4–6 | Turn knowledge into a worksheet a child can use |
| D. Assessment & Loop-Closing | 7–9 | Grade work, give feedback, report back, adapt |

1. Input & Parameter Definition
2. Topic Research & Data Sourcing
3. Content Safety & Age-Appropriateness Filtering
4. Exercise Generation Logic (template + LLM hybrid, never pure free-form)
5. Worksheet Assembly & Formatting (digital + printable PDF)
6. Delivery & Self-Navigation UX
7. Answer Capture & Assessment
8. Feedback & Adaptive Follow-Up
9. Parent/Teacher Review Dashboard

Each stage in planning.md follows a mandatory **Inputs → Actions → Outputs →
Considerations/Risks** structure — see the docs-conventions skill before
editing it.

The agent's own operating loop (separate from the product pipeline above) is
**Observe → Decide → Act → Get Feedback → Improve**, documented in
[instructions/agent_loop.md](../../../instructions/agent_loop.md). The key
point: "Improve" means changing approach based on *why* the last action
failed, not repeating it.

## Rules that must never be broken

From [instructions/CLAUDE.md](../../../instructions/CLAUDE.md) — these apply
to any work in this repo, product design or content generation alike:

- Never expose a child to unsafe, unverified, or adult content. Free-text
  topic input must pass the safety filter before reaching generation (Stage 1
  → Stage 3).
- Never treat live/current-event facts as stable — tag every fact with
  source + freshness; don't build exercises on data that could change
  mid-session (Stage 2). If live data is unavailable: cached data with a
  visible "as of" date → evergreen background facts → an honest "not
  available" message. Never fabricate stats.
- Never store or infer anything about a specific child beyond what was
  explicitly provided (e.g., a pet's name is fine; assumptions about the pet
  are not).
- Always ask before deleting a file or changing scope/architecture decisions
  already recorded in planning.md.
- Write anything learner-facing (worksheet text, feedback) for a 5–12-year-old
  reader: short sentences, define new terms, no jargon.
- Prefer the simplest safe path over cleverness — this is a children's
  product; robustness and predictability beat novelty.

Three already-resolved design decisions worth knowing before proposing
alternatives (full rationale in
[decisions/decision.md](../../../decisions/decision.md)):
1. Children pick topics only from pre-vetted cards; free text is gated behind
   a parent "grown-up mode."
2. Exercises come from parameterized templates bound to sourced facts; the
   LLM only varies phrasing, never invents facts.
3. Closed-form answers auto-grade immediately; open-ended writing gets
   encouraging acknowledgment now and rubric scoring later in the
   parent/teacher dashboard.

## Tooling stack

- **No application framework yet** — this repo is docs/markdown only
  (`data/` is present but empty, reserved for future raw data/exports).
- **bd (Beads)** — issue tracker for all task tracking in this repo. Local
  Dolt DB, synced via `refs/dolt/data` on the git remote. Run `bd prime` for
  full workflow context; see the `beads` skill at
  [.agents/skills/beads/SKILL.md](../beads/SKILL.md).
- **Claude Code** — configured via `.claude/settings.json` (a `SessionStart`
  hook runs `bd prime --hook-json`) and `.claude/settings.local.json`
  (permission allowlist).
- **Codex** — configured via `.codex/config.toml` and `.codex/hooks.json`,
  reads the same `AGENTS.md`.
- **git** — remote is `github.com/shayur0/AI-Training`. `CLAUDE.md` and
  `AGENTS.md` are independent files kept manually in sync (not symlinked);
  mirror substantive edits across both.

## Common tasks in this repo

- Add or revise a pipeline stage → edit `instructions/planning.md` (see
  docs-conventions skill for the required structure).
- Record a new product decision → append to `decisions/decision.md`.
- Log a session → append a dated entry to `notes/memory.md`.
- Find/claim/close work → use `bd` (`bd ready`, `bd show <id>`,
  `bd update <id> --claim`, `bd close <id>`). Never use TodoWrite or
  markdown TODO lists for durable project tasks in this repo.
- Re-map the repo layout when a new top-level folder appears → update
  `structure.md` (a documented recurring failure mode — see
  `structure-sync` agent).

## Known gotcha

`structure.md` is a manually-written snapshot, not a generated file — it goes
stale silently whenever a new top-level folder is added (this has already
happened twice: `.beads`, `.claude`, `.agents` all landed after the original
snapshot). Re-check it against the actual top-level directory listing
whenever you add, rename, or remove a top-level folder.

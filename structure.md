# Repo Structure

## Content folders

- `notes/` → session journal
  - `memory.md` — dated log of work sessions, one real lesson per entry
- `instructions/` → rules and specs the agent works from
  - `CLAUDE.md` — agent rules for this project
  - `planning.md` — the 9-stage pipeline spec (Intake → Research & Safety → Generation & Delivery → Assessment & Loop-Closing) for the Smart Worksheet Generator
  - `agent_loop.md` — the Observe-Decide-Act-Feedback-Improve loop the agent runs on
- `decisions/` → decision log
  - `decision.md` — what we decided / why / what we ruled out, for real product decisions
- `data/` → raw data & exports (currently empty)

## Tooling / agent config (dotfiles)

- `.beads/` → Beads issue tracker database (`bd`)
- `.claude/` → Claude Code settings (`settings.json`, `settings.local.json`)
- `.codex/` → Codex config (`config.toml`, `hooks.json`)
- `.agents/` → shared agent skills (e.g. `skills/beads/`)

## Top-level files

- `CLAUDE.md` / `AGENTS.md` — project instructions for AI agents (kept in sync)
- `README.md` — project readme

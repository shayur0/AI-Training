# Repo Structure

## Content folders

- `backend/` → Node/Express API server
- `data/` → raw data & exports (currently empty)
- `decisions/` → decision log
  - `decision.md` — what we decided / why / what we ruled out, for real product decisions
- `frontend/` → Vite + React web application
- `instructions/` → rules and specs the agent works from
  - `CLAUDE.md` — agent rules for this project
  - `planning.md` — the 9-stage pipeline spec (Intake → Research & Safety → Generation & Delivery → Assessment & Loop-Closing) for the Smart Worksheet Generator
  - `agent_loop.md` — the Observe-Decide-Act-Feedback-Improve loop the agent runs on
- `notes/` → session journal
  - `memory.md` — dated log of work sessions, one real lesson per entry

## Tooling / agent config (dotfiles)

- `.beads/` → Beads issue tracker database (`bd`)
- `.claude/` → Claude Code settings (`settings.json`, `settings.local.json`) and
  project subagents (`agents/structure-sync.md`, `agents/decision-logger.md`,
  `agents/memory-journalist.md`)
- `.codex/` → Codex config (`config.toml`, `hooks.json`)
- `.agents/` → shared agent skills: `skills/beads/`, plus project-context
  skills `skills/illumination-space-overview/` and `skills/illumination-space-docs/`

## Top-level files

- `CLAUDE.md` / `AGENTS.md` — project instructions for AI agents (kept in sync)
- `README.md` — project readme

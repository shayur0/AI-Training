# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->


## What this is

**The Illumination Space** turns a real-world topic into a personalized worksheet
for kids ages 5–12, then grades it and gives feedback. Audience: children,
directly or via a parent/teacher.

## Critical rules (never break)

- Never expose a child to unsafe/unverified content; every fact in a worksheet
  must trace to a source — never invent one. Full list: `instructions/CLAUDE.md`.
- Adding a topic is additive only — never touch `grade.js` or another topic's
  data file. Full pattern: `agents-plan.md`.
- This file stays a router. If you're about to add a paragraph of detail,
  it belongs in an L2/L3 doc below, not here — keep it under 150 lines.

## Router — where to go next

| Need | Read (L2/L3) |
|---|---|
| Product safety/traceability rules, full list | `instructions/CLAUDE.md` |
| Full 9-stage architecture | `instructions/planning.md` |
| Agent operating loop (Observe→Decide→Act→Feedback→Improve) | `instructions/agent_loop.md` |
| Topic-adding orchestrator + sub-agent guardrails | `agents-plan.md` + `.claude/skills/` |
| Past product decisions + why | `decisions/decision.md` |
| Session history / lessons learned | `notes/memory.md` |
| Orchestrator run history / bugs an eval caught | `evals/runs/RUN-LOG.md` |
| This harness's own memory (open work, architectural calls, incidents) | `harness/status.jsonl` · `harness/decisions.jsonl` · `harness/failures.jsonl` |

## Build & run

```bash
cd backend && npm install && npm run dev    # Express API, port 3001
cd frontend && npm install && npm run dev   # Vite dev server, proxies /api
node evals/run-all.mjs evals/runs/<slug> "<Topic Label>"  # orchestrator evals
```

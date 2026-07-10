# Memory

A running journal of work sessions on The Illumination Space. Each entry: date, task, one true lesson learned.

---

## 2026-06-09 — Initial commit

**Task:** Set up the project skeleton (README, git repo).

**Lesson:** Standing up the repo before any content existed gave later planning work a fixed home to reference — CLAUDE.md's rule about asking before changing scope/architecture only works because there's a stable place (planning.md) for those decisions to live and be checked against.

---

## 2026-06-26 — Add planning.md for Smart Worksheet Generator

**Task:** Write the full 9-stage pipeline (Intake → Research & Safety → Generation & Delivery → Assessment & Loop-Closing) for turning a topic into a graded worksheet.

**Lesson:** Forcing every stage into the same Inputs → Actions → Outputs → Risks structure (rather than free-form prose) is what surfaced risks that prose would have glossed over — e.g., the live-data fallback ladder in Stage 2 (cached data → evergreen facts → honest "not available") only got written down because "Risks" was a mandatory section, not an afterthought.

---

## 2026-07-02 — Add agent_loop.md explaining the Observe-Decide-Act-Feedback-Improve loop

**Task:** Document the five-step loop the agent runs on, with a worked example (reminding a student, Ayesha, about pending assignments).

**Lesson:** "Improve" only means something if it changes the next action — the Ayesha example makes this concrete: resending the same email after it failed isn't improving, it's repeating. The real lesson from a failed action is diagnosing *why* it failed (wrong channel, not enough urgency) before picking the next one, which is exactly the behavior CLAUDE.md's "How we work" section requires when a worksheet stage fails (bad topic match, wrong skill level, stale fact).

---

## 2026-07-06 — Reorganize repo into notes/instructions/data/decisions structure, then bd init

**Task:** Move flat top-level files into `notes/`, `instructions/`, `data/`, `decisions/`, write `structure.md` to map them, and initialize the Beads issue tracker in the same session.

**Lesson:** Writing structure.md as a one-time snapshot means it silently goes stale the moment new folders show up afterward — `.beads`, `.claude`, `.agents` all landed post-reorganization and none made it into the map. A folder map is only trustworthy if it's re-checked whenever a new top-level folder appears, the same way memory.md gets a new entry every session rather than being written once and left alone.

---

## 2026-07-08 — Add decision log, then trim entries to one sentence each

**Task:** Write `decision.md` capturing 3 key product decisions from planning.md (topic input gating, template+LLM hybrid, split grading authority), then immediately condense each Decided/Why/Ruled-out field down to one sentence.

**Lesson:** The first draft of each entry carried the full reasoning chain (specific examples, edge cases, second-order justifications) and was harder to scan *because* it was complete — trimming to one sentence per field didn't lose the decision, it forced picking out which single clause was load-bearing (e.g., "breaks the requirement that every factual claim trace back to a sourced fact") versus which was supporting detail. A decision log is for fast lookup later, not for re-deriving the reasoning from scratch each time it's read.

---

## 2026-07-10 — Add SKILL.md files and Claude Code subagents for onboarding

**Task:** Wrote two project-context skills (`illumination-space-overview`, `illumination-space-docs`) under `.agents/skills/`, and three Claude Code subagents (`structure-sync`, `decision-logger`, `memory-journalist`) under `.claude/agents/`, then updated `structure.md` in the same session to keep it accurate.

**Lesson:** The most useful agents to build weren't invented from scratch — they came directly out of this file's own past entries (structure.md drift on 2026-07-06, decision-log trimming on 2026-07-08). A memory log that records *why* something broke is a ready-made spec for the agent that should prevent it next time; the harder part than writing the agent was resisting the urge to give it broader scope than the one narrow failure mode it was built for.

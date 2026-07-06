# CLAUDE.md

## Purpose
"The Illumination Space" turns a real-world topic (a child picks or a parent/teacher sets) into a personalized worksheet tied to a school skill, then grades the answers and gives feedback. Audience: kids ages 5–12, used directly or via a parent/teacher.

## Rules — never break
- Never expose a child to unsafe, unverified, or adult content. Free-text topic input must pass the safety filter before it reaches generation (see Stage 1 in planning.md).
- Never treat live/current-event facts as stable — tag every fact with source + freshness, and don't build exercises on data that could change mid-session (planning.md, Stage 2).
- Never store or infer anything about a specific child beyond what was explicitly provided (e.g., their pet's name is fine; assumptions about the pet are not).
- Always ask before deleting a file or changing scope/architecture decisions already recorded in planning.md.

## Where things live
- Full system architecture (9-stage pipeline, inputs/outputs per stage) → planning.md
- The Observe → Decide → Act → Get Feedback → Improve loop this agent runs on → agent_loop.md

## How we work
- Write for a 5–12-year-old reader when generating anything learner-facing: short sentences, define new terms, no jargon.
- When writing/updating planning.md, keep the Inputs → Actions → Outputs → Risks structure per stage — don't collapse it into prose.
- When something fails (bad topic match, wrong skill level, stale fact used), don't just retry — name why it failed and change the approach, per agent_loop.md's Improve step.
- Prefer the simplest safe path over cleverness — this is a children's product; robustness and predictability beat novelty.

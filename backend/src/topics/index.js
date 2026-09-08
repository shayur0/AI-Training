import { topicKnowledgePacket as worldCup } from "../data/worldCupFacts.js";
import { topicKnowledgePacket as summerOlympics } from "../data/olympicsFacts.js";

// Topic registry (agents-plan.md): each entry is additive. worksheet-integrator
// adds one entry per new topic here plus a matching data file under
// backend/src/data/ — it never edits an existing entry or worksheetGenerator.js's
// grading-adjacent code.
export const TOPICS = {
  "world-cup-2026": {
    id: "world-cup-2026",
    label: "FIFA World Cup",
    icon: "⚽",
    subjects: ["math", "geography"],
    packet: worldCup,
  },
  "summer-olympics": {
    id: "summer-olympics",
    label: "Summer Olympics",
    icon: "🥇",
    subjects: ["math", "geography"],
    packet: summerOlympics,
  },
};

export function listTopics() {
  return Object.values(TOPICS).map(({ id, label, icon, subjects }) => ({
    id,
    label,
    icon,
    subjects,
  }));
}

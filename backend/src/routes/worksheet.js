import { Router } from "express";
import { generateWorksheet, toClientQuestion } from "../worksheetGenerator.js";
import { TOPICS } from "../topics/index.js";

const router = Router();

const VALID_SUBJECTS = new Set(["math", "geography"]);
const DEFAULT_TOPIC = "world-cup-2026"; // keeps older clients that don't send `topic` working

router.post("/", (req, res) => {
  const { subject, topic: topicId = DEFAULT_TOPIC } = req.body ?? {};

  if (!VALID_SUBJECTS.has(subject)) {
    return res.status(400).json({ error: `subject must be one of: ${[...VALID_SUBJECTS].join(", ")}` });
  }
  const topic = TOPICS[topicId];
  if (!topic) {
    return res.status(400).json({ error: `Unknown topic: ${topicId}` });
  }

  const questions = generateWorksheet(topicId, subject).map(toClientQuestion);

  res.json({
    topicId,
    topic: topic.packet.topic,
    asOf: topic.packet.as_of,
    subject,
    questions,
  });
});

export default router;

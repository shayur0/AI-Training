import { Router } from "express";
import { generateWorksheet, toClientQuestion } from "../worksheetGenerator.js";
import { topicKnowledgePacket } from "../data/worldCupFacts.js";

const router = Router();

const VALID_SUBJECTS = new Set(["math", "geography"]);

router.post("/", (req, res) => {
  const { subject } = req.body ?? {};

  if (!VALID_SUBJECTS.has(subject)) {
    return res.status(400).json({ error: `subject must be one of: ${[...VALID_SUBJECTS].join(", ")}` });
  }

  const questions = generateWorksheet(subject).map(toClientQuestion);

  res.json({
    topic: topicKnowledgePacket.topic,
    asOf: topicKnowledgePacket.as_of,
    subject,
    questions,
  });
});

export default router;

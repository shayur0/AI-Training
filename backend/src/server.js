// Must run before any other import touches process.env for a secret --
// module-level destructuring elsewhere (e.g. src/routes/slackEvents.js)
// reads process.env at import time, so dotenv has to have already run.
import "dotenv/config";
import express from "express";
import cors from "cors";
import topicsRouter from "./routes/topics.js";
import worksheetRouter from "./routes/worksheet.js";
import gradeRouter from "./routes/grade.js";
import slackEventsRouter from "./routes/slackEvents.js";
import githubWebhookRouter from "./routes/githubWebhook.js";
import { startCheckInLoop } from "./checkInLoop.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// `verify` captures the raw body bytes alongside the parsed JSON -- Slack's
// and GitHub's signature checks are HMACs over the exact raw payload, which
// re-stringifying the parsed body would not reliably reproduce.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/topics", topicsRouter);
app.use("/api/worksheet", worksheetRouter);
app.use("/api/grade", gradeRouter);
app.use("/slack", slackEventsRouter);
app.use("/webhooks", githubWebhookRouter);

app.listen(PORT, () => {
  console.log(`Illumination Space backend listening on http://localhost:${PORT}`);
  startCheckInLoop();
});

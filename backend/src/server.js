import express from "express";
import cors from "cors";
import topicsRouter from "./routes/topics.js";
import worksheetRouter from "./routes/worksheet.js";
import gradeRouter from "./routes/grade.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/topics", topicsRouter);
app.use("/api/worksheet", worksheetRouter);
app.use("/api/grade", gradeRouter);

app.listen(PORT, () => {
  console.log(`Illumination Space backend listening on http://localhost:${PORT}`);
});

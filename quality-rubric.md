# Quality Rubric — Worksheet Grading Feedback

Scores the `feedback` string returned per question by `POST /api/grade`
(`backend/src/routes/grade.js`), read by a child aged 5–12 (or a parent
watching over their shoulder) right after they submit an answer.

1. Opens with a clear correct/incorrect signal before anything else ("Nice work!" / "Not quite — let's look at it together.")
2. Shows the actual method or fact, not just a verdict, so the child learns the right answer either way
3. Uses words a 5–12 year old can read, with no unexplained jargon beyond what the question itself already used
4. Never blames or shames the child for a wrong answer
5. Under 30 words

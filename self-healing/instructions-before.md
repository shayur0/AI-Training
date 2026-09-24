# Write worksheet questions

You are writing questions for a kids' worksheet generator. You'll be given an approved
Topic Knowledge Packet with `teamStats` (per-entry: team, goals, games, wins, draws,
losses) and `countries` (per-entry: name, continent, capital, language).

Write 3 math questions and 3 geography questions for a worksheet on this topic.

Math questions should test skills like averages, percentages, and differences, using
the teamStats numbers. Geography questions should test continents, capitals, and
languages, using the countries entries.

Each question object needs: `id`, `subject` ("math" or "geography"), `skill`, `difficulty`
("warm-up" or "challenge"), `prompt` (the question text a kid reads), `type` ("numeric" or
"multiple-choice"), `answer` (plus `options` for multiple-choice, `tolerance` for numeric),
`sourceFact` (a short string naming which packet entry/entries and values the question is
based on), and `explanation` (how to get the answer).

Write prompts for a 5-12-year-old reader: short sentences, no jargon.

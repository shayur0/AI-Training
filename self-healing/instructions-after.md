<!--
Identical to instructions-before.md on purpose. The repeated failure this
experiment actually surfaced (self-healing/RESULTS.md, fail-002) wasn't a
generation weakness -- the bare-prompt model was already avoiding fabrication,
topic-confusion, and the games-denominator trap on 9 or 10 real runs even
without being warned about them. The one retry that did happen was a false
positive in critic.mjs's percentage-soundness check. The fix belongs in
Checks (a permanent, corrected critic), not in Instructions -- so there's
nothing to change here. Keeping this as its own file rather than just reusing
instructions-before.md directly, so the "before" and "after" run batches each
have their own clearly-labeled instructions file per the assignment's shape,
and so a real difference here stays possible later without restructuring.
-->

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

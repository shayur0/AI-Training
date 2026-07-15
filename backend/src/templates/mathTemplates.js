// Parameterized templates bound to sourced facts (decisions/decision.md #2:
// template + LLM hybrid — no free-form generation, no invented numbers).

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function averageGoalsQuestion(team) {
  const average = round1(team.goals / team.games);
  return {
    id: `math-avg-${team.team}`,
    subject: "math",
    skill: "averages",
    difficulty: "warm-up",
    prompt: `${team.team} scored ${team.goals} goals in ${team.games} games. What is their average goals per game?`,
    type: "numeric",
    tolerance: 0.1,
    answer: average,
    sourceFact: `${team.team}: ${team.goals} goals in ${team.games} games`,
    explanation: `Average goals per game = total goals ÷ games played = ${team.goals} ÷ ${team.games} = ${average}.`,
  };
}

export function winPercentageQuestion(team) {
  const percentage = round1((team.wins / team.games) * 100);
  return {
    id: `math-winpct-${team.team}`,
    subject: "math",
    skill: "percentages",
    difficulty: "challenge",
    prompt: `${team.team} won ${team.wins} out of ${team.games} games. What percent of their games did they win?`,
    type: "numeric",
    tolerance: 0.5,
    answer: percentage,
    sourceFact: `${team.team}: ${team.wins} wins out of ${team.games} games`,
    explanation: `Win % = wins ÷ games played × 100 = ${team.wins} ÷ ${team.games} × 100 = ${percentage}%.`,
  };
}

export function goalDifferenceQuestion(teamA, teamB) {
  const difference = teamA.goals - teamB.goals;
  return {
    id: `math-diff-${teamA.team}-${teamB.team}`,
    subject: "math",
    skill: "subtraction",
    difficulty: "warm-up",
    prompt: `${teamA.team} scored ${teamA.goals} goals total. ${teamB.team} scored ${teamB.goals} goals total. How many more goals did ${teamA.team} score than ${teamB.team}?`,
    type: "numeric",
    tolerance: 0,
    answer: difference,
    sourceFact: `${teamA.team}: ${teamA.goals} goals; ${teamB.team}: ${teamB.goals} goals`,
    explanation: `${teamA.team} − ${teamB.team} = ${teamA.goals} − ${teamB.goals} = ${difference}.`,
  };
}

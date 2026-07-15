// Parameterized templates bound to sourced facts (decisions/decision.md #2).

function shuffledOptions(correct, pool, count = 3) {
  const distractors = pool.filter((v) => v !== correct);
  const picked = distractors.sort(() => Math.random() - 0.5).slice(0, count - 1);
  return [correct, ...picked].sort(() => Math.random() - 0.5);
}

export function continentQuestion(country, allCountries) {
  const options = shuffledOptions(
    country.continent,
    [...new Set(allCountries.map((c) => c.continent))]
  );
  return {
    id: `geo-continent-${country.name}`,
    subject: "geography",
    skill: "continents",
    difficulty: "warm-up",
    prompt: `${country.name} is competing in the World Cup. Which continent is it on?`,
    type: "multiple-choice",
    options,
    answer: country.continent,
    sourceFact: `${country.name} is in ${country.continent}`,
    explanation: `${country.name} is located in ${country.continent}.`,
  };
}

export function capitalQuestion(country, allCountries) {
  const options = shuffledOptions(
    country.capital,
    allCountries.map((c) => c.capital)
  );
  return {
    id: `geo-capital-${country.name}`,
    subject: "geography",
    skill: "capitals",
    difficulty: "challenge",
    prompt: `What is the capital city of ${country.name}?`,
    type: "multiple-choice",
    options,
    answer: country.capital,
    sourceFact: `${country.name}'s capital is ${country.capital}`,
    explanation: `${country.name}'s capital is ${country.capital}.`,
  };
}

export function languageQuestion(country, allCountries) {
  const options = shuffledOptions(
    country.language,
    allCountries.map((c) => c.language)
  );
  return {
    id: `geo-language-${country.name}`,
    subject: "geography",
    skill: "languages",
    difficulty: "warm-up",
    prompt: `What language do people mostly speak in ${country.name}?`,
    type: "multiple-choice",
    options,
    answer: country.language,
    sourceFact: `${country.name}'s main language is ${country.language}`,
    explanation: `People in ${country.name} mostly speak ${country.language}.`,
  };
}

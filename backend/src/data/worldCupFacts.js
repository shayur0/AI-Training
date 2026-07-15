// Mock Topic Knowledge Packet (planning.md Stage 2).
// Real build would fetch this from a licensed sports-data API with a cached
// fallback ladder; Phase 1 MVP uses static, clearly-labeled sample data so no
// external API key/licensing is required to demo the pipeline.

export const topicKnowledgePacket = {
  topic: "FIFA World Cup 2026",
  topic_type: "current_event",
  data_freshness: "sample",
  as_of: "2026-06-25 (sample data, not live)",
  source: "sample_dataset",

  teamStats: [
    { team: "Brazil", goals: 7, games: 4, wins: 3, draws: 1, losses: 0 },
    { team: "Argentina", goals: 5, games: 4, wins: 2, draws: 1, losses: 1 },
    { team: "France", goals: 6, games: 4, wins: 2, draws: 2, losses: 0 },
    { team: "Japan", goals: 4, games: 4, wins: 1, draws: 1, losses: 2 },
  ],

  countries: [
    { name: "Brazil", continent: "South America", capital: "Brasília", language: "Portuguese" },
    { name: "Argentina", continent: "South America", capital: "Buenos Aires", language: "Spanish" },
    { name: "France", continent: "Europe", capital: "Paris", language: "French" },
    { name: "Japan", continent: "Asia", capital: "Tokyo", language: "Japanese" },
    { name: "USA", continent: "North America", capital: "Washington, D.C.", language: "English" },
  ],

  hostCountries: ["USA", "Canada", "Mexico"],
};

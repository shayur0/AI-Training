// One small Anthropic Messages API call, used to edit a single file.
const MODEL = "claude-sonnet-5-5";

export async function editFile({ path, source, instruction }) {
  const { ANTHROPIC_API_KEY } = process.env;
  if (!ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY environment variable.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system:
        "You edit one source file. Reply with the complete updated file and nothing else: " +
        "no markdown fences, no commentary. Change only what the instruction asks for.",
      messages: [{ role: "user", content: `File: ${path}\n\nInstruction: ${instruction}\n\n${source}` }],
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Anthropic API -> ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`);
  }
  return json.content.map((b) => b.text ?? "").join("").replace(/^```\w*\n|\n```\s*$/g, "");
}

// Slack outbound client for the agent loop (Module 15).

const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } = process.env;

function assertConfigured() {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    throw new Error("Missing SLACK_BOT_TOKEN / SLACK_CHANNEL_ID environment variables.");
  }
}

// Speaking is one call: chat.postMessage with the bot token and channel.
export async function sendMessage(text) {
  assertConfigured();
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel: SLACK_CHANNEL_ID, text }),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Slack chat.postMessage failed: ${json.error}`);
  }
  return json;
}

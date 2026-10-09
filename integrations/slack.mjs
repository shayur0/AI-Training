#!/usr/bin/env node
// Slack outbound half for the agent loop (Module 15, Video 4).
// Inbound (Event Subscriptions, signature verification) needs a public URL
// and is deferred to video 6 -- see the signing-secret check note below.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { loadEnv } from "./env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(resolve(__dirname, ".env"));

const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } = process.env;

function assertConfigured() {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    throw new Error(
      "Missing SLACK_BOT_TOKEN / SLACK_CHANNEL_ID. Copy integrations/.env.example to integrations/.env and fill them in."
    );
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
  // Slack returns HTTP 200 even on failure -- the real status is json.ok.
  if (!json.ok) {
    throw new Error(`Slack chat.postMessage failed: ${json.error}`);
  }
  return json;
}

// CLI: node integrations/slack.mjs "message text"
if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const text = process.argv.slice(2).join(" ");
  if (!text) {
    console.error('Usage: node integrations/slack.mjs "message text"');
    process.exit(1);
  }
  const result = await sendMessage(text);
  console.log(`OK: posted to ${result.channel} at ts ${result.ts}`);
}

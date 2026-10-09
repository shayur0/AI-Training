import { getBotInfo, getChannelInfo } from "../integrations/slack.js";
import { listConnectedDatabases, goalsDatabaseId, readCard } from "../integrations/notion.js";
import { unescapeSlack } from "./handleTask.js";
import { INTERVAL_MS } from "../checkInLoop.js";

const PROJECT = "The Illumination Space";
const REPO = "shayur0/AI-Training";

// Run one lookup; a failure becomes an honest "could not retrieve" line
// rather than a guess or a quiet gap.
async function attempt(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function gatherFacts(run, event) {
  const [bot, channel, databases, readback] = await Promise.all([
    attempt(getBotInfo),
    attempt(getChannelInfo),
    attempt(listConnectedDatabases),
    run.card ? attempt(() => readCard(run.card.id)) : { ok: false, error: "no card was created" },
  ]);
  return { run, taskText: unescapeSlack(event.text), bot, channel, databases, readback };
}

const got = (r, render) => (r.ok ? render(r.value) : `Could not retrieve: ${r.error}`);

export function renderAssignment({ run, taskText, bot, channel, databases, readback }) {
  const usedId = (goalsDatabaseId() ?? "").replace(/-/g, "");
  const lines = [];
  lines.push(`# Assignment: Module 15 integrations run`, "");
  lines.push(`Written automatically by the agent at ${new Date().toISOString()}. Every value below was read from the live systems during this run; anything that could not be read says so.`, "");

  lines.push("## Who and where", "");
  lines.push(`- **Project:** ${PROJECT} (${REPO})`);
  lines.push(`- **Bot / app:** ${got(bot, (b) => b.botName)}`);
  lines.push(`- **Slack workspace:** ${got(bot, (b) => b.workspace)}`);
  lines.push(`- **Slack channel:** ${got(channel, (c) => `#${c.channelName} (${c.channelId})`)}`, "");

  lines.push("## Notion", "");
  lines.push(`- **Databases connected:** ${got(databases, (d) => `${d.length} (${d.map((x) => `"${x.title}"`).join(", ") || "none"})`)}`);
  lines.push(`- **Database used:** ${got(databases, (d) => {
    const match = d.find((x) => x.id.replace(/-/g, "") === usedId);
    return match ? `"${match.title}"` : `id ${usedId} (not found among the connected databases)`;
  })}`);
  lines.push(`- **Card title:** ${run.card ? `${run.card.title}` : "No card was created"}`);
  lines.push(`- **Card link:** ${run.card ? run.card.url : "n/a"}`);
  lines.push(`- **Notion's own read-back of the card:** ${got(readback, (r) => `status "${r.status}", last edited ${r.lastEdited}`)}`, "");

  lines.push("### Status history (UTC, recorded as each change was made)", "");
  for (const h of run.history) lines.push(`1. ${h.status} - ${h.at}`);
  lines.push("");

  lines.push("## Task text as posted in Slack", "");
  lines.push("```", taskText, "```", "");

  lines.push("## Run details", "");
  lines.push(`- **Check-in loop interval:** ${INTERVAL_MS / 1000} seconds`);
  lines.push(`- **Branch:** ${run.branch ?? "not created"}`);
  lines.push(`- **Pull request:** ${run.pr ? `#${run.pr.number} - ${run.pr.url}` : "Not opened yet when this version was written (a later commit on this branch adds the link)."}`, "");

  lines.push("## What failed", "");
  const unretrieved = [bot, channel, databases, readback].filter((r) => !r.ok);
  if (run.failures.length === 0 && unretrieved.length === 0) lines.push("Nothing failed in this run.");
  for (const f of run.failures) lines.push(`- ${f.at} - step "${f.step}": ${f.message}`);
  for (const r of unretrieved) lines.push(`- A lookup could not be retrieved: ${r.error}`);
  lines.push("");
  return lines.join("\n");
}

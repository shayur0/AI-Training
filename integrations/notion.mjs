#!/usr/bin/env node
// Notion taskboard client for the agent loop (Module 15, Video 3).
// Query-then-create-or-update by card Name, matching the walkthrough:
// one lookup, then notion.pages.create() if nothing matched, else update().

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { loadEnv } from "./env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(resolve(__dirname, ".env"));

const { NOTION_API_KEY, NOTION_GOALS_DB_ID } = process.env;
const NOTION_VERSION = "2022-06-28";

function assertConfigured() {
  if (!NOTION_API_KEY || !NOTION_GOALS_DB_ID) {
    throw new Error(
      "Missing NOTION_API_KEY / NOTION_GOALS_DB_ID. Copy integrations/.env.example to integrations/.env and fill them in."
    );
  }
}

async function notionRequest(path, method, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Notion API ${method} ${path} -> ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  }
  return json;
}

function buildProperties({ status, priority, notes }) {
  const properties = {};
  if (status !== undefined) properties.Status = { select: { name: status } };
  if (priority !== undefined) properties.Priority = { select: { name: priority } };
  if (notes !== undefined) properties.Notes = { rich_text: [{ text: { content: notes } }] };
  return properties;
}

async function findByName(name) {
  assertConfigured();
  const result = await notionRequest(`/databases/${NOTION_GOALS_DB_ID}/query`, "POST", {
    filter: { property: "Name", title: { equals: name } },
  });
  return result.results[0] ?? null;
}

// One query, then create or update -- the shape from the walkthrough.
export async function upsertTask(name, { status = "To Do", priority = "Medium", notes } = {}) {
  assertConfigured();
  const existing = await findByName(name);
  const properties = buildProperties({ status, priority, notes });

  if (!existing) {
    properties.Name = { title: [{ text: { content: name } }] };
    return notionRequest("/pages", "POST", {
      parent: { database_id: NOTION_GOALS_DB_ID },
      properties,
    });
  }
  return notionRequest(`/pages/${existing.id}`, "PATCH", { properties });
}

// CLI: node integrations/notion.mjs "Card title" [status] [priority] [notes]
if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [name, status, priority, notes] = process.argv.slice(2);
  if (!name) {
    console.error('Usage: node integrations/notion.mjs "Card title" [status] [priority] [notes]');
    process.exit(1);
  }
  const page = await upsertTask(name, { status, priority, notes });
  console.log(`OK: "${name}" -> ${page.url}`);
}

// Notion taskboard client for the agent loop (Module 15).
// Query-then-create-or-update by card Name -- same shape as the
// integrations/notion.mjs script used to first verify this connection.

const { NOTION_API_KEY, NOTION_GOALS_DB_ID } = process.env;
const NOTION_VERSION = "2022-06-28";

function assertConfigured() {
  if (!NOTION_API_KEY || !NOTION_GOALS_DB_ID) {
    throw new Error("Missing NOTION_API_KEY / NOTION_GOALS_DB_ID environment variables.");
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

// Used by the check-in loop to see what's still open.
export async function queryOpenTasks() {
  assertConfigured();
  const result = await notionRequest(`/databases/${NOTION_GOALS_DB_ID}/query`, "POST", {
    filter: { property: "Status", select: { does_not_equal: "Done" } },
  });
  return result.results.map((page) => ({
    id: page.id,
    name: page.properties.Name.title.map((t) => t.plain_text).join(""),
    status: page.properties.Status.select?.name,
  }));
}

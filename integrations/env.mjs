import { readFileSync, existsSync } from "node:fs";

// Minimal .env loader shared by the integration scripts (notion.mjs, slack.mjs, ...).
export function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!(key in process.env)) process.env[key] = value.replace(/^["']|["']$/g, "");
  }
}

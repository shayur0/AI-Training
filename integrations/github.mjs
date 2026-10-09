#!/usr/bin/env node
// GitHub "workshop" half for the agent loop (Module 15, Video 5).
// Read-only check that GITHUB_TOKEN is real and scoped with write access --
// deliberately does not commit or open a PR, since this points at the real
// shayur0/AI-Training repo.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { loadEnv } from "./env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(resolve(__dirname, ".env"));

const { GITHUB_TOKEN } = process.env;
const OWNER = "shayur0";
const REPO = "AI-Training";

function assertConfigured() {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Missing GITHUB_TOKEN. Copy integrations/.env.example to integrations/.env and fill it in."
    );
  }
}

// Proves the token authenticates and can see the repo with write access,
// without touching the repo itself.
export async function checkAccess() {
  assertConfigured();
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "project-agent-integration-check",
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`GitHub API GET /repos/${OWNER}/${REPO} -> ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  }
  return {
    repo: json.full_name,
    canPush: Boolean(json.permissions?.push),
    permissions: json.permissions,
  };
}

// CLI: node integrations/github.mjs
if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkAccess();
  console.log(`OK: token sees ${result.repo}, push access: ${result.canPush}`);
  console.log(`Permissions: ${JSON.stringify(result.permissions)}`);
}

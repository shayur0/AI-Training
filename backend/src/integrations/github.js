// GitHub client for the agent loop (Module 15). Read-only for now --
// committing/opening PRs comes when the agent actually acts on tasks.

const { GITHUB_TOKEN } = process.env;
const OWNER = "shayur0";
const REPO = "AI-Training";

export async function checkAccess() {
  if (!GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_TOKEN environment variable.");
  }
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "illumination-space-backend",
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`GitHub API GET /repos/${OWNER}/${REPO} -> ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  }
  return { repo: json.full_name, canPush: Boolean(json.permissions?.push) };
}

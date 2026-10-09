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

async function ghRequest(path, method = "GET", body) {
  if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN environment variable.");
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "illumination-space-backend",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = res.status === 204 ? {} : await res.json();
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${path} -> ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  }
  return json;
}

export async function getFile(path, ref) {
  const json = await ghRequest(`/contents/${path}?ref=${encodeURIComponent(ref)}`);
  return { content: Buffer.from(json.content, "base64").toString("utf8"), sha: json.sha };
}

export async function createBranch(name, fromBranch = "main") {
  const base = await ghRequest(`/git/ref/heads/${fromBranch}`);
  await ghRequest("/git/refs", "POST", { ref: `refs/heads/${name}`, sha: base.object.sha });
}

// Create or update a file on a branch (pass the existing blob sha to update).
export async function putFile({ path, content, branch, message, sha }) {
  return ghRequest(`/contents/${path}`, "PUT", {
    message,
    branch,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha,
  });
}

export async function openPullRequest({ title, head, body, base = "main" }) {
  const pr = await ghRequest("/pulls", "POST", { title, head, base, body });
  return { number: pr.number, url: pr.html_url };
}

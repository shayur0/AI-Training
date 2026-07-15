// In production the frontend and backend are deployed separately (e.g.
// Vercel + Render), so a relative path won't reach the backend. Locally,
// Vite's dev proxy (vite.config.js) handles relative /api requests, so this
// stays unset in local dev.
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "";
const BASE = `${API_ROOT}/api`;

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed (${res.status})`);
  }
  return res.json();
}

export function fetchTopics() {
  return request("/topics");
}

export function fetchWorksheet(subject) {
  return request("/worksheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject }),
  });
}

export function submitGrade(subject, answers) {
  return request("/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, answers }),
  });
}

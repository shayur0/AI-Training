#!/bin/bash
# Triggered by the PostToolUse hook in .claude/settings.json whenever the Write
# tool runs. Cheap and safe by design: it only detects and enqueues — it never
# runs the orchestrator itself, so a hook firing can never block a tool call or
# recursively spawn an agent mid-turn. scripts/orchestrator-loop.mjs is the
# thing that actually drains the queue, on its own schedule.
set -euo pipefail

INPUT="$(cat)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

FILE_PATH="$(node -e "
let d = '';
process.stdin.on('data', (c) => (d += c));
process.stdin.on('end', () => {
  try {
    const j = JSON.parse(d);
    process.stdout.write(j.tool_input?.file_path || '');
  } catch {
    process.stdout.write('');
  }
});
" <<< "$INPUT")"

case "$FILE_PATH" in
  */topics/requests/*.md) ;;
  *) exit 0 ;;
esac

QUEUE_FILE="$REPO_ROOT/topics/queue.json"
mkdir -p "$REPO_ROOT/topics"
[ -f "$QUEUE_FILE" ] || echo "[]" > "$QUEUE_FILE"

SLUG="$(basename "$FILE_PATH" .md)"

node -e "
const fs = require('fs');
const queueFile = process.argv[1];
const slug = process.argv[2];
const filePath = process.argv[3];
const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
if (queue.find((q) => q.slug === slug)) {
  console.error('[enqueue-topic-request] already queued: ' + slug);
} else {
  queue.push({ slug, path: filePath, requested_at: new Date().toISOString(), processed: false });
  fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2) + '\n');
  console.error('[enqueue-topic-request] enqueued: ' + slug);
}
" "$QUEUE_FILE" "$SLUG" "$FILE_PATH"

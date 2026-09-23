#!/usr/bin/env node
// Sensor (PreToolUse, matcher: Bash): blocks `git push --force`/`-f` when the
// target is main/master, or no branch is named (which pushes the current
// branch — and this repo's current branch is main). A force-push to main can
// silently discard another commit that landed on the remote after this
// session's last pull; that's exactly the kind of thing a sensor should catch
// mechanically instead of trusting the model to remember every time.

let input = "";
try {
  input = require("fs").readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const command = payload?.tool_input?.command || "";
if (!command) process.exit(0);

const isGitPush = /\bgit\s+push\b/.test(command);
const isForce = /(^|\s)(--force(-with-lease)?|-f)(\s|$)/.test(command);
if (!isGitPush || !isForce) process.exit(0);

const namesOtherBranch = /\bgit\s+push\b[^|;&]*\borigin\s+(?!main\b|master\b)[A-Za-z0-9._/-]+/.test(command);
const namesMainOrMaster = /\b(main|master)\b/.test(command);

if (namesMainOrMaster || !namesOtherBranch) {
  console.error(
    "Blocked: this is a force-push that targets main (or names no branch, which pushes the " +
    "current branch — main). A force-push can silently discard a commit someone else pushed " +
    "since your last pull. If this is genuinely intended, ask the user to run it themselves " +
    "rather than having this session do it."
  );
  process.exit(2);
}

process.exit(0);

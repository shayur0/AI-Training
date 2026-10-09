import { queryOpenTasks } from "./integrations/notion.js";

const INTERVAL_MS = 60 * 1000;

// "Is there anything new for me?" -- the loop that makes the agent check in
// on its own instead of only reacting to a message or a webhook.
export function startCheckInLoop() {
  setInterval(async () => {
    try {
      const openTasks = await queryOpenTasks();
      console.log(`tick - polled Notion (${openTasks.length} open task(s))`);
    } catch (err) {
      console.error("check-in loop failed:", err.message);
    }
  }, INTERVAL_MS);
}

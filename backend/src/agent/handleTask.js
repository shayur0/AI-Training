import { createCard, updateCard } from "../integrations/notion.js";
import { sendMessage, targetChannelId } from "../integrations/slack.js";

const seenEvents = new Set();

// Only real, human-posted messages in the configured channel count as tasks.
// Slack also delivers the bot's own posts and edits/joins as message events;
// reacting to those would make the agent answer itself in a loop.
export function isTaskMessage(event) {
  return (
    event?.type === "message" &&
    !event.subtype &&
    !event.bot_id &&
    event.channel === targetChannelId() &&
    typeof event.text === "string" &&
    event.text.trim().length > 0
  );
}

// Slack retries deliveries it thinks failed; event_id lets us run a task once.
export function isDuplicate(eventId) {
  if (!eventId) return false;
  if (seenEvents.has(eventId)) return true;
  seenEvents.add(eventId);
  return false;
}

// One run = one Slack task = one Notion card. Every status change is written
// to Notion and recorded here with a timestamp at the moment it happens, since
// Notion keeps no history of select changes -- this is the only honest source
// for assignment.md's status history.
export class Run {
  constructor(taskText) {
    this.taskText = taskText;
    this.history = [];
    this.failures = [];
    this.card = null;
  }

  async start() {
    const title = `Slack task: ${this.taskText.replace(/\s+/g, " ").slice(0, 60)}`;
    this.card = { title, ...(await createCard(title, { status: "To Do" })) };
    this.history.push({ status: "To Do", at: new Date().toISOString() });
  }

  async setStatus(status) {
    await updateCard(this.card.id, { status });
    this.history.push({ status, at: new Date().toISOString() });
  }

  // Failures are kept, not swallowed -- assignment.md reports them verbatim.
  recordFailure(step, err) {
    this.failures.push({ step, message: err.message, at: new Date().toISOString() });
  }
}

export async function handleSlackTask(event, work) {
  const run = new Run(event.text);
  try {
    await run.start();
    await run.setStatus("In Progress");
    await work(run, event);
    await run.setStatus("Done");
  } catch (err) {
    run.recordFailure("run", err);
    console.error("task run failed:", err.message);
    try {
      if (run.card) await run.setStatus("Blocked");
      await sendMessage(`Task failed: ${err.message}`);
    } catch (inner) {
      console.error("could not report failure:", inner.message);
    }
  }
  return run;
}

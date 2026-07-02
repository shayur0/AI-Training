# The Agent Loop

An AI agent doesn't just do one thing and stop. It runs in a loop, constantly
checking whether what it did actually worked, and adjusting if it didn't.

The loop has five steps:

1. **Observe** — Look at the current situation and gather relevant data.
2. **Decide** — Figure out the best action to take based on what was observed.
3. **Act** — Actually do it.
4. **Get Feedback** — Check what happened as a result of the action.
5. **Improve** — Use that feedback to make a better decision next time.

Then the loop repeats, starting back at **Observe**.

```
 ┌─────────┐     ┌────────┐     ┌─────┐     ┌──────────────┐     ┌──────────┐
 │ Observe │ ──> │ Decide │ ──> │ Act │ ──> │ Get Feedback │ ──> │ Improve  │
 └─────────┘     └────────┘     └─────┘     └──────────────┘     └──────────┘
      ▲                                                                │
      └────────────────────────────────────────────────────────────────┘
```

## Example: Helping Ayesha finish her assignments

Let's walk through the loop using a real scenario: an agent trying to help a
student named Ayesha stay on track with her coursework.

### Round 1

**1. Observe**
The agent looks at Ayesha's activity data:
- She hasn't logged in for 9 days.
- She has completed only 1 out of 4 assignments.

**2. Decide**
Based on this, the agent decides the most likely problem is that Ayesha simply
forgot or got busy. The simplest fix is to remind her.

**3. Act**
The agent sends Ayesha a reminder email about her pending assignments.

**4. Get Feedback**
A few days pass. The agent checks again: Ayesha still hasn't logged in, and
she hasn't replied to the email. The reminder didn't work.

### Round 2 — Improving the recommendation

**5. Improve**
The agent doesn't just repeat the same action. It reasons about *why* the
first attempt failed:
- A plain email wasn't enough to get her attention.
- Maybe email isn't the right channel, or maybe she needs something more
  direct or personal than a generic reminder.

So the agent updates its strategy. Instead of sending another identical
email, it might now:
- Send a more urgent, personalized message (e.g., mentioning the exact
  assignment and deadline instead of a generic nudge).
- Try a different channel, like a text message or app notification.
- Escalate by notifying a teacher or advisor to check in with her directly.

The loop then continues: the agent **observes** whether this new action gets
a response, and keeps adjusting until Ayesha is back on track.

## Why this matters

The key idea is that **Improve** isn't just "try again" — it's "try
*differently*, based on what you learned." An agent that keeps sending the
same email over and over isn't really improving. A good agent notices that
its action failed, figures out a likely reason why, and changes its approach
before acting again.

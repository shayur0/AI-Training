import { Router } from "express";
import crypto from "node:crypto";

const router = Router();
const { SLACK_SIGNING_SECRET } = process.env;
const FIVE_MINUTES = 60 * 5;

// Same check as the walkthrough: HMAC over "v0:{timestamp}:{body}", proving
// the request really came from Slack and not just anyone who found the URL.
function isValidSlackSignature(req) {
  const timestamp = req.get("X-Slack-Request-Timestamp");
  const signature = req.get("X-Slack-Signature");
  if (!SLACK_SIGNING_SECRET || !timestamp || !signature || !req.rawBody) return false;

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > FIVE_MINUTES) return false;

  const base = `v0:${timestamp}:${req.rawBody}`;
  const expected = "v0=" + crypto.createHmac("sha256", SLACK_SIGNING_SECRET).update(base).digest("hex");

  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

router.post("/events", (req, res) => {
  if (!isValidSlackSignature(req)) {
    return res.status(403).json({ error: "invalid signature" });
  }

  const { type, challenge, event } = req.body;

  // One-time verification handshake -- echo the challenge back, or the URL
  // never verifies in Slack's Event Subscriptions tab.
  if (type === "url_verification") {
    return res.json({ challenge });
  }

  if (type === "event_callback") {
    console.log(`slack event received: ${event?.type}`);
    // Acknowledge immediately; Slack expects a fast 200 regardless of what
    // the agent decides to do with the event.
    res.status(200).end();
    return;
  }

  res.status(200).end();
});

export default router;

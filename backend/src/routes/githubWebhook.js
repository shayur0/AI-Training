import { Router } from "express";
import crypto from "node:crypto";

const router = Router();
const { GITHUB_WEBHOOK_SECRET } = process.env;

// A webhook is just someone else's server calling yours -- this is how you
// prove it's really GitHub and not an arbitrary POST to a public URL.
function isValidGithubSignature(req) {
  const signature = req.get("X-Hub-Signature-256");
  if (!GITHUB_WEBHOOK_SECRET || !signature || !req.rawBody) return false;

  const expected = "sha256=" + crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET).update(req.rawBody).digest("hex");

  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

router.post("/github", (req, res) => {
  if (!isValidGithubSignature(req)) {
    return res.status(403).json({ error: "invalid signature" });
  }

  const event = req.get("X-GitHub-Event");
  console.log(`github webhook received: ${event}`, req.body?.action ?? "");
  res.status(200).end();
});

export default router;

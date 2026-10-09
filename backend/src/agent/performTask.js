import { getFile, getFileOrNull, createBranch, putFile, openPullRequest } from "../integrations/github.js";
import { gatherFacts, renderAssignment } from "./assignmentDoc.js";
import { editFile } from "./llm.js";

const HOMEPAGE = "frontend/src/App.jsx";
const AUTHOR = process.env.AUTHOR_NAME || "Shayur";
const PROJECT = "The Illumination Space";

// Edit the homepage footer through the GitHub API and open a PR.
// Anything wrong throws, so the run is marked Blocked instead of "Done".
export async function performTask(run, event) {
  const { content: source, sha } = await getFile(HOMEPAGE, "main");

  const updated = await editFile({
    path: HOMEPAGE,
    source,
    instruction:
      `Add a footer at the bottom of the app's returned JSX showing: ${AUTHOR}, ${PROJECT}, ` +
      `and the line "Built with Claude." Use a <footer className="app-footer"> element. ` +
      `Original request: ${event.text}`,
  });

  // The model returns a whole file; refuse to commit one that lost the point
  // of the edit or looks truncated.
  const problems = [];
  if (!updated.includes("Built with Claude.")) problems.push('missing "Built with Claude."');
  if (!updated.includes(AUTHOR)) problems.push(`missing "${AUTHOR}"`);
  if (!updated.includes("export default App")) problems.push("missing export default App");
  if (updated.length < source.length * 0.9) problems.push("output shorter than the original");
  if (problems.length) throw new Error(`LLM edit rejected: ${problems.join(", ")}`);

  const branch = `slack-task/${Date.now()}`;
  await createBranch(branch);
  await putFile({
    path: HOMEPAGE,
    content: updated,
    branch,
    message: `Add footer to homepage (from Slack task)`,
    sha,
  });
  run.branch = branch;

  // assignment.md goes in before the PR opens. The PR link and the Done
  // timestamp don't exist yet, so the file says so; a final commit fills them in.
  const existing = await getFileOrNull("assignment.md", branch);
  const first = await putFile({
    path: "assignment.md",
    content: renderAssignment(await gatherFacts(run, event)),
    branch,
    message: "Add assignment.md describing this run",
    sha: existing?.sha,
  });

  run.pr = await openPullRequest({
    title: "Add footer to homepage",
    head: branch,
    body: `Opened automatically from a Slack task.\n\n> ${event.text}`,
  });

  await run.setStatus("Done");
  await putFile({
    path: "assignment.md",
    content: renderAssignment(await gatherFacts(run, event)),
    branch,
    message: "Update assignment.md with PR link and final status",
    sha: first.content.sha,
  });
}

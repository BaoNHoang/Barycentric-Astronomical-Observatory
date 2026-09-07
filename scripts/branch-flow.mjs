import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// Keep the routing rules small enough to read without GitHub Actions knowledge.
export function allowedSource(base, head, sameRepository) {
  if (!sameRepository) return false;
  if (base === "dev") return /^(feature|bugfix|hotfix)\/.+/.test(head);
  if (base === "test") return head === "dev";
  if (base === "main") return head === "test";
  return false;
}

export function latestTestPassed(runs, sha) {
  const eligible = runs.filter(
    (run) =>
      run.head_sha === sha &&
      run.head_branch === "test" &&
      ["push", "workflow_dispatch"].includes(run.event),
  );
  eligible.sort((a, b) => Number(b.id) - Number(a.id));
  return (
    eligible[0]?.status === "completed" && eligible[0]?.conclusion === "success"
  );
}

async function checkPullRequest() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const pr = event.pull_request;
  if (!pr) throw new Error("This check runs on a pull request.");

  const base = pr.base.ref;
  const head = pr.head.ref;
  const sameRepository = pr.head.repo?.full_name === pr.base.repo.full_name;
  if (!allowedSource(base, head, sameRepository)) {
    throw new Error(
      "Use feature/bugfix/hotfix → dev → test → main, within this repository.",
    );
  }

  if (base === "dev") {
    // Git records ancestry, not the name of the branch a developer clicked.
    // Requiring the current dev commit ensures the work includes its latest state.
    execFileSync("git", [
      "merge-base",
      "--is-ancestor",
      pr.base.sha,
      pr.head.sha,
    ]);
  }

  if (base === "main") {
    const query = new URLSearchParams({
      branch: "test",
      head_sha: pr.head.sha,
      per_page: "100",
    });
    const url =
      process.env.GITHUB_API_URL +
      "/repos/" +
      process.env.GITHUB_REPOSITORY +
      "/actions/workflows/test.yml/runs?" +
      query;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + process.env.GH_TOKEN,
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error("Cannot read test results: HTTP " + response.status);
    const data = await response.json();
    if (!latestTestPassed(data.workflow_runs, pr.head.sha)) {
      throw new Error(
        "Wait for the Test suite on this exact test commit to pass, then rerun Branch flow.",
      );
    }
  }
  console.log("Allowed promotion: " + head + " → " + base);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  checkPullRequest().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

// One-time repository administration, using the user's existing GitHub CLI login.
// No GitHub token is stored in this project.
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const settings = JSON.parse(
  readFileSync(join(root, ".github/repository-settings.json"), "utf8"),
);
const repository = settings.owner + "/" + settings.name;

function run(command, args, { input, optional = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    input,
  });
  if (result.error)
    throw new Error(
      command + " is required. Install it and open a new PowerShell window.",
    );
  if (result.status !== 0 && !optional) {
    throw new Error(
      (result.stderr || result.stdout).trim() || command + " failed.",
    );
  }
  return result;
}

function git(...args) {
  // Use gh only for GitHub authentication, without editing global Git settings.
  return run("git", [
    "-c",
    "credential.https://github.com.helper=",
    "-c",
    "credential.https://github.com.helper=!gh auth git-credential",
    ...args,
  ]).stdout.trim();
}

function api(method, path, body) {
  const args = ["api", "--hostname", "github.com", "--method", method, path];
  if (body !== undefined) args.push("--input", "-");
  const output = run("gh", args, {
    input: body === undefined ? undefined : JSON.stringify(body),
  }).stdout;
  return output.trim() ? JSON.parse(output) : null;
}

export function protectionFor(branch) {
  const rule = settings.branches[branch];
  if (!rule) throw new Error("Unknown protected branch: " + branch);
  return {
    required_status_checks: { strict: rule.strict, contexts: rule.checks },
    enforce_admins: true,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      required_approving_review_count: 0,
    },
    restrictions: null,
    required_linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false,
    required_conversation_resolution: true,
  };
}

async function setup() {
  const flags = new Set(process.argv.slice(2));
  for (const flag of flags) {
    if (!["--public", "--dry-run"].includes(flag))
      throw new Error("Unknown option: " + flag);
  }
  const visibility = flags.has("--public") ? "public" : "private";
  if (flags.has("--dry-run")) {
    console.log(
      JSON.stringify(
        {
          repository,
          visibility,
          defaultBranch: settings.default_branch,
          description: settings.description,
          branches: settings.branches,
          protections: Object.fromEntries(
            Object.keys(settings.branches).map((branch) => [
              branch,
              protectionFor(branch),
            ]),
          ),
        },
        null,
        2,
      ),
    );
    return;
  }

  run("git", ["--version"]);
  run("gh", ["auth", "status", "--hostname", "github.com"]);
  const user = api("GET", "user");
  if (user.login.toLowerCase() !== settings.owner.toLowerCase()) {
    throw new Error(
      "Sign in as " + settings.owner + " before setting up this repository.",
    );
  }
  if (visibility === "private" && user.plan?.name === "free") {
    throw new Error(
      "Private branch protections require GitHub Pro. Keep the code private with Pro, or explicitly rerun with --public. No repository was created.",
    );
  }

  const lookup = run(
    "gh",
    ["api", "--hostname", "github.com", "repos/" + repository],
    { optional: true },
  );
  let remote;
  if (lookup.status === 0) {
    remote = JSON.parse(lookup.stdout);
    if (remote.private !== (visibility === "private")) {
      throw new Error(
        "The existing repository has different visibility. Setup will not change it.",
      );
    }
    if (!remote.permissions?.admin)
      throw new Error("Repository administration access is required.");
  } else if (/HTTP 404/.test(lookup.stderr)) {
    remote = api("POST", "user/repos", {
      name: settings.name,
      description: settings.description,
      homepage: settings.homepage,
      private: visibility === "private",
      auto_init: false,
    });
    console.log("Created " + remote.html_url);
  } else {
    throw new Error(
      lookup.stderr.trim() || "Cannot check the existing repository.",
    );
  }

  if (!existsSync(join(root, ".git"))) git("init", "-b", "main");
  if (resolve(git("rev-parse", "--show-toplevel")) !== root)
    throw new Error("Run setup in the BAO project.");
  const existingOrigin = run("git", ["remote", "get-url", "origin"], {
    optional: true,
  });
  if (
    existingOrigin.status === 0 &&
    existingOrigin.stdout.trim() !== remote.clone_url
  ) {
    throw new Error(
      "origin points to a different repository. Setup will not replace it.",
    );
  }
  if (existingOrigin.status !== 0)
    git("remote", "add", "origin", remote.clone_url);

  const remoteHeads = git("ls-remote", "--heads", "origin");
  const hasLocalCommit =
    run("git", ["rev-parse", "--verify", "HEAD"], { optional: true }).status ===
    0;
  if (remoteHeads && !hasLocalCommit) {
    throw new Error(
      "The remote already contains commits. Use an empty repository for this initial import.",
    );
  }
  if (!hasLocalCommit) {
    if (run("git", ["config", "user.name"], { optional: true }).status !== 0)
      git("config", "user.name", user.name || user.login);
    if (run("git", ["config", "user.email"], { optional: true }).status !== 0)
      git(
        "config",
        "user.email",
        user.id + "+" + user.login + "@users.noreply.github.com",
      );
    git("add", ".");
    git(
      "commit",
      "-m",
      "Import BAO with development, testing and production workflow",
    );
  }
  if (git("status", "--porcelain"))
    throw new Error(
      "Commit or set aside local changes before repository setup.",
    );

  for (const branch of ["test", "dev"]) {
    const exists =
      run("git", ["show-ref", "--verify", "--quiet", "refs/heads/" + branch], {
        optional: true,
      }).status === 0;
    if (!exists) git("branch", branch, "main");
  }
  // Atomic and fast-forward only: this never replaces unrelated remote history.
  git("push", "--atomic", "--set-upstream", "origin", "main", "test", "dev");

  const { owner, name, topics, branches, ...repositoryOptions } = settings;
  api("PATCH", "repos/" + repository, repositoryOptions);
  api("PUT", "repos/" + repository + "/topics", { names: topics });
  api("PUT", "repos/" + repository + "/actions/permissions/workflow", {
    default_workflow_permissions: "read",
    can_approve_pull_request_reviews: false,
  });

  for (const branch of Object.keys(branches)) {
    api(
      "PUT",
      "repos/" + repository + "/branches/" + branch + "/protection",
      protectionFor(branch),
    );
    console.log("Protected " + branch);
  }
  for (const branch of Object.keys(branches)) {
    const actual = api(
      "GET",
      "repos/" + repository + "/branches/" + branch + "/protection",
    );
    const expected = protectionFor(branch);
    if (
      !actual.enforce_admins?.enabled ||
      !actual.required_pull_request_reviews ||
      actual.allow_force_pushes?.enabled ||
      actual.allow_deletions?.enabled ||
      !actual.required_conversation_resolution?.enabled ||
      actual.required_status_checks?.strict !==
        expected.required_status_checks.strict ||
      !expected.required_status_checks.contexts.every((name) =>
        actual.required_status_checks.contexts.includes(name),
      )
    ) {
      throw new Error("Protection verification failed for " + branch);
    }
  }

  const testSha = git("rev-parse", "test");
  const runsPath =
    "repos/" +
    repository +
    "/actions/workflows/test.yml/runs?branch=test&event=workflow_dispatch&head_sha=" +
    testSha;
  // On a rerun, wait for the new test run instead of accepting an older result.
  const previousRuns = api("GET", runsPath).workflow_runs;
  const previousRunId = Math.max(
    0,
    ...previousRuns.map((run) => Number(run.id)),
  );
  run("gh", [
    "workflow",
    "run",
    "test.yml",
    "--repo",
    repository,
    "--ref",
    "test",
  ]);
  console.log("Running all tests on test. Waiting for GitHub Actions...");
  const deadline = Date.now() + 25 * 60 * 1000;
  while (Date.now() < deadline) {
    const data = api("GET", runsPath);
    const latest = data.workflow_runs.find(
      (run) => Number(run.id) > previousRunId,
    );
    if (latest?.status === "completed") {
      if (latest.conclusion !== "success")
        throw new Error(
          "Test suite failed. Inspect " +
            latest.html_url +
            " and fix through dev before promoting.",
        );
      console.log("Test suite passed: " + latest.html_url);
      console.log("Ready: " + remote.html_url);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  throw new Error(
    "Repository and protections are configured, but tests are still running. Check the Actions tab.",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  setup().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

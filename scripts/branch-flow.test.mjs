import assert from "node:assert/strict";
import test from "node:test";
import { allowedSource, latestTestPassed } from "./branch-flow.mjs";
import { protectionFor } from "./setup-github.mjs";

test("only work branches can enter dev", () => {
  for (const branch of [
    "feature/sky-filter",
    "bugfix/moon-date",
    "hotfix/api-timeout",
  ]) {
    assert.equal(allowedSource("dev", branch, true), true);
  }
  for (const branch of ["main", "test", "dev", "feature", "feature/"]) {
    assert.equal(allowedSource("dev", branch, true), false);
  }
});

test("stages cannot be skipped or reversed", () => {
  assert.equal(allowedSource("test", "dev", true), true);
  assert.equal(allowedSource("main", "test", true), true);
  assert.equal(allowedSource("main", "dev", true), false);
  assert.equal(allowedSource("test", "feature/example", true), false);
  assert.equal(allowedSource("test", "main", true), false);
  assert.equal(allowedSource("unknown", "dev", true), false);
  assert.equal(allowedSource("main", "test", false), false);
  assert.equal(allowedSource("dev", "feature/example", false), false);
});

const passed = {
  id: 10,
  head_sha: "tested-commit",
  head_branch: "test",
  event: "push",
  status: "completed",
  conclusion: "success",
};

test("production needs a successful run on the exact test commit", () => {
  assert.equal(latestTestPassed([passed], "tested-commit"), true);
  assert.equal(latestTestPassed([passed], "other-commit"), false);
  assert.equal(latestTestPassed([], "tested-commit"), false);
  assert.equal(
    latestTestPassed([{ ...passed, event: "pull_request" }], "tested-commit"),
    false,
  );
  assert.equal(
    latestTestPassed([{ ...passed, head_branch: "dev" }], "tested-commit"),
    false,
  );
  assert.equal(
    latestTestPassed(
      [{ ...passed, event: "workflow_dispatch" }],
      "tested-commit",
    ),
    true,
  );
});

test("an earlier success cannot hide a newer failed or unfinished run", () => {
  assert.equal(
    latestTestPassed(
      [passed, { ...passed, id: 11, conclusion: "failure" }],
      "tested-commit",
    ),
    false,
  );
  assert.equal(
    latestTestPassed(
      [passed, { ...passed, id: 12, status: "in_progress", conclusion: null }],
      "tested-commit",
    ),
    false,
  );
});

test("all long-lived branches require PRs, checks and administrator enforcement", () => {
  for (const branch of ["dev", "test", "main"]) {
    const rule = protectionFor(branch);
    assert.equal(rule.enforce_admins, true);
    assert.equal(rule.allow_force_pushes, false);
    assert.equal(rule.allow_deletions, false);
    assert.equal(rule.required_conversation_resolution, true);
    assert.ok(rule.required_pull_request_reviews);
    assert.ok(rule.required_status_checks.contexts.includes("Branch flow"));
  }
  assert.ok(
    protectionFor("test").required_status_checks.contexts.includes(
      "Test suite",
    ),
  );
  assert.equal(protectionFor("dev").required_status_checks.strict, true);
  assert.equal(protectionFor("test").required_status_checks.strict, false);
  assert.equal(protectionFor("main").required_status_checks.strict, false);
  assert.throws(() => protectionFor("other"));
});

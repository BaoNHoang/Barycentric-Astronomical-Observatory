# Contributing to BAO

The development path is **work branch → dev → test → main**.

| Target | Allowed source                      | Purpose                    | Required checks                                   |
| ------ | ----------------------------------- | -------------------------- | ------------------------------------------------- |
| dev    | `feature/*`, `bugfix/*`, `hotfix/*` | Combine development work   | Branch flow; work includes current dev            |
| test   | dev                                 | Test the release candidate | Branch flow and Test suite                        |
| main   | test                                | Production source          | Branch flow verifies the exact test commit passed |

The default branch is dev. All three long-lived branches require pull requests,
including changes by the owner. Force pushes and branch deletion are blocked.
Use merge commits; squash and rebase merging are disabled.

## Start a change

Check existing branches before creating another branch for the same work.
Use PowerShell:

```powershell
git status
git fetch origin
git branch --all
git switch dev
git pull --ff-only origin dev
git switch -c feature/sky-filter
```

Make one focused change, then commit and open a pull request into dev:

```powershell
git add .
git commit -m "Add a sky brightness filter"
git push -u origin feature/sky-filter
gh pr create --base dev --head feature/sky-filter --fill
```

If dev moves forward before your PR merges, update your work branch:

```powershell
git fetch origin
git merge origin/dev
git push
```

Resolve conflicts in the work branch. Do not overwrite another developer's work.
Use `feature/*` for features and documentation, `bugfix/*` for defects, and `hotfix/*`
for urgent fixes. Every type follows the same three stages.

## Test and promote

After the work PR merges into dev:

```powershell
gh pr create --base test --head dev --title "Validate the next release" --body "Promote the accumulated dev changes to the testing stage."
```

The Test suite checks types, branch rules, astronomy/API behavior, interface
structure and a production build before this PR can merge. After the merge,
the same checks plus live NASA/JPL integration tests run on the actual test
commit. Wait for that run to finish successfully.

Then open the production promotion:

```powershell
gh pr create --base main --head test --title "Promote the tested release" --body "Promote the current test commit after its complete Test suite passes."
```

Branch flow checks the test commit's SHA against GitHub Actions results. A green
run from a different commit does not qualify. If you opened the PR while tests
were running, rerun Branch flow after they pass.

If anything fails, create a fix branch from dev and repeat the forward flow.
Do not fix test or main directly. Keep all test files in source control on every
branch; the testing stage determines where the automated suite runs.

## Review and maintenance

- Keep the application code readable, with small components and ordinary CSS.
- Preserve scientific units, source credits and unknown values.
- Update the README, design notes and API documentation when behavior changes.
- Check the required jobs before merging. Resolve review conversations.
- Keep dev, test and main. Delete a completed work branch only when it is no
  longer needed.
- Approving reviews are not required while Bao is the sole maintainer, because
  GitHub does not allow authors to approve their own PRs. Require one approving
  review when a second maintainer joins. CODEOWNERS identifies Bao as the owner.

Protected branches and workflow files work together. Repository administrators
can still edit protection settings; changing workflow definitions deserves
careful review.

## Why test and main do not require an up-to-date branch

Every promotion adds a merge commit. Requiring reverse merges from main into
test, or test into dev, would conflict with the forward workflow. The testing
stage validates the combined PR result and then the actual test commit.
Only work branches targeting dev must contain the latest dev commit.

## Production

Merging test into main creates a downloadable standalone Next.js build in
GitHub Actions. Extract it and run:

```powershell
node server.js
```

The existing private Sites demo is published separately. This repository does
not silently redeploy it, and the test branch does not create a separate
public staging website.

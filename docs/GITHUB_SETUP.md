# GitHub setup

The setup script targets BaoNHoang/barycentric-astronomical-observatory.
It applies the settings saved in .github/repository-settings.json.

## Prerequisites

- Git
- Node.js 22.13 or newer
- GitHub CLI
- GitHub repository administration access for BaoNHoang

If GitHub CLI is missing, install it from PowerShell, then open a new terminal:

```powershell
winget install --id GitHub.cli --exact
```

Sign in using GitHub CLI's browser flow. No token or password belongs in this
project or in a chat message:

```powershell
gh auth login --hostname github.com --web --git-protocol https --scopes repo,workflow
```

Preview the planned settings, then run the setup from the project directory:

```powershell
.\setup-github.ps1 -DryRun
.\setup-github.ps1
```

The default is a private repository. GitHub requires Pro for protected branches
in a personal private repository. Public repositories support these protections
on GitHub Free. To explicitly create a public repository instead:

```powershell
.\setup-github.ps1 -Public
```

The script does not change the visibility of an existing repository or purchase
a subscription. It stops if GitHub cannot enforce the requested protections.

## What setup does

1. Verifies the account and checks for an existing repository.
2. Creates the repository with its description and website link.
3. Uploads the complete app and seeds main, test and dev from the initial commit.
4. Makes dev the default branch and allows merge commits only.
5. Adds topics, branch protections and read-only default Actions permissions.
6. Reads back the branch rules to verify them.
7. Starts a new Test suite run on test and waits for that run's result.

All three branches block direct pushes, force pushes and deletion, including
administrator pushes. Test requires the Test suite. Main requires a Branch flow
result that verifies the exact test commit passed.

The initial upload happens before protection is applied. This bootstrap is the
only direct upload to the long-lived branches.

The script can be rerun after an interrupted setup. It never force-pushes,
deletes branches, or overwrites an unrelated repository. If an existing repository
already contains different work, it stops for a deliberate import.

## Test failures

Live NASA/JPL checks run only after code reaches test or when Test suite is
manually run on test. A provider outage can block production promotion. Inspect
the failed job and rerun it after the provider recovers; do not skip the failure.

The interface checks render HTML on the server. They do not exercise browser
clicks or prove visual appearance.

## References

- [Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Branch protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [Workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Merge methods](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github)

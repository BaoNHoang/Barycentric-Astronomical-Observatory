# Run from PowerShell after installing Git, Node.js, and GitHub CLI.
param(
    [switch]$Public,
    [switch]$DryRun
)

$setupArguments = @("$PSScriptRoot/scripts/setup-github.mjs")
if ($Public) { $setupArguments += "--public" }
if ($DryRun) { $setupArguments += "--dry-run" }
& node @setupArguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

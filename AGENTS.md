# BAO project instructions

## Branch workflow

- Read `CONTRIBUTING.md` before changing the project.
- Check the current branch and worktree, then search for an existing branch that
  owns the requested work. Reuse related work instead of creating duplicates.
- Start new work from the latest `origin/dev` on `feature/*`, `bugfix/*`, or
  `hotfix/*`. Do not commit directly to `dev`, `test`, or `main`.
- Open work-branch pull requests into `dev`. Promote `dev` into `test`, then
  promote `test` into `main`. Do not skip a stage or add fixes directly to `test`.
- Run the complete test suite at the `test` stage. A production promotion must
  reference the exact `test` commit with a successful Test suite run.
- Use merge commits so the long-lived branches keep shared ancestry. Do not
  squash, rebase, force-push, or delete the long-lived branches.
- The initial repository bootstrap seeds all three branches from one verified
  snapshot before protections are enabled. This exception is only for setup.
- `main` is the production source. Its workflow packages a production build;
  it does not publish the existing private Sites demo automatically.

## Interface

Read `DESIGN.md` before changing the interface. These rules record the owner's
September 2026 design feedback; do not reintroduce the rejected patterns.

- Keep the homepage separate from the working observatory at `/explore`.
- Use spacious composition, a colorful cosmic background, and direct language.
- Keep tool navigation on the left, with an accessible drawer on small screens.
  Do not replace it with a dropdown selector.
- Carry the space atmosphere into the app: small stars, subtle galaxy dust and
  distant decorative planets around the edges, with readable content over it.
- Background motion must be visible immediately and pause at its current position.
  Remember the visitor's choice and respect reduced motion by default.
- Include useful exploration, developer, guide and credit links in the footer.
- Keep the space background visible through the footer to the page edge, without
  a dark bottom fade or extra page spacing. Match scrollbars to the indigo/violet theme.
- No decorative count badges, floating planet cards, generic motivational
  subtitles, or repeated light-bordered rounded containers.
- Show one primary task per screen. Put settings and secondary measurements in
  labeled disclosures or detail views. Preserve scientific units and caveats.
- Use BAO's original vector UI icons in `components/icons.tsx`, not stock icons.
- Keep code straightforward: small feature files, explicit state, ordinary CSS.
- Update `README.md`, `DESIGN.md`, and asset credits when their contents change.
- Keep the existing astronomy API and calculations intact during visual work.

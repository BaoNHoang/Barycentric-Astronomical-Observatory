# BAO — Barycentric Astronomical Observatory

An interactive astronomy explorer and web API. Explore planetary motion, your
night sky, exoplanets, asteroids, spacecraft trajectories and space imagery.

Built with **Next.js, React, TypeScript, Three.js and Astronomy Engine**.
The frontend and API live in one project, with small feature files and readable
code for learning.

[Private hosted demo](https://bao-observatory.bao12162003.chatgpt.site) ·
[Contributing](CONTRIBUTING.md) · [GitHub setup](docs/GITHUB_SETUP.md) ·
[Scientific details](docs/SCIENCE.md) · [Credits](CREDITS.md)

## Run locally

Use Node.js 22.13 or newer. In PowerShell:

```powershell
git clone https://github.com/BaoNHoang/barycentric-astronomical-observatory.git
Set-Location barycentric-astronomical-observatory
npm ci
npm run dev
```

Open **http://localhost:3000**. No database or API key is needed.
The homepage is at /; the working observatory is at /explore.

If you received this project as a ZIP, extract it and run the last two commands
inside the project folder. To create the GitHub repository from the prepared
source, follow [GitHub setup](docs/GITHUB_SETUP.md).

## Features

- **Solar system:** interactive 3D planets and moons, date controls, playback and physical measurements.
- **Sky charts:** location and time controls, stars, constellations, visible planets, Moon phase and SVG export.
- **Exoplanets:** a NASA archive snapshot, search, filters, host-star details and system diagrams.
- **Asteroids and spacecraft:** JPL close approaches and sampled trajectories for supported targets.
- **Images:** credited NASA observations, Mars rover imagery and archive search.
- **Developer API:** JSON endpoints, an OpenAPI description and an interactive request playground.

The interface uses original BAO icons, colorful cosmic artwork, pausable
background motion and a responsive left navigation bar.

## Development → testing → production

`feature/*`, `bugfix/*` or `hotfix/*` → `dev` → `test` → `main`

| Branch | Role                        | Accepts pull requests from               |
| ------ | --------------------------- | ---------------------------------------- |
| dev    | Default development branch  | Work branches created from dev           |
| test   | Full automated testing      | dev only                                 |
| main   | Production source and build | test only, after its exact commit passes |

The setup script protects all three branches: pull requests and required checks
are mandatory, direct pushes and force pushes are blocked, and branches cannot
be deleted. Merge commits preserve the promotion history.

All application tests run at the test stage. Live NASA/JPL integration checks
run after merging into test and on manual test runs. The main promotion verifies
the test results before it can merge.

GitHub Free does not enforce saved protection rules on private repositories.
Enforcement requires GitHub Pro or a public repository; see [GitHub setup](docs/GITHUB_SETUP.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the exact PowerShell workflow.

## Commands

| Command               | Purpose                                       |
| --------------------- | --------------------------------------------- |
| npm run dev           | Start the local app                           |
| npm run check         | Check TypeScript                              |
| npm run test:workflow | Test branch routing and protection settings   |
| npm test              | Check astronomy calculations and API behavior |
| npm run test:ui       | Check server-rendered interface structure     |
| npm run test:live     | Check the live NASA/JPL integrations          |
| npm run build         | Build the complete production app             |
| npm start             | Run that production build                     |
| npm run refresh:data  | Refresh saved astronomy catalogs              |

The interface tests do not run a browser. Scientific and integration tests check
real calculations and responses; they do not certify navigation-grade accuracy.

## Learn the code

Start with exoplanet search:

1. The search field is in components/explorers/exoplanets.tsx.
2. A shared request hook calls /v1/exoplanets.
3. The route in app/v1/exoplanets/route.ts calls lib/api/exoplanets.ts.
4. The API filters the saved catalog, then React displays the result.

| Folder                | Contents                                          |
| --------------------- | ------------------------------------------------- |
| app/                  | Pages and API route handlers                      |
| components/explorers/ | One view per astronomy tool                       |
| components/           | Shared controls and visualizations                |
| lib/api/              | Catalog queries and NASA/JPL adapters             |
| lib/astronomy.ts      | Astronomical calculations and coordinate handling |
| data/                 | Saved catalogs and reference values               |
| scripts/              | Tests, catalog refresh and repository setup       |
| .github/              | Branch rules, Actions workflows and PR templates  |
| components/ui/        | Supplied UI primitives; skip these while learning |

## API

```powershell
Invoke-RestMethod 'http://localhost:3000/v1/bodies/mars'
Invoke-RestMethod 'http://localhost:3000/v1/exoplanets?radius_earth_max=2&limit=10'
Invoke-RestMethod 'http://localhost:3000/v1/positions?target=mars&origin=sun'
Invoke-RestMethod 'http://localhost:3000/v1/moon'
```

The endpoint index is **/v1**, and the OpenAPI description is **/v1/openapi**.
Times, coordinate frames, units and provenance are included where applicable.
Missing measurements remain null.

## Production

The main workflow saves a standalone Next.js server and its assets as a GitHub
Actions artifact. Extract it and run node server.js with Node.js 22.13 or newer.

The existing private Sites demo is a separate publication of the same application.
GitHub merges do not automatically deploy that demo. GitHub Pages cannot run
this application's server API; use a Node.js-compatible host for the standalone
build.

## Sources and credits

Planetary data comes from JPL and NASA archives; local calculations use Astronomy
Engine. Exoplanet equilibrium temperatures are modeled values, not measured
surface temperatures. Decorative backgrounds are original artwork, not observed
sky maps.

See [Scientific details](docs/SCIENCE.md), [CREDITS.md](CREDITS.md),
[artwork provenance](docs/ARTWORK.md) and the licenses/ directory.
The project's own code has no open-source license assigned yet; third-party
licenses and image credits remain in effect.

Maintained by **Bao Hoang**.

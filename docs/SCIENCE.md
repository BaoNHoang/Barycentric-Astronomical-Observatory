# Data, sources and scientific limits

## Data and scientific meaning

- **Analytical positions:** Astronomy Engine, J2000 equatorial, geometric, positions in AU. Velocity is a centered one-minute heliocentric numerical estimate in km/s. Observer coordinates include apparent-position corrections and standard refraction.
- **JPL positions / trajectories:** J2000 ecliptic, ICRF reference system, geometric, AU and AU/day. Origins: Sun, Earth, solar system barycenter. `engine=horizons` is the precise ephemeris option. Time labels explicitly describe UT/UTC limitations.
- **Visualization:** illustrative mode compresses planet orbit distances and enlarges sizes. True scale uses actual proportions, so small planets may be invisible. Moon orbit distances use a common linear scale. Surface texture orientation and spin are illustrative. Exoplanet orbit diagrams have arbitrary phase and spacing. Trajectory animations linearly interpolate samples and omit Z in the 2D plot.
- **Exoplanets:** NASA Exoplanet Archive `pscomppars` composite parameters, captured with a timestamp in `data/exoplanets.json`. Temperature is modeled equilibrium temperature, not surface temperature. Read mass provenance (`pl_bmassprov`), uncertainties, and original archive references. `sy_dist` is parsecs; the UI converts to light-years. Missing measurements stay null.
- **Sky:** 5,044 XHIP / Extended Hipparcos stars via d3-celestial, magnitude ≤ 6. J2000 coordinates are precessed to the selected date; proper motion is omitted. Charts show geometric visibility, not weather, terrain, or light-pollution predictions.
- **Close approaches:** nominal Earth approaches from JPL, with TDB timestamps and uncertainty bounds. These are not impact predictions. A lunar distance is defined here as 384,400 km.
- **Imagery:** the featured gallery contains processed observations, with credits and processing described. Live NASA searches may also return diagrams and artist concepts. The old Mars Rover Photos API is not used.

Live adapters have timeouts and clear error responses; they never substitute invented records. Public upstream results are cached for 30–60 minutes in a bounded in-memory cache, and duplicate requests are combined. JPL requests are serialized per server process / Worker isolate. Before operating a large multi-instance public service, add a shared request queue to honor JPL’s service-wide one-request-at-a-time policy. Do not repeatedly retry failures.

Spacecraft and asteroid availability depends on JPL trajectory coverage. Future states are predictions, and a catalog listing does not establish current mission status. This app is for learning and exploration, not spacecraft navigation or precision stellar astrometry.

For asset licenses and original imagery credits, see [CREDITS.md](../CREDITS.md).

## Galaxy explorer and system tours

Five credited NASA/ESA images support image-plane pan and zoom (1×–10×). Four are processed Hubble observations; the external Milky Way view is a NASA artist’s concept. Galaxy properties are approximate literature values with per-fact source links. Image zoom does not resolve planets in external galaxies.

Three separate Milky Way system models use reference orbital periods, circular paths, arbitrary starting phases, uniformly spaced enlarged orbits and enlarged planet radii. They are not ephemerides or maps of system locations within the galaxy image. A selected planet pauses orbital travel while its illustrative axial rotation can continue. Playback advances one simulated day per real second.

The 15 exoplanet records are a small subset of the existing NASA archive snapshot (2026-09-05). Kepler-90 is stored under its KOI-351 host alias in that catalog; original names are retained in data/explorer-systems.json. Exoplanet surface appearances are unknown and use plain colors. Missing measurements remain null. Temperatures, where displayed for exoplanets, are equilibrium estimates rather than surface measurements.

The existing Solar system tool and astronomy API retain their calculated coordinates. Its 3D view and moon view now interpolate position updates for smoother playback; displayed measurements retain their calculated values. Animation clocks pause offscreen or in hidden tabs and clamp long frame gaps to avoid jumps.

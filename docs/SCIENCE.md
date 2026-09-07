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

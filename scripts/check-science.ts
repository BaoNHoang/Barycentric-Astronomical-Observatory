import assert from "node:assert/strict";
import { position, eclipticVector, moonInfo } from "../lib/astronomy";
import { buildSky, skySvg } from "../lib/api/sky";
import { searchExoplanets } from "../lib/api/exoplanets";
import { GET as positions } from "../app/v1/positions/route";
import { GET as chart } from "../app/v1/charts/sky/route";
const time = new Date("2026-09-05T00:00:00Z");
const earth = position("earth", time, "earth");
assert.equal(earth.distance_from_earth_au, 0);
assert.deepEqual(earth.position_au, { x: 0, y: 0, z: 0 });
const mars = eclipticVector("mars", time);
// Independent JPL Horizons sample, same epoch, origin and ecliptic frame.
const reference = {
  x: 0.4694968807562563,
  y: 1.450980923518523,
  z: 0.01889507259676452,
};
const delta = Math.hypot(
  mars.x - reference.x,
  mars.y - reference.y,
  mars.z - reference.z,
);
assert.ok(delta < 0.0003, `Mars differs from JPL by ${delta} AU`);
for (const id of ["moon", "io", "europa", "ganymede", "callisto"])
  assert.ok(position(id, time).distance_from_sun_au > 0);
const moon = moonInfo(time);
assert.ok(moon.illumination >= 0 && moon.illumination <= 1);
const sky = buildSky(time, 37.09, -76.47, 5);
assert.ok(sky.stars.length > 100);
assert.ok(sky.stars.every((star) => star.altitude >= 0 && star.altitude <= 90));
assert.ok(skySvg(sky).includes("<svg"));
const opposite = buildSky(time, -37.09, 103.53, 5);
assert.notDeepEqual(
  sky.stars.map((s) => s.id),
  opposite.stars.map((s) => s.id),
);
const system = searchExoplanets(new URLSearchParams({ host: "TRAPPIST-1" }));
assert.equal(system.results.length, 7);
assert.ok(system.results.every((planet) => planet.hostname === "TRAPPIST-1"));
const small = searchExoplanets(
  new URLSearchParams({ radius_earth_max: "2", limit: "100" }),
);
assert.ok(
  small.results.every(
    (planet) => planet.pl_rade !== null && planet.pl_rade <= 2,
  ),
);
assert.ok(small.catalog_total > 5000);
const invalid = await positions(
  new Request("http://localhost/v1/positions?target=mars&lat=91"),
);
assert.equal(invalid.status, 400);
const invalidTime = await positions(
  new Request("http://localhost/v1/positions?time=invalid"),
);
assert.equal(invalidTime.status, 400);
const svg = await chart(
  new Request("http://localhost/v1/charts/sky?lat=37.09&lon=-76.47&format=svg"),
);
assert.equal(svg.status, 200);
assert.equal(svg.headers.get("Content-Type"), "image/svg+xml");
console.log(
  `Science checks passed: Mars/JPL separation ${(delta * 149597870.7).toFixed(1)} km; ${sky.stars.length} visible stars; ${small.catalog_total} exoplanets.`,
);

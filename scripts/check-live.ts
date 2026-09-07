import assert from "node:assert/strict";
import { horizons } from "../lib/api/horizons";
import { closeApproaches } from "../lib/api/asteroids";
import { searchImages } from "../lib/api/images";
const date = new Date("2026-09-05T00:00:00Z");
// Keep JPL requests sequential: its API fair-use guidance prohibits concurrent requests.
const mars = await horizons("mars", date, date, 1);
assert.equal(mars.points.length, 1);
console.log("JPL Mars vector OK");
const spacecraft = await horizons(
  "voyager-1",
  date,
  new Date("2027-09-05T00:00:00Z"),
  3,
);
assert.equal(spacecraft.points.length, 3);
console.log("Voyager 1 trajectory OK");
const encounters = await closeApproaches("2026-09-05", "2026-10-05", 0.1);
assert.ok(encounters.results.length > 0);
console.log(`JPL close approaches: ${encounters.results.length}`);
// Newly discovered close approaches can reach CAD before Horizons indexes them.
// Apophis is a stable fixture for both its permanent number and designation.
const asteroid = await horizons(
  "asteroid:99942",
  date,
  new Date("2026-10-05T00:00:00Z"),
  3,
  "earth",
);
assert.equal(asteroid.points.length, 3);
const designation = await horizons("asteroid:2004 MN4", date, date, 1, "earth");
const numberedPosition = asteroid.points[0].position_au;
const designationPosition = designation.points[0].position_au;
assert.ok(
  Math.hypot(
    numberedPosition.x - designationPosition.x,
    numberedPosition.y - designationPosition.y,
    numberedPosition.z - designationPosition.z,
  ) < 1e-9,
  "Asteroid number and designation should identify the same trajectory",
);
console.log("Apophis trajectory: number and designation lookups OK");
const images = await searchImages("Perseverance Mars rover", 1, "");
assert.ok(images.results.length > 0);
console.log(`NASA imagery: ${images.results.length} images`);

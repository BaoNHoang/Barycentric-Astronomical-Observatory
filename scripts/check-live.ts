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
const first = encounters.results[0];
const asteroid = await horizons(
  `asteroid:${first.id}`,
  date,
  new Date("2026-10-05T00:00:00Z"),
  3,
  "earth",
);
assert.equal(asteroid.points.length, 3);
console.log(`Asteroid ${first.id} trajectory OK`);
const images = await searchImages("Perseverance Mars rover", 1, "");
assert.ok(images.results.length > 0);
console.log(`NASA imagery: ${images.results.length} images`);

// Astronomy Engine does the orbital math. Our code chooses the inputs and labels the output.
import * as Astro from "astronomy-engine";
import { findBody, planets } from "@/data/bodies";
export const AU_KM = 149597870.7;
export const DAY_MS = 86400000;
export const astronomySource = "https://github.com/cosinekitty/astronomy";
export function parseTime(value: string | null): Date {
  if (
    value &&
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(
      value,
    )
  )
    throw new Error(
      "Use an ISO date or a timestamp with Z / an explicit UTC offset.",
    );
  const date = value ? new Date(value) : new Date();
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 2100
  )
    throw new Error("Use an ISO date between 1900 and 2100.");
  return date;
}
export function numberParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const number = value === null ? fallback : Number(value);
  if (!Number.isFinite(number) || number < min || number > max)
    throw new Error(`Expected a number from ${min} to ${max}.`);
  return number;
}
// All these vectors start in the J2000 equatorial frame, measured in AU.
export function helioVector(id: string, time: Date): Astro.Vector {
  const body = findBody(id);
  if (!body) throw new Error("Unknown celestial body.");
  if (["io", "europa", "ganymede", "callisto"].includes(id)) {
    const jupiter = Astro.HelioVector(Astro.Body.Jupiter, time);
    const moon =
      Astro.JupiterMoons(time)[id as "io" | "europa" | "ganymede" | "callisto"];
    return new Astro.Vector(
      jupiter.x + moon.x,
      jupiter.y + moon.y,
      jupiter.z + moon.z,
      jupiter.t,
    );
  }
  return Astro.HelioVector(body.name as Astro.Body, time);
}
export function eclipticVector(id: string, time: Date) {
  return Astro.RotateVector(Astro.Rotation_EQJ_ECL(), helioVector(id, time));
}
export function position(
  id: string,
  time: Date,
  origin = "sun",
  lat = 37.09,
  lon = -76.47,
) {
  const vector = helioVector(id, time);
  const center = origin === "earth" ? helioVector("earth", time) : null;
  const sun =
    origin === "barycenter" ? Astro.BaryState(Astro.Body.Sun, time) : null;
  const coordinates = {
    x: vector.x - (center?.x ?? 0) + (sun?.x ?? 0),
    y: vector.y - (center?.y ?? 0) + (sun?.y ?? 0),
    z: vector.z - (center?.z ?? 0) + (sun?.z ?? 0),
  };
  const earlier = helioVector(id, new Date(time.getTime() - 30000));
  const later = helioVector(id, new Date(time.getTime() + 30000));
  // A one-minute centered difference gives an educational velocity estimate.
  const velocity = {
    x: ((later.x - earlier.x) * AU_KM) / 60,
    y: ((later.y - earlier.y) * AU_KM) / 60,
    z: ((later.z - earlier.z) * AU_KM) / 60,
  };
  const earth = helioVector("earth", time);
  const body = findBody(id)!;
  let observer = null;
  if (
    id !== "earth" &&
    !["io", "europa", "ganymede", "callisto"].includes(id)
  ) {
    const location = new Astro.Observer(lat, lon, 0);
    const equatorial = Astro.Equator(
      body.name as Astro.Body,
      time,
      location,
      true,
      true,
    );
    const horizontal = Astro.Horizon(
      time,
      location,
      equatorial.ra,
      equatorial.dec,
      "normal",
    );
    observer = {
      latitude: lat,
      longitude: lon,
      height_m: 0,
      right_ascension_hours: equatorial.ra,
      declination_deg: equatorial.dec,
      altitude_deg: horizontal.altitude,
      azimuth_deg: horizontal.azimuth,
      corrections:
        "Apparent topocentric equator of date; standard refraction for altitude",
    };
  }
  return {
    target: id,
    time: time.toISOString(),
    time_scale: "UTC input; Astronomy Engine converts internally",
    origin,
    frame: "J2000 equatorial",
    corrections: "Geometric position; no light-time correction",
    position_au: coordinates,
    heliocentric_velocity_km_s: velocity,
    distance_from_sun_au: vector.Length(),
    distance_from_earth_au: Math.hypot(
      vector.x - earth.x,
      vector.y - earth.y,
      vector.z - earth.z,
    ),
    observer,
    source: astronomySource,
    method:
      "Astronomy Engine analytical model; use engine=horizons for JPL ephemerides",
  };
}
export function moonInfo(time: Date, lat = 37.09, lon = -76.47) {
  const angle = Astro.MoonPhase(time);
  const names = [
    "New Moon",
    "Waxing crescent",
    "First quarter",
    "Waxing gibbous",
    "Full Moon",
    "Waning gibbous",
    "Last quarter",
    "Waning crescent",
  ];
  const observer = new Astro.Observer(lat, lon, 0);
  const rise = Astro.SearchRiseSet(Astro.Body.Moon, observer, +1, time, 2);
  const set = Astro.SearchRiseSet(Astro.Body.Moon, observer, -1, time, 2);
  return {
    time: time.toISOString(),
    phase: names[Math.round(angle / 45) % 8],
    phase_angle_deg: angle,
    illumination: Astro.Illumination(Astro.Body.Moon, time).phase_fraction,
    next_rise: rise?.date.toISOString() ?? null,
    next_set: set?.date.toISOString() ?? null,
    latitude: lat,
    longitude: lon,
    source: astronomySource,
  };
}
export function orbitPoints(id: string, time: Date, samples = 100) {
  const period = findBody(id)!.periodDays;
  return Array.from({ length: samples + 1 }, (_, i) =>
    eclipticVector(
      id,
      new Date(time.getTime() + (period * DAY_MS * i) / samples),
    ),
  );
}
export const planetIds = planets.map((planet) => planet.id);

import { position, parseTime, numberParam } from "@/lib/astronomy";
import { horizons } from "@/lib/api/horizons";
import { respond, ApiError } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(async () => {
    const p = new URL(request.url).searchParams;
    const time = parseTime(p.get("time")),
      target = p.get("target") ?? "mars",
      origin = p.get("origin") ?? "sun";
    if (!["sun", "earth", "barycenter"].includes(origin))
      throw new ApiError("Origin must be sun, earth, or barycenter.");
    const engine = p.get("engine") ?? "astronomy";
    if (!["astronomy", "horizons"].includes(engine))
      throw new ApiError("Engine must be astronomy or horizons.");
    if (engine === "horizons") return horizons(target, time, time, 1, origin);
    return position(
      target,
      time,
      origin,
      numberParam(p.get("lat"), 37.09, -90, 90),
      numberParam(p.get("lon"), -76.47, -180, 180),
    );
  });
}

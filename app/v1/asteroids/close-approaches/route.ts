import { closeApproaches } from "@/lib/api/asteroids";
import { parseTime, numberParam, DAY_MS } from "@/lib/astronomy";
import { respond, ApiError } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => {
    const p = new URL(request.url).searchParams,
      start = parseTime(p.get("start")),
      end = p.has("end")
        ? parseTime(p.get("end"))
        : new Date(start.getTime() + 30 * DAY_MS);
    if (end < start || end.getTime() - start.getTime() > 366 * DAY_MS)
      throw new ApiError("Choose a date range of up to 366 days.");
    return closeApproaches(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10),
      numberParam(p.get("distance_au_max"), 0.1, 0.001, 1),
    );
  });
}

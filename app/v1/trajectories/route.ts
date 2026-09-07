import { parseTime, numberParam, DAY_MS } from "@/lib/astronomy";
import { horizons } from "@/lib/api/horizons";
import { respond, ApiError } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => {
    const p = new URL(request.url).searchParams,
      start = parseTime(p.get("start")),
      end = p.has("end")
        ? parseTime(p.get("end"))
        : new Date(start.getTime() + 365 * DAY_MS);
    if (end <= start || end.getTime() - start.getTime() > 365.25 * 50 * DAY_MS)
      throw new ApiError("End must follow start by at most 50 years.");
    return horizons(
      p.get("target") ?? "voyager-1",
      start,
      end,
      numberParam(p.get("samples"), 60, 2, 240),
      p.get("origin") ?? "sun",
    );
  });
}

import { moonInfo, parseTime, numberParam } from "@/lib/astronomy";
import { respond } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => {
    const p = new URL(request.url).searchParams;
    return moonInfo(
      parseTime(p.get("time")),
      numberParam(p.get("lat"), 37.09, -90, 90),
      numberParam(p.get("lon"), -76.47, -180, 180),
    );
  });
}

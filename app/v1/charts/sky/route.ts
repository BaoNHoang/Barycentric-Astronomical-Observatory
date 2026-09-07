import { buildSky, skySvg } from "@/lib/api/sky";
import { parseTime, numberParam } from "@/lib/astronomy";
import { respond } from "@/lib/api/http";
export function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const compute = () =>
    buildSky(
      parseTime(p.get("time")),
      numberParam(p.get("lat"), 37.09, -90, 90),
      numberParam(p.get("lon"), -76.47, -180, 180),
      numberParam(p.get("magnitude"), 5, 0, 6),
      p.get("constellations") !== "false",
    );
  if (p.get("format") !== "svg") return respond(compute);
  try {
    return new Response(skySvg(compute(), p.get("labels") !== "false"), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, max-age=60",
        "Content-Disposition":
          p.get("download") === "true"
            ? 'attachment; filename="bao-sky-chart.svg"'
            : "inline",
      },
    });
  } catch {
    return Response.json(
      { error: "Invalid chart location, time, or magnitude." },
      { status: 400 },
    );
  }
}

import { searchImages } from "@/lib/api/images";
import { numberParam } from "@/lib/astronomy";
import { respond, ApiError } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => {
    const p = new URL(request.url).searchParams;
    const q = (p.get("q") ?? p.get("mission") ?? "").slice(0, 120),
      year = p.get("year") ?? "";
    if (year && !/^\d{4}$/.test(year))
      throw new ApiError("Year must contain four digits.");
    return searchImages(
      q,
      Math.floor(numberParam(p.get("page"), 1, 1, 100)),
      year,
    );
  });
}

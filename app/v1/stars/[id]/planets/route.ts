import { searchExoplanets } from "@/lib/api/exoplanets";
import { respond } from "@/lib/api/http";
export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return respond(async () => {
    const { id } = await context.params;
    const p = new URL(request.url).searchParams;
    p.set("host", id);
    return searchExoplanets(p);
  });
}

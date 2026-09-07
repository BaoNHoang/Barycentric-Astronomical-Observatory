import { bodies, bodySource } from "@/data/bodies";
import { respond } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => {
    const q = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? "";
    return {
      results: bodies.filter((b) => b.name.toLowerCase().includes(q)),
      source: bodySource,
      mode: "Reference catalog",
    };
  });
}

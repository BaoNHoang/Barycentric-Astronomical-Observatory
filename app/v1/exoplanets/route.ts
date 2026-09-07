import { searchExoplanets } from "@/lib/api/exoplanets";
import { respond } from "@/lib/api/http";
export function GET(request: Request) {
  return respond(() => searchExoplanets(new URL(request.url).searchParams));
}

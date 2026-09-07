import { missions } from "@/data/missions";
import { respond } from "@/lib/api/http";
export function GET() {
  return respond(() => ({
    results: missions,
    notes:
      "Trajectory availability depends on JPL coverage, not mission status.",
  }));
}

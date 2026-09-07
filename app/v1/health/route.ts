import { respond } from "@/lib/api/http";
export function GET() {
  return respond(() => ({
    status: "ok",
    name: "Barycentric Astronomical Observatory",
    version: "1.0.0",
  }));
}

import { endpoints } from "@/data/endpoints";
export function GET() {
  return Response.json({
    name: "Barycentric Astronomical Observatory",
    version: "1.0.0",
    openapi: "/v1/openapi",
    endpoints,
  });
}

import { openapi } from "@/lib/api/openapi";
export function GET() {
  return Response.json(openapi);
}

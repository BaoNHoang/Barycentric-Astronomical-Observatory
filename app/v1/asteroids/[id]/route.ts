import { respond, fetchJson, ApiError } from "@/lib/api/http";
export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return respond(async () => {
    const { id } = await context.params;
    if (!/^[a-zA-Z0-9 ()-]{1,50}$/.test(id))
      throw new ApiError("Invalid asteroid identifier.");
    const p = new URLSearchParams({
      sstr: id,
      "phys-par": "true",
      "full-prec": "true",
    });
    return {
      source: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
      data: await fetchJson("https://ssd-api.jpl.nasa.gov/sbdb.api?" + p),
    };
  });
}

import {
  findBody,
  bodySource,
  moonSource,
  temperatureSource,
} from "@/data/bodies";
import { respond, ApiError } from "@/lib/api/http";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return respond(async () => {
    const { id } = await context.params;
    const body = findBody(id);
    if (!body) throw new ApiError("Body not found.", 404);
    return {
      ...body,
      sources: [
        body.kind === "Moon" ? moonSource : bodySource,
        temperatureSource,
      ],
      units: {
        radiusKm: "km",
        massKg: "kg",
        periodDays: "Earth days",
        semiMajorAu: "AU relative to parent",
        gravity: "m/s²",
        dayHours: "hours; negative means retrograde rotation",
        temperatureK: "K; see temperatureNote",
      },
    };
  });
}

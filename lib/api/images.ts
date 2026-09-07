import gallery from "@/data/gallery.json";
import { fetchJson } from "./http";
export type GalleryImage = {
  id: string;
  title: string;
  image: string;
  sourceUrl: string;
  credit: string;
  description: string;
  kind: string;
  date: string;
  originalUrl: string;
};
export const featuredImages: GalleryImage[] = gallery.map((item) => ({
  id: item.id,
  title: item.title,
  image: item.image,
  sourceUrl: item.sourceUrl,
  credit: item.credit,
  description: item.description,
  kind: item.kind,
  date:
    "observedDate" in item
      ? (item.observedDate ?? item.releaseDate)
      : item.releaseDate,
  originalUrl:
    "originalUrl" in item
      ? (item.originalUrl ?? item.downloadUrl)
      : item.downloadUrl,
}));
export async function searchImages(query: string, page: number, year: string) {
  if (!query) {
    const results = year
      ? featuredImages.filter((image) => image.date.startsWith(year))
      : featuredImages;
    return {
      results,
      total: results.length,
      page: 1,
      source: "NASA Science",
      mode: "Curated observations",
    };
  }
  const params = new URLSearchParams({
    q: query,
    media_type: "image",
    page: String(page),
    page_size: "24",
  });
  if (year) {
    params.set("year_start", year);
    params.set("year_end", year);
  }
  type NasaItem = {
    data: {
      nasa_id: string;
      title: string;
      description?: string;
      date_created: string;
      photographer?: string;
      center?: string;
    }[];
    links?: { href: string; rel: string }[];
  };
  const data = await fetchJson<{
    collection: { metadata: { total_hits: number }; items: NasaItem[] };
  }>(`https://images-api.nasa.gov/search?${params}`);
  const results = data.collection.items.flatMap((item) => {
    const details = item.data[0],
      thumbnail = item.links?.find((link) => link.rel === "preview")?.href;
    if (!details || !thumbnail || !thumbnail.startsWith("https://")) return [];
    return [
      {
        id: details.nasa_id,
        title: details.title,
        image: thumbnail,
        sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(details.nasa_id)}`,
        credit: details.photographer ?? details.center ?? "NASA",
        description: (details.description ?? "").replace(/<[^>]*>/g, ""),
        kind: "NASA archive item · see source for image type and processing",
        date: details.date_created,
        originalUrl: `https://images.nasa.gov/details/${encodeURIComponent(details.nasa_id)}`,
      },
    ];
  });
  return {
    results,
    total: data.collection.metadata.total_hits,
    page,
    source: "NASA Image and Video Library",
    mode: "Live archive search",
  };
}

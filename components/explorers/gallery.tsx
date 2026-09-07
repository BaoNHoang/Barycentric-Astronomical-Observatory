"use client";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Images,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/bao-dialog";
import {
  PageHeading,
  Disclosure,
  Loading,
  ErrorState,
  SourceLink,
  useRemote,
  formatDate,
} from "@/components/shared";
import type { GalleryImage } from "@/lib/api/images";
type ImageResults = {
  results: GalleryImage[];
  total: number;
  page: number;
  mode: string;
};
export default function Gallery() {
  const [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [year, setYear] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<GalleryImage | null>(null),
    [tab, setTab] = useState("featured");
  const remote = useRemote<ImageResults>(
    `/v1/images?${new URLSearchParams({ q: query, page: String(page), year })}`,
  );
  function category(value: string) {
    setTab(value);
    setPage(1);
    setYear("");
    const q: Record<string, string> = {
      featured: "",
      mars: "Perseverance Mars rover",
      planets: "Jupiter Saturn",
      deep: "James Webb galaxy nebula",
    };
    setQuery(q[value]);
    setDraft(q[value]);
  }
  return (
    <div>
      <PageHeading title="Images" />
      <div className="gallery-toolbar">
        <Tabs value={tab} onValueChange={category}>
          <TabsList>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="mars">Mars rovers</TabsTrigger>
            <TabsTrigger value="planets">Planets</TabsTrigger>
            <TabsTrigger value="deep">Deep space</TabsTrigger>
          </TabsList>
        </Tabs>
        <Disclosure title="Search archive">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(draft);
              setPage(1);
              setTab("search");
            }}
            className="gallery-search"
          >
            <div className="search-box">
              <Search size={16} />
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search NASA images…"
                aria-label="Search NASA imagery"
              />
            </div>
            <Input
              className="year-filter"
              type="number"
              min={1900}
              max={2100}
              placeholder="Year"
              aria-label="Image year"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </Disclosure>
      </div>
      {remote.loading && <Loading label="Opening the image archive…" />}
      {remote.error && (
        <ErrorState message={remote.error} retry={remote.reload} />
      )}{" "}
      {remote.data && (
        <>
          <div className="results-bar">
            <span>{remote.data.total.toLocaleString("en-US")} images</span>
          </div>
          <div className={`image-grid ${!query ? "featured-grid" : ""}`}>
            {remote.data.results.map((item, i) => (
              <button
                className="image-card"
                key={`${item.id}-${i}`}
                onClick={() => setSelected(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading={i < 3 ? "eager" : "lazy"}
                  onError={(e) => {
                    e.currentTarget.style.opacity = ".25";
                    e.currentTarget.alt =
                      "Image unavailable — open the original source";
                  }}
                />
                <div className="image-card-overlay">
                  <span className="image-date">{formatDate(item.date)}</span>
                  <h2>{item.title}</h2>
                  <span>
                    {!query ? item.kind : "NASA archive"}
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </button>
            ))}
          </div>
          {remote.data.total === 0 && (
            <div className="empty-state">
              <Images size={30} />
              <h2>No images found</h2>
              <p>Try a mission name, celestial object, or a different year.</p>
            </div>
          )}
          {query && (
            <div className="pagination-row">
              <span>Page {page}</span>
              <div>
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page * 24 >= remote.data.total || page >= 100}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <p className="source-note">
        Featured images are observations with their processing described.
        Archive searches may also return illustrations and diagrams; check the
        original source.{" "}
        <SourceLink href="https://images.nasa.gov/">
          NASA Image and Video Library
        </SourceLink>
      </p>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="image-dialog">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.kind} · {formatDate(selected.date)}
                </DialogDescription>
              </DialogHeader>
              <img src={selected.image} alt={selected.title} />
              <div className="image-details">
                <p>{selected.description}</p>
                <p className="muted small">Credit: {selected.credit}</p>
                <div className="button-row">
                  <Button asChild>
                    <a
                      href={selected.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open original
                      <ArrowUpRight size={16} />
                    </a>
                  </Button>
                  <SourceLink href={selected.sourceUrl}>
                    Source & full caption
                  </SourceLink>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

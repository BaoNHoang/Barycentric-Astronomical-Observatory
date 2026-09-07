// Consistent errors, a bounded cache, and one JPL request at a time.
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function respond(work: () => unknown | Promise<unknown>) {
  try {
    return Response.json(await work(), {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: error instanceof ApiError ? error.status : 400 },
    );
  }
}
const cache = new Map<
  string,
  { expires: number; data: unknown; retrievedAt: string }
>();
const pending = new Map<string, Promise<unknown>>();
let jplQueue: Promise<unknown> = Promise.resolve();
export function retrievalTime(url: string) {
  return cache.get(url)?.retrievedAt ?? new Date().toISOString();
}
export async function fetchJson<T>(url: string, seconds = 3600): Promise<T> {
  const saved = cache.get(url);
  if (saved && saved.expires > Date.now()) return saved.data as T;
  if (pending.has(url)) return pending.get(url) as Promise<T>;
  async function request() {
    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(25000),
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new ApiError(
        "The data source did not respond. Please try again shortly.",
        502,
      );
    }
    if (!response.ok)
      throw new ApiError(
        `The data source returned HTTP ${response.status}. Wait a moment before trying again.`,
        502,
      );
    let data: T;
    try {
      data = (await response.json()) as T;
    } catch {
      throw new ApiError(
        "The data source returned an unreadable response.",
        502,
      );
    }
    if (cache.size >= 40) cache.delete(cache.keys().next().value!);
    cache.set(url, {
      expires: Date.now() + seconds * 1000,
      data,
      retrievedAt: new Date().toISOString(),
    });
    return data;
  }
  // The queue is per server process / Worker isolate. Keep JPL concurrency at one
  // in a local deployment; a large multi-instance deployment needs a shared queue.
  const isJpl = new URL(url).hostname.endsWith("jpl.nasa.gov");
  const task = isJpl ? jplQueue.then(request) : request();
  if (isJpl) jplQueue = task.catch(() => undefined);
  pending.set(url, task);
  try {
    return await task;
  } finally {
    pending.delete(url);
  }
}

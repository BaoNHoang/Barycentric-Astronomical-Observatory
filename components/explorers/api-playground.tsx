"use client";
import { useState } from "react";
import { Play, Copy, Check, Download, Braces } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/data/endpoints";
import {
  Choice,
  PageHeading,
  Disclosure,
  downloadJson,
} from "@/components/shared";
export default function ApiPlayground({ time }: { time: string }) {
  const [endpoint, setEndpoint] = useState("positions"),
    [path, setPath] = useState(
      `/v1/positions?target=mars&origin=sun&time=${encodeURIComponent(time)}`,
    ),
    [result, setResult] = useState<unknown>(null),
    [status, setStatus] = useState<number | null>(null),
    [duration, setDuration] = useState(0),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [language, setLanguage] = useState("javascript"),
    [copied, setCopied] = useState(false);
  function choose(id: string) {
    setEndpoint(id);
    const value = endpoints.find((e) => e.id === id)!;
    setPath(value.path);
    setResult(null);
    setStatus(null);
    setError("");
  }
  const definition = endpoints.find((e) => e.id === endpoint)!;
  const example =
    language === "javascript"
      ? `// In the BAO app, requests use the same origin.\nconst response = await fetch(${JSON.stringify(path)});\nconst data = await response.json();\n\nif (!response.ok) throw new Error(data.error);\nconsole.log(data);`
      : language === "python"
        ? `import requests\n\n# For a local development server.\nresponse = requests.get(\n    "http://localhost:3000${path}",\n    timeout=30,\n)\nresponse.raise_for_status()\ndata = response.json()\nprint(data)`
        : `Invoke-RestMethod -Uri 'http://localhost:3000${path}'`;
  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    setStatus(null);
    const begin = performance.now();
    try {
      if (!path.startsWith("/v1/") || path.includes("://"))
        throw new Error("Enter a BAO endpoint beginning with /v1/.");
      const response = await fetch(path, {
        signal: AbortSignal.timeout(35000),
      });
      setStatus(response.status);
      const type = response.headers.get("content-type") ?? "";
      const body = type.includes("json")
        ? await response.json()
        : await response.text();
      setResult(body);
      setDuration(Math.round(performance.now() - begin));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(example);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(
        "Clipboard access is unavailable. You can select and copy the example.",
      );
    }
  }
  return (
    <div>
      <PageHeading title="API playground" />
      <div className="api-layout">
        <div className="api-main">
          <section className="panel request-panel">
            <Choice
              label="API endpoint"
              value={endpoint}
              onChange={choose}
              options={endpoints.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <p className="muted">{definition.description}</p>
            <form
              className="request-bar"
              onSubmit={(e) => {
                e.preventDefault();
                run();
              }}
            >
              <span className="method-badge">GET</span>
              <Input
                aria-label="API request path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <Button disabled={loading} type="submit">
                <Play size={15} />
                {loading ? "Running…" : "Run request"}
              </Button>
            </form>
            <p className="muted small">
              Edit query parameters in the path. Requests run against this app.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>
          <Disclosure title="Code examples" className="code-panel">
            <div className="panel-topline">
              <Tabs value={language} onValueChange={setLanguage}>
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="powershell">PowerShell</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copy code example"
                onClick={copy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <pre>
              <code>{example}</code>
            </pre>
          </Disclosure>
          <section className="panel response-panel">
            <div className="panel-topline">
              <h2>Response</h2>
              <div className="response-meta">
                {status !== null && (
                  <span
                    className={`status-pill ${status >= 400 ? "failed" : ""}`}
                  >
                    {status} · {duration} ms
                  </span>
                )}
                {result !== null && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Download response"
                    onClick={() =>
                      downloadJson(result, "bao-api-response.json")
                    }
                  >
                    <Download size={16} />
                  </Button>
                )}
              </div>
            </div>
            {result === null ? (
              <div className="response-empty">
                <Braces size={28} />
                <p>
                  {loading
                    ? "Waiting for the response…"
                    : "Run a request to inspect the data."}
                </p>
              </div>
            ) : (
              <pre>
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            )}
          </section>
        </div>
      </div>
      <Disclosure title="Response conventions & access">
        <div className="api-notes">
          <div>
            <h3>Position context</h3>
            <p>
              Position responses identify time, origin, frame, units,
              corrections, and the source.
            </p>
          </div>
          <div>
            <h3>Missing measurements</h3>
            <p>
              Unknown measurements use null. Read mass provenance and
              temperature definitions before comparing worlds.
            </p>
          </div>
          <div>
            <h3>Local developer access</h3>
            <p>
              This hosted app is private. Run the source locally to use Python
              or PowerShell directly; hosted API requests require your signed-in
              browser session.
            </p>
          </div>
        </div>
      </Disclosure>
    </div>
  );
}

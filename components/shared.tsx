"use client";
import { useEffect, useState } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  ChevronDown,
  Check,
} from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
        <ChevronDown size={14} />
      </SelectTrigger>
      <SelectContent className="bao-select">
        {options.map((option) => (
          <SelectItem value={option.value} key={option.value}>
            {option.label}
            <Check className="bao-choice-check" size={14} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
// Every data view follows the same small pattern: request, loading, result, or error.
export function useRemote<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "The request failed.");
        return result as T;
      })
      .then(setData)
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, revision]);
  return {
    data,
    error,
    loading,
    reload: () => setRevision((value) => value + 1),
  };
}
export function useDebounced(value: string) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return settled;
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}
// Native details gives us keyboard access and closed-by-default content,
// without another state library or custom focus-management code.
export function Disclosure({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={`disclosure ${className}`}>
      <summary>
        {title}
        <ChevronDown size={16} />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
export function Stat({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>
        {value} {unit && <small>{unit}</small>}
      </strong>
      {sub && <p>{sub}</p>}
    </div>
  );
}
export function Loading({
  label = "Loading observations…",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <RefreshCw size={20} className="spin" />
      <p>{label}</p>
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <h3>Data is temporarily unavailable</h3>
      <p>{message}</p>
      <Button variant="outline" onClick={retry}>
        <RefreshCw size={16} />
        Try again
      </Button>
    </div>
  );
}
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={13} />
    </a>
  );
}
export function formatNumber(value: number | null | undefined, digits = 2) {
  return value == null
    ? "Unknown"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(
        value,
      );
}
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

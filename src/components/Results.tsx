"use client";
import { useState } from "react";

export default function Results({
  onResults,
}: {
  onResults: (week: string | null, lines: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const cookie = decodeURIComponent(
      (
        document.cookie
          .split("; ")
          .find((s) => s.startsWith("wh_authors_v1=")) || ""
      )
        .split("=")
        .slice(1)
        .join("=")
    );
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "live", authors: cookie }),
    });
    const json = await res.json();
    onResults(json.weekDate ?? null, json.entries || []);
    setLoading(false);
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={run}
        className="min-w-1/3 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 flex justify-center"
        disabled={loading}
      >
        {loading ? "Checking…" : "Check live NYT"}
      </button>
    </div>
  );
}

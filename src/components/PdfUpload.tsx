"use client";
import { useState, DragEvent, ChangeEvent } from "react";

export default function PdfUpload({
  onResults,
}: {
  onResults: (week: string | null, lines: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function send(file: File) {
    setLoading(true);
    const authors = decodeURIComponent(
      (
        document.cookie
          .split("; ")
          .find((s) => s.startsWith("wh_authors_v1=")) || ""
      )
        .split("=")
        .slice(1)
        .join("=")
    );
    const fd = new FormData();
    fd.append("source", "pdf");
    fd.append("authors", authors);
    fd.append("file", file, file.name);

    const res = await fetch("/api/run", { method: "POST", body: fd });
    const json = await res.json();
    onResults(json.weekDate ?? null, json.entries || []);
    setLoading(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") send(file);
  }
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      send(file);
    }
  }

  return (
    <section className="space-y-2">
      <div className="flex justify-center">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border border-dashed rounded-xl text-sm p-10 text-neutral-100 bg-black flex justify-center"
        >
          Drag this week&apos;s bestseller PDF here
          {/* <div className="text-xs text-neutral-100">
            Drop the advance PDF you receive. We’ll extract ranks for this week
            and compare against last week from the NYT overview.
          </div> */}
        </div>
      </div>
      {/* <input type="file" accept="application/pdf" onChange={onChange} /> */}
      {/* I'd like to have the input, but as a hyper link in the explanation text */}
      {loading && <div className="text-sm text-neutral-600">Processing…</div>}
    </section>
  );
}

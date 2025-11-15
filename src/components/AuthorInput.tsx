"use client";
import { useState, useEffect } from "react";
import GlassTextarea from "./GlassTextarea";

export default function AuthorInput() {
  const [blob, setBlob] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("wh_auth_blob") || "";
    setBlob(raw);
  }, []);

  function persist(v: string) {
    setBlob(v);
    localStorage.setItem("wh_auth_blob", v);
    document.cookie = `wh_authors_v1=${encodeURIComponent(
      v
    )}; path=/; max-age=${3600 * 24 * 365}; samesite=Lax`;
  }

  return (
    <div>
      <GlassTextarea
        rows={12}
        value={blob}
        onChange={(e) => persist(e.target.value)}
        placeholder={`Type your authors' names here. Aliases can be added with a pipe.

Nora Roberts | J.D. Robb
Colleen Hoover
David Grann
Amor Towles`}
      />
      <div className="text-lg font-medium text-neutral-100 p-2 bg-stone-950 text-right">
        MY AUTHORS
      </div>
    </div>
  );
}

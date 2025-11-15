// src/components/AgencyAuthors.tsx
"use client";
import { useEffect, useState } from "react";
import GlassTextarea from "./GlassTextarea";

const KEY = "wh_agency_authors_v1";

export default function AgencyAuthors() {
  const [text, setText] = useState("");
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setText(saved);
    else {
      const placeholder = [
        "Nora Roberts | J.D. Robb",
        "Colleen Hoover",
        "Amor Towles",
        "David Grann",
      ].join("\n");
      setText(placeholder);
      localStorage.setItem(KEY, placeholder);
    }
  }, []);

  function toggleEdit() {
    if (!editable) {
      const ok = window.confirm(
        "You are about to edit the agency-wide list. Continue?"
      );
      if (!ok) return;
    }
    setEditable((v) => !v);
  }

  function save(v: string) {
    setText(v);
    localStorage.setItem(KEY, v);
  }

  return (
    <div>
      <GlassTextarea
        rows={10}
        value={text}
        onChange={(e) => save(e.target.value)}
        readOnly={!editable}
        muted={!editable}
        placeholder="Agency-wide author list"
      />
      <div className="text-lg font-display font-medium text-neutral-100 p-2 bg-stone-950 text-right">
        CHECK ALL WRITERS HOUSE AUTHORS
      </div>
      <button
        type="button"
        onClick={toggleEdit}
        className="text-xs px-3 py-1 rounded border border-white/30 bg-white/20 text-white hover:bg-white/30"
      >
        {editable ? "Done" : "Edit"}
      </button>
      {!editable && (
        <p className="text-xs italic text-neutral-300">
          Read-only. Press Edit to modify the agency list.
        </p>
      )}
    </div>
  );
}
